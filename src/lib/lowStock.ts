/**
 * Manual low-stock overrides.
 *
 * ── THIS IS NO LONGER THE PRIMARY SOURCE ─────────────────────────────────
 * Low stock is now derived from real Shopify quantities. lib/inventory.ts
 * reads `quantityAvailable` off each variant and flags anything at or below
 * LOW_STOCK_AT_OR_BELOW (10 by default — so 1 through 10), which means the
 * storefront tracks restocks and sell-downs on its own with nothing to
 * maintain here.
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
  // Verified against Shopify on 18 Aug 2026 (scripts/dump-variants.mjs).
  // Sierra Shorts, Picnic: XS=8, S=10, XL=8 — all at or under the threshold.
  // 2XS and 2XL are also thin but exempt by design, see NO_LOW_STOCK_DOT.
  //
  // Only reachable if the inventory scope stops working. While quantities are
  // readable this is dead weight, and the numbers above will drift.
  'sierra-shorts|Picnic': ['XS', 'S', 'XL'],
  'sierra-shorts|Jam': ['XS', 'XL'],
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

// ─── Sizes that never show the low-stock dot ────────────────────────────────
//
// The end sizes are stocked thin on purpose — two units each, not two units
// *left*. Flagging them as low is technically true and practically misleading:
// a shopper reads the dot as "nearly gone, everyone's buying these" when in
// fact nobody has bought one. Worse, it makes the size look like a bad bet and
// nudges people away from the size they actually need.
//
// Both spellings are listed because the storefront's local product data says
// XXS/XXL while Shopify variants may be titled 2XS/2XL, and this has to match
// whichever comes back.
//
// ── WHAT THIS DOES NOT DO ───────────────────────────────────────────────
// It only hides the low-stock dot. A size in this list that genuinely hits
// zero still shows as sold out and still can't be added to the cart — that
// path reads availableForSale, which nothing here touches.
//
// ── WHEN TO REVISIT ─────────────────────────────────────────────────────
// When you start stocking these sizes at normal depth. At that point a low
// count means the same thing it means everywhere else, and hiding it costs a
// shopper the warning they'd want. Remove the size from this list then.
const NO_LOW_STOCK_DOT = ['xxs', '2xs', 'xxl', '2xl'];

/** True when this size is deliberately exempt from the low-stock treatment. */
export function suppressesLowStockDot(size: string | undefined): boolean {
  if (!size) return false;
  return NO_LOW_STOCK_DOT.includes(size.trim().toLowerCase());
}
