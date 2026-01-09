import HeaderStaticBlack from '@/components/HeaderStaticBlack';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

interface ProductsPageProps {
  searchParams: { category?: string };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = searchParams;

  const filteredProducts = category
    ? products.filter(p => p.category === category)
    : products;

  const pageTitle = category ? `${category}s` : 'Collection 1';

  return (
    <>
      <HeaderStaticBlack />

      {/* offset for fixed header */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-normal text-black mb-2 tracking-[0.2em] uppercase">
            {pageTitle}
          </h1>
          <p className="text-xs text-gray-600 font-light">
            {filteredProducts.length}{' '}
            {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
