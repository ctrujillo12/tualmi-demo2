'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';
import { createCheckout } from '@/lib/shopify';
import type { ShopifyVariant } from '@/lib/shopify';
import { findVariant, maxPurchasable } from '@/lib/inventory';
import { attributionCartAttributes } from '@/lib/attribution';
import { getDiscountCode } from '@/lib/discount';
import { trackBeginCheckout } from '@/lib/analytics';
import { getGaIds } from '@/lib/ga';

interface CartStore {
  items: CartItem[];
  addItem: (
    product: Product,
    selectedSize: string,
    selectedColor: string,
    quantity?: number,
    options?: { isPreorder?: boolean; shippingWindow?: string }
  ) => void;
  removeItem: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  hasPreorderItems: () => boolean;
  /** Re-sync each item's price + image from Shopify (kills stale snapshots). */
  refreshFromShopify: () => Promise<void>;
  /**
   * Builds a Shopify cart from the current items and navigates to the hosted
   * Shopify checkout. Throws if a variant can't be resolved.
   */
  redirectToShopifyCheckout: () => Promise<void>;
}

// ─── Variant resolver ─────────────────────────────────────────────────────────
/**
 * The Shopify variant for a cart line — exact size + colour, or nothing.
 *
 * This used to fall back twice: first to any variant in the same SIZE
 * regardless of colour, then to "whatever variant happens to be available".
 * Both are silent substitutions. Someone who picked Picnic / S could be
 * charged for, and shipped, Jam / S, with no error raised anywhere — from
 * Shopify's side it's a perfectly valid order. That's worse than a failed
 * checkout. A failed checkout is a support email; a wrong item is a return, a
 * refund, and a customer who doesn't come back.
 *
 * So: exact, or nothing. Callers surface the failure.
 */
type VariantResolution =
  | { ok: true; variant: ShopifyVariant }
  | { ok: false; reason: 'no-data' | 'no-match' | 'sold-out' };

function resolveVariant(item: CartItem): VariantResolution {
  const variants: ShopifyVariant[] | undefined = item.product.variants;
  if (!variants || variants.length === 0) return { ok: false, reason: 'no-data' };

  const variant = findVariant(item.product, item.selectedColor, item.selectedSize);
  if (!variant) return { ok: false, reason: 'no-match' };
  // Shopify would reject this at payment anyway. Better to say so here, where
  // the shopper can still change size instead of hitting a wall on checkout.
  if (!variant.availableForSale) return { ok: false, reason: 'sold-out' };

  return { ok: true, variant };
}

/** How a cart line reads to a shopper, e.g. "Sierra Shorts (Picnic / S)". */
function describeLine(item: CartItem): string {
  const opts = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
  return opts ? `${item.product.name} (${opts})` : item.product.name;
}

/**
 * Cart lines Shopify won't accept as-is, with a reason. The cart page uses
 * this to warn before the shopper commits, and checkout refuses to proceed
 * while it's non-empty.
 *
 * Lines whose product carries no Shopify data at all are deliberately NOT
 * listed — that's the offline fallback, and blocking on it would take the
 * store down every time Shopify hiccups.
 */
