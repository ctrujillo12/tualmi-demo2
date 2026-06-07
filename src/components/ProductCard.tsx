'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

// Same gating rules as ProductDetailClient — keep these in sync.
const AVAILABLE_HANDLES = ['trailblazing-tote'];
const PREVIEW_ONLY_HANDLES = ['carabiner'];

// Hardcoded colors per product handle — not sourced from Shopify
const PRODUCT_COLORS: Record<string, { name: string; value: string }[]> = {
  'trailblazing-fleece': [
    { name: 'Wildflower',    value: '#E8A0B8' },
    { name: 'Golden Hour',   value: '#E8C84A' },
  ],
  'summit-pant': [
    { name: 'Moss',          value: '#7A8C52' },
    { name: 'Birch',         value: '#EDE8DF' },
  ],
  'alpine-baby-tee': [
    { name: 'Petal',         value: '#F2C4CE' },
    { name: 'Solstice',      value: '#D4A843' },
  ],
  'horizon-shorts': [
    { name: 'Meadow',        value: 'linear-gradient(135deg, #A8C484 50%, #7A9E6A 50%)' },
    { name: 'Canyon',        value: '#A85448' },
    { name: 'Dusk',          value: '#C49AB0' },
  ],
  'trailblazing-tote': [
    { name: 'Natural',       value: '#D6C9B0' },
  ],
};

function ColorSwatch({
  colorValue,
  isSelected,
  onClick,
}: {
  colorValue: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const value = colorValue;
  const isGradient = value.startsWith('linear-gradient');

  return (
    <button
      onClick={onClick}
      title={colorValue}
      aria-label={`Select ${colorValue}`}
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: isSelected ? '2px solid #111110' : '2px solid transparent',
        outline: isSelected ? 'none' : '1px solid #D6D3CD',
        outlineOffset: '1px',
        background: isGradient ? value : undefined,
        backgroundColor: isGradient ? undefined : value,
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'border-color 0.15s, transform 0.15s',
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
      }}
    />
  );
}

const sans = "'Jost', 'DM Sans', system-ui, sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

export default function ProductCard({ product, showPrice = true }: ProductCardProps) {
  const handle        = product.handle ?? '';
  const colors        = PRODUCT_COLORS[handle] ?? [];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor]           = useState(colors[0]?.name ?? null);

  const isInStock     = AVAILABLE_HANDLES.includes(handle);
  const isPreviewOnly = PREVIEW_ONLY_HANDLES.includes(handle);
  const isPreorder    = !isInStock && !isPreviewOnly;

  const handleColorClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.images[index]) setSelectedImageIndex(index);
    setSelectedColor(colors[index]?.name ?? null);
  };

  // Pill shown in top-left corner of image. Tote = no pill (it's just available).
  const cornerPill = isPreorder ? (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: '#FAFAF7',
      color: '#3B2F1E',
      fontSize: '9px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      border: '1px solid #DDD5C8',
      zIndex: 1,
    }}>
      Pre-Order
    </div>
  ) : isPreviewOnly ? (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: '#F2EDE4',
      color: '#8C7B6B',
      fontSize: '9px',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      zIndex: 1,
    }}>
      Coming Soon
    </div>
  ) : null;

  return (
    <div>
      <Link href={`/products/${product.handle ?? product.id}`} style={{ textDecoration: 'none' }}>
        {/* Image */}
        <div style={{
          aspectRatio: '1',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#F2F0EB',
          marginBottom: '14px',
        }}>
          {cornerPill}
          <Image
            src={product.images[selectedImageIndex]}
            alt={product.name}
            fill
            style={{ objectFit: 'contain', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* Text */}
        <div style={{ marginBottom: '10px' }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: 400,
            color: '#111110',
            marginBottom: '3px',
            fontFamily: sans,
            letterSpacing: '0.01em',
          }}>
            {product.name}
          </h3>
          <p style={{ fontSize: '11px', color: '#A8A8A3', fontFamily: sans, letterSpacing: '0.02em', marginBottom: '3px' }}>
            {product.category}
          </p>
          {showPrice && (
            <p style={{ fontSize: '13px', color: '#111110', fontFamily: serif }}>
              ${(product.price / 100).toFixed(2)}
            </p>
          )}
        </div>
      </Link>

      {/* Swatches — outside the Link so clicks don't navigate */}
      {colors.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {colors.map(({ name, value }, index) => (
            <ColorSwatch
              key={name}
              colorValue={value}
              isSelected={selectedColor === name}
              onClick={(e) => handleColorClick(e, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}