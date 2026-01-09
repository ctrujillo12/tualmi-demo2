import Image from 'next/image';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
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

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
