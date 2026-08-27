/**
 * Wording for the stock states the storefront shows.
 *
 * That's all this file is now. Low stock itself is derived from real Shopify
 * quantities in lib/inventory.ts, which reads `quantityAvailable` off each
 * variant and flags anything at or below LOW_STOCK_AT_OR_BELOW — so the
 * storefront tracks restocks and sell-downs on its own, with nothing to
 * maintain here.
 *
 * ── WHAT USED TO LIVE HERE ───────────────────────────────────────────────
 * A hand-kept LOW_STOCK_OVERRIDES map (product handle + colourway → sizes to
 * flag) and a manualLowStockSizes() lookup, used as a fallback for when the
 * Storefront token couldn't read inventory. Removed 27 Aug 2026.
 *
 * Two reasons. First, the scope is live — the boot log says "Inventory
 * quantities readable" — so the map had been dead code since the token was
 * fixed, and its numbers were last verified on 18 Aug 2026. It still listed
 * Picnic / S as merely low when Shopify has it at zero. A fallback nobody
 * exercises doesn't stay correct; it just waits to be wrong at the worst
 * moment. Second, a stale list is a worse failure than no list: "only a few
 * left" is a claim about the real world, and the FTC treats manufactured
 * urgency as a deceptive practice.
 *
 * If the scope ever breaks again, lib/inventory.ts now goes quiet rather than
 * guessing — no dots at all, and lib/shopify.ts logs a loud warning naming the
 * `unauthenticated_read_product_inventory` scope. A missing dot costs a nudge.
 * A wrong dot costs trust.
 */

/** The wording used wherever a low-stock size is shown. */
export const LOW_STOCK_LABEL = 'only a few left';

/** Wording for a size Shopify says can't be sold. */
export const SOLD_OUT_LABEL = 'sold out';

// ─── Removed: the end-size exemption ────────────────────────────────────────
//
// XXS/2XS and XXL/2XL used to be exempt from the low-stock dot, via a
// NO_LOW_STOCK_DOT list here and a `suppressesLowStockDot()` check in
// lib/inventory.ts. Removed 19 Aug 2026; deliberately left removed on
// 27 Aug 2026 when LOW_STOCK_AT_OR_BELOW dropped from 10 to 4.
//
// The argument for the exemption, recorded so it isn't rediscovered from
// scratch: the end sizes are stocked thin on purpose — a handful of units
// each, not a handful *left*. A dot there is technically true and reads as
// "nearly gone, everyone's buying these" when in fact nobody has bought one,
// which makes the size look like a bad bet and can push a shopper off the size
// she actually needs.
//
// Why it stays removed: the real fault was the threshold, not the end sizes. At
// 10, a variant stocked ~14 deep got the dot after selling four units ever, so
// the dot marched across the whole size run as the drop sold through normally —
// four of seven sizes on Sierra Shorts / Jam by 20 Aug. At 4 the dot fires only
// when a size is genuinely about to go, which drops the end sizes off the list
// on the merits and leaves one rule that applies evenly to every size. A rule
// that quietly goes silent at both ends of the range is harder to trust than
// one honest number.
//
// If you do bring the exemption back, it belongs in exactly the two places
// named above, and remember it only ever hid the DOT — an exempt size at zero
// still went sold out and still couldn't be added to the cart, because that
// path reads availableForSale and never touched this file.
