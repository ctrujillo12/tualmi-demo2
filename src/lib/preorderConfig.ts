/**
 * What's on preorder, and how many are coming. Data only, no imports, so both
 * lib/inventory.ts (which caps preorders) and lib/preorder.ts (which prices and
 * labels them) can read it without importing each other.
 *
 * ── HOW IT WORKS WITH SHOPIFY ────────────────────────────────────────────
 * For every size listed here, tick "Continue selling when out of stock" on
 * that variant in Shopify and leave its on-hand count alone. Then, per size:
 *   on hand > 0                      in stock: full price, ships as normal
 *   0 down to -(incoming - 1)        preorder: discounted, ships later
 *   -(incoming) or lower             sold out: every incoming unit is spoken for
 * Shopify counts backordered units as negative stock, so "how many preorders
 * have sold" is just how far below zero the count is.
 *
 * The cap is enforced by this site (add to cart, quantity, checkout
 * validation). Shopify itself will keep selling, so turn "Continue selling"
 * back OFF for a size if it should stop for any reason.
 *
 * ── WHEN THE SHIPMENT LANDS ──────────────────────────────────────────────
 * Receive the stock in Shopify, untick "Continue selling", and delete the
 * entry below. Every size then sells as normal in-stock again.
 */
export interface PreorderConfig {
  colors: string[];
  /** Units on the purchase order, per size. Only these sizes go on preorder. */
  incoming: Record<string, number>;
  discountPct: number;
  /** e.g. "late December – early January" */
  shipWindow: string;
  /**
   * The Shopify discount code that gives the preorder discount, applied by the
   * site at checkout only when the cart holds a preorder line. A code rather
   * than an automatic discount because the same variants also sell in stock at
   * full price, and an automatic discount can't tell the two apart.
   */
  code: string;
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
    shipWindow: 'late December – early January',
    code: 'PREORDER15',
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
