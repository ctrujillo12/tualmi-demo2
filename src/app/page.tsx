import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen w-full">
        <Image
          src="/images-2/hero7.jpg"
          alt="Hero"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </section>

      {/* Product Grid - No Title */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-md mx-auto text-center px-4">
          <h2 className="text-sm font-normal text-black mb-6 tracking-[0.3em] uppercase">
            Newsletter
          </h2>
          <form className="flex gap-0 border border-black">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 px-4 py-3 text-sm focus:outline-none bg-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-xs uppercase tracking-widest"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}