import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HomeHero from '@/components/HomeHero';
import type { Product } from '@/types';

export default async function Home() {
  const products = await getProducts();

  const tote = products.find((p) => p.handle === 'trailblazing-tote');
  const previewProducts = products.filter((p) => p.handle !== 'trailblazing-tote');

  return (
    <div>
      {/* Hero Section — carousel stays client-side in its own component */}
      <HomeHero />

      {/* Story Blurb */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-sm leading-relaxed mb-6">
          Tualmi was born on the trail. After years of hiking and backpacking, we saw that women's
          outdoor clothing rarely reflected the women wearing it—designed to blend in rather than stand out.
        </p>
        <p className="text-sm leading-relaxed">
          We design functional outdoor apparel that lets women show up fully as themselves,
          made sustainably and manufactured in Los Angeles.
        </p>
        <Link
          href="/story"
          className="inline-block mt-8 text-xs tracking-wide underline underline-offset-4"
        >
          Read our story
        </Link>
      </section>

      {/* Tote — Available Now */}
      {tote && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
          <p className="text-xs tracking-[0.3em] uppercase text-center mb-10">
            Available For Preorder
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square relative overflow-hidden bg-gray-50">
              <Image
                src={tote.images[0]}
                alt={tote.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">
                  {tote.category}
                </p>
                <h2 className="text-2xl font-medium text-gray-900 mb-3">
                  {tote.name}
                </h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  {tote.description}
                </p>
              </div>
              <p className="text-lg font-medium text-gray-900">
                ${(tote.price / 100).toFixed(2)}
              </p>
              <Link
                href={`/products/${tote.handle ?? tote.id}`}
                className="inline-block w-fit border border-gray-900 px-8 py-3 text-xs tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-colors duration-200"
              >
                Preorder Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Preview Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
        <p className="text-xs tracking-[0.3em] uppercase text-center mb-10">
          Launching Spring 2026 — Preview Drop 1
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {previewProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}