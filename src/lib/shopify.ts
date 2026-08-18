// ─── Shopify Storefront API Client ───────────────────────────────────────────

const SHOPIFY_DOMAIN  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

// Pinned, but overridable without a code change. Shopify ships a new API
// version every quarter and supports each for at least 12 months; requesting
// an unsupported one silently serves the oldest supported version instead.
// Bump this with NEXT_PUBLIC_SHOPIFY_API_VERSION (e.g. "2026-07") once you've
// smoke-tested a product page and a real checkout against it.
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION?.trim() || '2024-01';
const API_URL     = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

/**
 * Cache tag on every product read. The inventory webhook
 * (app/api/webhooks/shopify/inventory) calls revalidateTag with this, so a
 * stock change in Shopify flushes the storefront immediately instead of
 * waiting out the 60-second window.
 */
export const SHOPIFY_PRODUCTS_TAG = 'shopify-products';

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: { noStore?: boolean },
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    // Mutations (cart creation) must never be served from a cache.
    ...(opts?.noStore
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 60, tags: [SHOPIFY_PRODUCTS_TAG] } }),
  });

  if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));

  return json.data as T;
}

// ─── Inventory scope: ask for it, but never bet the store on it ──────────────
//
// `quantityAvailable` requires the Storefront token to hold
// `unauthenticated_read_product_inventory` (Shopify admin → the app that owns
// the token → Storefront API access scopes). Requesting the field WITHOUT the
// scope makes Shopify reject the whole request — which is exactly what once
// dropped every product back to local data with no variants and made the store
// unbuyable.
//
// So the field is requested optimistically and, if the token can't read it,
// the same query is retried without it. Being wrong costs one failed request
// per ten minutes. Being wrong used to cost the store.

type InventoryCapability = 'unknown' | 'granted' | 'denied';
let inventoryCapability: InventoryCapability = 'unknown';
let deniedAt = 0;
const REPROBE_AFTER_MS = 10 * 60 * 1000;

/** Whether inventory quantities are currently readable. For diagnostics. */
export function inventoryQuantitiesVisible(): boolean {
  return inventoryCapability === 'granted';
}

function shouldRequestInventory(): boolean {
  if (inventoryCapability !== 'denied') return true;
  // Re-probe periodically, so granting the scope takes effect without a deploy.
  if (Date.now() - deniedAt >= REPROBE_AFTER_MS) {
    inventoryCapability = 'unknown';
    return true;
  }
  return false;
}

/** Is this "your token can't read that field", or a genuine failure? */
function isInventoryScopeError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /quantityAvailable|currentlyNotInStock/i.test(msg) ||
    /access denied|not authorized|unauthorized|scope/i.test(msg)
  );
}

/**
 * Runs a product query with the inventory fields, falling back to the same
 * query without them when the token lacks the scope.
 */
async function productFetch<T>(
  build: (withInventory: boolean) => string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!shouldRequestInventory()) return shopifyFetch<T>(build(false), variables);

  try {
    const data = await shopifyFetch<T>(build(true), variables);
    if (inventoryCapability !== 'granted') {
      inventoryCapability = 'granted';
      console.info('[shopify] Inventory quantities readable — low-stock flags are automatic.');
    }
    return data;
  } catch (err) {
    if (!isInventoryScopeError(err)) throw err;

    // Once this token has demonstrably read inventory, a later denial is a
    // blip — scope propagation lag right after granting it, or a flaky
    // response — not the scope being revoked. Demoting on it would throw away
    // a known-good capability and revert the whole store to the manual list
    // for the entire re-probe window, off the back of one bad request. So
    // fall back for THIS request only and leave the capability alone.
    if (inventoryCapability === 'granted') {
      console.warn(
        '[shopify] One inventory read was denied even though the scope is live — ' +
        'serving this request without quantities. Harmless unless it repeats.',
      );
      return shopifyFetch<T>(build(false), variables);
    }

    inventoryCapability = 'denied';
    deniedAt = Date.now();
    console.warn(
      '[shopify] Storefront token cannot read inventory quantities. Falling back to ' +
      'availableForSale plus the manual list in lib/lowStock.ts. To fix: add the ' +
      '`unauthenticated_read_product_inventory` scope to the token in Shopify admin.',
    );
    return shopifyFetch<T>(build(false), variables);
  }
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  /**
   * Shopify's own verdict on whether this variant can be sold right now. It
   * accounts for inventory policy, so it stays true for a variant the merchant
   * has set to "continue selling when out of stock". Authoritative for whether
   * to show a buy button.
   */
  availableForSale: boolean;
  /**
   * Units on hand. `undefined` means the Storefront token can't read inventory
   * (see productFetch above) — NOT that stock is zero. Treat undefined as
   * "unknown" everywhere; lib/inventory.ts already does.
   */
  quantityAvailable?: number | null;
  /** Out of stock but still sellable — i.e. the merchant allows backorders. */
  currentlyNotInStock?: boolean | null;
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

/** The two fields that need the inventory scope, isolated so they can be dropped. */
const INVENTORY_FIELDS = `
          quantityAvailable
          currentlyNotInStock`;

const productFields = (withInventory: boolean) => `
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
          availableForSale${withInventory ? INVENTORY_FIELDS : ''}
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
  }
`;

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const data = await productFetch<ProductsQueryResult>((inv) => `
    ${productFields(inv)}
    query GetAllProducts {
      products(first: 50) {
        edges { node { ...ProductFields } }
      }
    }
  `);
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await productFetch<ProductQueryResult>((inv) => `
    ${productFields(inv)}
    query GetProduct($handle: String!) {
      product(handle: $handle) { ...ProductFields }
    }
  `, { handle });
  return data.product;
}

export async function getProductById(shopifyId: string): Promise<ShopifyProduct | null> {
  const gid = shopifyId.startsWith('gid://') ? shopifyId : `gid://shopify/Product/${shopifyId}`;
  const data = await productFetch<{ node: ShopifyProduct | null }>((inv) => `
    ${productFields(inv)}
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
  }, { noStore: true });

  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length > 0) throw new Error(userErrors.map((e) => e.message).join(', '));
  if (!cart) throw new Error('Cart creation failed — no cart returned.');

  // Shopify builds checkoutUrl on the store's primary domain (tualmi.com), but
  // that DNS points at Vercel, not Shopify — so the URL would 404. It has to be
  // rewritten to a hostname Shopify actually serves.
  //
  // Set NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN to a branded subdomain you've added
  // in Shopify (e.g. shop.tualmi.com) so customers never see myshopify.com —
  // including when they back out of Shop Pay. Falls back to the raw myshopify
  // domain, which works but exposes the store's internal address.
  const checkoutHost =
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN?.trim() || SHOPIFY_DOMAIN;

  const url = new URL(cart.checkoutUrl);
  url.hostname = checkoutHost;
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

  // Real units when the token can read them; the old 100/0 placeholder when it
  // can't. Nothing should branch on this number directly — use lib/inventory.ts,
  // which distinguishes "zero" from "we can't see it".
  const counted = variants.filter((v) => typeof v.quantityAvailable === 'number');
  const stock = counted.length
    ? counted.reduce((n, v) => n + Math.max(0, v.quantityAvailable ?? 0), 0)
    : variants.some((v) => v.availableForSale) ? 100 : 0;

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
    stock,
    variants,
    isPreorder,                                                                  // ← NEW
    shippingWindow,                                                              // ← NEW
  };
}