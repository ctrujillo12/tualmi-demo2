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
export const AFTERPAY_MIN_CENTS = 3500;
export const AFTERPAY_MAX_CENTS = 200000;
export const AFTERPAY_DISCLAIMER = 'Late fees may apply. Eligibility criteria apply.';
export const AFTERPAY_TERMS_URL = 'https://bit.ly/AfterpayTerms';
export const AFTERPAY_SHORT = 'shop now, pay later with Afterpay';

export const afterpayEligible = (cents: number) =>
  cents >= AFTERPAY_MIN_CENTS && cents <= AFTERPAY_MAX_CENTS;

/** One of the four payments, rounded up so four of them cover the total. */
export function installmentLabel(cents: number): string {
  const each = Math.ceil(cents / 4) / 100;
  return each % 1 === 0 ? `$${each.toFixed(0)}` : `$${each.toFixed(2)}`;
}
