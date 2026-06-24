'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
  imageAspectRatio?: string;
  imageFit?: 'cover' | 'contain';
  hideSwatches?: boolean;
  colorLabel?: string;
  colorQuery?: string;
  disableLink?: boolean;
}

// Same gating rules as ProductDetailClient — keep these in sync.
const AVAILABLE_HANDLES = ['trailblazing-tote'];
const PREVIEW_ONLY_HANDLES = ['carabiner'];

import { PRODUCT_COLORS } from '@/lib/productColors';

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

export default function ProductCard({
  product,
  showPrice = true,
  imageAspectRatio = '2/3',
  imageFit = 'cover',
  hideSwatches = false,
  colorLabel,
  colorQuery,
  disableLink = false,
}: ProductCardProps) {
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

  // Pill shown in top-left corner of image.
  const cornerPill = isPreviewOnly ? (
    <div className="product-pill" style={{
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

  const href = `/products/${product.handle ?? product.id}${colorQuery ? `?color=${encodeURIComponent(colorQuery)}` : ''}`;

  const CardWrapper = disableLink
    ? ({ children }: { children: React.ReactNode }) => <div style={{ textDecoration: 'none', cursor: 'default' }}>{children}</div>
    : ({ children }: { children: React.ReactNode }) => <Link href={href} style={{ textDecoration: 'none' }}>{children}</Link>;

  return (
    <div>
      <CardWrapper>
        {/* Image */}
        <div style={{
          aspectRatio: imageAspectRatio,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#F5F2EC',
        }}>
          {cornerPill}
          <Image
            src={product.images[selectedImageIndex]}
            alt={product.name}
            fill
            style={{ objectFit: imageFit, transition: 'transform 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* Text */}
        <div style={{ padding: '12px 14px 10px', marginBottom: '0' }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: 400,
            color: '#111110',
            marginBottom: colorLabel ? '1px' : '3px',
            fontFamily: sans,
            letterSpacing: '0.01em',
          }}>
            {product.name}
          </h3>
          {colorLabel && (
            <p style={{ fontSize: '10px', color: '#B8A898', fontFamily: sans, letterSpacing: '0.06em', marginBottom: '2px', textTransform: 'uppercase' }}>
              {colorLabel}
            </p>
          )}
          <p style={{ fontSize: '11px', color: '#A8A8A3', fontFamily: sans, letterSpacing: '0.02em', marginBottom: '3px' }}>
            {product.category}
          </p>
          {showPrice && (
            <p style={{ fontSize: '13px', color: '#111110', fontFamily: serif, marginBottom: product.shippingWindow?.includes('August') ? '4px' : undefined }}>
              ${(product.price / 100).toFixed(2)}
            </p>
          )}
          {product.shippingWindow?.includes('August') && (
            <p style={{ fontSize: '9px', fontFamily: sans, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C94468', margin: 0 }}>
              Ships August 2026
            </p>
          )}
        </div>
      </CardWrapper>

      {/* Swatches — outside the Link so clicks don't navigate */}
      {!hideSwatches && colors.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '0 14px 14px' }}>
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
