/**
 * Klaviyo onsite tracking.
 *
 * Why this file exists: Klaviyo had Shopify's server-side data (Placed Order,
 * Checkout Started) but zero onsite data — `Viewed Product` had never fired
 * once, because klaviyo.js was never installed. Two consequences:
 *
 *   1. Browse-abandon flows are impossible. There is no browse event to
 *      trigger on, so every visitor who looked at a product and left is
 *      simply gone.
 *   2. Back-in-stock and "recently viewed" blocks have nothing to read.
 *
 * The snippet is loaded once in app/layout.tsx. Everything here pushes onto
 * `_learnq`, which is a plain array until klaviyo.js replaces it — so events
 * fired before the script loads are queued rather than lost, and every call is
 * a no-op if the script is blocked. Analytics must never break a purchase.
 *
 * Site ID (public API key): WFQaza. This is a public identifier by design —
 * it's in the script URL on every Klaviyo-enabled storefront. No private key
 * belongs in client code.
 */

export const KLAVIYO_COMPANY_ID = 'WFQaza';

declare global {
  interface Window {
    _learnq?: unknown[];
  }
}

function push(payload: unknown[]): void {
  if (typeof window === 'undefined') return;
  try {
    window._learnq = window._learnq || [];
    window._learnq.push(payload);
  } catch {
    /* never throw into the shopping flow */
  }
}

export type KlaviyoProduct = {
  /** Product handle — stable across price and copy changes. */
  id: string;
  name: string;
  /** Dollars, not cents. */
  price: number;
  imageUrl?: string;
  url?: string;
  variant?: string;
  quantity?: number;
};

const absoluteUrl = (path?: string): string | undefined => {
  if (typeof window === 'undefined') return path;
  if (!path) return window.location.href;
  return path.startsWith('http') ? path : new URL(path, window.location.origin).toString();
};

/**
 * Ties the browser session to a known profile. Klaviyo can only attribute a
 * browse-abandon email to someone it can identify — without this, onsite
 * events land on an anonymous cookie and never reach an inbox.
 *
 * Safe to call repeatedly; Klaviyo dedupes.
 */
export function klaviyoIdentify(email?: string | null): void {
  if (!email) return;
  push(['identify', { $email: email }]);
}

/** Fires both `Viewed Product` (flow trigger) and `trackViewedProduct`
 *  (powers the recently-viewed block in emails). */
export function klaviyoViewedProduct(p: KlaviyoProduct): void {
  const url = absoluteUrl(p.url);
  const item = {
    ProductName: p.name,
    ProductID: p.id,
    ImageURL: absoluteUrl(p.imageUrl),
    URL: url,
    Brand: 'Tualmi',
    Price: p.price,
    Metadata: { Brand: 'Tualmi', Price: p.price },
  };
  push(['track', 'Viewed Product', item]);
  push([
    'trackViewedItem',
    {
      Title: p.name,
      ItemId: p.id,
      ImageUrl: absoluteUrl(p.imageUrl),
      Url: url,
      Metadata: { Brand: 'Tualmi', Price: p.price },
    },
  ]);
}

/** Fires `Added to Cart` — the second trigger worth having, and the one that
 *  catches people who added something and never reached checkout. */
export function klaviyoAddedToCart(p: KlaviyoProduct): void {
  const qty = p.quantity ?? 1;
  push([
    'track',
    'Added to Cart',
    {
      $value: p.price * qty,
      AddedItemProductName: p.name,
      AddedItemProductID: p.id,
      AddedItemImageURL: absoluteUrl(p.imageUrl),
      AddedItemURL: absoluteUrl(p.url),
      AddedItemPrice: p.price,
      AddedItemQuantity: qty,
      AddedItemVariant: p.variant,
    },
  ]);
}
