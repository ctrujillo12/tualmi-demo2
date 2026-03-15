import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Track the currently selected image index
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Optional: track selected color if product has a colors array
  const [selectedColor, setSelectedColor] = useState(
    product.colors ? product.colors[0] : null
  );

  const handleColorClick = (index: number) => {
    setSelectedImageIndex(index);
    if (product.colors) setSelectedColor(product.colors[index]);
  };

  return (
    <div className="group">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100 mb-4 flex items-center justify-center">
        <Image
          src={product.images[selectedImageIndex]}
          alt={product.name}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product info */}
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600">{product.category}</p>
        <p className="font-semibold text-gray-500 text-xs">
          ${(product.price / 100).toFixed(2)}
        </p>

        {/* Color buttons */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex space-x-2 mt-2">
            {product.colors.map((color, index) => (
              <button
                key={color}
                onClick={() => handleColorClick(index)}
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}