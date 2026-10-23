/**
 * What's on preorder, and how many are coming. Data only, no imports, so both
 * lib/inventory.ts (which caps preorders) and lib/preorder.ts (which prices and
 * labels them) can read it without importing each other.
 *
 * ── HOW IT WORKS WITH SHOPIFY ────────────────────────────────────────────
 * Each listed variant holds its REAL on-hand count in Shopify, with "Continue
 * selling when out of stock" ON (set up 23 Oct 2026). The incoming units are
 * not in Shopify's count. Then, per size:
 *   on hand > 0                      in stock: full price, ships as normal
 *   0 down to -(incoming - 1)        preorder: ships later
 *   -(incoming) or lower             sold out: every incoming unit is spoken for
 * Shopify counts backordered units as negative stock, so how far below zero a
 * size is = how many preorders have sold.
 *
 * The cap is enforced by this site (add to cart, quantity, checkout
 * validation). Shopify itself would keep selling, so a sale on another channel
 * (Shop app, social shops, POS) isn't capped or labelled as a preorder.
 *
 * ── WHEN THE SHIPMENT LANDS ──────────────────────────────────────────────
 * Receive the stock in Shopify, untick "Continue selling", and delete the
 * entry below. Every size then sells as normal in-stock again.
 */
export interface PreorderConfig {
  colors: string[];
  /** Units on the purchase order, per size. Only these sizes go on preorder. */
  incoming: Record<string, number>;
  /** Every preorder unit gets this; in-stock units of the same sizes don't. */
  discountPct: number;
  /**
   * The Shopify discount CODE that gives `discountPct`, applied by the site at
   * checkout only when the cart holds a preorder line. A code, not an
   * automatic discount, because an automatic discount on a variant applies
   * whether that unit is on hand or a preorder, and the same size is both over
   * time. In Shopify: Amount off products, `discountPct`%, on every variant in
   * `incoming` for these colors. Deliberately not guessable, since anyone who
   * types it gets it on in-stock units too.
   */
  code: string;
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
    code: 'TMPRE-PICNIC-7Q4K',
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
