/**
 * GA4 identifiers, read client-side.
 *
 * Why this exists: checkout leaves our domain, and Shop Pay adds a further hop
 * through shop.app. By the time the order completes, nothing in the browser
 * ties it back to the original GA4 session — the purchase lands in GA4 as
 * "direct" no matter how well the landing page was tagged.
 *
 * Fix: capture GA4's client_id and session_id while we still can, write them
 * onto the Shopify cart, then replay them from the orders webhook via the
 * Measurement Protocol. GA4 stitches the server-side purchase back onto the
 * original session because the ids match.
 */

export const GA_MEASUREMENT_ID = 'G-PTRJN12KTL';

export type GaIds = { clientId?: string; sessionId?: string };

/**
 * Parse the `_ga` cookie: "GA1.1.<client_id_part1>.<part2>".
 * client_id is the last two dot-separated segments joined.
 */
function clientIdFromCookie(): string | undefined {
  const m = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!m) return undefined;
  const parts = decodeURIComponent(m[1]).split('.');
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined;
}

/**
 * Parse `_ga_<STREAM>`: "GS1.1.<session_id>.<session_number>...".
 * The measurement id minus its "G-" prefix is the cookie suffix.
 */
function sessionIdFromCookie(): string | undefined {
  const suffix = GA_MEASUREMENT_ID.replace(/^G-/, '');
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)_ga_${suffix}=([^;]+)`));
  if (!m) return undefined;
  const parts = decodeURIComponent(m[1]).split('.');
  return parts.length >= 3 ? parts[2] : undefined;
}

/**
 * Ask gtag directly (the supported API), falling back to cookie parsing.
 *
 * gtag's `get` is callback-based and silently never fires if the library was
 * blocked, so it's raced against a short timeout. Attribution is best-effort:
 * this must never delay or block checkout.
 */
export function getGaIds(timeoutMs = 600): Promise<GaIds> {
  if (typeof window === 'undefined') return Promise.resolve({});

  const fromCookies = (): GaIds => {
    try {
      return { clientId: clientIdFromCookie(), sessionId: sessionIdFromCookie() };
    } catch {
      return {};
    }
  };

  const gtag = window.gtag;
  if (typeof gtag !== 'function') return Promise.resolve(fromCookies());

  return new Promise<GaIds>((resolve) => {
    const result: GaIds = {};
    let settled = false;
    let pending = 2;

    const done = () => {
      if (settled) return;
      if (--pending > 0) return;
      settled = true;
      const cookies = fromCookies();
      resolve({
        clientId: result.clientId ?? cookies.clientId,
        sessionId: result.sessionId ?? cookies.sessionId,
      });
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(fromCookies());
    }, timeoutMs);

    try {
      gtag('get', GA_MEASUREMENT_ID, 'client_id', (v: string) => {
        result.clientId = v;
        done();
      });
      gtag('get', GA_MEASUREMENT_ID, 'session_id', (v: string) => {
        result.sessionId = v;
        done();
      });
    } catch {
      clearTimeout(timer);
      settled = true;
      resolve(fromCookies());
    }
  });
}
