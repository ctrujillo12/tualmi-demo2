'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';
import { createCheckout } from '@/lib/shopify';
import type { ShopifyVariant } from '@/lib/shopify';
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
function resolveVariantId(item: CartItem): string | null {
  const variants: ShopifyVariant[] | undefined = item.product.variants;
  if (!variants || variants.length === 0) return null;

  const size  = item.selectedSize.toLowerCase();
  const color = item.selectedColor.toLowerCase();

  const exact = variants.find((v) => {
    const opts = v.selectedOptions.map((o) => ({ name: o.name.toLowerCase(), value: o.value.toLowerCase() }));
    const hasSize  = opts.find((o) => o.name === 'size')?.value  === size;
    const hasColor = opts.find((o) => o.name === 'color')?.value === color;
    return hasSize && hasColor;
  });
  if (exact) return exact.id;

  const bySize = variants.find((v) =>
    v.selectedOptions.some((o) => o.name.toLowerCase() === 'size' && o.value.toLowerCase() === size)
  );
  if (bySize) return bySize.id;

  return variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id ?? null;
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
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: i.quantity + quantity } : i
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
          items: state.items.map((i) =>
            i.product.id === productId &&
            i.selectedSize === selectedSize &&
            i.selectedColor === selectedColor
              ? { ...i, quantity }
              : i
          ),
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

        for (const item of items) {
          const variantId = resolveVariantId(item);
          if (!variantId) {
            console.warn(
              `[cart] Could not resolve variant for "${item.product.name}" ` +
              `(${item.selectedSize} / ${item.selectedColor}). Skipping.`
            );
            continue;
          }
          // Preorder items carry their ship window onto the Shopify order.
          // Strip a leading "Ships " so the note reads e.g. "Ships: August".
          const attributes =
            item.isPreorder && item.shippingWindow
              ? [{ key: 'Ships', value: item.shippingWindow.replace(/^ships\s+/i, '') }]
              : undefined;
          lines.push({ variantId, quantity: item.quantity, attributes });
        }

        if (lines.length === 0) {
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