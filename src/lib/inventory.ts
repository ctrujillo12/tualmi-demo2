/**
 * Availability, derived from live Shopify variants.
 *
 * ── THE ONE RULE ─────────────────────────────────────────────────────────
 * There are three answers, not two: available, sold out, and UNKNOWN. Unknown
 * always behaves like available.
 *
 * That matters more than it sounds. Shopify can be unreachable (getProduct
 * falls back to local data with `variants: []`), the token may not be allowed
 * to read quantities, or a size/colour combination may simply not exist as a
 * variant. If any of those got treated as "sold out", the store would go
 * unbuyable the moment Shopify hiccuped — the same failure this codebase has
 * already lived through once. Better to let one oversell through to Shopify's
 * checkout, which re-validates stock at payment anyway, than to refuse every
 * sale because we couldn't see.
 *
 * ── WHAT'S AUTHORITATIVE ─────────────────────────────────────────────────
 * `availableForSale` decides whether something can be bought. It already
 * accounts for the merchant's inventory policy, so it stays true for variants
 * set to "continue selling when out of stock".
 *
 * `quantityAvailable` decides whether to say "only a few left" — and only when
 * it's actually readable. Without the inventory scope it's undefined, and the
 * hand-kept overrides in lib/lowStock.ts take over.
 *
 * ── WHAT THIS CANNOT DO ──────────────────────────────────────────────────
 * Prevent an oversell. Nothing on the storefront can: Shopify doesn't reserve
 * inventory when someone adds to cart, so two shoppers can always race for the
 * last unit. The actual guarantee is per-variant "Track quantity" ON and
 * "Continue selling when out of stock" OFF in Shopify admin. Everything here
 * is the UX around that guarantee.
 */

import type { Product } from '@/types';
import type { ShopifyVariant } from '@/lib/shopify';
import { manualLowStockSizes, suppressesLowStockDot } from '@/lib/lowStock';

/**
 * A size reads as "only a few left" at this quantity OR FEWER — so at 10,
 * everything from 1 to 10 is flagged and 11 is not.
 *
 * The name spells out the comparison on purpose. This started as "threshold"
 * with a `<` and it wasn't clear whether the number itself counted; Picnic / S
 * landed on exactly 10 and went unflagged, which looked like a bug and wasn't.
 *
 * Override with NEXT_PUBLIC_LOW_STOCK_AT_OR_BELOW.
 */
export const LOW_STOCK_AT_OR_BELOW =
  Number(process.env.NEXT_PUBLIC_LOW_STOCK_AT_OR_BELOW) > 0
    ? Number(process.env.NEXT_PUBLIC_LOW_STOCK_AT_OR_BELOW)
    : 10;

export type AvailabilityStatus = 'available' | 'sold-out' | 'unknown';

export interface Availability {
  status: AvailabilityStatus;
  /** Units on hand, or null when we can't see them. Never infer 0 from null. */
  quantity: number | null;
  /** Show the "only a few left" treatment. */
  low: boolean;
  /** Sellable but not in stock — the merchant is taking backorders. */
  backorder: boolean;
}

const UNKNOWN: Availability = {
  status: 'unknown',
  quantity: null,
  low: false,
  backorder: false,
};

function norm(v: string | undefined | null): string | undefined {
  const s = v?.trim().toLowerCase();
  return s ? s : undefined;
}

function optionValue(variant: ShopifyVariant, option: string): string | undefined {
  return norm(
    variant.selectedOptions?.find((o) => o.name.trim().toLowerCase() === option)?.value,
  );
}

/** Every option name this product's variants declare, lowercased. */
function declaredOptions(variants: ShopifyVariant[]): Set<string> {
  const names = new Set<string>();
  for (const v of variants) {
    for (const o of v.selectedOptions ?? []) names.add(o.name.trim().toLowerCase());
  }
  return names;
}

/** Warn once per product per process, so a data mismatch is loud but not spam. */
const warnedAmbiguous = new Set<string>();

/**
 * The one variant matching this exact size + colour, or null.
 *
 * ── EXACT OR NOTHING ─────────────────────────────────────────────────────
 * A near-miss here is how a shopper ends up sold a different colourway than
 * the one they picked, and how a size ends up displaying another size's stock
 * count. Both are silent, and both are worse than showing nothing.
 *
 * ── WHY IT CHECKS WHICH OPTIONS EXIST ────────────────────────────────────
 * The lookup keys off Shopify option names — "Size" and "Color". An earlier
 * version compared per-variant: a dimension a variant didn't declare was
 * ignored. That reads fine until the product's options are named something
 * else ("Waist", "Colour", "Shade"). Then NO variant declares "size", every
 * comparison is skipped, every size matches the first variant, and every size
 * on the page shows variant #1's quantity — confidently, and wrong.
 *
 * So the dimensions are established from the product as a whole first. If the
 * product is sized, the caller must name a size AND the variant must declare
 * that exact size. And the match has to be unique: two candidates means the
 * options don't identify one variant, and picking either would be a guess.
 *
 * Failing to null degrades to "unknown", which reads as available — no dot, no
 * count, nothing blocked. Safe in the direction that matters.
 */
