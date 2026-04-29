import Link from 'next/link';
import Image from 'next/image';
import HeaderStaticBlack from '@/components/HeaderStaticBlack';
import { getProducts } from '@/lib/products';
import CollectionsFilters from '@/components/CollectionsFilters';
import type { Product } from '@/types';

export default async function CollectionsPage() {
  const allProducts = await getProducts();
  const products = allProducts.filter((p) => p.handle !== 'trailblazing-tote');

  return (
    <>
      <HeaderStaticBlack />

      <main className="px-6 pt-28 pb-15 max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-sans text-s tracking-tight">
            Coming Spring 2026
          </h1>
        </div>

        {/* Filter toggle — needs client interactivity, isolated below */}
        <CollectionsFilters />

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {products.map((product: Product) => (
            <Link
              key={product.id}
              href={`/products/${product.handle ?? product.id}`}
              className="group"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-sand-200 flex items-center justify-center">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>

              {/* Meta */}
              <div className="mt-4 text-center">
                <p className="font-sans text-base tracking-tight">
                  {product.name}
                </p>
                <p className="font-sans text-xs text-sand-600 mt-1 tracking-wide">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}