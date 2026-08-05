import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns / exchanges portal submissions.
 *
 * Klaviyo is the ONLY destination. This function stores nothing itself — a
 * serverless function has no durable filesystem, so if the Klaviyo call fails
 * the submission is gone the moment this returns.
 *
 * Because of that, the rule here is: never tell the customer it worked unless
 * Klaviyo actually accepted it. An earlier version returned success no matter
 * what, which silently destroyed a real customer's request. If Klaviyo fails we
 * log the full submission AND return an error, so the form tells her to email
 * us instead. A failure the customer knows about is recoverable. A silent one
 * is not.
 */

type ReturnRequest = {
  receivedAt: string;
  name: string;
  email: string;
  orderNumber: string;
  requestType: string;
  item: string;
  sizeHave: string;
  sizeWant: string;
  reason: string;
};

const CONTACT_FALLBACK =
  'We could not save your request. Please email hello@tualmi.com with your order number and we will sort it out right away.';

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

  const record: ReturnRequest = {
    receivedAt: new Date().toISOString(),
    name: String(name || ''),
    email: String(email),
    orderNumber: String(orderNumber),
    requestType: String(requestType),
    item: String(item || ''),
    sizeHave: String(sizeHave || ''),
    sizeWant: String(sizeWant || ''),
    reason: String(reason),
  };

  const apiKey = process.env.KLAVIYO_API_KEY;

  // No key = nothing can be delivered. Log the whole submission so it's at
  // least recoverable from Vercel logs, and tell the customer it failed.
  if (!apiKey) {
    console.error(
      '[returns] KLAVIYO_API_KEY is not set in this environment — submission NOT delivered:',
      JSON.stringify(record)
    );
    return NextResponse.json({ error: CONTACT_FALLBACK }, { status: 500 });
  }

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
            properties: {
              order_number: record.orderNumber,
              request_type: record.requestType,
              item: record.item,
              size_have: record.sizeHave,
              size_want: record.sizeWant,
              reason: record.reason,
            },
            metric: {
              data: { type: 'metric', attributes: { name: 'Return or Exchange Request' } },
            },
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email: record.email,
                  ...(record.name ? { first_name: record.name } : {}),
                },
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      // 403 here usually means the private key lacks the events scope.
      // ALWAYS log the submission alongside the error — this is what makes a
      // failed request recoverable.
      console.error(
        '[returns] Klaviyo rejected the event — status:',
        res.status,
        '— response:',
        detail.slice(0, 500),
        '— submission:',
        JSON.stringify(record)
      );
      return NextResponse.json({ error: CONTACT_FALLBACK }, { status: 500 });
    }

    console.log('[returns] delivered to Klaviyo for', record.email, '— order', record.orderNumber);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(
      '[returns] Network error reaching Klaviyo:',
      err,
      '— submission:',
      JSON.stringify(record)
    );
    return NextResponse.json({ error: CONTACT_FALLBACK }, { status: 500 });
  }
}
