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

  // Klaviyo profile properties: which form they used (signup_source) plus where
  // they originally came from (utm_* / referrer). The attribution fields replace
  // the old manual "how did you find us?" dropdown.
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

  if (Object.keys(properties).length > 0) {
    profileAttributes.properties = properties;
  }

  profileAttributes.subscriptions = subscriptions;

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
    }

    return NextResponse.json({ success: true, sms: Boolean(phoneNumber) });
  } catch (err) {
    console.error('[subscribe] Klaviyo fetch threw:', err);
    return NextResponse.json({ success: true });
  }
}
