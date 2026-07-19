import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct } from '@/lib/products';

export const metadata: Metadata = {
  title: 'trailblazing club tote — organic cotton canvas',
  description:
    'The tote that goes everywhere you do — 100% organic cotton canvas, sturdy enough for the trail, cute enough for the farmers market.',
  alternates: { canonical: '/products/trailblazing-tote' },
};

// Only the tote has a live product page right now — everything else
// redirects to the product preview on the landing page.
const LIVE_HANDLES = ['trailblazing-tote', '11'];

export function generateStaticParams() {
  return [{ id: 'trailblazing-tote' }];
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

  if (!LIVE_HANDLES.includes(id)) {
    redirect('/#collection');
  }

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
    material: '100% organic cotton canvas',
    image: `https://tualmi.com${product!.images[0]}`,
    offers: {
      '@type': 'Offer',
      price: (product!.price / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://tualmi.com/products/trailblazing-tote',
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
