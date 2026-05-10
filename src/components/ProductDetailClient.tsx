'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import { createCheckout } from '@/lib/shopify';
import type { ShopifyVariant } from '@/lib/shopify';

interface ProductDetailClientProps {
  product: Product;
}

// In-stock products (ship immediately).
const AVAILABLE_HANDLES = ['trailblazing-tote'];

// Preview-only — shown but not purchasable, not pre-orderable.
const PREVIEW_ONLY_HANDLES = ['carabiner'];

const brown = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';
const rule  = '#DDD5C8';
const bgAlt = '#F2EDE4';

function resolveVariantId(product: Product, selectedSize: string, selectedColor: string): string | null {
  const variants: ShopifyVariant[] | undefined = product.variants;
  if (!variants || variants.length === 0) return null;

  const size  = selectedSize.toLowerCase();
  const color = selectedColor.toLowerCase();

  const exact = variants.find((v) => {
    const opts = v.selectedOptions.map((o) => ({ name: o.name.toLowerCase(), value: o.value.toLowerCase() }));
    const hasSize  = opts.find((o) => o.name === 'size')?.value  === size;
    const hasColor = opts.find((o) => o.name === 'color')?.value === color;
    return hasSize && hasColor;
  });
  if (exact) return exact.id;

  const bySize = variants.find((v) =>
    v.selectedOptions.some((o) => o.name.toLowerCase() === 'size' && o.value.toLowerCase() === size)
  );
  if (bySize) return bySize.id;

  return variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id ?? null;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const handle      = product.handle ?? '';
  const isInStock   = AVAILABLE_HANDLES.includes(handle);
  const isPreviewOnly = PREVIEW_ONLY_HANDLES.includes(handle);
  const isPreorder  = !isInStock && !isPreviewOnly;
  const isPurchasable = isInStock || isPreorder;

  const colorImageMap: Record<string, number> = {};
  product.colors.forEach((color, index) => {
    if (index < product.images.length) colorImageMap[color] = index;
  });

  const [selectedImage, setSelectedImage]     = useState(0);
  const [selectedSize, setSelectedSize]       = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor]     = useState(product.colors[0] || '');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [buyStatus, setBuyStatus]             = useState<'idle' | 'loading' | 'error'>('idle');
  const [buyError, setBuyError]               = useState('');

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const imageIndex = colorImageMap[color];
    if (imageIndex !== undefined) setSelectedImage(imageIndex);
  };

  // Uses createCheckout — resolves the right variant per product (no hardcoded ID).
  const handleBuyNow = async () => {
    setBuyStatus('loading');
    setBuyError('');
    try {
      const variantId = resolveVariantId(product, selectedSize, selectedColor);
      if (!variantId) throw new Error('No purchasable variant available.');
      const checkoutUrl = await createCheckout([{ variantId, quantity: 1 }]);
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error('[buyNow] failed:', e);
      setBuyStatus('error');
      setBuyError('Something went wrong. Please try again.');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // ─── Status pill ────────────────────────────────────────────────────────
  const statusPill = isInStock ? (
    <div style={{ display: 'inline-block', backgroundColor: brown, color: '#FAFAF7', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '16px' }}>
      Available Now
    </div>
  ) : isPreorder ? (
    <div style={{ display: 'inline-block', backgroundColor: '#FAFAF7', color: brown, border: `1px solid ${brown}`, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '16px' }}>
      Pre-Order
    </div>
  ) : (
    <div style={{ display: 'inline-block', backgroundColor: bgAlt, color: muted, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '16px' }}>
      Spring 2026
    </div>
  );

  const imageOverlay = isPreviewOnly ? (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ backgroundColor: 'rgba(250,250,247,0.92)', color: mid, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '8px 24px' }}>
        Coming Soon
      </span>
    </div>
  ) : null;

  const bottomStatus = isInStock
    ? 'In Stock'
    : isPreorder
      ? (product.shippingWindow ?? 'Pre-Order')
      : 'Available Spring 2026';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF7' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Images */}
          <div className="space-y-3">
            <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', backgroundColor: bgAlt, opacity: isPurchasable ? 1 : 0.8 }}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'contain', filter: isPurchasable ? 'none' : 'saturate(0.8)' }}
                priority
              />
              {imageOverlay}
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
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="25vw" style={{ objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pl-4">
            <div style={{ marginBottom: '32px' }}>
              {statusPill}
              <h1 style={{ fontSize: '20px', fontWeight: 400, color: brown, marginBottom: '8px', letterSpacing: '0.03em' }}>
                {product.name}
              </h1>
              <p style={{ fontSize: '14px', color: mid }}>
                ${(product.price / 100).toFixed(2)}
              </p>
              {isPreorder && product.shippingWindow && (
                <p style={{ fontSize: '12px', color: muted, marginTop: '6px', letterSpacing: '0.05em' }}>
                  {product.shippingWindow}
                </p>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => isPurchasable && setSelectedSize(size)}
                      disabled={!isPurchasable}
                      style={{
                        padding: '8px 16px', fontSize: '12px',
                        border: `1px solid ${selectedSize === size ? brown : rule}`,
                        backgroundColor: selectedSize === size ? brown : 'transparent',
                        color: selectedSize === size ? '#FAFAF7' : brown,
                        cursor: isPurchasable ? 'pointer' : 'not-allowed',
                        opacity: isPurchasable ? 1 : 0.4,
                        transition: 'all 0.15s', letterSpacing: '0.05em',
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
                      onClick={() => isPurchasable && handleColorSelect(color)}
                      disabled={!isPurchasable}
                      style={{
                        padding: '8px 16px', fontSize: '12px',
                        border: `1px solid ${selectedColor === color ? brown : rule}`,
                        backgroundColor: selectedColor === color ? brown : 'transparent',
                        color: selectedColor === color ? '#FAFAF7' : brown,
                        cursor: isPurchasable ? 'pointer' : 'not-allowed',
                        opacity: isPurchasable ? 1 : 0.4,
                        transition: 'all 0.15s', letterSpacing: '0.05em',
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Buy Now / Pre-Order / Coming Soon */}
            <div style={{ marginBottom: '16px' }}>
              {isPurchasable ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    disabled={buyStatus === 'loading'}
                    style={{
                      width: '100%',
                      backgroundColor: buyStatus === 'loading' ? bgAlt : brown,
                      color: buyStatus === 'loading' ? muted : '#FAFAF7',
                      padding: '14px',
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: buyStatus === 'loading' ? 'wait' : 'pointer',
                      transition: 'opacity 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={e => { if (buyStatus !== 'loading') e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {buyStatus === 'loading'
                      ? 'ONE MOMENT…'
                      : isPreorder
                        ? 'PRE-ORDER NOW'
                        : 'BUY NOW'}
                  </button>
                  {isPreorder && (
                    <p style={{ fontSize: '11px', color: muted, marginTop: '10px', textAlign: 'center', lineHeight: 1.6, letterSpacing: '0.03em' }}>
                      You'll be charged today. {product.shippingWindow ?? 'Ships when collection drops.'}
                    </p>
                  )}
                  {buyStatus === 'error' && (
                    <p style={{ fontSize: '12px', color: '#9B4040', marginTop: '8px', textAlign: 'center' }}>
                      {buyError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <button
                    disabled
                    style={{ width: '100%', backgroundColor: bgAlt, color: muted, padding: '14px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: 'not-allowed', marginBottom: '8px' }}
                  >
                    COMING SOON — SPRING 2026
                  </button>
                  <p style={{ fontSize: '12px', color: muted, textAlign: 'center' }}>
                    Sign up on our homepage to get early access when this drops.
                  </p>
                </>
              )}
            </div>

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
                  key: 'shipping',
                  label: 'SHIPPING & RETURNS',
                  content: (
                    <>
                      <p style={{ marginTop: '8px' }}>7-day returns and exchanges</p>
                      <p style={{ marginTop: '8px' }}>
                        {isPreorder
                          ? (product.shippingWindow ?? 'Pre-order — ships when the collection drops.')
                          : 'Ships within 2–3 business days!'}
                      </p>
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
              {bottomStatus}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}