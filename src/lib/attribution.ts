/**
 * First-touch attribution.
 *
 * Replaces the manual "how did you find us?" signup step. We capture UTM params
 * and the referring domain on the visitor's FIRST page load and stash them in
 * sessionStorage, so by the time they reach /invite and actually submit, we
 * still know where they originally came from (by then document.referrer is just
 * the previous internal page, which is useless).
 *
 * First-touch, not last-touch: once a value is stored for the session we never
 * overwrite it. The first entry point is the one that earned the signup.
 *
 * NOTE: this only works if your Instagram/TikTok bio links are UTM-tagged, e.g.
 *   https://tualmi.com/invite?utm_source=instagram&utm_medium=social&utm_campaign=bio
 * In-app browsers on iOS routinely strip document.referrer, so the tags are the
 * reliable signal and the referrer is only a fallback.
 */

const KEY = 'tualmi_attribution';

/**
 * How long a first touch stays credited. Affiliate/influencer traffic often
 * browses, leaves, and buys days later, so sessionStorage (which dies with the
 * tab) would under-credit creators badly. 30 days is the common affiliate
 * default.
 */
const WINDOW_DAYS = 30;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Bare hostname of the referrer, or '' for direct / same-site / stripped. */
function referrerHost(): string {
  if (!document.referrer) return '';
  try {
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return '';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Map a referring hostname to a friendly channel name, so Klaviyo shows
 * "instagram" rather than "l.instagram.com".
 */
function friendlyChannel(host: string): string {
  if (!host) return '';
  if (host.includes('instagram')) return 'instagram';
  if (host.includes('tiktok')) return 'tiktok';
  if (host.includes('pinterest')) return 'pinterest';
  if (host.includes('facebook') || host === 'fb.me') return 'facebook';
  if (host.includes('google')) return 'google';
  if (host.includes('bing')) return 'bing';
  if (host.includes('reddit')) return 'reddit';
  if (host.includes('youtube')) return 'youtube';
  return host;
}

/** Call once on first mount. No-ops on the server and after the first capture. */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    // First touch wins for the whole attribution window.
    if (Object.keys(getAttribution()).length > 0) return;

    const params = new URLSearchParams(window.location.search);
    const data: Attribution = {};

    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) data[k] = v.slice(0, 120);
    }

    const host = referrerHost();
    if (host) data.referrer = friendlyChannel(host);

    // If the link wasn't tagged, fall back to the referring channel so we still
    // get instagram-vs-tiktok rather than nothing at all.
    if (!data.utm_source && data.referrer) data.utm_source = data.referrer;

    // Nothing worth recording (direct visit, no tags, no referrer).
    if (Object.keys(data).length === 0) return;

    data.landing_page = window.location.pathname;

    localStorage.setItem(
      KEY,
      JSON.stringify({ data, expiresAt: Date.now() + WINDOW_DAYS * 86_400_000 })
    );
  } catch {
    // Private mode / storage disabled — attribution is best-effort, never fatal.
  }
}

/** The stored first touch, if it hasn't expired. Returns {} otherwise. */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { data?: Attribution; expiresAt?: number };
    if (!parsed?.data || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(KEY);
      return {};
    }
    return parsed.data;
  } catch {
    return {};
  }
}

/**
 * Attribution formatted as Shopify cart attributes.
 *
 * These ride along with the cart into Shopify's hosted checkout and land on the
 * order in the admin under "Additional details" — which is the only way to tie
 * a purchase back to a creator, since the checkout is on Shopify's domain where
 * our own analytics can't follow it.
 */
export function attributionCartAttributes(): { key: string; value: string }[] {
  const a = getAttribution();
  const out: { key: string; value: string }[] = [];

  // Shown first in the Shopify admin, so make it the obvious one to read.
  if (a.utm_source) out.push({ key: 'Referred by', value: a.utm_source });
  if (a.utm_medium) out.push({ key: 'Channel', value: a.utm_medium });
  if (a.utm_campaign) out.push({ key: 'Campaign', value: a.utm_campaign });
  if (a.utm_content) out.push({ key: 'Content', value: a.utm_content });
  if (a.referrer && a.referrer !== a.utm_source) {
    out.push({ key: 'Referrer', value: a.referrer });
  }
  if (a.landing_page) out.push({ key: 'Landing page', value: a.landing_page });

  return out;
}
