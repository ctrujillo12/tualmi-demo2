import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart'] },
    // www, because the apex 308s to it. Google follows the redirect either
    // way; this just removes the hop and matches the URL submitted in Search
    // Console, so the two can't be read as two different sitemaps.
    sitemap: 'https://www.tualmi.com/sitemap.xml',
  };
}
