// ─── Shopify Storefront API Client ───────────────────────────────────────────

const SHOPIFY_DOMAIN  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;

// Pinned, but overridable without a code change. Shopify ships a new API
// version every quarter and supports each for at least 12 months; requesting
// an unsupported one silently serves the oldest supported version instead —
// which is exactly what this pin had been doing since 2024-01 went out of
// Shopify's support window, with no error and nothing in the code to show it.
//
// Bumped to 2026-07 (current stable as of September 2026) as its own isolated
// change: every field and query this file uses (Product, ProductVariant) was
// checked against the 2026-07 schema and is unchanged and non-deprecated
// there, so this is a version-string change only, not a query rewrite.
// Re-verify the same way before ever bumping this again.
const API_VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION?.trim() || '2026-07';
const API_URL     = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

/**
 * Cache tag on every product read. The inventory webhook
 * (app/api/webhooks/shopify/inventory) calls revalidateTag with this, so a
 * stock change in Shopify flushes the storefront immediately instead of
 * waiting out the 60-second window.
 */
export const SHOPIFY_PRODUCTS_TAG = 'shopify-products';

/**
 * How long one Shopify request gets before we stop waiting on it.
 *
 * There was no timeout here at all, and that is how a slow Storefront response
 * became a failed page: the render sat on the socket with nothing to interrupt
 * it until the serverless function itself was killed, and the shopper got an
 * error instead of a product. The fallback in lib/products.ts never ran,
 * because nothing ever threw.
 *
 * 6s is far past Shopify's normal response time and still well inside the
 * function limit, so a hang now fails while there's still time to recover.
 * Failing fast is the whole point: the caller catches and serves local copy,
 * and a product page without live stock badges beats no product page.
 *
 * Override with SHOPIFY_TIMEOUT_MS.
 */
const REQUEST_TIMEOUT_MS = Number(process.env.SHOPIFY_TIMEOUT_MS) || 6000;

/** Attempts per read, including the first. */
const MAX_ATTEMPTS = 3;

/** Base backoff; attempt N waits N × this. Short — a shopper is waiting. */
const BACKOFF_MS = 150;

/**
 * A blip worth retrying, as opposed to a request that will fail identically
 * every time. 429 is Shopify's cost-based rate limit, 408/5xx are theirs to
 * fix; a 400 or 404 is ours and retrying it just burns the clock.
 */
function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts?: { noStore?: boolean },
): Promise<T> {
  /**
   * Reads retry; mutations don't.
   *
   * A retried cart mutation can leave a duplicate abandoned cart in Shopify if
   * the first attempt actually landed and only the response was lost. That's
   * cosmetic, but it also isn't worth much: checkout is a click the shopper can
   * repeat, whereas a product page render is not. So reads get the resilience
   * and mutations get one clean attempt.
   */
  const attempts = opts?.noStore ? 1 : MAX_ATTEMPTS;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    let res: Response;

    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        // Bounded, so a hung connection can't outlive the request that needs it.
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        // Mutations (cart creation) must never be served from a cache.
        ...(opts?.noStore
          ? { cache: 'no-store' as const }
          : { next: { revalidate: 60, tags: [SHOPIFY_PRODUCTS_TAG] } }),
      });
    } catch (err) {
      // Timed out, or the connection failed before any response. Both are the
      // kind of thing that works on the next try.
      lastErr = err;
      if (attempt >= attempts) throw err;
      await sleep(BACKOFF_MS * attempt);
      continue;
    }

    if (!res.ok) {
      const err = new Error(`Shopify API error: ${res.status} ${res.statusText}`);
      if (isRetryableStatus(res.status) && attempt < attempts) {
        lastErr = err;
        await sleep(BACKOFF_MS * attempt);
        continue;
      }
      throw err;
    }

    const json = await res.json();

    // A GraphQL-level error is a fact about the query, not about the network —
    // a missing scope or a bad field fails identically on every attempt. Throw
    // it straight through so productFetch's inventory-scope fallback fires on
    // the first attempt instead of after three pointless retries.
    if (json.errors) {
      throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
    }

    return json.data as T;
  }

  throw lastErr ?? new Error('Shopify request failed');
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

// ─── Cart (Storefront API) ────────────────────────────────────────────────────
//
// A real Shopify Cart is now created once, on the shopper's first add-to-cart
// — see store/cartStore.ts for the sync logic that calls these. This file used
// to have only createCheckout(), which built a brand-new cart at the instant
// checkout began; that meant Shopify never saw a cart — or the shopper who
// owned it — until the moment they were already leaving for checkout, which is
// the reason Shopify's own session/cart-addition analytics never matched
// reality (GA4, which is instrumented independently, was always the accurate
// one). These functions let a real Cart object track the shopper for their
// whole visit instead of springing into existence at the very end.

