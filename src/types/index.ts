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
  isPreorder?: boolean;       // true if Shopify product has 'preorder' tag
  shippingWindow?: string;    // e.g. "Ships mid September"
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  isPreorder?: boolean;       // ← NEW: snapshot at time of add
  shippingWindow?: string;    // ← NEW: snapshot at time of add
}