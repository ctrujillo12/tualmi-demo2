'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductDetailClientProps {
  product: Product;
}

const AVAILABLE_HANDLES = ['carabiner'];

// Earthy palette
const brown  = '#3B2F1E';
const mid    = '#6B5C4C';
const muted  = '#8C7B6B';
const rule   = '#DDD5C8';
const bgAlt  = '#F2EDE4';

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
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF7' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Images */}
          <div className="space-y-3">
            <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', backgroundColor: bgAlt, opacity: isAvailable ? 1 : 0.8 }}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'contain', filter: isAvailable ? 'none' : 'saturate(0.8)' }}
                priority
              />
              {!isAvailable && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ backgroundColor: 'rgba(250,250,247,0.92)', color: mid, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '8px 24px' }}>
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
                    style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', opacity: selectedImage === index ? 1 : 0.45, border: 'none', background: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      sizes="25vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pl-4">
            <div style={{ marginBottom: '32px' }}>
              {/* Badge */}
              {!isAvailable ? (
                <div style={{ display: 'inline-block', backgroundColor: bgAlt, color: muted, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '16px' }}>
                  Spring 2026
                </div>
              ) : (
                <div style={{ display: 'inline-block', backgroundColor: brown, color: '#FAFAF7', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '16px' }}>
                  Available Now
                </div>
              )}
              <h1 style={{ fontSize: '20px', fontWeight: 400, color: brown, marginBottom: '8px', letterSpacing: '0.03em' }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '14px', color: mid }}>
                ${(product.price / 100).toFixed(2)}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        border: `1px solid ${selectedSize === size ? brown : rule}`,
                        backgroundColor: selectedSize === size ? brown : 'transparent',
                        color: selectedSize === size ? '#FAFAF7' : brown,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.4,
                        transition: 'all 0.15s',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && product.colors[0] !== 'Default' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => isAvailable && handleColorSelect(color)}
                      disabled={!isAvailable}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        border: `1px solid ${selectedColor === color ? brown : rule}`,
                        backgroundColor: selectedColor === color ? brown : 'transparent',
                        color: selectedColor === color ? '#FAFAF7' : brown,
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.4,
                        transition: 'all 0.15s',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart / Coming Soon */}
            {isAvailable ? (
              <button
                onClick={handleAddToCart}
                style={{ width: '100%', backgroundColor: brown, color: '#FAFAF7', padding: '14px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginBottom: '16px', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {addedToCart ? 'ADDED TO CART' : 'ADD TO CART'}
              </button>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <button
                  disabled
                  style={{ width: '100%', backgroundColor: bgAlt, color: muted, padding: '14px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'not-allowed', marginBottom: '8px' }}
                >
                  COMING SOON — SPRING 2026
                </button>
                <p style={{ fontSize: '12px', color: muted, textAlign: 'center' }}>
                  Sign up on our homepage to get early access when this drops.
                </p>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${rule}` }}>
              <p style={{ fontSize: '13px', lineHeight: 1.8, color: mid }}>
                {product.description}
              </p>
            </div>

            {/* Expandable Sections */}
            <div>
              {[
                {
                  key: 'size',
                  label: 'SIZE & FIT',
                  content: (
                    <>
                      <p>Model is 5'9" and wearing size S</p>
                      <p style={{ marginTop: '8px' }}>Fits true to size. For a relaxed fit, size up.</p>
                    </>
                  ),
                },
                {
                  key: 'shipping',
                  label: 'SHIPPING & RETURNS',
                  content: (
                    <>
                      <p>Free shipping on orders over $100</p>
                      <p style={{ marginTop: '8px' }}>30-day returns and exchanges</p>
                      <p style={{ marginTop: '8px' }}>Ships within 2–3 business days</p>
                    </>
                  ),
                },
                {
                  key: 'care',
                  label: 'CARE DETAILS',
                  content: (
                    <>
                      <p>Hand wash cold</p>
                      <p style={{ marginTop: '8px' }}>Lay flat to dry</p>
                      <p style={{ marginTop: '8px' }}>Do not bleach or iron</p>
                    </>
                  ),
                },
              ].map(({ key, label, content }) => (
                <div key={key} style={{ borderBottom: `1px solid ${rule}` }}>
                  <button
                    onClick={() => toggleSection(key)}
                    style={{ width: '100%', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', letterSpacing: '0.15em', color: brown, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span>{label}</span>
                    <span style={{ fontSize: '18px', color: muted }}>{expandedSection === key ? '−' : '+'}</span>
                  </button>
                  {expandedSection === key && (
                    <div style={{ paddingBottom: '16px', fontSize: '12px', color: mid, lineHeight: 1.8 }}>
                      {content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: muted, marginTop: '24px' }}>
              {isAvailable ? 'In Stock' : 'Available Spring 2026'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}