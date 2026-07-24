import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct } from '@/lib/products';

// Full product pages: the tote (purchasable) plus the shorts and pant
// (view-only, dropping July 31st). Anything else redirects to the landing preview.
const DETAIL_HANDLES = ['trailblazing-tote', '11', 'sierra-shorts', 'juniper-pant'];

const PAGE_METADATA: Record<string, Metadata> = {
  'sierra-shorts': {
    title: 'sierra shorts — mid-rise hiking shorts',
    description:
      'Mid-rise, relaxed-fit women’s hiking shorts in 100% recycled nylon — moisture-wicking, water-resistant, and ultra-light. Dropping July 31st in Jam, Picnic, and Confetti.',
    alternates: { canonical: '/products/sierra-shorts' },
  },
  'juniper-pant': {
    title: 'juniper pant — flare cargo hiking pants',
    description:
      'Fashion-forward flare cargo hiking pants with a flattering, women-engineered fit and cargo pockets. Made from sustainable, recycled materials. Dropping July 31st.',
    alternates: { canonical: '/products/juniper-pant' },
  },
  'trailblazing-tote': {
    title: 'trailblazing club tote — organic cotton canvas',
    description:
      'The tote that goes everywhere you do — 100% organic cotton canvas, sturdy enough for the trail, cute enough for the farmers market.',
    alternates: { canonical: '/products/trailblazing-tote' },
  },
};

export function generateStaticParams() {
  return [
    { id: 'trailblazing-tote' },
    { id: 'sierra-shorts' },
    { id: 'juniper-pant' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return PAGE_METADATA[id] ?? PAGE_METADATA['trailblazing-tote'];
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

  // ── Full product page: tote (purchasable) + shorts & pant (view-only) ──
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

  const isTote = (product!.handle ?? id) === 'trailblazing-tote';

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
      availability: isTote ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
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
