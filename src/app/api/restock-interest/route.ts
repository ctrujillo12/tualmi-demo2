import { NextRequest, NextResponse } from 'next/server';
import { klaviyoPrivateKey } from '@/lib/klaviyoKey';
import { backupSignup, markSignup } from '@/lib/signupBackup';

/**
 * "Tell me if this size comes back" on a product page.
 *
 * Deliberately NOT /api/subscribe: that endpoint opts people into marketing
 * email, and someone asking about one sold-out size never agreed to that. This
 * records the request only:
 *   1. a row in Supabase (public.signups, source 'restock') so it can't be lost
 *   2. a "Restock Interest" event on their Klaviyo profile, carrying the
 *      product, size and colour. No list subscription, no marketing consent.
 *
 * To count demand, filter the signups table on source = 'restock' (the
 * details are in attribution -> 'restock'), or look at the "Restock Interest"
 * metric in Klaviyo. To email people when stock lands, build a Klaviyo flow or
 * segment on that event.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, productId, productName, size, color } = body as Record<string, unknown>;

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const cleanEmail = str(email, 200);
  const product = str(productId, 80);
  const name = str(productName, 120);
  const sizes = Array.isArray(size) ? size.map((s) => str(s, 20)).filter(Boolean).slice(0, 12) : [str(size, 20)].filter(Boolean);
  const colour = str(color, 60);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }
  if (!product || sizes.length === 0) {
    return NextResponse.json({ error: 'Pick a size' }, { status: 400 });
  }

  const restock = { product, product_name: name, sizes, color: colour };

  const backupId = await backupSignup({
    email: cleanEmail,
    first_name: null,
    phone: null,
    sms_consent: false,
    source: 'restock',
    event_id: null,
    ref: null,
    attribution: { restock },
  });

  const apiKey = klaviyoPrivateKey();
  if (!apiKey) {
    console.error('[restock-interest] KLAVIYO_API_KEY missing. Request:', cleanEmail, JSON.stringify(restock));
    await markSignup(backupId, 'not_configured', 'KLAVIYO_API_KEY missing');
    if (!backupId) return NextResponse.json({ error: 'Something went wrong. Please try again shortly.' }, { status: 503 });
    return NextResponse.json({ success: true });
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
            properties: { product, product_name: name, sizes, size: sizes.join(', '), color: colour },
            metric: { data: { type: 'metric', attributes: { name: 'Restock Interest' } } },
            profile: { data: { type: 'profile', attributes: { email: cleanEmail } } },
          },
        },
      }),
    });
    if (!res.ok) {
      const errBody = (await res.text()).slice(0, 400);
      console.error('[restock-interest] Klaviyo rejected the event:', res.status, errBody);
      await markSignup(backupId, 'failed', `${res.status}: ${errBody}`);
      if (!backupId) return NextResponse.json({ error: 'Something went wrong. Please try again shortly.' }, { status: 502 });
    } else {
      await markSignup(backupId, 'ok');
      console.log('[restock-interest]', cleanEmail, product, sizes.join(','), colour);
    }
  } catch (err) {
    console.error('[restock-interest] Klaviyo fetch threw:', err);
    await markSignup(backupId, 'failed', String(err).slice(0, 400));
    if (!backupId) return NextResponse.json({ error: 'Something went wrong. Please try again shortly.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
