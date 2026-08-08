/**
 * Creator / affiliate discount codes.
 *
 * A visitor arriving at /discount/CAMI10 has their code stored here, then gets
 * sent on to a normal page on our own site. The code is applied later, at
 * cartCreate, via the Storefront API's `discountCodes` input.
 *
 * SESSION-SCOPED ON PURPOSE. The code lives in sessionStorage, so it only
 * applies to the visit that actually came through the creator's link. It was
 * briefly kept in localStorage for 30 days, which meant anyone who had ever
 * clicked a creator link kept getting the discount on every later visit —
 * including people arriving straight at tualmi.com. Don't move this back to
 * localStorage.
 *
 * Attribution (see lib/attribution.ts) is deliberately different: that DOES
 * persist 30 days, so a creator still gets credited for a sale they drove even
 * if the buyer returns later. Credit and discount are separate questions.
 *
 * Why not Shopify's own /discount/CODE?redirect= endpoint: that lands the
 * visitor on tualmi.myshopify.com — Shopify's storefront, not ours. They'd see
 * the default Shopify theme instead of the real site, and none of our
 * attribution or analytics would run.
 */

const KEY = 'tualmi_discount';

/** Codes are uppercase alphanumeric with dashes/underscores. Reject anything else. */
export function normalizeCode(raw: string): string | null {
  const code = decodeURIComponent(raw || '').trim().toUpperCase();
  if (!code || code.length > 40) return null;
  if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(code)) return null;
  return code;
}

export function saveDiscountCode(code: string): void {
  if (typeof window === 'undefined') return;
  const clean = normalizeCode(code);
  if (!clean) return;
  try {
    sessionStorage.setItem(KEY, clean);
    // Clear any code left over from the old localStorage behaviour, so a
    // returning shopper isn't carrying a stale one around.
    localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable — the shopper can still type the code at checkout.
  }
}

/**
 * The active code for this visit, or null. Used both for the on-page "code
 * applied" note and for the actual discount sent to Shopify at checkout —
 * they should never disagree.
 */
export function getDiscountCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
}

export function clearDiscountCode(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
