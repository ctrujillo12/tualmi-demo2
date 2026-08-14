/**
 * Free-shipping threshold.
 *
 * Single source of truth — the header promo, the product page line and the
 * cart progress bar all read from here, so the promise can't drift between
 * pages. Change the number once and every surface follows.
 *
 * IMPORTANT: this is only the storefront messaging. The actual discount has to
 * exist in Shopify (Settings → Shipping and delivery → add a Free shipping
 * rate with a $130 minimum, or a Free Shipping discount with a minimum
 * purchase amount). Without it the site promises something checkout won't
 * honour.
 */

/**
 * Orders at or above this qualify. Cents, to match cart maths.
 *
 * $130 is set so two pairs of Sierra Shorts ($68 each = $136) clear it — the
 * threshold exists to make the second pair feel free to ship, so it has to sit
 * just under that number, not above it.
 *
 * Must match the minimum on the Shopify free-shipping rule.
 */
export const FREE_SHIPPING_THRESHOLD = 13000;

// "US" is load-bearing: the Shopify rule is United States only and excludes
// rates over $11, so international orders still pay. Claiming plain "free
// shipping" would be a promise checkout doesn't keep.
export const FREE_SHIPPING_LABEL = 'free US shipping over $130';

export type ShippingProgress = {
  qualified: boolean;
  /** Cents still needed. 0 once qualified. */
  remaining: number;
  /** 0–1, for the progress bar. */
  pct: number;
};

export function freeShippingProgress(subtotalCents: number): ShippingProgress {
  const qualified = subtotalCents >= FREE_SHIPPING_THRESHOLD;
  return {
    qualified,
    remaining: qualified ? 0 : FREE_SHIPPING_THRESHOLD - subtotalCents,
    pct: Math.max(0, Math.min(1, subtotalCents / FREE_SHIPPING_THRESHOLD)),
  };
}

/** $12 / $12.50 — drops the cents when they're .00 so the nudge reads cleanly. */
export function money(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`;
}
