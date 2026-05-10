import type { ShopifyVariant } from '@/lib/shopify';

export interface Product {
  id: string;
  handle?: string;          // Shopify URL slug — optional so old local data still compiles
  name: string;
  description: string;
  price: number;            // in cents, same as before
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  variants: ShopifyVariant[]; // raw Shopify variants, used at checkout
  isPreorder?: boolean;       // ← NEW: true if Shopify product has 'preorder' tag
  shippingWindow?: string;    // ← NEW: e.g. "Ships August 2026"
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}