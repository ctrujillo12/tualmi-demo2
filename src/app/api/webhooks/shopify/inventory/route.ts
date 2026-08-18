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
 * topic, all pointing here:
 *   inventory_levels/update   ← the important one: stock moved
 *   products/update           ← catches variant add/remove, policy changes
 * Format: JSON
 * URL: https://hooks.tualmi.com/api/webhooks/shopify/inventory
 *
 * ── WHY NOT tualmi.com ───────────────────────────────────────────────────
 * Shopify refuses to send webhooks to a domain connected to the store, and
 * tualmi.com is the store's primary domain (it's what builds checkout URLs).
 * The form rejects it outright.
 *
 * ── WHY NOT THE .vercel.app URL ──────────────────────────────────────────
 * The project runs Vercel SSO protection scoped to `all_except_custom_domains`,
 * so every *.vercel.app URL answers 401 behind an auth wall. Shopify would see
 * failures and eventually delete the webhook. Custom domains are exempt, which
 * is why hooks.tualmi.com is the destination: reachable, and not a domain
 * Shopify considers its own.
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
