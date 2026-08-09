/**
 * GA4 ecommerce events.
 *
 * Context: checkout happens on tualmi.myshopify.com, a different domain, so our
 * tag cannot see the purchase. That half has to come from Shopify's own GA4
 * integration (Shopify admin → Online Store → Preferences → Google Analytics),
 * pointed at the SAME measurement ID.
 *
 * What we own is everything before that hand-off — view_item, add_to_cart,
 * begin_checkout — which is what makes "Instagram bio link → session → cart"
 * legible in GA4. Revenue attribution by creator does NOT depend on this: the
 * affiliate is stamped onto the Shopify order itself (see lib/attribution.ts →
 * attributionCartAttributes), which survives regardless of what analytics does.
 *
 * Every call is a no-op if gtag hasn't loaded (ad blockers, consent tools), so
 * analytics can never break a purchase.
 */

type GtagArgs = [string, string, Record<string, unknown>?];

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: GtagArgs): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag(...args);
  } catch {
    /* analytics must never throw into the shopping flow */
  }
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  /** Dollars, not cents. */
  price: number;
  item_variant?: string;
  quantity?: number;
};

export function trackViewItem(item: AnalyticsItem): void {
  gtag('event', 'view_item', {
    currency: 'USD',
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem): void {
  gtag('event', 'add_to_cart', {
    currency: 'USD',
    value: item.price * (item.quantity ?? 1),
    items: [item],
  });
}

export function trackBeginCheckout(items: AnalyticsItem[], valueDollars: number, coupon?: string): void {
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: valueDollars,
    ...(coupon ? { coupon } : {}),
    items,
  });
}

/**
 * Credit a creator code as a campaign source in GA4.
 *
 * Links like /discount/CAMI10 carry no utm_* params, so GA4 would file that
 * traffic under "direct" and the creator would look like they drove nothing.
 * Setting campaign fields before the redirect puts them in Traffic acquisition
 * alongside properly tagged links.
 */
export function trackCreatorCampaign(code: string): void {
  gtag('set', 'campaign', {
    source: code.toLowerCase(),
    medium: 'affiliate',
    name: 'creator-code',
  } as unknown as Record<string, unknown>);
}
