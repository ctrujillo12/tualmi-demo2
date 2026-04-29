/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    return [
      {
        // Proxy /cart/:path* → your Shopify store's cart/checkout URLs
        source: '/cart/:path*',
        destination: `https://${shopifyDomain}/cart/:path*`,
      },
      {
        // Shopify also sometimes uses /checkouts/:path*
        source: '/checkouts/:path*',
        destination: `https://${shopifyDomain}/checkouts/:path*`,
      },
    ];
  },
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
};

module.exports = nextConfig;