import { NextRequest, NextResponse } from 'next/server';

// Backup: push email into Upstash KV list so nothing is ever lost
async function backupToKV(email: string) {
  const token = process.env.KV_REST_API_TOKEN;
  const url   = process.env.KV_REST_API_URL;
  if (!token || !url) return;
  try {
    await fetch(`${url}/lpush/email_signups/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    console.error('[subscribe] KV backup failed:', e);
  }
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  // Always save to KV first — even if Klaviyo fails, the email is captured
  await backupToKV(email);

  const apiKey = process.env.KLAVIYO_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('[subscribe] Missing KLAVIYO_API_KEY or KLAVIYO_LIST_ID in Vercel env vars');
    return NextResponse.json({ success: true }); // email already saved to KV
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
              profiles: {
                data: [{
                  type: 'profile',
                  attributes: {
                    email,
                    subscriptions: {
                      email: { marketing: { consent: 'SUBSCRIBED' } },
                    },
                  },
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
      const body = await res.text();
      console.error('[subscribe] Klaviyo error — status:', res.status, '— body:', body);
    } else {
      console.log('[subscribe] Klaviyo success:', email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscribe] Klaviyo fetch threw:', err);
    return NextResponse.json({ success: true }); // email already in KV backup
  }
}
