/**
 * Low-stock flags, by product / colourway / size.
 *
 * ── WHY THIS IS A HAND-KEPT LIST ─────────────────────────────────────────
 * Because the storefront genuinely cannot see stock levels. Shopify exposes
 * `quantityAvailable` on a variant, but only to tokens holding the
 * `unauthenticated_read_product_inventory` scope — and ours doesn't. Adding
 * that field to the query without the scope makes Shopify reject the whole
 * request, which drops every product back to local data with no variants and
 * makes the entire store unbuyable. There's a comment in lib/shopify.ts saying
 * exactly that, because it has already happened once.
 *
 * So: a list you maintain. The cost is that it can go stale; the benefit is
 * that it cannot take checkout down.
 *
 * ── KEEPING IT HONEST ────────────────────────────────────────────────────
 * "Only a few left" is a promise about the real world. If it's on a size that
 * is in fact well stocked, it's the kind of small lie shoppers notice and
 * remember — and in the US the FTC treats fake urgency as a deceptive
 * practice. Clear the entry when you restock.
 *
 * ── HOW TO EDIT ──────────────────────────────────────────────────────────
 * Key is "<product handle>|<colourway>", value is the list of sizes running
 * low. Both are matched case-insensitively. To flag a whole colourway rather
 * than particular sizes, list every size.
 *
 *   'sierra-shorts|Picnic': ['S']      → Picnic, size S only
 *   'juniper-pant|Olive':   ['XS','S'] → Olive, two sizes
 *
 * Delete the key entirely when nothing in that colourway is low.
 */

const LOW_STOCK: Record<string, string[]> = {
  // Fewer than 10 pairs left, as of 18 Aug 2026.
  'sierra-shorts|Picnic': ['S'],
};

/** The wording used wherever a low-stock size is shown. */
export const LOW_STOCK_LABEL = 'only a few left';

/** True when this exact product + colourway + size is running low. */
export function isLowStock(
  handle: string | undefined,
  color: string | undefined,
  size: string | undefined,
): boolean {
  if (!handle || !color || !size) return false;
  const key = `${handle.trim().toLowerCase()}|${color.trim().toLowerCase()}`;
  const entry = Object.entries(LOW_STOCK).find(
    ([k]) => k.trim().toLowerCase() === key,
  );
  if (!entry) return false;
  return entry[1].some((s) => s.trim().toLowerCase() === size.trim().toLowerCase());
}

/** True when any size in this colourway is low — for a badge on the swatch. */
export function colorHasLowStock(
  handle: string | undefined,
  color: string | undefined,
): boolean {
  if (!handle || !color) return false;
  const key = `${handle.trim().toLowerCase()}|${color.trim().toLowerCase()}`;
  return Object.keys(LOW_STOCK).some((k) => k.trim().toLowerCase() === key);
}
