import { NextRequest, NextResponse } from 'next/server';
import { klaviyoPrivateKey } from '@/lib/klaviyoKey';
import { getOrCreateReferralCode, recordReferral } from '@/lib/referrals';
import { backupSignup, markSignup } from '@/lib/signupBackup';

/**
 * Normalize a US-entered phone number to E.164 (+1XXXXXXXXXX).
 * Klaviyo rejects anything that isn't E.164, so we return null on anything
 * we can't confidently convert and simply skip the SMS half of the request.
 */
function toE164(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  // Already international (user typed a leading +) — pass through if plausible.
  if (raw.trim().startsWith('+') && digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

// Interest-form answers from the /invite event card. These ids mirror
// RIDE_OPTIONS / CAMERA_OPTIONS in components/ClubEventsPage.tsx; anything else
// is dropped so a hand-built request cannot write arbitrary text to a profile.
const RSVP_RIDE_IDS = ['need_ride', 'own_ride'];
const RSVP_CAMERA_IDS = ['has_camera', 'need_disposable'];

type RsvpAnswers = { ride?: string; camera?: string; instagram?: string };

function cleanRsvp(raw: unknown): RsvpAnswers {
  const out: RsvpAnswers = {};
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.ride === 'string' && RSVP_RIDE_IDS.includes(r.ride)) out.ride = r.ride;
  if (typeof r.camera === 'string' && RSVP_CAMERA_IDS.includes(r.camera)) out.camera = r.camera;
  if (typeof r.instagram === 'string') {
    // "@handle", "handle" or a pasted profile link all become "handle".
    const handle = r.instagram.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[/?#].*$/, '');
    if (/^[A-Za-z0-9._]{1,30}$/.test(handle)) out.instagram = handle;
  }
  return out;
}

/**
 * Attach custom properties (signup_source, utm_*) to a profile.
 *
 * This is a SEPARATE call on purpose. The subscription endpoint rejects a
 * `properties` field outright and drops the whole signup, so properties go on
 * afterwards via the upsert endpoint. Never let this throw — the subscription
 * has already succeeded by the time we get here.
 */
async function attachProperties(
  apiKey: string,
  email: string,
  properties: Record<string, string>,
  firstName?: string,
): Promise<void> {
  if (Object.keys(properties).length === 0 && !firstName) return;

  try {
    const res = await fetch('https://a.klaviyo.com/api/profile-import/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          // first_name is a real Klaviyo profile field, so {{ first_name }} works
          // in emails and texts. Only sent when we actually have one.
          attributes: { email, ...(firstName ? { first_name: firstName } : {}), properties },
        },
      }),
    });
    if (!res.ok) {
      console.error(
        '[subscribe] Could not attach attribution (signup itself was fine) —',
        res.status,
        (await res.text()).slice(0, 300)
      );
    }
  } catch (err) {
    console.error('[subscribe] attachProperties threw (signup itself was fine):', err);
  }
}

/**
 * Fire a Klaviyo event against a specific profile.
 *
 * The referral reward needs this because Klaviyo flows are profile-scoped: the
 * friend's signup belongs to the FRIEND, so a flow triggered by it can only
 * email the friend. To reward the referrer you have to put an event on the
 * referrer's own profile — which is exactly what this does, with their email
 * rather than the person who filled in the form.
 *
 * Never throws. The signup has already succeeded before this runs.
 */
