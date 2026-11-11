/**
 * Afterpay "pay in 4" messaging.
 *
 * Copy follows Afterpay's retailer guidelines: "$XX or 4 payments of $XX with
 * Afterpay", and any "4 payments" wording carries the disclaimer below. Do not
 * add "no credit check", "no fees" or "instant approval"; all are prohibited.
 *
 * Confirm MIN and MAX against the limits on the Afterpay account. Below or
 * above them the line is hidden, because a shopper could not actually use it.
 */
/**
 * Master switch. Set to true once Afterpay appears at Shopify checkout; every
 * Afterpay message on the site follows this one value.
 */
export const AFTERPAY_ENABLED = false;

/**
 * Square on-site messaging (Square dashboard → Online → On-site messaging).
 * These are public ids from the implementation guide, not secrets, and Square
 * requires them to stay exactly as given. The Square placement renders its own
 * copy, disclaimer and limits, and is NOT gated on AFTERPAY_ENABLED: Square
 * needs to see it live on the product and cart pages to approve the account.
 */
export const SQUARE_MARKETPLACE_SRC = 'https://js.squarecdn.com/square-marketplace.js';
export const SQUARE_MPID = 'd4775e18-4568-452c-8e1c-c6d9694667c6';
export const SQUARE_PLACEMENT_PRODUCT = 'ea1c3b0b-095d-469f-87da-063915f1afc5';
export const SQUARE_PLACEMENT_CART = '0d90b26c-d106-4898-951a-a7eb373b6594';

export const AFTERPAY_MIN_CENTS = 3500;
export const AFTERPAY_MAX_CENTS = 200000;
export const AFTERPAY_DISCLAIMER = 'Late fees may apply. Eligibility criteria apply.';
export const AFTERPAY_TERMS_URL = 'https://bit.ly/AfterpayTerms';
export const AFTERPAY_SHORT = 'shop now, pay later with Afterpay';

export const afterpayEligible = (cents: number) =>
  AFTERPAY_ENABLED && cents >= AFTERPAY_MIN_CENTS && cents <= AFTERPAY_MAX_CENTS;

/** One of the four payments, rounded up so four of them cover the total. */
export function installmentLabel(cents: number): string {
  const each = Math.ceil(cents / 4) / 100;
  return each % 1 === 0 ? `$${each.toFixed(0)}` : `$${each.toFixed(2)}`;
}
