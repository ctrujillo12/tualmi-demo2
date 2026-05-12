'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';
import { createCheckout } from '@/lib/shopify';
import type { ShopifyVariant } from '@/lib/shopify';

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

      redirectToShopifyCheckout: async () => {
        const { items, clearCart } = get();
        if (items.length === 0) throw new Error('Cart is empty');

        const lines: { variantId: string; quantity: number }[] = [];

        for (const item of items) {
          const variantId = resolveVariantId(item);
          if (!variantId) {
            console.warn(
              `[cart] Could not resolve variant for "${item.product.name}" ` +
              `(${item.selectedSize} / ${item.selectedColor}). Skipping.`
            );
            continue;
          }
          lines.push({ variantId, quantity: item.quantity });
        }

        if (lines.length === 0) {
          throw new Error(
            'None of your cart items could be matched to a Shopify variant. ' +
            'Make sure your products are published in the Shopify Storefront API.'
          );
        }

        const checkoutUrl = await createCheckout(lines);
        clearCart();
        window.location.href = checkoutUrl;
      },
    }),
    {
      name: 'tualmi-cart',
    }
  )
);