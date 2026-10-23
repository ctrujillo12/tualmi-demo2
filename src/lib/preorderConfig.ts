/**
 * What's on preorder, and how many are coming. Data only, no imports, so both
 * lib/inventory.ts (which caps in-stock sales) and lib/preorder.ts (which
 * prices and labels preorders) can read it without importing each other.
 *
 * ── HOW IT WORKS WITH SHOPIFY ────────────────────────────────────────────
 * The incoming units are ADDED to each variant's available stock in Shopify
 * (done 23 Oct 2026), with "Continue selling when out of stock" OFF. So for a
 * listed size, Shopify's available count is on-hand + incoming, and:
 *   available > incoming      the units above `incoming` are on hand: sold
 *                             in stock, full price, ships as normal
 *   1 to incoming             what's left is the incoming shipment: preorder,
 *                             discounted, ships later
 *   0                         sold out, as usual; Shopify stops selling
 * A size with nothing on hand (S, M) is a preorder from the first unit.
 *
 * ── WHEN THE SHIPMENT LANDS ──────────────────────────────────────────────
 * Delete the entry below. The counts in Shopify are already right, so every
 * size goes straight back to normal in-stock selling. Leaving the entry in
 * after the stock arrives would keep selling in-hand units as preorders.
 */
export interface PreorderConfig {
  colors: string[];
  /** Units on the purchase order, per size. Only these sizes go on preorder. */
  incoming: Record<string, number>;
  discountPct: number;
  /**
   * Sizes that get `discountPct`. Must match the AUTOMATIC discount in Shopify
   * exactly (Discounts → Amount off products → those variants), because that
   * discount is what actually changes the price at checkout. Sizes on
   * preorder but not listed here sell as preorders at full price.
   *
   * Only sizes with NOTHING on hand belong here: an automatic discount can't
   * tell an on-hand unit from an incoming one, so a size still selling stock
   * would give the discount on in-stock units too.
   */
  discountSizes: string[];
  /** e.g. "late December – early January" */
  shipWindow: string;
}

/**
 * Sierra Shorts, Picnic: PO #TM-002 (submitted 20 Oct 2026, ex-factory
 * 25 Dec 2026). S and M were sold out, so they start on preorder; the other
 * sizes sell what's on hand first.
 */
export const PREORDERS: Record<string, PreorderConfig> = {
  'sierra-shorts': {
    colors: ['Picnic'],
    incoming: { '2XS': 3, XS: 22, S: 34, M: 30, L: 8, XL: 3 },
    discountPct: 15,
    // Shopify automatic discount on Picnic S and M, set 23 Oct 2026.
    discountSizes: ['S', 'M'],
    shipWindow: 'late December – early January',
  },
};

const eq = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Size labels on the site may be "XXS"/"XXL" where Shopify and the PO say "2XS"/"2XL". */
const norm = (s: string) => s.trim().toUpperCase().replace(/^XXS$/, '2XS').replace(/^XXL$/, '2XL');

/** Units coming for this exact size + color, or null if it isn't on preorder. */
export function preorderIncoming(
  handle: string | undefined | null,
  color: string | undefined,
  size: string | undefined,
): number | null {
  const cfg = handle ? PREORDERS[handle] : undefined;
  if (!cfg || !color || !size) return null;
  if (!cfg.colors.some((c) => eq(c, color))) return null;
  const key = Object.keys(cfg.incoming).find((k) => norm(k) === norm(size));
  return key ? cfg.incoming[key] : null;
}
