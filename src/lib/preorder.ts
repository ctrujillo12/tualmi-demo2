import type { Product, CartItem } from '@/types';
import { availability } from '@/lib/inventory';
import { getVariantPricing } from '@/lib/productPricing';
import { PREORDERS, preorderIncoming } from '@/lib/preorderConfig';

/**
 * Size-level preorders with a preorder discount: pricing, labels and cart
 * flags. WHAT is on preorder, how many are coming and the Shopify setup that
 * goes with it are in lib/preorderConfig.ts.
 *
 * A listed size is a preorder once its on-hand stock in Shopify is gone and it
 * is selling below zero (`backorder` in lib/inventory.ts). While it still has
 * stock on hand it sells as a normal in-stock size at full price, so the same
 * variant can be either, depending on when it's bought.
 *
 * ── THE DISCOUNT LIVES IN SHOPIFY ────────────────────────────────────────
 * This file only DISPLAYS the discount and counts it in the cart estimate.
 * The charge comes from the Shopify discount code in the config, which the
 * cart applies at checkout when it holds a preorder line (store/cartStore.ts).
 * If that code is missing in Shopify or scoped differently, the site promises
 * a price checkout won't honour.
 */
export interface PreorderOffer {
  discountPct: number;
  /** e.g. "late December – early January" */
  shipWindow: string;
}

const handleOf = (product: Pick<Product, 'handle' | 'id'>) => product.handle ?? product.id;

/** The preorder terms for this exact size + color, or null if it's not on preorder right now. */
export function preorderOffer(
  product: Pick<Product, 'handle' | 'id' | 'variants'>,
  color: string | undefined,
  size: string | undefined,
): PreorderOffer | null {
  const handle = handleOf(product);
  const incoming = preorderIncoming(handle, color, size);
  if (incoming === null) return null;
  // In stock: a normal sale. Sold out: the incoming units are all spoken for.
  // Unknown (Shopify unreachable): can't tell, so no preorder promise.
  const a = availability(product, color, size);
  if (a.status !== 'available' || !a.backorder) return null;
  const cfg = PREORDERS[handle];
  return { discountPct: cfg.discountPct, shipWindow: cfg.shipWindow };
}

/** Shopify discount codes for the preorder lines in a cart, deduped. */
export function preorderCodesFor(items: CartItem[]): string[] {
  const codes = items
    .filter((i) => i.isPreorder && i.preorderDiscountPct)
    .map((i) => PREORDERS[handleOf(i.product)]?.code)
    .filter((c): c is string => !!c);
  return Array.from(new Set(codes));
}

/** Sizes of this colorway currently on preorder, in the product's size order. */
export function preorderSizes(
  product: Pick<Product, 'handle' | 'id' | 'variants' | 'sizes'>,
  color: string | undefined,
): string[] {
  return (product.sizes ?? []).filter((s) => preorderOffer(product, color, s));
}

export function discounted(cents: number, pct: number): number {
  return Math.round((cents * (100 - pct)) / 100);
}

/** What a shopper adding this size gets flagged with in the cart. */
export function preorderCartOptions(offer: PreorderOffer) {
  return {
    isPreorder: true,
    shippingWindow: `ships ${offer.shipWindow}`,
    preorderDiscountPct: offer.discountPct,
  };
}

/**
 * Unit price for a cart line, with the preorder discount applied when the line
 * was added as a preorder. `compareAtPrice` carries the pre-discount price so
 * the cart can strike it through. Used by the cart total and every cart line,
 * so the two can't disagree.
 */
export function cartLinePricing(item: CartItem): { price: number; compareAtPrice?: number } {
  const base = getVariantPricing(item.product, item.selectedSize, item.selectedColor);
  const pct = item.preorderDiscountPct;
  if (!pct) return base;
  return { price: discounted(base.price, pct), compareAtPrice: base.compareAtPrice ?? base.price };
}
