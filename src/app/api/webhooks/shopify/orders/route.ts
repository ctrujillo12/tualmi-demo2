import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Shopify orders webhook → server-side GA4 `purchase`.
 *
 * The problem this solves: checkout happens on Shopify, and Shop Pay adds a
 * further hop through shop.app. By the time an order completes there is no
 * browser context left that ties it to the original GA4 session, so purchases
 * land as "direct" regardless of how well the landing page was tagged.
 *
 * The fix: at checkout we stamp the cart with the GA4 client_id / session_id
 * and the original UTM values (see store/cartStore.ts). Shopify carries those
 * onto the order. Here we read them back and replay a `purchase` event through
 * the Measurement Protocol using the SAME ids, so GA4 stitches the revenue onto
 * the session that actually earned it.
 *
 * Required environment variables:
 *   GA4_API_SECRET          GA4 → Admin → Data Streams → Measurement Protocol
 *   SHOPIFY_WEBHOOK_SECRET  shown when you create the webhook in Shopify
 *   GA4_DEBUG=1             optional — routes events to GA4 DebugView
 *
 * Configure in Shopify: Settings → Notifications → Webhooks → create
 *   Event: "Order payment" (orders/paid)
 *   Format: JSON
 *   URL: https://tualmi.com/api/webhooks/shopify/orders
 */

export const runtime = 'nodejs'; // needs crypto + the raw request body

const GA_MEASUREMENT_ID = 'G-PTRJN12KTL';

/**
 * Idempotency. Shopify retries a webhook until it gets a 2xx, and a duplicate
 * delivery would double-count revenue in GA4.
 *
 * NOTE: this is an in-memory guard, so it only protects within a warm serverless
 * instance. Shopify's retries are usually seconds to minutes apart and normally
 * hit the same warm instance, so this catches the common case — but it is NOT a
 * hard guarantee. A durable store (Upstash/Redis) would be needed for that.
 */
const seenOrders = new Map<string, number>();
const SEEN_TTL_MS = 6 * 60 * 60 * 1000;

function alreadyProcessed(orderId: string): boolean {
  const now = Date.now();
  for (const [id, ts] of seenOrders) {
    if (now - ts > SEEN_TTL_MS) seenOrders.delete(id);
  }
  if (seenOrders.has(orderId)) return true;
  seenOrders.set(orderId, now);
  return false;
}

/** Constant-time HMAC check — anyone can POST to this URL otherwise. */
function verifyShopifyHmac(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest);
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

type ShopifyAttribute = { name: string; value: string };
type ShopifyLineItem = {
  product_id?: number | string;
  variant_id?: number | string;
  title?: string;
  variant_title?: string;
  quantity?: number;
  price?: string;
  sku?: string;
};

function attr(attrs: ShopifyAttribute[], key: string): string | undefined {
  return attrs.find((a) => a.name === key)?.value || undefined;
}

export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const apiSecret = process.env.GA4_API_SECRET;

  // Read the raw body BEFORE parsing — HMAC is computed over exact bytes.
  const raw = await req.text();

  if (!secret) {
    console.error('[ga-webhook] SHOPIFY_WEBHOOK_SECRET not set — rejecting');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  if (!verifyShopifyHmac(raw, req.headers.get('x-shopify-hmac-sha256'), secret)) {
    console.warn('[ga-webhook] HMAC verification failed — ignoring request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let order: Record<string, unknown>;
  try {
    order = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const orderId = String(order.id ?? order.order_number ?? '');
  const orderName = String(order.name ?? orderId);

  if (!orderId) {
    console.error('[ga-webhook] Order payload had no id');
    return NextResponse.json({ ok: true }); // don't make Shopify retry forever
  }

  if (alreadyProcessed(orderId)) {
    console.log('[ga-webhook] Duplicate delivery for order', orderName, '— skipped');
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const attrs = (order.note_attributes as ShopifyAttribute[] | undefined) ?? [];

  const clientId = attr(attrs, '_ga_client_id');
  const sessionId = attr(attrs, '_ga_session_id');
  const referredBy = attr(attrs, 'Referred by');
  const channel = attr(attrs, 'Channel');
  const campaign = attr(attrs, 'Campaign');

  if (!apiSecret) {
    console.error('[ga-webhook] GA4_API_SECRET not set — order', orderName, 'not sent to GA4');
    return NextResponse.json({ ok: true });
  }

  if (!clientId) {
    // Happens for orders that didn't originate from our storefront (draft
    // orders, POS, Shop app browsing). Nothing to stitch to — log and move on
    // rather than inventing a client id, which would create a phantom user.
    console.warn(
      '[ga-webhook] Order', orderName, 'has no _ga_client_id — skipping GA4 purchase.',
      'referred_by:', referredBy ?? '(none)'
    );
    return NextResponse.json({ ok: true, skipped: 'no client_id' });
  }

  const lineItems = (order.line_items as ShopifyLineItem[] | undefined) ?? [];
  const currency = String(order.currency ?? 'USD');
  const value = Number(order.total_price ?? 0);

  const payload = {
    client_id: clientId,
    // Not a real GA4 field, but harmless and useful when eyeballing DebugView.
    non_personalized_ads: false,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: orderName,
          value,
          currency,
          tax: Number(order.total_tax ?? 0),
          shipping: Number(
            (order.total_shipping_price_set as { shop_money?: { amount?: string } } | undefined)
              ?.shop_money?.amount ?? 0
          ),
          coupon: (order.discount_codes as { code?: string }[] | undefined)?.[0]?.code,
          // Stitches this event onto the original session.
          ...(sessionId ? { session_id: sessionId } : {}),
          engagement_time_msec: 1,
          // Original campaign, so revenue is credited to the creator/channel
          // rather than to "direct".
          ...(referredBy ? { source: referredBy } : {}),
          ...(channel ? { medium: channel } : {}),
          ...(campaign ? { campaign: campaign } : {}),
          items: lineItems.map((li) => ({
            item_id: String(li.sku || li.variant_id || li.product_id || ''),
            item_name: li.title ?? 'item',
            item_variant: li.variant_title ?? undefined,
            price: Number(li.price ?? 0),
            quantity: li.quantity ?? 1,
          })),
        },
      },
    ],
  };

  const debug = process.env.GA4_DEBUG === '1';

  // IMPORTANT: /debug/mp/collect only VALIDATES a payload — it never records
  // the event, so nothing shows up in DebugView. To make an event appear there
  // you send it to the normal endpoint with `debug_mode: true` in the params.
  // When debugging we do both: validate (for the error messages) and send.
  if (debug) {
    try {
      const check = await fetch(
        `https://www.google-analytics.com/debug/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${apiSecret}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      console.log('[ga-webhook] validation response:', await check.text());
    } catch (err) {
      console.error('[ga-webhook] validation call failed:', err);
    }
    // Flag the real event so GA4 routes it to DebugView.
    (payload.events[0].params as Record<string, unknown>).debug_mode = true;
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.error('[ga-webhook] Measurement Protocol returned', res.status, await res.text());
    } else {
      console.log(
        '[ga-webhook] purchase sent — order', orderName,
        '| value', value, currency,
        '| source', referredBy ?? 'direct',
        '| session', sessionId ?? '(none)',
        debug ? '| debug_mode ON' : ''
      );
    }
  } catch (err) {
    console.error('[ga-webhook] Failed to reach GA4 for order', orderName, err);
  }

  // Always 2xx once the signature is valid — a non-2xx makes Shopify retry,
  // and an analytics failure isn't worth a retry storm.
  return NextResponse.json({ ok: true });
}
