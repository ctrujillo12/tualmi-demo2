/**
 * Creator / affiliate discount codes.
 *
 * A visitor arriving at /discount/CAMI10 has their code stored here, then gets
 * sent on to a normal page on OUR site. The code is applied later, at
 * cartCreate, via the Storefront API's `discountCodes` input.
 *
 * Why not Shopify's own /discount/CODE?redirect= endpoint: that lands the
 * visitor on tualmi.myshopify.com — Shopify's storefront, not ours. They'd see
 * the default Shopify theme instead of the real site, and none of our
 * attribution or analytics would run. Applying the code on the cart is both
 * deterministic (no cross-domain cookie to lose) and invisible to the shopper.
 */

const KEY = 'tualmi_discount';
/**
 * Set only when the visitor arrives through /discount/[code] in THIS browsing
 * session. The code itself is remembered for 30 days so it still applies at
 * checkout on a later visit, but the on-page "code applied" note is tied to
 * this flag — otherwise the badge would follow shoppers around for a month.
 */
const SESSION_KEY = 'tualmi_discount_session';
const WINDOW_DAYS = 30; // match the attribution window

type Stored = { code: string; expiresAt: number };

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
    const payload: Stored = { code: clean, expiresAt: Date.now() + WINDOW_DAYS * 86_400_000 };
    localStorage.setItem(KEY, JSON.stringify(payload));
    // Mark this visit as having come from a code link.
    sessionStorage.setItem(SESSION_KEY, clean);
  } catch {
    // Storage unavailable — the shopper can still enter the code at checkout.
  }
}

/**
 * The code to SHOW on the page — only for a visitor who arrived via a discount
 * link this session. Use this for UI. Use getDiscountCode() for checkout, which
 * should still honour a code from a previous visit.
 */
export function getSessionDiscountCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const active = sessionStorage.getItem(SESSION_KEY);
    if (!active) return null;
    // Only show it if the stored code is still valid and matches.
    return getDiscountCode() === active ? active : null;
  } catch {
    return null;
  }
}

/** The stored code, if any and not expired. */
export function getDiscountCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.code || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed.code;
  } catch {
    return null;
  }
}

export function clearDiscountCode(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* no-op */
  }
}
