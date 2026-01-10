import { notFound } from 'next/navigation';
import HeaderStaticBlack from '@/components/HeaderStaticBlack';
import ProductDetailClient from '@/components/ProductDetailClient';
import { products } from '@/lib/products';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <HeaderStaticBlack />
      <main className="pt-16">
      <ProductDetailClient product={product} />
    </main>
    </>
  );
}
