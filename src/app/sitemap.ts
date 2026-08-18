import type { MetadataRoute } from 'next';

const BASE = 'https://tualmi.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/story`, priority: 0.8 },
    { url: `${BASE}/in-the-wild`, priority: 0.7 },
    { url: `${BASE}/products/sierra-shorts`, priority: 0.8 },
    { url: `${BASE}/products/juniper-pant`, priority: 0.8 },
    { url: `${BASE}/invite`, priority: 0.6 },
    { url: `${BASE}/footer-pages/shipping`, priority: 0.3 },
    { url: `${BASE}/footer-pages/returns`, priority: 0.3 },
    { url: `${BASE}/footer-pages/size-fit`, priority: 0.3 },
    { url: `${BASE}/footer-pages/garment-care`, priority: 0.3 },
    { url: `${BASE}/footer-pages/privacy`, priority: 0.2 },
    { url: `${BASE}/footer-pages/legal`, priority: 0.2 },
  ];
}
