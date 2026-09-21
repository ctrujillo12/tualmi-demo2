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
  // Server-side permanent redirects (Next emits 308, not 301 — same effect
  // for Google) so the old product URLs pass their ranking to the new ones.
  // /products/horizon-shorts is not hypothetical: it was the single busiest
  // landing page on the site in the last 30 days.
  async redirects() {
    return [
      { source: '/products/horizon-shorts', destination: '/products/sierra-shorts', permanent: true },
      { source: '/products/summit-pant', destination: '/products/juniper-pant', permanent: true },
      { source: '/products/pinnacles-pant', destination: '/products/juniper-pant', permanent: true },
      // Was missing while its three siblings were all here, so this one alone
      // fell through to the catch-all in products/[id]/page.tsx and landed on
      // /#collection — wrong page, and a 307 that passes no ranking.
      { source: '/products/juniper-pants', destination: '/products/juniper-pant', permanent: true },
      { source: '/products/carabiner', destination: '/', permanent: true },
      // NO entry for /products/trailblazing-tote. It is a real, buyable
      // product (SELLABLE_HANDLES) that is merely unlisted, and a permanent
      // redirect told Google the URL was gone for good. Nothing links to it —
      // CartItem and CartUpsell both check hasDetailPage() first.
      // NO /collections redirect any more. It used to send /collections to the
      // homepage fragment, and a redirect here OUTRANKS the route, so the real
      // shop page at app/collections/page.tsx would have been unreachable in
      // production while building and type-checking perfectly. If /collections
      // ever 307s to /#collection again, this line came back.
    ];
  },
};

module.exports = nextConfig;