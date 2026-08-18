/**
 * Manual low-stock overrides.
 *
 * ── THIS IS NO LONGER THE PRIMARY SOURCE ─────────────────────────────────
 * Low stock is now derived from real Shopify quantities. lib/inventory.ts
 * reads `quantityAvailable` off each variant and flags anything at or below
 * LOW_STOCK_THRESHOLD, so the storefront tracks restocks and sell-downs on its
 * own with nothing to maintain here.
 *
 * The old comment in this file claimed the storefront "genuinely cannot see
 * stock levels". It can — the query failed because the Storefront token was
 * missing the `unauthenticated_read_product_inventory` scope, not because the
 * field is off-limits. lib/shopify.ts now requests the field optimistically
 * and retries without it if the token can't read it, so a missing scope
 * degrades to this list instead of taking checkout down.
 *
 * ── WHEN TO EDIT THIS FILE ───────────────────────────────────────────────
 * Only two cases:
 *   1. The inventory scope isn't granted yet (the server log carries a warning
 *      from lib/shopify.ts when that's so) — this list is the whole mechanism
 *      until it is.
 *   2. A colourway you want flagged sooner than the global threshold — say a
 *      size you're deliberately holding back.
 *
 * When quantities ARE readable, entries here are ignored. Real numbers win.
 *
 * ── KEEPING IT HONEST ────────────────────────────────────────────────────
 * "Only a few left" is a claim about the real world. On a well-stocked size
 * it's the kind of small lie shoppers notice, and the FTC treats manufactured
 * urgency as a deceptive practice. Clear the entry when you restock.
 *
 * Key is "<product handle>|<colourway>", value is the sizes running low. Both
 * are matched case-insensitively.
 *
 *   'sierra-shorts|Picnic': ['S']      → Picnic, size S only
 *   'juniper-pant|Olive':   ['XS','S'] → Olive, two sizes
 */

const LOW_STOCK_OVERRIDES: Record<string, string[]> = {
  // Fewer than 10 pairs left, as of 18 Aug 2026.
  'sierra-shorts|Picnic': ['S'],
};

/** The wording used wherever a low-stock size is shown. */
export const LOW_STOCK_LABEL = 'only a few left';

/** Wording for a size Shopify says can't be sold. */
export const SOLD_OUT_LABEL = 'sold out';

/**
 * Manually-flagged sizes for a product + colourway. Consulted by
 * lib/inventory.ts only when real quantities aren't readable.
 */
export function manualLowStockSizes(
  handle: string | undefined,
  color: string | undefined,
): string[] {
  if (!handle || !color) return [];
  const key = `${handle.trim().toLowerCase()}|${color.trim().toLowerCase()}`;
  const entry = Object.entries(LOW_STOCK_OVERRIDES).find(
    ([k]) => k.trim().toLowerCase() === key,
  );
  return entry ? entry[1] : [];
}
