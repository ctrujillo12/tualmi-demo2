import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct, getProducts } from '@/lib/products';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.handle ?? product.id,
  }));
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
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="pt-16">
      <ProductDetailClient product={product!} initialColor={color} />
    </main>
  );
}
