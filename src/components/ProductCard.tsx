import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-sand-100 mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm text-sand-900 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-sand-600">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}