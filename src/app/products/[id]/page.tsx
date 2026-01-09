'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id);
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    addItem(product, selectedSize, selectedColor);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative h-[600px] rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="font-serif text-4xl font-bold text-sand-900 mb-4">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-ocean-700 mb-6">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sand-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-sand-900 mb-3">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-2 border-2 rounded-md transition-colors ${
                    selectedSize === size
                      ? 'border-ocean-600 bg-ocean-50 text-ocean-700'
                      : 'border-sand-300 hover:border-sand-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-sand-900 mb-3">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-6 py-2 border-2 rounded-md transition-colors ${
                    selectedColor === color
                      ? 'border-ocean-600 bg-ocean-50 text-ocean-700'
                      : 'border-sand-300 hover:border-sand-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-ocean-600 text-white py-4 rounded-md font-semibold hover:bg-ocean-700 transition-colors mb-4"
          >
            Add to Cart
          </button>

          {showSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              Added to cart successfully!
            </div>
          )}

          <button
            onClick={() => router.push('/products')}
            className="w-full border-2 border-sand-300 text-sand-700 py-4 rounded-md font-semibold hover:bg-sand-50 transition-colors"
          >
            Continue Shopping
          </button>

          {/* Product Details */}
          <div className="mt-12 border-t border-sand-200 pt-8">
            <h3 className="font-semibold text-sand-900 mb-4">Product Details</h3>
            <ul className="space-y-2 text-sand-600">
              <li>• Premium quick-dry fabric</li>
              <li>• UPF 50+ sun protection</li>
              <li>• Chlorine and saltwater resistant</li>
              <li>• Machine washable</li>
              <li>• Designed and tested for comfort</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}