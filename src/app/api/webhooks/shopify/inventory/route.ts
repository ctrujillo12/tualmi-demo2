import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import crypto from 'crypto';
import { SHOPIFY_PRODUCTS_TAG } from '@/lib/shopify';

/**
 * Shopify inventory webhook → flush the storefront's product cache.
 *
 * The problem this solves: product reads are cached for 60 seconds
 * (lib/shopify.ts) and product pages are statically generated, so a sell-out
 * in Shopify could keep showing as buyable on the storefront until the window
 * expired — and on a statically rendered page, potentially longer. Sixty
 * seconds is a long time during a drop.
 *
 * The fix: every product query is tagged, and this route calls revalidateTag
 * the moment Shopify says stock moved. The next request rebuilds from live
 * data. The 60-second window stays as the backstop for anything that slips
 * past — a missed delivery just means the old behaviour, not stale forever.
 *
 * Required environment variable:
 *   SHOPIFY_WEBHOOK_SECRET   shown when you create the webhook in Shopify
 *   (the same secret the orders webhook uses)
 *
 * Configure in Shopify: Settings → Notifications → Webhooks → create one per
 * topic, both pointing at this route:
 *   inventory_levels/update   ← the important one: stock moved
 *   products/update           ← catches variant add/remove, policy changes
 * Format: JSON
 *
 * ── THIS WAS NEVER ACTUALLY WIRED UP. CHECKED 19 Sept 2026 ───────────────
 * The note here used to give the URL as https://hooks.tualmi.com/... That
 * subdomain does not exist. The Vercel project serves exactly three domains —
 * tualmi.com, www.tualmi.com and tualmi-outdoors.vercel.app — so every
 * delivery Shopify attempted failed DNS and this route has never run: 24 hours
 * of runtime logs showed hits on /api/webhooks/shopify/orders and none here.
 *
 * The consequence is not an oversell — Shopify re-checks stock at payment —
 * but staleness. With no cache flush, a sell-out takes up to the product
 * page's own revalidate window (300s, see products/[id]/page.tsx) to leave the
 * storefront instead of going the moment Shopify says so.
 *
 * ── THE URL TO USE ───────────────────────────────────────────────────────
 *   https://tualmi-outdoors.vercel.app/api/webhooks/shopify/inventory
 *
 * That is the host the orders webhook is ACTUALLY registered at (confirmed
 * against Shopify admin on 19 Sept 2026), and it is receiving deliveries, so
 * it is known to work for this store. Topics: inventory_levels/update and
 * products/update. Format JSON. Any API version — this route never reads the
 * body, it only flushes the cache.
 *
 * ── TWO CLAIMS THE OLD NOTE MADE, BOTH WRONG ─────────────────────────────
 * It said Shopify refuses webhooks to a domain connected to the store, and
 * that *.vercel.app sits behind Vercel SSO and would answer 401. The second is
 * disproved by the orders webhook working on exactly that domain. The first
 * may well be true of tualmi.com, but it is moot: the .vercel.app URL is the
 * one in use and the one to match.
 *
 * The lesson worth keeping: this file specified a destination that had never
 * been created, in enough detail to sound verified, and nothing failed loudly
 * enough for anyone to notice for months. If you change the URL, change it in
 * Shopify admin first and confirm a delivery lands before writing it here.
 */

export const runtime = 'nodejs'; // needs crypto + the raw request body

/** Constant-time HMAC check — anyone can POST to this URL otherwise. */
function verifyShopifyHmac(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const a = Buffer.from(digest);
  const b = Buffer.from(header);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  // Read the raw body BEFORE parsing — HMAC is computed over exact bytes.
  const raw = await req.text();

  if (!secret) {
    console.error('[inventory-webhook] SHOPIFY_WEBHOOK_SECRET not set — rejecting');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  if (!verifyShopifyHmac(raw, req.headers.get('x-shopify-hmac-sha256'), secret)) {
    console.warn('[inventory-webhook] HMAC verification failed — ignoring request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const topic = req.headers.get('x-shopify-topic') ?? 'unknown';

  // Deliberately not deduplicated. Revalidation is idempotent — the worst a
  // retry costs is one extra cache flush — so the in-memory guard the orders
  // webhook needs (where a duplicate would double-count revenue) would be
  // complexity for nothing here.
  try {
    revalidateTag(SHOPIFY_PRODUCTS_TAG);
    console.info(`[inventory-webhook] ${topic} → revalidated "${SHOPIFY_PRODUCTS_TAG}"`);
  } catch (err) {
    // Always 200 back to Shopify regardless. A non-2xx puts the webhook into
    // Shopify's retry queue and, after enough failures, gets it deleted
    // outright — losing every future inventory update over one bad minute.
    console.error('[inventory-webhook] revalidateTag failed:', err);
  }

  return NextResponse.json({ ok: true, topic });
}