export function findVariant(
  product: Pick<Product, 'variants'> | null | undefined,
  color: string | undefined,
  size: string | undefined,
): ShopifyVariant | null {
  const variants = product?.variants ?? [];
  if (!variants.length) return null;

  const options = declaredOptions(variants);
  const hasSizeDim = options.has('size');
  const hasColorDim = options.has('color');

  const wantSize = norm(size);
  const wantColor = norm(color);

  // Sized product, no size chosen yet — genuinely unanswerable, not a miss.
  if (hasSizeDim && wantSize === undefined) return null;
  if (hasColorDim && wantColor === undefined) return null;

  const matches = variants.filter((v) => {
    if (hasSizeDim && optionValue(v, 'size') !== wantSize) return false;
    if (hasColorDim && optionValue(v, 'color') !== wantColor) return false;
    return true;
  });

  if (matches.length === 1) return matches[0];

  // More than one candidate means the option names we key off don't pin down a
  // single variant — usually because Shopify's options aren't called Size and
  // Color, or because there's a third dimension. Worth shouting about: it's
  // invisible otherwise, and it's the difference between "no low-stock dots
  // appear" and "the dots are lying".
  if (matches.length > 1) {
    const key = [...options].sort().join(',');
    if (!warnedAmbiguous.has(key)) {
      warnedAmbiguous.add(key);
      console.warn(
        `[inventory] Could not identify a single variant from options [${[...options].join(', ')}]. ` +
        'Availability will read as unknown (nothing flagged, nothing blocked) until the ' +
        'Shopify options are named "Size" and "Color", or lib/inventory.ts is taught the ' +
        'names in use. Run `node scripts/dump-variants.mjs` to see the real option names.',
      );
    }
  }

  return null;
}

/** Availability of one exact size + colour. */
export function availability(
  product: Pick<Product, 'variants' | 'handle'> | null | undefined,
  color: string | undefined,
  size: string | undefined,
): Availability {
  // No Shopify data at all (offline fallback) — never block the sale.
  if (!product?.variants?.length) return UNKNOWN;

  const variant = findVariant(product, color, size);
  // A combination Shopify doesn't have. Don't invent a sold-out state for it;
  // resolveVariantId will refuse it at checkout with a clear message.
  if (!variant) return UNKNOWN;

  const qty = typeof variant.quantityAvailable === 'number' ? variant.quantityAvailable : null;
  const backorder = !!variant.availableForSale && !!variant.currentlyNotInStock;

  if (!variant.availableForSale) {
    return { status: 'sold-out', quantity: qty ?? 0, low: false, backorder: false };
  }

  const low = backorder
    ? false
    : qty !== null
      ? qty > 0 && qty <= LOW_STOCK_AT_OR_BELOW
      : manualLowStockSizes(product.handle, color).some((s) => norm(s) === norm(size));

  return {
    status: 'available',
    quantity: qty,
    // Some sizes are stocked thin by design and are exempt from the dot — see
    // NO_LOW_STOCK_DOT in lib/lowStock.ts. Applied last so it overrides both
    // the real count and the manual list, and applied only to `low`: an exempt
    // size that hits zero still goes sold-out above, untouched.
    low: low && !suppressesLowStockDot(size),
    backorder,
  };
}

/** Sold out for certain. Unknown is deliberately NOT sold out. */
export function isSoldOut(
  product: Pick<Product, 'variants' | 'handle'> | null | undefined,
  color: string | undefined,
  size: string | undefined,
): boolean {
  return availability(product, color, size).status === 'sold-out';
}

export function isLowStock(
  product: Pick<Product, 'variants' | 'handle'> | null | undefined,
  color: string | undefined,
  size: string | undefined,
): boolean {
  return availability(product, color, size).low;
}

/**
 * Every size this product offers. Shopify's option list is per-product, not
 * per-colourway, so this is the set to check each colourway against.
 */
function sizesFor(product: Pick<Product, 'sizes'>): string[] {
  return (product.sizes ?? []).filter((s) => s && s !== 'One Size');
}

/** True only when every size in the colourway is confirmed sold out. */
export function isColorSoldOut(
  product: Pick<Product, 'variants' | 'handle' | 'sizes'> | null | undefined,
  color: string | undefined,
): boolean {
  if (!product?.variants?.length) return false;
  const sizes = sizesFor(product);
  if (!sizes.length) return isSoldOut(product, color, undefined);
  // "Every size sold out" — and at least one of them had to be a real variant,
  // otherwise an unknown colourway would read as sold out.
  const statuses = sizes.map((s) => availability(product, color, s).status);
  return statuses.some((s) => s === 'sold-out') && statuses.every((s) => s === 'sold-out');
}

/** Any size in this colourway running low — for a dot on the swatch. */
export function colorHasLowStock(
  product: Pick<Product, 'variants' | 'handle' | 'sizes'> | null | undefined,
  color: string | undefined,
): boolean {
  if (!product) return false;
  return sizesFor(product).some((s) => isLowStock(product, color, s));
}

/**
 * How many of this size+colour a shopper may put in the cart, capped by `cap`.
 * Unknown quantity means the cap applies unchanged — we can't count, so we
 * don't pretend to.
 */
export function maxPurchasable(
  product: Pick<Product, 'variants' | 'handle'> | null | undefined,
  color: string | undefined,
  size: string | undefined,
  cap: number,
): number {
  const a = availability(product, color, size);
  if (a.status === 'sold-out') return 0;
  if (a.backorder || a.quantity === null) return cap;
  return Math.max(0, Math.min(cap, a.quantity));
}

/** Sizes that are confirmed sold out, for filtering pickers. */
export function soldOutSizes(
  product: Pick<Product, 'variants' | 'handle' | 'sizes'> | null | undefined,
  color: string | undefined,
): string[] {
  if (!product) return [];
  return sizesFor(product).filter((s) => isSoldOut(product, color, s));
}
