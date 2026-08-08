// ─── Shopify Storefront API Client ───────────────────────────────────────────

const SHOPIFY_DOMAIN  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const API_URL         = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));

  return json.data as T;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  /**
   * Units left for this variant.
   *
   * Shopify only returns a number when BOTH are true:
   *   1. the Storefront access token has the
   *      `unauthenticated_read_product_inventory` scope, and
   *   2. the product has "Track quantity" enabled in Shopify.
   *
   * Otherwise it comes back null — so always treat null as "unknown", never as
   * "zero", or in-stock sizes would look sold out.
   */
  quantityAvailable?: number | null;
  selectedOptions: { name: string; value: string }[];
  image?: { url: string; altText: string | null } | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];                                          // ← NEW
  shippingWindow: { value: string } | null;                // ← NEW (aliased metafield)
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: { edges: { node: ShopifyVariant }[] };
}

interface ProductsQueryResult {
  products: { edges: { node: ShopifyProduct }[] };
}

interface ProductQueryResult {
  product: ShopifyProduct | null;
}

interface CartCreateResult {
  cartCreate: {
    cart: { checkoutUrl: string; id: string } | null;
    userErrors: { field: string[]; message: string }[];
  };
}

const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    shippingWindow: metafield(namespace: "custom", key: "shipping_window") {
      value
    }
    images(first: 20) {
      edges { node { url altText } }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          price { amount currencyCode }
          availableForSale
          quantityAvailable
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
  }
`;

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<ProductsQueryResult>(`
    ${PRODUCT_FIELDS}
    query GetAllProducts {
      products(first: 50) {
        edges { node { ...ProductFields } }
      }
    }
  `);
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<ProductQueryResult>(`
    ${PRODUCT_FIELDS}
    query GetProduct($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `, { handle });
  return data.product;
}

export async function getProductById(shopifyId: string): Promise<ShopifyProduct | null> {
  const gid = shopifyId.startsWith('gid://') ? shopifyId : `gid://shopify/Product/${shopifyId}`;
  const data = await shopifyFetch<{ node: ShopifyProduct | null }>(`
    ${PRODUCT_FIELDS}
    query GetProductById($id: ID!) {
      node(id: $id) { ...ProductFields }
    }
  `, { id: gid });
  return data.node ?? null;
}

export async function createCheckout(
  lines: { variantId: string; quantity: number; attributes?: { key: string; value: string }[] }[],
  /**
   * Cart-level attributes (as opposed to per-line). Used to carry affiliate /
   * UTM attribution through to the Shopify order, where it appears under
   * "Additional details". This is the only reliable way to attribute a sale to
   * a creator, because checkout happens on Shopify's domain.
   */
  cartAttributes?: { key: string; value: string }[],
  /**
   * Creator/affiliate codes captured at /discount/[code]. Applying them here
   * means the discount is already on the cart when checkout loads — no
   * cross-domain cookie, and the shopper never types anything.
   */
  discountCodes?: string[],
): Promise<string> {
  const data = await shopifyFetch<CartCreateResult>(`
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `, {
    input: {
      lines: lines.map(({ variantId, quantity, attributes }) => ({
        merchandiseId: variantId,
        quantity,
        // Line-item note (shows on cart, checkout, and the order confirmation)
        ...(attributes && attributes.length ? { attributes } : {}),
      })),
      ...(cartAttributes && cartAttributes.length ? { attributes: cartAttributes } : {}),
      ...(discountCodes && discountCodes.length ? { discountCodes } : {}),
    },
  });

  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length > 0) throw new Error(userErrors.map((e) => e.message).join(', '));
  if (!cart) throw new Error('Cart creation failed — no cart returned.');

  // Shopify builds checkoutUrl using the primary domain (tualmi.com) but that
  // points to Vercel, not Shopify. Rewrite to myshopify.com so checkout loads.
  const url = new URL(cart.checkoutUrl);
  url.hostname = 'tualmi.myshopify.com';
  url.port = '';
  return url.toString();
}

import type { Product } from '@/types';

export function toProduct(sp: ShopifyProduct): Product {
  const variants = sp.variants.edges.map((e) => e.node);
  const firstVariant = variants[0];

  const sizes  = [...new Set(variants.flatMap((v) => v.selectedOptions.filter((o) => o.name.toLowerCase() === 'size').map((o) => o.value)))];
  const colors = [...new Set(variants.flatMap((v) => v.selectedOptions.filter((o) => o.name.toLowerCase() === 'color').map((o) => o.value)))];

  const images = sp.images.edges.map((e) => e.node.url);

  const priceInCents = Math.round(parseFloat(firstVariant?.price.amount ?? '0') * 100);

  const isPreorder = sp.tags?.includes('preorder') ?? false;                     // ← NEW
  const shippingWindow = sp.shippingWindow?.value ?? undefined;                  // ← NEW

  return {
    id: sp.handle,
    handle: sp.handle,
    name: sp.title,
    description: sp.description,
    price: priceInCents,
    images: images.length ? images : ['/images-2/placeholder.png'],
    category: sp.productType,
    sizes: sizes.length ? sizes : ['One Size'],
    colors: colors.length ? colors : ['Default'],
    stock: variants.some((v) => v.availableForSale) ? 100 : 0,
    variants,
    isPreorder,                                                                  // ← NEW
    shippingWindow,                                                              // ← NEW
  };
}