/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern formats — typically 25-50% smaller than JPEG at the same
    // quality. Browsers that don't support them fall back automatically.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        // Customer review photos, served from Supabase Storage. Without this
        // entry next/image refuses the URL at request time and the review card
        // throws — the photo is uploaded fine and the page still breaks.
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Server-side 301s so Google transfers ranking from the old product URLs
  async redirects() {
    return [
      { source: '/products/horizon-shorts', destination: '/products/sierra-shorts', permanent: true },
      { source: '/products/summit-pant', destination: '/products/juniper-pant', permanent: true },
      { source: '/products/pinnacles-pant', destination: '/products/juniper-pant', permanent: true },
      { source: '/products/carabiner', destination: '/', permanent: true },
      { source: '/products/trailblazing-tote', destination: '/', permanent: true },
      { source: '/collections', destination: '/#collection', permanent: false },
    ];
  },
};

module.exports = nextConfig;