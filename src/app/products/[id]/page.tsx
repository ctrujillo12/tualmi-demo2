import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct } from '@/lib/products';

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
      'Mid-rise, relaxed-fit women’s hiking shorts in 100% recycled nylon — fast-dry and water-repellent performance, ultra-light. Dropping July 31st in Jam, Picnic, and Confetti.',
    alternates: { canonical: '/products/sierra-shorts' },
    openGraph: {
      ...OG_BASE,
      title: 'Sierra Shorts — Tualmi',
      description:
        'Mid-rise, relaxed fit. 100% recycled nylon, fast-dry and ultra-light. Built for the trail, cute everywhere else.',
      url: '/products/sierra-shorts',
      images: [{ url: '/og/sierra-shorts-og.jpg', width: 1200, height: 630, alt: 'Tualmi Sierra Shorts' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sierra Shorts — Tualmi',
      description: 'Mid-rise, relaxed fit. 100% recycled nylon, fast-dry and ultra-light.',
      images: ['/og/sierra-shorts-og.jpg'],
    },
  },
  'juniper-pant': {
    title: 'juniper pant — flare cargo hiking pants',
    description:
      'Fashion-forward flare cargo hiking pants with a flattering, women-engineered fit and cargo pockets. Made from sustainable, recycled materials. Dropping July 31st.',
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
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

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
      availability: 'https://schema.org/PreOrder',
      url: `https://tualmi.com/products/${product!.handle ?? id}`,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product!} initialColor={color} />
    </main>
  );
}
