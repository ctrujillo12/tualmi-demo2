/**
 * The referral code a visitor arrived with, remembered until they sign up.
 *
 * ── WHY THIS IS PERSISTED ────────────────────────────────────────────────
 * Almost nobody clicks a friend's link and immediately fills in the form on
 * that exact page. They land, look at the shorts, wander to the story page,
 * and eventually subscribe through the footer or the welcome popup — by which
 * point ?ref= is long gone from the URL. Reading the query string at the
 * moment of signup would therefore drop most real referrals and credit nobody,
 * which looks identical to "the programme doesn't work".
 *
 * So the code is captured on arrival and kept for 30 days, the same shape as
 * lib/attribution.ts. First code wins: if someone later clicks a second
 * person's link, the friend who actually introduced them keeps the credit.
 */

const KEY = 'tualmi_ref';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Codes are 6 characters from an unambiguous alphabet — see lib/referrals.ts. */
const CODE_RE = /^[A-Z0-9]{4,12}$/;

/**
 * Read ?ref= and store it. Call once, as early as possible.
 *
 * Never throws: private browsing and blocked storage both make localStorage
 * throw on access, and a referral is never worth breaking a page over.
 */
export function captureReferralCode(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = new URLSearchParams(window.location.search).get('ref');
    if (!raw) return;

    const code = raw.trim().toUpperCase();
    if (!CODE_RE.test(code)) return;

    // First touch wins.
    const existing = window.localStorage.getItem(KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as { code?: string; expiresAt?: number };
      if (parsed?.code && parsed.expiresAt && Date.now() < parsed.expiresAt) return;
    }

    window.localStorage.setItem(
      KEY,
      JSON.stringify({ code, expiresAt: Date.now() + TTL_MS }),
    );
  } catch {
    /* storage unavailable — the referral is lost, the page is fine */
  }
}

/** The remembered code, or undefined. Safe to call from any signup form. */
export function getReferralCode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    // The URL wins when it's there — covers someone signing up on the very
    // page they landed on, before the effect above has run.
    const fromUrl = new URLSearchParams(window.location.search).get('ref');
    if (fromUrl && CODE_RE.test(fromUrl.trim().toUpperCase())) {
      return fromUrl.trim().toUpperCase();
    }

    const raw = window.localStorage.getItem(KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { code?: string; expiresAt?: number };
    if (!parsed?.code || !parsed.expiresAt || Date.now() > parsed.expiresAt) return undefined;
    return parsed.code;
  } catch {
    return undefined;
  }
}
