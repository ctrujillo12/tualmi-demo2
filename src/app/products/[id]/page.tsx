import { notFound } from 'next/navigation';
import HeaderStaticBlack from '@/components/HeaderStaticBlack';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct, getProducts } from '@/lib/products';

// Pre-render all product pages at build time
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    id: product.handle ?? product.id,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

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