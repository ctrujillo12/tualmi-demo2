import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group">
      <div className="aspect-square relative overflow-hidden bg-gray-100 mb-4">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600">{product.category}</p>
        <p className="font-semibold text-gray-500 text-xs">
          ${(product.price / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}