export interface ShopifyCartLine {
  /** The CartLine's own id — needed to target it with cartLinesUpdate/Remove. */
  id: string;
  quantity: number;
  variantId: string;
}

export interface ShopifyCart {
  id: string;
  /** Raw, as Shopify returns it (still on the myshopify.com host) — pass
   *  through checkoutUrlFor() right before sending someone to it. */
  checkoutUrl: string;
  lines: ShopifyCartLine[];
}

interface RawCart {
  id: string;
  checkoutUrl: string;
  lines: { edges: { node: { id: string; quantity: number; merchandise: { id?: string } } }[] };
}

function toShopifyCart(raw: RawCart | null | undefined): ShopifyCart | null {
  if (!raw) return null;
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    lines: raw.lines.edges.map((e) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      variantId: e.node.merchandise?.id ?? '',
    })),
  };
}

const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    lines(first: 250) {
      edges {
        node {
          id
          quantity
          merchandise { ... on ProductVariant { id } }
        }
      }
    }
  }
`;

/**
 * Rewrites a Shopify-issued checkoutUrl onto the branded checkout domain.
 *
 * Shopify builds checkoutUrl on the store's primary domain (tualmi.com), but
 * that DNS points at Vercel, not Shopify — so the URL would 404 as-is.
 *
 * Set NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN to a branded subdomain you've added
 * in Shopify (e.g. shop.tualmi.com) so customers never see myshopify.com —
 * including when they back out of Shop Pay. Falls back to the raw myshopify
 * domain, which works but exposes the store's internal address.
 *
 * Pulled out of createCheckout (which no longer exists) so it can be applied
 * every time a stored cart's checkoutUrl is used, not just once at creation —
 * the cart is created long before checkout now, so its checkoutUrl gets read
 * many times over the life of one visit.
 */
export function checkoutUrlFor(rawCheckoutUrl: string): string {
  const checkoutHost =
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN?.trim() || SHOPIFY_DOMAIN;
  const url = new URL(rawCheckoutUrl);
  url.hostname = checkoutHost;
  url.port = '';
  return url.toString();
}

type CartLineInput = { variantId: string; quantity: number; attributes?: { key: string; value: string }[] };
type CartAttribute = { key: string; value: string };

interface CartMutationResult {
  cart: RawCart | null;
  userErrors: { field: string[]; message: string }[];
}

const cartLineInputs = (lines: CartLineInput[]) =>
  lines.map(({ variantId, quantity, attributes }) => ({
    merchandiseId: variantId,
    quantity,
    // Line-item note (shows on cart, checkout, and the order confirmation)
    ...(attributes && attributes.length ? { attributes } : {}),
  }));

/**
 * Creates a brand-new Shopify cart. Called once per shopper, on their first
 * add-to-cart — see store/cartStore.ts. Throws on a real failure; unlike the
 * cartLinesAdd/Update/Remove below, there's no existing cart id to be stale,
 * so any failure here is a genuine one.
 */
export async function cartCreate(
  lines: CartLineInput[],
  /**
   * Cart-level attributes (as opposed to per-line) — attribution and GA4 ids
   * when they're already known at creation time. Usually they aren't yet
   * (the cart is created on first add-to-cart, long before checkout), so
   * cartAttributesUpdate() below is what actually sets them in practice.
   */
  cartAttributes?: CartAttribute[],
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResult }>(`
    ${CART_FIELDS}
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, {
    input: {
      lines: cartLineInputs(lines),
      ...(cartAttributes && cartAttributes.length ? { attributes: cartAttributes } : {}),
    },
  }, { noStore: true });

  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length > 0) throw new Error(userErrors.map((e) => e.message).join(', '));
  if (!cart) throw new Error('Cart creation failed — no cart returned.');
  return toShopifyCart(cart)!;
}

/**
 * Adds lines to an existing cart. Returns null — rather than throwing — when
 * Shopify no longer recognises `cartId` (an expired or otherwise invalid
 * cart, returned with `cart: null` and no userErrors), so the caller can
 * recreate the cart instead of treating "this cart aged out" the same as
 * "Shopify is down".
 */