async function fireKlaviyoEvent(
  apiKey: string,
  metric: string,
  profileEmail: string,
  properties: Record<string, unknown>,
): Promise<void> {
  try {
    const res = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        revision: '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            properties,
            metric: { data: { type: 'metric', attributes: { name: metric } } },
            profile: { data: { type: 'profile', attributes: { email: profileEmail } } },
          },
        },
      }),
    });
    if (!res.ok) {
      console.error(
        `[subscribe] Klaviyo rejected the "${metric}" event —`,
        res.status,
        (await res.text()).slice(0, 300),
      );
    }
  } catch (err) {
    console.error(`[subscribe] "${metric}" event threw:`, err);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, phone, smsConsent, source, attribution, ref, event, name, rsvp } = body as {
    email?: string;
    /** Event RSVP (from /invite): the event's id in lib/events.ts, and the RSVPer's first name. */
    event?: string;
    name?: string;
    /** Event RSVP interest answers: ride, camera, instagram. See cleanRsvp(). */
    rsvp?: unknown;
    phone?: string;
    smsConsent?: boolean;
    source?: string;
    /** UTM params + referring channel, captured client-side. See lib/attribution.ts. */
    attribution?: Record<string, string>;
    /** Referral code from ?ref= on the link a friend shared. */
    ref?: string;
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // SMS is only ever attached when the user checked the consent box AND we can
  // parse the number. TCPA requires express written consent for marketing texts,
  // separate from email consent — never infer it from the email opt-in.
  const phoneNumber = smsConsent === true ? toE164(phone) : null;

  // If they ticked the box but the number is unusable, tell the client so it can
  // re-prompt. Email is handled independently below, so nothing is lost.
  if (smsConsent === true && phone && !phoneNumber) {
    return NextResponse.json(
      { error: 'Please enter a valid 10-digit phone number.' },
      { status: 400 }
    );
  }

  // ── Backup copy, written BEFORE Klaviyo is touched ──────────────────────
  // Klaviyo is the system of record for sending, but it used to be the only
  // copy: if it rejected a signup or the env vars were missing, the address
  // survived only as a line in the Vercel logs. Every submission now lands in
  // Supabase first (see lib/signupBackup.ts + supabase/signups.sql) and is
  // marked ok / failed once Klaviyo answers. Best-effort: never throws, and a
  // Supabase outage cannot block a signup on its own.
  const firstName = typeof name === 'string' ? name.trim().slice(0, 80) : '';
  const eventId = typeof event === 'string' ? event.trim().slice(0, 80) : '';
  const rsvpAnswers = eventId ? cleanRsvp(rsvp) : {};
  const hasRsvpAnswers = Object.keys(rsvpAnswers).length > 0;
  const backupId = await backupSignup({
    email,
    first_name: firstName || null,
    // A number is only kept when they ticked the SMS consent box.
    phone: phoneNumber,
    sms_consent: Boolean(phoneNumber),
    source: source || null,
    event_id: eventId || null,
    ref: typeof ref === 'string' && ref.trim() ? ref.trim().slice(0, 80) : null,
    // No column for the RSVP answers (adding one would break every insert until
    // the migration is run), so they ride along in this jsonb under 'rsvp'.
    attribution:
      (attribution && typeof attribution === 'object') || hasRsvpAnswers
        ? { ...(attribution && typeof attribution === 'object' ? attribution : {}), ...(hasRsvpAnswers ? { rsvp: rsvpAnswers } : {}) }
        : null,
  });

  const apiKey = klaviyoPrivateKey();
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    // Log the address itself — otherwise a misconfigured environment loses
    // signups without leaving any trace of who tried to subscribe.
    console.error(
      '[subscribe] Missing KLAVIYO_API_KEY or KLAVIYO_LIST_ID in Vercel env vars — LOST signup:',
      email,
      phoneNumber ? `(phone ${phoneNumber})` : ''
    );
    await markSignup(backupId, 'not_configured', 'KLAVIYO_API_KEY or KLAVIYO_LIST_ID missing');
    // With no backup either, the signup would vanish. Say so instead of
    // showing a success screen for an address nobody has.
    if (!backupId) {
      return NextResponse.json({ error: 'Signups are having a moment. Please try again shortly.' }, { status: 503 });
    }
    return NextResponse.json({ success: true });
  }

  // Set once Klaviyo has accepted the subscription, so a later hiccup in the
  // best-effort referral steps cannot be recorded as a failed signup.
  let subscribed = false;

  const consentedAt = new Date().toISOString();

  // One profile, two consent channels. Sending both in a single profile payload
  // is what keeps this as one enriched profile instead of two duplicates.
  const subscriptions: Record<string, unknown> = {
    email: { marketing: { consent: 'SUBSCRIBED' } },
  };

  const profileAttributes: Record<string, unknown> = { email };

  if (phoneNumber) {
    profileAttributes.phone_number = phoneNumber;
    subscriptions.sms = {
      marketing: { consent: 'SUBSCRIBED', consented_at: consentedAt },
    };
  }

  // NOTE: do NOT put `properties` on the profile in this payload. The
  // subscription-bulk-create-jobs endpoint rejects it with
  // "'properties' is not a valid field for the resource 'profile'" (400) and
  // the entire signup is lost. Custom properties are attached separately, after
  // the subscription succeeds — see attachProperties() below.
  profileAttributes.subscriptions = subscriptions;

  // Which form they used, plus where they originally came from (utm_* /
  // referrer). Replaces the old manual "how did you find us?" dropdown.
  const properties: Record<string, string> = {};
  if (source) properties.signup_source = source;

  if (attribution && typeof attribution === 'object') {
    const ALLOWED = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'referrer', 'landing_page',
    ];
    for (const key of ALLOWED) {
      const value = attribution[key];
      if (typeof value === 'string' && value) properties[key] = value.slice(0, 200);
    }
  }

  try {
    const res = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              // Required by Klaviyo when an SMS consent is present — records the
              // page the consent was collected on for TCPA audit purposes.
              custom_source: source || 'website',
              profiles: {
                data: [{
                  type: 'profile',
                  attributes: profileAttributes,
                }],
              },
            },
            relationships: {
              list: { data: { type: 'list', id: listId } },
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error(
        '[subscribe] Klaviyo error — status:', res.status,
        '— body:', errBody,
        '— LOST signup:', email, phoneNumber ? `(phone ${phoneNumber})` : ''
      );
      await markSignup(backupId, 'failed', `${res.status}: ${errBody.slice(0, 400)}`);
      if (!backupId) {
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 502 });
      }
    } else {
      subscribed = true;
      await markSignup(backupId, 'ok');
      console.log('[subscribe] Klaviyo success:', email, phoneNumber ? '(+sms)' : '');

      // ── Refer a friend ────────────────────────────────────────────────
      // Everything below is best-effort. The subscription has succeeded by
      // this point, and no referral problem may undo it or change the
      // response the visitor sees.

      // 1. If they arrived on someone's link, try to reward both sides.
      //
      //    ORDER MATTERS, and getting it wrong is silent. recordReferral()
      //    rejects a friend who is "already on the list", which it detects by
      //    looking for an existing referral code. Issuing this person's own
      //    code FIRST (as this block used to) creates exactly that row a
      //    moment before the check reads it, so every single referral was
      //    rejected as self-evidently pre-existing. The reward must be decided
      //    against the state of the world BEFORE this signup.
      let outcome: Awaited<ReturnType<typeof recordReferral>> | null = null;
      if (typeof ref === 'string' && ref.trim()) {
        outcome = await recordReferral(ref, email);
      }

      // 2. Give this person their own link, whether or not they were referred.
      //    Goes onto the profile as {{ person.referral_link }} so the welcome
      //    email can include it — a referral programme nobody can find is a
      //    referral programme nobody uses.
      const ownCode = await getOrCreateReferralCode(email);
      if (ownCode) {
        properties.referral_code = ownCode;
        properties.referral_link = `https://www.tualmi.com/invite?ref=${ownCode}`;
      }

      // 3. Fire the reward events, if step 1 said this one counts.
      if (outcome) {
        if (outcome.status === 'rewarded') {
          properties.referred_by = outcome.referrerEmail;

          // The friend's 10%. Fires on the friend's own profile.
          await fireKlaviyoEvent(apiKey, 'Referred Signup', email, {
            referred_by: outcome.referrerEmail,
          });

          // The referrer's 10%. Fires on the REFERRER's profile, which is the
          // only way a Klaviyo flow can email them about someone else's
          // signup — flows can only ever message the profile they trigger on.
          await fireKlaviyoEvent(apiKey, 'Referral Completed', outcome.referrerEmail, {
            friend_email: email,
            friend_number: outcome.friendNumber,
          });

          console.log(
            `[subscribe] referral rewarded — ${outcome.referrerEmail} -> ${email}` +
            ` (their #${outcome.friendNumber})`,
          );
        } else {
          // Logged, not silent: "why didn't my friend's referral count?" is a
          // question you will be asked, and this is the answer.
          console.log(`[subscribe] referral not rewarded (${ref}): ${outcome.reason}`);
        }
      }

      // Event RSVP from the /invite page. Stored on the profile so a Klaviyo
      // flow / segment can email the right people about the right event, and
      // fired as an event so a flow can send the confirmation. Best-effort:
      // the signup above has already succeeded.
      if (eventId) {
        properties.rsvp_event = eventId;
        if (firstName) properties.rsvp_name = firstName;
        if (rsvpAnswers.ride) properties.rsvp_ride = rsvpAnswers.ride;
        if (rsvpAnswers.camera) properties.rsvp_camera = rsvpAnswers.camera;
        if (rsvpAnswers.instagram) properties.rsvp_instagram = rsvpAnswers.instagram;
        await fireKlaviyoEvent(apiKey, 'Event RSVP', email, {
          event_id: eventId,
          ...(firstName ? { first_name: firstName } : {}),
          ...(rsvpAnswers.ride ? { ride: rsvpAnswers.ride } : {}),
          ...(rsvpAnswers.camera ? { camera: rsvpAnswers.camera } : {}),
          ...(rsvpAnswers.instagram ? { instagram: rsvpAnswers.instagram } : {}),
        });
      }

      // Attribution, referral code and referred_by all go on in one call.
      await attachProperties(apiKey, email, properties, firstName || undefined);
    }

    return NextResponse.json({ success: true, sms: Boolean(phoneNumber) });
  } catch (err) {
    console.error('[subscribe] Klaviyo fetch threw:', err);
    if (!subscribed) {
      await markSignup(backupId, 'failed', String(err).slice(0, 400));
      if (!backupId) {
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 502 });
      }
    }
    return NextResponse.json({ success: true });
  }
}
