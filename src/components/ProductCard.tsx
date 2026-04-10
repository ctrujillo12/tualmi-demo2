'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

// Matches exactly the color names defined in localProducts
const COLOR_MAP: Record<string, string> = {
  // Trailblazing Fleece
  Wildflower:    '#E8A0B8',   // dusty rose/pink
  'Golden Hour': '#E8C84A',   // warm golden yellow

  // Summit Pant
  Moss:          '#7A8C52',   // olive green
  Birch:         '#EDE8DF',   // warm off-white/cream

  // Alpine Baby Tee — distinct from fleece colors
  Solstice:      '#D4A843',   // deeper amber-gold (different from Golden Hour)
  Petal:         '#F2C4CE',   // soft blush (lighter/pinker than Wildflower)

  // Horizon Shorts
  Canyon:        '#A85448',   // terracotta red
  Dusk:          '#C49AB0',   // muted mauve
  Meadow:        'linear-gradient(135deg, #A8C484 50%, #7A9E6A 50%)', // two greens

  // Tote
  Natural:       '#D6C9B0',   // raw canvas tan
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
  const value = COLOR_MAP[color] ?? '#ccc';
  const isGradient = value.startsWith('linear-gradient');

  return (
    <button
      onClick={onClick}
      title={color}
      aria-label={`Select ${color}`}
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

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(
    product.colors ? product.colors[0] : null
  );

  const handleColorClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    // Only switch image if one exists for that index
    if (product.images[index]) setSelectedImageIndex(index);
    if (product.colors) setSelectedColor(product.colors[index]);
  };

  return (
    <div>
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        {/* Image */}
        <div style={{
          aspectRatio: '1',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#F2F0EB',
          marginBottom: '14px',
        }}>
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
          <p style={{ fontSize: '13px', color: '#111110', fontFamily: serif }}>
            ${(product.price / 100).toFixed(2)}
          </p>
        </div>
      </Link>

      {/* Swatches — outside the Link so clicks don't navigate */}
      {product.colors && product.colors.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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