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
 * There are no size exemptions any more — every size at or below the threshold
 * gets the dot. See the note at the bottom of this file for what was removed.
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
  //
  // XXS and XXL are listed too. They're stocked around two units each, which is
  // under the threshold like everything else here, and as of 19 Aug 2026 they
  // are no longer exempt from the dot (see the note at the bottom of this
  // file). Spelled the way the storefront spells them — lib/products.ts says
  // XXS/XXL — since that's what gets passed to this function.
  //
  // Only reachable if the inventory scope stops working. While quantities are
  // readable this is dead weight, and the numbers above will drift.
  'sierra-shorts|Picnic': ['XXS', 'XS', 'S', 'XL', 'XXL'],
  'sierra-shorts|Jam': ['XXS', 'XS', 'XL', 'XXL'],
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

// ─── Removed: the end-size exemption ────────────────────────────────────────
//
// XXS/2XS and XXL/2XL used to be exempt from the low-stock dot, via a
// NO_LOW_STOCK_DOT list here and a `suppressesLowStockDot()` check in
// lib/inventory.ts. Removed 19 Aug 2026 at Cheyenne's request: every size at
// or below LOW_STOCK_AT_OR_BELOW now gets the dot, end sizes included.
//
// The argument for the exemption, recorded so it isn't rediscovered from
// scratch: the end sizes are stocked thin on purpose — around two units each,
// not two units *left*. A dot there is technically true and reads as "nearly
// gone, everyone's buying these" when in fact nobody has bought one, which
// makes the size look like a bad bet and can push a shopper off the size she
// actually needs.
//
// The argument against, which is the one in force: two units left is two units
// left whatever the reason, and a shopper who doesn't buy today finds it gone
// either way. Consistency across sizes is easier to trust than a rule that
// quietly stays silent at both ends of the range.
//
// If you bring the exemption back, it belongs in exactly the two places named
// above, and remember it only ever hid the DOT — an exempt size at zero still
// went sold out and still couldn't be added to the cart, because that path
// reads availableForSale and never touched this file.
