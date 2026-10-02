/**
 * The one canonical origin for the site.
 *
 * Vercel redirects tualmi.com -> www.tualmi.com, so www is the real host.
 * Canonicals, the sitemap, robots and every JSON-LD URL must use THIS origin;
 * pointing them at the apex tells Google the canonical is a URL that redirects.
 */
export const SITE_URL = 'https://www.tualmi.com';
