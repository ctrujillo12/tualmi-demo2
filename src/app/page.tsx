import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const featuredProducts = products.slice(0, 5);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen w-full">
        <Image
          src="/images-2/hero5.jpg"
          alt="Hero"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </section>

      {/* Story Blurb */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* <p className="text-xs tracking-[0.3em] uppercase mb-6">
          Our Story
        </p> */}

        <p className="text-sm leading-relaxed mb-6">
          Tualmi was born on the trail. After years of hiking and backpacking, we saw that women’s
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


      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {featuredProducts.map(product => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <ProductCard product={product} />
            </Link>
          ))}

        </div>
      </section>
    </div>
  );
}