export function unsellableLines(items: CartItem[]): { item: CartItem; reason: 'no-match' | 'sold-out' }[] {
  const out: { item: CartItem; reason: 'no-match' | 'sold-out' }[] = [];
  for (const item of items) {
    const r = resolveVariant(item);
    if (!r.ok && r.reason !== 'no-data') out.push({ item, reason: r.reason });
  }
  return out;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, selectedSize, selectedColor, quantity = 1, options) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product.id === product.id &&
              i.selectedSize === selectedSize &&
              i.selectedColor === selectedColor
          );

          if (existing) {
            // Never let repeated taps push a line past what Shopify has. When
            // the quantity isn't readable this is a no-op cap, not a block.
            const wanted = existing.quantity + quantity;
            const allowed = maxPurchasable(product, selectedColor, selectedSize, wanted);
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: Math.max(existing.quantity, allowed) } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                product,
                selectedSize,
                selectedColor,
                quantity,
                isPreorder: options?.isPreorder ?? false,
                shippingWindow: options?.shippingWindow,
              },
            ],
          };
        });
      },

      removeItem: (productId, selectedSize, selectedColor) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(i.product.id === productId &&
                i.selectedSize === selectedSize &&
                i.selectedColor === selectedColor)
          ),
        }));
      },

      updateQuantity: (productId, selectedSize, selectedColor, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize, selectedColor);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (
              i.product.id !== productId ||
              i.selectedSize !== selectedSize ||
              i.selectedColor !== selectedColor
            ) {
              return i;
            }
            // Raising the quantity is capped at real stock; lowering it always
            // goes through, even below what's currently sellable.
            const capped =
              quantity > i.quantity
                ? Math.max(i.quantity, maxPurchasable(i.product, selectedColor, selectedSize, quantity))
                : quantity;
            return { ...i, quantity: capped };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      hasPreorderItems: () =>
        get().items.some((i) => i.isPreorder),

      refreshFromShopify: async () => {
        const { items } = get();
        if (items.length === 0) return;

        const handles = [...new Set(items.map((i) => i.product.handle ?? i.product.id))];
        const results = await Promise.all(
          handles.map(async (h) => {
            try {
              const res = await fetch(`/api/product-refresh?handle=${encodeURIComponent(h)}`);
              const data = await res.json();
              return [h, data] as const;
            } catch {
              return [h, { ok: false }] as const;
            }
          }),
        );
        const byHandle = Object.fromEntries(results);

        set({
          items: get().items.map((item) => {
            const key = item.product.handle ?? item.product.id;
            const d = byHandle[key];
            if (!d || !d.ok) return item;
            const colorImg =
              d.imageByColor?.[(item.selectedColor || '').toLowerCase()] ?? d.featured ?? item.product.images[0];
            return {
              ...item,
              product: {
                ...item.product,
                price: typeof d.price === 'number' ? d.price : item.product.price,
                images: colorImg ? [colorImg] : item.product.images,
                // Re-attach live variants. Items added while Shopify was down
                // have none, and without this they can never check out.
                variants: Array.isArray(d.variants) && d.variants.length
                  ? d.variants
                  : item.product.variants,
              },
            };
          }),
        });
      },

      redirectToShopifyCheckout: async () => {
        if (get().items.length === 0) throw new Error('Cart is empty');

        // Self-heal stale carts. Items added while Shopify was unreachable were
        // saved with no variants and persist in localStorage indefinitely, so
        // checkout would fail forever with "no variant matched". Re-fetch
        // before giving up rather than dead-ending the customer.
        if (get().items.some((i) => !i.product.variants?.length)) {
          console.warn('[cart] Item(s) missing variants — refreshing from Shopify before checkout');
          try {
            await get().refreshFromShopify();
          } catch (e) {
            console.error('[cart] Pre-checkout refresh failed:', e);
          }
        }

        const items = get().items;
        const lines: { variantId: string; quantity: number; attributes?: { key: string; value: string }[] }[] = [];
        const soldOut: string[] = [];
        const unresolved: string[] = [];

        for (const item of items) {
          const resolved = resolveVariant(item);

          if (!resolved.ok) {
            // A line that can't be matched used to be skipped silently — the
            // shopper then paid for a cart quietly missing an item and only
            // found out when the box arrived. Every failure is now surfaced.
            if (resolved.reason === 'sold-out') soldOut.push(describeLine(item));
            else unresolved.push(describeLine(item));
            console.warn(
              `[cart] ${resolved.reason} for "${item.product.name}" ` +
              `(${item.selectedSize} / ${item.selectedColor}).`,
            );
            continue;
          }

          // Last line of defence on quantity. The stepper already caps at
          // what's in stock, but a cart can sit in localStorage for days while
          // the stock behind it sells down.
          const allowed = maxPurchasable(item.product, item.selectedColor, item.selectedSize, item.quantity);
          if (allowed < item.quantity) {
            if (allowed <= 0) {
              soldOut.push(describeLine(item));
              continue;
            }
            console.warn(`[cart] Trimming "${describeLine(item)}" from ${item.quantity} to ${allowed} — that's all Shopify has.`);
          }

          // Preorder items carry their ship window onto the Shopify order.
          // Strip a leading "Ships " so the note reads e.g. "Ships: August".
          const attributes =
            item.isPreorder && item.shippingWindow
              ? [{ key: 'Ships', value: item.shippingWindow.replace(/^ships\s+/i, '') }]
              : undefined;
          lines.push({ variantId: resolved.variant.id, quantity: Math.max(1, allowed), attributes });
        }

        // Sold out is a different conversation from a technical failure, so it
        // gets its own message: it names what went, and the fix is in the
        // shopper's hands rather than ours.
        if (soldOut.length > 0) {
          throw new Error(
            `${soldOut.join(' and ')} just sold out. Please remove ` +
            `${soldOut.length > 1 ? 'those items' : 'that item'} from your cart — ` +
            'everything else is ready to go.',
          );
        }

        if (unresolved.length > 0 || lines.length === 0) {
          // Customer-facing wording — the old message was internal debugging
          // text about the Storefront API, which means nothing to a shopper.
          throw new Error(
            'We couldn’t start checkout just now. Please refresh the page and try again — ' +
            'if it keeps happening, email hello@tualmi.com and we’ll take your order directly.'
          );
        }

        // Carries "Referred by / Campaign / ..." onto the Shopify order so
        // affiliate sales can be reconciled exactly, not guessed by timestamp,
        // and pre-applies any creator code picked up at /discount/[code].
        const code = getDiscountCode();

        // Last event we can fire ourselves — the purchase happens on Shopify's
        // domain, so that one has to come from Shopify's own GA4 integration.
        trackBeginCheckout(
          items.map((i) => ({
            item_id: i.product.handle ?? i.product.id,
            item_name: i.product.name,
            price: i.product.price / 100,
            item_variant: `${i.selectedColor} / ${i.selectedSize}`,
            quantity: i.quantity,
          })),
          get().getTotal() / 100,
          code ?? undefined,
        );

        // GA4 ids ride along on the cart so the orders webhook can replay a
        // server-side `purchase` into the SAME GA4 session. Without this, the
        // Shop Pay hop through shop.app makes every sale look like "direct".
        // Keys starting with "_" are hidden from customer-facing order views.
        const ga = await getGaIds();
        const cartAttributes = [
          ...attributionCartAttributes(),
          ...(ga.clientId ? [{ key: '_ga_client_id', value: ga.clientId }] : []),
          ...(ga.sessionId ? [{ key: '_ga_session_id', value: ga.sessionId }] : []),
        ];

        const checkoutUrl = await createCheckout(
          lines,
          cartAttributes,
          code ? [code] : undefined,
        );
        // Deliberately NOT clearing the cart here. Shopify's checkout — and
        // Shop Pay especially — is a place people back out of: to check a size,
        // compare a colour, or grab a discount code. Emptying the cart on the
        // way out meant hitting Back landed them on "nothing here yet." and the
        // sale was gone. The cart is cheap to keep; an abandoned checkout is not.
        window.location.href = checkoutUrl;
      },
    }),
    {
      // Bumped to -v2 to discard old saved carts that snapshotted stale
      // prices/photos from before the Shopify data was updated.
      name: 'tualmi-cart-v2',
    }
  )
);