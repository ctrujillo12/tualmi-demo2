import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct } from '@/lib/products';
import { getSummary } from '@/lib/reviews';
import ProductReviews from '@/components/ProductReviews';

// Full product pages: the shorts and pant. Anything else redirects to the preview.
const DETAIL_HANDLES = ['sierra-shorts', 'juniper-pant'];

// NOTE ON LINK PREVIEWS
// The `openGraph` block is what Instagram, iMessage, Linktree, WhatsApp etc.
// show when someone shares the link. Without it these pages fall back to the
// site-wide image in app/layout.tsx, so every product link previewed
// identically. The images live in public/og/ and are regenerated with
// `python3 scripts/make-og-images.py`.
const OG_BASE = {
  siteName: 'Tualmi',
  type: 'website' as const,
};

const PAGE_METADATA: Record<string, Metadata> = {
  'sierra-shorts': {
    title: 'sierra shorts — mid-rise hiking shorts',
    description:
      'Mid-rise, relaxed-fit women’s hiking shorts in 100% recycled nylon — fast-dry and water-repellent performance, ultra-light. In Jam, Picnic, and Confetti — shipping now.',
    alternates: { canonical: '/products/sierra-shorts' },
    openGraph: {
      ...OG_BASE,
      title: 'Sierra Shorts — Tualmi',
      description:
        'Mid-rise, relaxed fit. 100% recycled, fast-dry and ultra-light. Built for the trail, cute everywhere else.',
      url: '/products/sierra-shorts',
      images: [{ url: '/og/sierra-shorts-og.jpg', width: 1200, height: 630, alt: 'Tualmi Sierra Shorts' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sierra Shorts — Tualmi',
      description: 'Mid-rise, relaxed fit. 100% recycled, fast-dry and ultra-light.',
      images: ['/og/sierra-shorts-og.jpg'],
    },
  },
  'juniper-pant': {
    title: 'juniper pant — flare cargo hiking pants',
    description:
      'Fashion-forward flare cargo hiking pants with a flattering, women-engineered fit and cargo pockets. Made from sustainable, recycled materials. Preorder now — ships mid September.',
    alternates: { canonical: '/products/juniper-pant' },
    openGraph: {
      ...OG_BASE,
      title: 'Juniper Pant — Tualmi',
      description:
        'Flare cargo hiking pants, engineered for women. Sustainable recycled materials, real pockets.',
      url: '/products/juniper-pant',
      images: [{ url: '/og/juniper-pant-og.jpg', width: 1200, height: 630, alt: 'Tualmi Juniper Pant' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Juniper Pant — Tualmi',
      description: 'Flare cargo hiking pants, engineered for women. Sustainable recycled materials.',
      images: ['/og/juniper-pant-og.jpg'],
    },
  },
};

export function generateStaticParams() {
  return [
    { id: 'sierra-shorts' },
    { id: 'juniper-pant' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return PAGE_METADATA[id] ?? PAGE_METADATA['sierra-shorts'];
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { id } = await params;
  const { color } = await searchParams;

  // ── Anything without a full detail page redirects to the landing preview ──
  if (!DETAIL_HANDLES.includes(id)) {
    redirect('/#collection');
  }

  // ── Full product page: shorts & pant ──
  // Started together rather than chained: reviews don't depend on the product,
  // and awaiting them in sequence would add their latency to a page that
  // already waits on Shopify. The review read is cached for five minutes and
  // never throws — an outage costs the review section, not the page.
  const [product, reviewSummary] = await Promise.all([getProduct(id), getSummary(id)]);
  if (!product) {
    notFound();
  }

  // Availability was hardcoded to PreOrder, so Google kept advertising
  // "pre-order" on products that had been shipping for weeks — and would go on
  // advertising it after they sold out. Derived from the live variants instead.
  const anySellable = (product!.variants ?? []).some((v) => v.availableForSale);
  const availability =
    product!.isPreorder ? 'https://schema.org/PreOrder'
    // No Shopify data (offline fallback) — don't announce a sold-out store to
    // Google on the strength of one failed request.
    : !product!.variants?.length ? 'https://schema.org/InStock'
    : anySellable ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product!.name,
    description: product!.description,
    brand: { '@type': 'Brand', name: 'Tualmi' },
    image: `https://tualmi.com${product!.images[0]}`,
    offers: {
      '@type': 'Offer',
      price: (product!.price / 100).toFixed(2),
      priceCurrency: 'USD',
      availability,
      url: `https://tualmi.com/products/${product!.handle ?? id}`,
    },
    // Google will show a star rating in the search result for this, which is
    // the single biggest free click-through win a product page gets. Gated on
    // the same threshold as the on-page section (lib/reviews.ts): claiming an
    // aggregate rating built from one review is both useless and, under
    // Google's structured-data policy, grounds for a manual action.
    // Emitted only when the same reviews are visibly rendered on the page.
    // An aggregate rating in the markup that a visitor can't see is exactly
    // what Google issues manual actions for. Gated on the same threshold as
    // the on-page summary (MIN_FOR_SUMMARY in lib/reviews.ts).
    //
    // Note there is one Product entity on this page, not two: the rating goes
    // INTO this object. A second <script type="application/ld+json"> block
    // describing the same product is a structured-data error.
    ...(reviewSummary.showSummary
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewSummary.average,
            reviewCount: reviewSummary.count,
          },
          review: reviewSummary.reviews.slice(0, 5).map((r) => ({
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
            author: { '@type': 'Person', name: r.name },
            datePublished: r.date,
            reviewBody: r.body,
          })),
        }
      : {}),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product!} initialColor={color} reviews={reviewSummary} />
      <ProductReviews summary={reviewSummary} productHandle={id} />
    </main>
  );
}
