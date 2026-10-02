import type { ShopifyVariant } from '@/lib/shopify';

export interface Product {
  id: string;
  handle?: string;          // Shopify URL slug — optional so old local data still compiles
  name: string;
  description: string;
  price: number;            // in cents, same as before
  compareAtPrice?: number;   // original price in cents, when on sale
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  variants: ShopifyVariant[]; // raw Shopify variants, used at checkout
  isPreorder?: boolean;       // true if Shopify product has 'preorder' tag
  shippingWindow?: string;    // e.g. "In stock, ships in 1–3 business days"
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  isPreorder?: boolean;       // ← NEW: snapshot at time of add
  shippingWindow?: string;    // ← NEW: snapshot at time of add
  /**
   * The Shopify CartLine id for this item, once it's been synced to a real
   * Shopify cart (store/cartStore.ts). Undefined until the first successful
   * sync — e.g. right after addItem() but before the async cartCreate/
   * cartLinesAdd call resolves — and needed to target this exact line with
   * cartLinesUpdate/cartLinesRemove afterward (Shopify's line ids, not our
   * own product/size/color key, are what those mutations take).
   */
  shopifyLineId?: string;
}