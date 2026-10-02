import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Transactional / personal pages: nothing to rank, and /api and
        // /discount are crawl-budget noise.
        disallow: ['/api/', '/cart', '/share', '/review', '/discount/'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/cart'],
      },
    ],
    sitemap: 'https://www.tualmi.com/sitemap.xml',
  };
}