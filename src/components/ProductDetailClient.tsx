'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_DETAILS } from '@/lib/productDetails';
import { PRODUCT_COLORS } from '@/lib/productColors';

interface ProductDetailClientProps {
  product: Product;
  initialColor?: string;
}

// Products that can actually be purchased right now
const AVAILABLE_HANDLES = ['trailblazing-tote'];

// ─── Landing-page design tokens ───────────────────────────────────────────────
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';
const rule    = '#F0D9E1';

const eyebrowStyle: React.CSSProperties = {
  fontFamily: sans,
  fontWeight: 700,
  fontSize: '13px',
  letterSpacing: '0.14em',
  color: soft,
  margin: 0,
  textTransform: 'lowercase',
};

const bodyStyle: React.CSSProperties = {
  fontFamily: sans,
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: 2,
  color: soft,
  margin: 0,
  textAlign: 'left',
};

export default function ProductDetailClient({ product, initialColor }: ProductDetailClientProps) {
  const handle       = product.handle ?? '';
  const isInStock    = AVAILABLE_HANDLES.includes(handle);
  const shippingLabel = isInStock
    ? 'In stock — ships in 1–2 business days'
    : (product.shippingWindow ?? 'Coming soon');

  const addItem = useCartStore((state) => state.addItem);

  const swatchColors = PRODUCT_COLORS[handle] ?? [];
  const colorCount   = Math.max(1, swatchColors.length || product.colors.length);
  const imgsPerColor = Math.max(1, Math.floor(product.images.length / colorCount));

  const getColorImages = (colorIdx: number): string[] => {
    const start = colorIdx * imgsPerColor;
    const end   = colorIdx === colorCount - 1 ? product.images.length : start + imgsPerColor;
    return product.images.slice(start, end);
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize]   = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(() => {
    const fallback = swatchColors.length > 0 ? swatchColors[0].name : (product.colors[0] || '');
    if (initialColor && swatchColors.some((s) => s.name === initialColor)) return initialColor;
    return fallback;
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [buyStatus, setBuyStatus] = useState<'idle' | 'added' | 'error'>('idle');

  const fabricDetail = PRODUCT_DETAILS[handle] ?? null;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedImage(0);
  };

  const handleAddToCart = () => {
    try {
      // Pass only the selected colorway's images so the cart shows the right photo
      const colorIdx = swatchColors.length > 0
        ? swatchColors.findIndex((s) => s.name === selectedColor)
        : product.colors.indexOf(selectedColor);
      const colorImages = getColorImages(Math.max(0, colorIdx));
      addItem({ ...product, images: colorImages }, selectedSize, selectedColor, 1, {
        isPreorder: false,
        shippingWindow: shippingLabel,
      });
      setBuyStatus('added');
    } catch (e) {
      console.error('[addToCart] failed:', e);
      setBuyStatus('error');
    }
  };

  const toggleSection = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section);

  // ── Accordion content ──
  const accordionItems: { key: string; label: string; content: React.ReactNode }[] = [];

  if (fabricDetail) {
    accordionItems.push({
      key: 'material',
      label: 'material',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', columnGap: '12px' }}>
            <span style={{ color: soft, opacity: 0.8 }}>Shell</span>
            <span>{fabricDetail.shell}</span>
            {fabricDetail.lining && (<><span style={{ color: soft, opacity: 0.8 }}>Lining</span><span>{fabricDetail.lining}</span></>)}
            {fabricDetail.pocketLining && (<><span style={{ color: soft, opacity: 0.8 }}>Pocket lining</span><span>{fabricDetail.pocketLining}</span></>)}
            {fabricDetail.weight && (<><span style={{ color: soft, opacity: 0.8 }}>Weight</span><span>{fabricDetail.weight}</span></>)}
          </div>
          {fabricDetail.features && fabricDetail.features.length > 0 && (
            <ul style={{ margin: '6px 0 0', padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {fabricDetail.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </div>
      ),
    });
  }

  if (fabricDetail?.tempGuide) {
    accordionItems.push({
      key: 'temp',
      label: 'temperature guide',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '8px', columnGap: '12px' }}>
          <span style={{ color: soft, opacity: 0.8 }}>Standalone ideal for</span>
          <span>{fabricDetail.tempGuide.standalone}</span>
          <span style={{ color: soft, opacity: 0.8 }}>Layered use</span>
          <span>{fabricDetail.tempGuide.layered}</span>
        </div>
      ),
    });
  }

  accordionItems.push({
    key: 'care',
    label: 'care',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(fabricDetail?.care ?? ['Machine wash cold', 'Hang dry', 'Do not bleach', 'Do not iron'])
          .map((line, i) => <p key={i} style={{ margin: 0 }}>{line}</p>)}
      </div>
    ),
  });

  accordionItems.push({
    key: 'shipping',
    label: 'shipping & returns',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ margin: 0 }}>7-day returns and exchanges</p>
        <p style={{ margin: 0 }}>{shippingLabel}.</p>
      </div>
    ),
  });

  const activeColorIdx = swatchColors.length > 0
    ? swatchColors.findIndex((s) => s.name === selectedColor)
    : product.colors.indexOf(selectedColor);
  const gallery     = getColorImages(Math.max(0, activeColorIdx));
  const activeImage = gallery[selectedImage] ?? gallery[0] ?? product.images[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: blushBg }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(88px, 12vw, 130px) clamp(20px, 4vw, 48px) clamp(64px, 9vw, 110px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Left: gallery ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative', lineHeight: 0, borderRadius: '10px', overflow: 'hidden' }}>
              <Image
                src={activeImage}
                alt={product.name}
                width={800}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {gallery.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {gallery.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      opacity: selectedImage === i ? 1 : 0.45,
                      border: selectedImage === i ? `1.5px solid ${maroon}` : '1.5px solid transparent',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s, border-color 0.2s',
                      lineHeight: 0,
                      padding: 0,
                    }}
                  >
                    <Image src={image} alt={`${product.name} ${i + 1}`} width={200} height={300} sizes="25vw" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}

            <p style={{ ...bodyStyle, fontSize: '12px', lineHeight: 1.7, opacity: 0.85 }}>
              Photos show pre-production samples. Final color and fit may vary slightly.
            </p>
          </div>

          {/* ── Right: details ── */}
          <div>
            <p style={{ ...eyebrowStyle, marginBottom: '12px' }}>
              {isInStock ? 'available now' : shippingLabel.toLowerCase()}
            </p>

            <h1
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                letterSpacing: '-0.03em',
                color: maroon,
                margin: '0 0 8px',
                lineHeight: 1.1,
                textTransform: 'lowercase',
              }}
            >
              {product.name}
            </h1>

            <p style={{ ...bodyStyle, fontWeight: 600, color: maroon, marginBottom: '28px' }}>
              ${(product.price / 100).toFixed(2)}
            </p>

            {/* Sizes */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ ...eyebrowStyle, fontSize: '12px', marginBottom: '10px' }}>size</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '8px 18px',
                        fontFamily: sans,
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '100px',
                        border: `1.5px solid ${maroon}`,
                        backgroundColor: selectedSize === size ? maroon : 'transparent',
                        color: selectedSize === size ? 'white' : maroon,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {swatchColors.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <p style={{ ...eyebrowStyle, fontSize: '12px', marginBottom: '10px' }}>
                  color — {selectedColor.toLowerCase()}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {swatchColors.map((swatch) => {
                    const isSelected = selectedColor === swatch.name;
                    const isGradient = swatch.value.startsWith('linear-gradient');
                    return (
                      <button
                        key={swatch.name}
                        title={swatch.name}
                        onClick={() => handleColorSelect(swatch.name)}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          border: isSelected ? `2px solid ${maroon}` : '2px solid transparent',
                          outline: isSelected ? 'none' : `1px solid ${rule}`,
                          outlineOffset: '1px',
                          background: isGradient ? swatch.value : undefined,
                          backgroundColor: isGradient ? undefined : swatch.value,
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0,
                          transition: 'border-color 0.15s, transform 0.15s',
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ marginBottom: '36px' }}>
              {isInStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    style={{
                      display: 'block',
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: maroon,
                      color: 'white',
                      padding: '15px 28px',
                      fontFamily: sans,
                      fontSize: '14px',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      textTransform: 'lowercase',
                      border: 'none',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {buyStatus === 'added' ? 'added ✦' : 'add to cart'}
                  </button>
                  {buyStatus === 'added' && (
                    <p style={{ ...bodyStyle, textAlign: 'center', marginTop: '12px' }}>
                      <Link href="/cart" style={{ color: maroon, fontWeight: 600, textUnderlineOffset: '4px' }}>
                        view cart →
                      </Link>
                    </p>
                  )}
                  {buyStatus === 'error' && (
                    <p style={{ ...bodyStyle, color: '#B85C49', textAlign: 'center', marginTop: '12px' }}>
                      something went wrong — please try again.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/invite"
                    style={{
                      display: 'block',
                      boxSizing: 'border-box',
                      backgroundColor: maroon,
                      color: 'white',
                      padding: '15px 28px',
                      fontFamily: sans,
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      border: 'none',
                      borderRadius: '100px',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    join the trailblazing club
                  </Link>
                  <p style={{ ...bodyStyle, fontSize: '12px', textAlign: 'center', marginTop: '10px', lineHeight: 1.7 }}>
                    Members get early access when we launch. {shippingLabel}.
                  </p>
                </>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${rule}` }}>
              <p style={bodyStyle}>{product.description}</p>
            </div>

            {/* Fit & sizing */}
            {fabricDetail?.fit && (
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${rule}` }}>
                <p style={{ ...eyebrowStyle, fontSize: '12px', marginBottom: '12px' }}>fit & sizing</p>
                {fabricDetail.fit.split('\n\n').map((block, i) => (
                  <p key={i} style={{ ...bodyStyle, margin: i > 0 ? '10px 0 0' : 0 }}>{block}</p>
                ))}
                {fabricDetail.sizeChart && (
                  <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 8px 8px 0', borderBottom: `1.5px solid ${maroon}` }}> </th>
                          {fabricDetail.sizeChart.sizes.map((s) => (
                            <th key={s} style={{ padding: '6px 4px 8px', textAlign: 'center', fontFamily: sans, fontSize: '12px', fontWeight: 700, color: maroon, textTransform: 'lowercase', borderBottom: `1.5px solid ${maroon}` }}>
                              {s}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fabricDetail.sizeChart.rows.map((row) => (
                          <tr key={row.label} style={{ borderBottom: `1px solid ${rule}` }}>
                            <td style={{ padding: '7px 8px 7px 0', fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft, whiteSpace: 'nowrap' }}>{row.label}</td>
                            {row.values.map((v, j) => (
                              <td key={j} style={{ padding: '7px 4px', textAlign: 'center', fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fabricDetail.sizeChart.note && (
                      <p style={{ ...bodyStyle, fontSize: '12px', margin: '8px 0 0' }}>{fabricDetail.sizeChart.note}</p>
                    )}
                  </div>
                )}
                <p style={{ ...bodyStyle, marginTop: '16px' }}>
                  Fit question? Email <span style={{ color: maroon, fontWeight: 600 }}>hello@tualmi.com</span>
                </p>
              </div>
            )}

            {/* Accordion */}
            <div>
              {accordionItems.map(({ key, label, content }) => (
                <div key={key} style={{ borderBottom: `1px solid ${rule}` }}>
                  <button
                    onClick={() => toggleSection(key)}
                    style={{
                      width: '100%',
                      padding: '16px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: sans,
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'lowercase',
                      color: maroon,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{label}</span>
                    <span style={{ fontSize: '16px', color: soft, fontWeight: 400 }}>{expandedSection === key ? '−' : '+'}</span>
                  </button>
                  {expandedSection === key && (
                    <div style={{ paddingBottom: '16px', ...bodyStyle, lineHeight: 1.9 }}>
                      {content}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
