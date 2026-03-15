'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

// Map your product color names to actual CSS colors
const COLOR_MAP: Record<string, string> = {
  Pink: '#F4A7B9',
  Lemon: '#F5E642',
  Olive: '#6B7C3E',
  Cream: '#F5F0E8',
  Red: '#C0392B',
  Plaid: '#8B3A3A',       // representative plaid color (burgundy)
  'Pink/Green': 'linear-gradient(135deg, #F4A7B9 50%, #7DBE8E 50%)', // split bubble
};

function ColorSwatch({
  color,
  isSelected,
  onClick,
}: {
  color: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const value = COLOR_MAP[color] ?? color.toLowerCase();
  const isGradient = value.startsWith('linear-gradient');

  return (
    <button
      onClick={onClick}
      aria-label={`Select ${color}`}
      className={`w-5 h-5 rounded-full border-2 transition-all ${
        isSelected ? 'border-gray-900 scale-110' : 'border-gray-300 hover:border-gray-500'
      }`}
      style={
        isGradient
          ? { background: value }
          : { backgroundColor: value }
      }
    />
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors ? product.colors[0] : null
  );

  const handleColorClick = (e: React.MouseEvent, index: number) => {
    // Stop the click from bubbling up to any parent <Link> or <a>
    e.preventDefault();
    e.stopPropagation();
    setSelectedImageIndex(index);
    if (product.colors) setSelectedColor(product.colors[index]);
  };

  return (
    <div className="group">
      {/* Wrap only the image + name in the link so color clicks don't navigate */}
      <Link href={`/products/${product.id}`}>
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
        </div>
      </Link>

      {/* Color swatches — outside the Link so clicks don't navigate */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex space-x-2 mt-2">
          {product.colors.map((color, index) => (
            <ColorSwatch
              key={color}
              color={color}
              isSelected={selectedColor === color}
              onClick={(e) => handleColorClick(e, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}