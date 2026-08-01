import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns / exchanges portal submissions.
 * Logs each request as a Klaviyo event ("Return or Exchange Request") on the
 * customer's profile, so it's stored, searchable, and can trigger a Klaviyo
 * flow (e.g. notify the team + auto-reply to the customer).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { name, email, orderNumber, requestType, item, sizeHave, sizeWant, reason } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }
  if (!orderNumber || !requestType || !reason) {
    return NextResponse.json(
      { error: 'Order number, request type, and a reason are required.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.KLAVIYO_API_KEY;
  if (!apiKey) {
    // Don't lose the request — log it so it's recoverable from server logs.
    console.error('[returns] Missing KLAVIYO_API_KEY — request not delivered:', body);
    return NextResponse.json({ success: true });
  }

  try {
    const res = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            properties: {
              order_number: orderNumber,
              request_type: requestType,
              item: item || '',
              size_have: sizeHave || '',
              size_want: sizeWant || '',
              reason,
            },
            metric: {
              data: { type: 'metric', attributes: { name: 'Return or Exchange Request' } },
            },
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email,
                  ...(name ? { first_name: name } : {}),
                },
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      console.error('[returns] Klaviyo error — status:', res.status, '— body:', await res.text());
    } else {
      console.log('[returns] logged request for', email, '— order', orderNumber);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[returns] fetch threw:', err);
    return NextResponse.json({ success: true });
  }
}
