import type { MetadataRoute } from 'next';

const BASE = 'https://tualmi.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1 },
    // Second only to the home page: it is the entry point to both products
    // and the target of every breadcrumb trail on the site.
    { url: `${BASE}/collections`, priority: 0.9 },
    { url: `${BASE}/story`, priority: 0.8 },
    { url: `${BASE}/in-the-wild`, priority: 0.7 },
    { url: `${BASE}/products/sierra-shorts`, priority: 0.8 },
    { url: `${BASE}/products/juniper-pant`, priority: 0.8 },
    { url: `${BASE}/invite`, priority: 0.6 },
    // Higher than the other policy pages on purpose: it is the page that
    // establishes the business is real, which is the thing being checked.
    { url: `${BASE}/footer-pages/contact`, priority: 0.5 },
    { url: `${BASE}/footer-pages/exchanges`, priority: 0.3 },
    { url: `${BASE}/footer-pages/shipping`, priority: 0.3 },
    { url: `${BASE}/footer-pages/returns`, priority: 0.3 },
    { url: `${BASE}/footer-pages/garment-care`, priority: 0.3 },
    { url: `${BASE}/footer-pages/privacy`, priority: 0.2 },
    { url: `${BASE}/footer-pages/legal`, priority: 0.2 },
  ];
}
