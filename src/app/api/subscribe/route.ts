import { NextRequest, NextResponse } from 'next/server';

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
  properties: Record<string, string>
): Promise<void> {
  if (Object.keys(properties).length === 0) return;

  try {
    const res = await fetch('https://a.klaviyo.com/api/profile-import/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: { type: 'profile', attributes: { email, properties } },
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, phone, smsConsent, source, attribution } = body as {
    email?: string;
    phone?: string;
    smsConsent?: boolean;
    source?: string;
    /** UTM params + referring channel, captured client-side. See lib/attribution.ts. */
    attribution?: Record<string, string>;
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

  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    // Log the address itself — otherwise a misconfigured environment loses
    // signups without leaving any trace of who tried to subscribe.
    console.error(
      '[subscribe] Missing KLAVIYO_API_KEY or KLAVIYO_LIST_ID in Vercel env vars — LOST signup:',
      email,
      phoneNumber ? `(phone ${phoneNumber})` : ''
    );
    return NextResponse.json({ success: true });
  }

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
    } else {
      console.log('[subscribe] Klaviyo success:', email, phoneNumber ? '(+sms)' : '');
      // Best-effort only. Attribution is nice to have; the subscription is the
      // thing that matters and has already succeeded by this point, so a
      // failure here must never affect the response.
      await attachProperties(apiKey, email, properties);
    }

    return NextResponse.json({ success: true, sms: Boolean(phoneNumber) });
  } catch (err) {
    console.error('[subscribe] Klaviyo fetch threw:', err);
    return NextResponse.json({ success: true });
  }
}
