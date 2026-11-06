import type { MetadataRoute } from 'next';

// Transactional / personal pages: nothing to rank, and /api and /discount are
// crawl-budget noise.
const PRIVATE = ['/api/', '/cart', '/share', '/review', '/discount/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      // Named explicitly so nobody "tidies" an AI search crawler out of here.
      // These are the bots that fetch pages to cite them in ChatGPT search,
      // Perplexity, Claude and Gemini answers; blocking them removes the site
      // from those answers. A bot obeys only the most specific group that
      // matches it, so each one repeats the same disallow list. (Previously
      // OAI-SearchBot had its own group without /share, /review and
      // /discount, so it was the one crawler allowed into them.)
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot', 'Google-Extended'],
        allow: '/',
        disallow: PRIVATE,
      },
    ],
    sitemap: 'https://www.tualmi.com/sitemap.xml',
  };
}
