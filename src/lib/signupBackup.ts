import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Backup copy of every signup, kept in Supabase (table: public.signups, see
 * supabase/signups.sql).
 *
 * Klaviyo is where messages get sent from, but it was the ONLY place a signup
 * lived. When Klaviyo rejected one, or an env var was missing, the address
 * existed only as a line in the Vercel logs. /api/subscribe now writes here
 * first, then records whether Klaviyo accepted it, so a failed signup is a row
 * you can find and re-import rather than a lost lead.
 *
 * Both functions are best-effort and NEVER throw: a Supabase problem must not
 * turn a working signup into an error. They return null / do nothing instead,
 * and the route decides what that means.
 *
 * Uses the same server-only credentials as /api/reviews:
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. The service role key
 * bypasses row-level security by design and must never be exposed to the
 * browser. The table has RLS on and no policies, so the public anon key can
 * neither read nor write it.
 */

export type SignupRow = {
  email: string;
  first_name: string | null;
  /** E.164, and only when they ticked the SMS consent box. */
  phone: string | null;
  sms_consent: boolean;
  source: string | null;
  /** lib/events.ts event id, for event RSVPs. */
  event_id: string | null;
  /** Referral code from ?ref=, if they arrived on a friend's link. */
  ref: string | null;
  attribution: Record<string, unknown> | null;
};

export type KlaviyoStatus = 'ok' | 'failed' | 'not_configured';

const TIMEOUT_MS = 4000;

let cached: SupabaseClient | null | undefined;

function client(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      '[signups] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing, ' +
      'so signups are NOT being backed up.',
    );
    cached = null;
    return null;
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

/** Rejects after ms so a slow Supabase can never hold a signup hostage. */
function withTimeout<T>(p: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(p),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)),
  ]);
}

/** Inserts the row and returns its id, or null if it could not be saved. */
export async function backupSignup(row: SignupRow): Promise<string | null> {
  const supabase = client();
  if (!supabase) return null;
  try {
    const { data, error } = await withTimeout(
      supabase.from('signups').insert(row).select('id').single(),
      TIMEOUT_MS,
    );
    if (error || !data) {
      console.error('[signups] backup insert failed:', error?.message ?? 'no row returned');
      return null;
    }
    return data.id as string;
  } catch (err) {
    console.error('[signups] backup insert threw:', err);
    return null;
  }
}

/** Records how Klaviyo answered. No-op when the insert did not happen. */
export async function markSignup(
  id: string | null,
  status: KlaviyoStatus,
  error?: string,
): Promise<void> {
  if (!id) return;
  const supabase = client();
  if (!supabase) return;
  try {
    const { error: updateError } = await withTimeout(
      supabase
        .from('signups')
        .update({ klaviyo_status: status, klaviyo_error: error ?? null })
        .eq('id', id),
      TIMEOUT_MS,
    );
    if (updateError) console.error('[signups] status update failed:', updateError.message);
  } catch (err) {
    console.error('[signups] status update threw:', err);
  }
}