export async function cartLinesAdd(cartId: string, lines: CartLineInput[]): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResult }>(`
    ${CART_FIELDS}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lines: cartLineInputs(lines) }, { noStore: true });

  const { cart, userErrors } = data.cartLinesAdd;
  if (!cart) return null; // gone — let the caller recreate it
  if (userErrors.length > 0) throw new Error(userErrors.map((e) => e.message).join(', '));
  return toShopifyCart(cart);
}

/** Same null-means-gone contract as cartLinesAdd. */
export async function cartLinesUpdate(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResult }>(`
    ${CART_FIELDS}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lines }, { noStore: true });

  const { cart, userErrors } = data.cartLinesUpdate;
  if (!cart) return null;
  if (userErrors.length > 0) throw new Error(userErrors.map((e) => e.message).join(', '));
  return toShopifyCart(cart);
}

/** Same null-means-gone contract as cartLinesAdd. */
export async function cartLinesRemove(cartId: string, lineIds: string[]): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResult }>(`
    ${CART_FIELDS}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
  `, { cartId, lineIds }, { noStore: true });

  const { cart, userErrors } = data.cartLinesRemove;
  if (!cart) return null;
  if (userErrors.length > 0) throw new Error(userErrors.map((e) => e.message).join(', '));
  return toShopifyCart(cart);
}

/**
 * Reads a cart back. Used to validate a stored cart id before trusting it —
 * e.g. right after the page loads with a cart id from localStorage that could
 * be days old. A read, so (unlike the mutations above) it's allowed to retry.
 */
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>(`
    ${CART_FIELDS}
    query CartQuery($id: ID!) {
      cart(id: $id) { ...CartFields }
    }
  `, { id: cartId });
  return toShopifyCart(data.cart);
}

/**
 * Sets cart-level attributes — attribution (lib/attribution.ts) and the GA4
 * client_id/session_id (lib/ga.ts) — on an EXISTING cart.
 *
 * These used to be set once, at cartCreate, because the cart was created
 * fresh at the instant of checkout, by which time both were already known.
 * Now the cart is created much earlier (first add-to-cart), before either
 * exists yet, so they get attached here instead, right before checkout.
 *
 * Best-effort: attribution is a nice-to-have, not something worth failing
 * checkout over, so a failure here is logged and swallowed — same philosophy
 * as the Klaviyo notification in the reviews route.
 */
export async function cartAttributesUpdate(
  cartId: string,
  attributes: CartAttribute[],
): Promise<ShopifyCart | null> {
  if (attributes.length === 0) return null;
  try {
    const data = await shopifyFetch<{ cartAttributesUpdate: CartMutationResult }>(`
      ${CART_FIELDS}
      mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
        cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
          cart { ...CartFields }
          userErrors { field message }
        }
      }
    `, { cartId, attributes }, { noStore: true });

    const { cart, userErrors } = data.cartAttributesUpdate;
    if (userErrors.length > 0) {
      console.warn('[cart] cartAttributesUpdate had userErrors, continuing anyway:', userErrors);
    }
    return toShopifyCart(cart);
  } catch (err) {
    console.warn('[cart] cartAttributesUpdate failed, continuing without it:', err);
    return null;
  }
}

/**
 * Applies a discount code to an EXISTING cart. Same best-effort treatment as
 * cartAttributesUpdate and for the same reason: a creator code that fails to
 * apply is a worse discount, not a broken checkout.
 */
export async function cartDiscountCodesUpdate(
  cartId: string,
  discountCodes: string[],
): Promise<ShopifyCart | null> {
  if (discountCodes.length === 0) return null;
  try {
    const data = await shopifyFetch<{ cartDiscountCodesUpdate: CartMutationResult }>(`
      ${CART_FIELDS}
      mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart { ...CartFields }
          userErrors { field message }
        }
      }
    `, { cartId, discountCodes }, { noStore: true });

    const { cart, userErrors } = data.cartDiscountCodesUpdate;
    if (userErrors.length > 0) {
      console.warn('[cart] cartDiscountCodesUpdate had userErrors, continuing anyway:', userErrors);
    }
    return toShopifyCart(cart);
  } catch (err) {
    console.warn('[cart] cartDiscountCodesUpdate failed, continuing without it:', err);
    return null;
  }
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
    // /images-2/placeholder.png never existed — if a Shopify product ever came
    // back with no images this rendered a 404'd <Image> on the live PDP. The OG
    // card is a real file that ships with the site.
    images: images.length ? images : ['/og/home-og.jpg'],
    category: sp.productType,
    sizes: sizes.length ? sizes : ['One Size'],
    colors: colors.length ? colors : ['Default'],
    stock,
    variants,
    isPreorder,                                                                  // ← NEW
    shippingWindow,                                                              // ← NEW
  };
}
