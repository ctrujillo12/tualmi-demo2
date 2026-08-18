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
import { manualLowStockSizes } from '@/lib/lowStock';

/**
 * At or below this many units, a size reads as "only a few left".
 * Override with NEXT_PUBLIC_LOW_STOCK_THRESHOLD.
 */
export const LOW_STOCK_THRESHOLD =
  Number(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD) > 0
    ? Number(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD)
    : 6;

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

/**
 * The one variant matching this exact size + colour, or null.
 *
 * Exact only. Never "close enough" — a near-miss here is how a shopper ends up
 * being sold a different colourway than the one they picked.
 *
 * Products don't all have both options (a one-size item has no Size), so a
 * dimension the variant doesn't declare is ignored rather than required.
 */
export function findVariant(
  product: Pick<Product, 'variants'> | null | undefined,
  color: string | undefined,
  size: string | undefined,
): ShopifyVariant | null {
  const variants = product?.variants ?? [];
  if (!variants.length) return null;

  const wantSize = norm(size);
  const wantColor = norm(color);

  return (
    variants.find((v) => {
      const vSize = optionValue(v, 'size');
      const vColor = optionValue(v, 'color');
      // A dimension the variant declares must match what was chosen — and must
      // have been chosen at all.
      if (vSize !== undefined && vSize !== wantSize) return false;
      if (vColor !== undefined && vColor !== wantColor) return false;
      return true;
    }) ?? null
  );
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
      ? qty > 0 && qty <= LOW_STOCK_THRESHOLD
      : manualLowStockSizes(product.handle, color).some((s) => norm(s) === norm(size));

  return { status: 'available', quantity: qty, low, backorder };
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
