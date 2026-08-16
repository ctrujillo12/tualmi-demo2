/**
 * Free-shipping threshold.
 *
 * Single source of truth — the header promo, the product page line and the
 * cart progress bar all read from here, so the promise can't drift between
 * pages. Change the number once and every surface follows.
 *
 * IMPORTANT: this is only the storefront messaging. The actual discount has to
 * exist in Shopify (Settings → Shipping and delivery → add a Free shipping
 * rate with a $100 minimum, or a Free Shipping discount with a minimum
 * purchase amount). Without it the site promises something checkout won't
 * honour. If you change the number here, change it there in the same sitting.
 */

/**
 * Orders at or above this qualify. Cents, to match cart maths.
 *
 * $100. What each basket does at this number:
 *   1 × Sierra Shorts  $68  → $32 short, so the bar has something to ask for
 *   2 × Sierra Shorts  $136 → clears
 *   1 × Juniper Pant   $108 → clears on its own
 *   shorts + pant      $176 → clears
 *
 * The previous $130 was tuned so only a second pair of shorts cleared it. At
 * $100 a single pant ships free, which is the trade being made deliberately:
 * more orders qualify, and the shipping cost on a one-pant order comes out of
 * margin instead of the customer.
 *
 * Must match the minimum on the Shopify free-shipping rule.
 */
export const FREE_SHIPPING_THRESHOLD = 10000;

// "US" is load-bearing: the Shopify rule is United States only and excludes
// rates over $11, so international orders still pay. Claiming plain "free
// shipping" would be a promise checkout doesn't keep. Drop the word only if
// the Shopify rule is changed to cover every country.
// Derived from the constant, not retyped, so the number can only ever be
// changed in one place. `money` is a function declaration, so it is hoisted
// and usable here.
export const FREE_SHIPPING_LABEL = `free US shipping over ${money(FREE_SHIPPING_THRESHOLD)}`;

/**
 * Long-form version of the same promise, for places with room for a sentence
 * (policy pages, the cart panel, email). Same number, same caveat, one source.
 */
export const FREE_SHIPPING_SENTENCE =
  `Earn free shipping if you spend over ${money(FREE_SHIPPING_THRESHOLD)} on US orders.`;

/**
 * Flat US shipping rate charged below the free threshold, in cents.
 *
 * The cart used to say "Shipping — from $7.99" while the total underneath
 * showed only the subtotal. "From" is the word that loses the sale: the
 * shopper taps checkout not knowing what they'll pay, and on a $68 order an
 * unknown worth ~12% of the basket is a reasonable thing to back out over.
 * Naming one number, and rolling it into a stated estimated total, removes
 * the last unknown before the checkout button.
 *
 * MUST match the US rate in Shopify → Settings → Shipping and delivery. If
 * that rate is tiered or weight-based rather than flat, set this to the
 * highest a single-item order can hit — quoting high and charging less is
 * recoverable; quoting low is the same surprise moved one screen later.
 */
export const FLAT_SHIPPING_CENTS = 799;

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
