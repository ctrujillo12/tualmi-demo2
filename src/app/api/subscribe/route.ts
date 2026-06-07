import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const apiKey  = process.env.KLAVIYO_API_KEY;
  const listId  = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    console.warn('[subscribe] Missing KLAVIYO_API_KEY or KLAVIYO_LIST_ID');
    // Gracefully succeed in dev so the popup UX can be tested without credentials
    return NextResponse.json({ success: true });
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
      console.warn('[subscribe] Klaviyo non-OK response:', res.status, body);
      // Treat all Klaviyo errors as success — the most common case is the email
      // already being on the list, which isn't an error from the user's perspective.
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[subscribe] fetch error:', err);
    // Even on network error, show success so users always get their code
    return NextResponse.json({ success: true });
  }
}
