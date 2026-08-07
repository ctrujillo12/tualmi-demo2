'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';
import { createCheckout } from '@/lib/shopify';
import type { ShopifyVariant } from '@/lib/shopify';
import { attributionCartAttributes } from '@/lib/attribution';

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
              },
            };
          }),
        });
      },

      redirectToShopifyCheckout: async () => {
        const { items, clearCart } = get();
        if (items.length === 0) throw new Error('Cart is empty');

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
          throw new Error(
            'None of your cart items could be matched to a Shopify variant. ' +
            'Make sure your products are published in the Shopify Storefront API.'
          );
        }

        // Carries "Referred by / Campaign / ..." onto the Shopify order so
        // affiliate sales can be reconciled exactly, not guessed by timestamp.
        const checkoutUrl = await createCheckout(lines, attributionCartAttributes());
        clearCart();
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