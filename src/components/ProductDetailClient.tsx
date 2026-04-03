'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductDetailClientProps {
  product: Product;
}

const AVAILABLE_HANDLES = ['trailblazing-tote', 'carabiner'];

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const isAvailable = AVAILABLE_HANDLES.includes(product.handle ?? '');

  const colorImageMap: Record<string, number> = {};
  product.colors.forEach((color, index) => {
    if (index < product.images.length) {
      colorImageMap[color] = index;
    }
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const imageIndex = colorImageMap[color];
    if (imageIndex !== undefined) setSelectedImage(imageIndex);
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color');
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color');
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    router.push('/cart');
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Images */}
          <div className="space-y-3">
            <div className={`aspect-[3/4] relative overflow-hidden bg-gray-50 ${!isAvailable ? 'opacity-80' : ''}`}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain ${!isAvailable ? 'saturate-[0.8]' : ''}`}
                priority
              />
              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white/90 text-gray-700 text-xs tracking-widest uppercase px-6 py-2">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      const matchingColor = product.colors.find((c) => colorImageMap[c] === index);
                      if (matchingColor) setSelectedColor(matchingColor);
                    }}
                    className={`aspect-[3/4] relative overflow-hidden transition-opacity ${
                      selectedImage === index ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="25vw"
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pl-4">
            <div className="mb-8">
              {/* Coming soon banner */}
              {!isAvailable && (
                <div className="inline-block bg-gray-100 text-gray-500 text-[10px] tracking-widest uppercase px-3 py-1 mb-4">
                  Spring 2026
                </div>
              )}
              {isAvailable && (
                <div className="inline-block bg-black text-white text-[10px] tracking-widest uppercase px-3 py-1 mb-4">
                  Available Now
                </div>
              )}
              <h1 className="text-xl font-normal text-black mb-2 tracking-wide">
                {product.name}
              </h1>
              <p className="text-sm text-black">
                ${(product.price / 100).toFixed(2)}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`py-2 px-4 text-xs transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white'
                          : 'bg-white text-black border border-gray-300 hover:border-black'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && product.colors[0] !== 'Default' && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => isAvailable && handleColorSelect(color)}
                      disabled={!isAvailable}
                      className={`py-2 px-4 text-xs transition-all ${
                        selectedColor === color
                          ? 'bg-black text-white'
                          : 'bg-white text-black border border-gray-300 hover:border-black'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart / Coming Soon Button */}
            {isAvailable ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 text-xs tracking-wide hover:bg-gray-900 transition-all mb-4"
              >
                {addedToCart ? 'ADDED TO CART' : 'ADD TO CART'}
              </button>
            ) : (
              <div className="mb-4 space-y-2">
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-400 py-3 text-xs tracking-wide cursor-not-allowed"
                >
                  COMING SOON — SPRING 2026
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Sign up on our homepage to get early access when this drops.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <p className="text-xs leading-relaxed text-black">
                {product.description}
              </p>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-0">
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('size')}
                  className="w-full py-4 flex items-center justify-between text-xs text-black hover:text-gray-600 transition-colors"
                >
                  <span>SIZE & FIT</span>
                  <span className="text-lg">{expandedSection === 'size' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'size' && (
                  <div className="pb-4 text-xs text-gray-700 leading-relaxed">
                    <p>Model is 5&apos;9&quot; and wearing size S</p>
                    <p className="mt-2">Fits true to size. For a relaxed fit, size up.</p>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full py-4 flex items-center justify-between text-xs text-black hover:text-gray-600 transition-colors"
                >
                  <span>SHIPPING & RETURNS</span>
                  <span className="text-lg">{expandedSection === 'shipping' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'shipping' && (
                  <div className="pb-4 text-xs text-gray-700 leading-relaxed">
                    <p>Free shipping on orders over $100</p>
                    <p className="mt-2">30-day returns and exchanges</p>
                    <p className="mt-2">Ships within 2-3 business days</p>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('care')}
                  className="w-full py-4 flex items-center justify-between text-xs text-black hover:text-gray-600 transition-colors"
                >
                  <span>CARE DETAILS</span>
                  <span className="text-lg">{expandedSection === 'care' ? '−' : '+'}</span>
                </button>
                {expandedSection === 'care' && (
                  <div className="pb-4 text-xs text-gray-700 leading-relaxed">
                    <p>Hand wash cold</p>
                    <p className="mt-2">Lay flat to dry</p>
                    <p className="mt-2">Do not bleach or iron</p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              {isAvailable ? 'In Stock' : 'Available Spring 2026'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}