import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Refer a friend — both sides get 10% when the friend joins the mailing list.
 *
 * Server-only. Everything here uses the service role key, because referral
 * codes map to customer email addresses and the referrals table is a record of
 * who knows whom. Neither is safe behind the public anon key.
 */

/**
 * How many friends one person can be rewarded for.
 *
 * The whole reason this number exists: the reward fires on a list JOIN, not a
 * purchase, so a referral costs one throwaway email address. Uncapped, that is
 * a machine for converting margin into unengaged subscribers — and unengaged
 * subscribers are already what is pulling the open rate down. Five is generous
 * for a real person telling real friends and boring for anyone farming.
 *
 * Raising it is a deliberate decision, not a knob to turn when someone
 * complains. Look at supabase/referrals.sql for the query that shows who is
 * actually at the cap first.
 */
export const MAX_REWARDS_PER_REFERRER = 5;

/** Unambiguous alphabet — no O/0, I/1/L, so a code read aloud still works. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Collapse the many spellings of one mailbox into a single identity.
 *
 * This is the single most important function here. Gmail treats
 * foo+anything@gmail.com and f.o.o@gmail.com as the same inbox, which means
 * one person can generate unlimited "different" addresses that all reach them.
 * Without this, the cap above is decorative — someone signs up five friends
 * from one account in about a minute.
 *
 * Applied to both sides, so it also catches the obvious self-referral: you
 * cannot refer yourself with a +alias of your own address.
 */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1) return email;

  let local = email.slice(0, at);
  const domain = email.slice(at + 1);

  // Sub-addressing: everything after a + is a label, not a different mailbox.
  // Widely supported (Gmail, Outlook, Fastmail, Proton), harmless elsewhere.
  const plus = local.indexOf('+');
  if (plus > 0) local = local.slice(0, plus);

  // Dots are only ignorable at Google-run domains. Stripping them everywhere
  // would merge genuinely different people at hosts that treat them as
  // significant, which is a worse failure than letting one alias through.
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

function serviceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      '[referrals] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — ' +
      'referrals are disabled. Signups still work.',
    );
    return null;
  }
  return createClient(url, key);
}

function makeCode(): string {
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * The referral code for an email address, creating one if they don't have one.
 *
 * Called on every signup, so every subscriber leaves with a link whether or
 * not they ever ask for one — that link then goes into the welcome email as
 * {{ person.referral_link }}. A program nobody can find doesn't get used.
 *
 * Returns null rather than throwing: a referral code is a nice-to-have, and a
 * Supabase hiccup must never cost you the actual mailing list signup.
 */
export async function getOrCreateReferralCode(email: string): Promise<string | null> {
  const supabase = serviceClient();
  if (!supabase) return null;
  const normalized = normalizeEmail(email);

  try {
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('normalized', normalized)
      .maybeSingle();
    if (existing?.code) return existing.code as string;

    // Retry on collision. Six characters from a 31-letter alphabet is ~887
    // million codes, so this effectively never loops — but "effectively never"
    // is not "never", and a duplicate key would otherwise surface as a failed
    // signup.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const { error } = await supabase
        .from('referral_codes')
        .insert({ code, email: email.trim().toLowerCase(), normalized });
      if (!error) return code;
      // 23505 = unique violation. If it's the NORMALIZED column that clashed,
      // someone else created this person's code in a parallel request — fetch
      // theirs rather than fighting over it.
      if (error.code === '23505') {
        const { data: raced } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('normalized', normalized)
          .maybeSingle();
        if (raced?.code) return raced.code as string;
        continue; // the CODE collided; try another
      }
      throw new Error(error.message);
    }
    return null;
  } catch (err) {
    console.error('[referrals] could not issue a referral code:', err);
    return null;
  }
}

export type ReferralOutcome =
  | { status: 'rewarded'; referrerEmail: string; friendNumber: number }
  | { status: 'ignored'; reason: string };

/**
 * Record a friend joining via someone's referral code.
 *
 * Returns 'rewarded' only when both sides have genuinely earned it. Every
 * other path returns 'ignored' with a reason — the friend's signup has already
 * succeeded by this point and must never be undone by a referral problem.
 *
 * The reasons are deliberately specific so the logs answer "why didn't my
 * friend's referral count?" without a debugging session.
 */
export async function recordReferral(
  code: string,
  friendEmail: string,
): Promise<ReferralOutcome> {
  const supabase = serviceClient();
  if (!supabase) return { status: 'ignored', reason: 'referrals not configured' };

  const friendNormalized = normalizeEmail(friendEmail);

  try {
    const { data: owner } = await supabase
      .from('referral_codes')
      .select('code, email, normalized')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();

    if (!owner) return { status: 'ignored', reason: `no such code: ${code}` };

    // Self-referral, including via a +alias or dotted spelling of your own
    // address — which is the first thing anyone tries.
    if (owner.normalized === friendNormalized) {
      return { status: 'ignored', reason: 'self-referral' };
    }

    // Already referred by someone. Checked before the insert so the reason is
    // specific, though the unique index on friend_normalized is what actually
    // guarantees it under concurrent requests.
    const { data: already } = await supabase
      .from('referrals')
      .select('id')
      .eq('friend_normalized', friendNormalized)
      .maybeSingle();
    if (already) return { status: 'ignored', reason: 'friend was already referred' };

    // Someone who already has a code is an existing subscriber, not a new
    // friend. Without this, two customers could refer each other on day one.
    const { data: isSubscriber } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('normalized', friendNormalized)
      .maybeSingle();
    if (isSubscriber) return { status: 'ignored', reason: 'friend is already on the list' };

    const { count } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_normalized', owner.normalized);

    if ((count ?? 0) >= MAX_REWARDS_PER_REFERRER) {
      return { status: 'ignored', reason: `referrer is at the cap of ${MAX_REWARDS_PER_REFERRER}` };
    }

    const { error } = await supabase.from('referrals').insert({
      code: owner.code,
      referrer_email: owner.email,
      referrer_normalized: owner.normalized,
      friend_email: friendEmail.trim().toLowerCase(),
      friend_normalized: friendNormalized,
      rewarded: true,
    });

    // Lost a race with a simultaneous signup for the same friend. The other
    // request won and rewarded them; this one must not reward again.
    if (error?.code === '23505') {
      return { status: 'ignored', reason: 'friend was already referred (race)' };
    }
    if (error) throw new Error(error.message);

    return {
      status: 'rewarded',
      referrerEmail: owner.email,
      friendNumber: (count ?? 0) + 1,
    };
  } catch (err) {
    console.error('[referrals] recordReferral failed:', err);
    return { status: 'ignored', reason: 'error' };
  }
}
