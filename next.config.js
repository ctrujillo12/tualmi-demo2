/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
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
      { source: '/collections', destination: '/#collection', permanent: false },
    ];
  },
};

module.exports = nextConfig;