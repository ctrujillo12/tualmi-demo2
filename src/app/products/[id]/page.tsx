import { redirect, notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct } from '@/lib/products';

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

  return (
    <main>
      <ProductDetailClient product={product!} initialColor={color} />
    </main>
  );
}
