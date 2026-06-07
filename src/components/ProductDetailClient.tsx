'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductDetailClientProps {
  product: Product;
}

const AVAILABLE_HANDLES = ['trailblazing-tote'];
const PREVIEW_ONLY_HANDLES = ['carabiner'];

const brown = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#A89080';
const rule  = '#E8E2D8';
const bgAlt = '#F2EDE4';
const sans  = 'var(--font-montserrat)';
const serif = "'Cormorant Garamond', Georgia, serif";

// ─── Value proposition matrix ─────────────────────────────────────────────────

interface CompRow {
  label: string;
  tualmi: boolean;
  patagonia: boolean;
  vuori: boolean;
  comp4: boolean;
}

interface CompTable {
  price: { tualmi: string; patagonia: string; vuori: string; comp4: string };
  labels: { tualmi: string; patagonia: string; vuori: string; comp4: string };
  rows: CompRow[];
}

const compTableByHandle: Record<string, CompTable> = {
  'trailblazing-fleece': {
    price:  { tualmi: '$149', patagonia: '$149', vuori: '$188', comp4: '$98'  },
    labels: { tualmi: 'Tualmi', patagonia: 'Patago.', vuori: 'Vuori', comp4: 'FP Mvmt' },
    rows: [
      { label: 'Designed by women',        tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'Women-specific fit',        tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'Fashion-forward patterns',  tualmi: true,  patagonia: false, vuori: true,  comp4: true  },
      { label: 'Trail-ready construction',  tualmi: true,  patagonia: true,  vuori: false, comp4: false },
      { label: 'Ethical manufacturing',     tualmi: true,  patagonia: true,  vuori: false, comp4: false },
      { label: 'Chest zip pocket',          tualmi: true,  patagonia: true,  vuori: false, comp4: false },
    ],
  },
  'summit-pant': {
    price:  { tualmi: '$99',  patagonia: '$99',  vuori: '$118', comp4: '$128' },
    labels: { tualmi: 'Tualmi', patagonia: 'Patago.', vuori: 'Vuori', comp4: 'Lulu' },
    rows: [
      { label: 'Designed by women',        tualmi: true,  patagonia: false, vuori: false, comp4: false },
      { label: 'Women-specific fit',        tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'Fashion-forward cut',       tualmi: true,  patagonia: false, vuori: true,  comp4: true  },
      { label: 'Trail-ready construction',  tualmi: true,  patagonia: true,  vuori: false, comp4: false },
      { label: 'Cargo pockets',             tualmi: true,  patagonia: false, vuori: false, comp4: false },
      { label: 'Flare silhouette',          tualmi: true,  patagonia: false, vuori: false, comp4: false },
    ],
  },
  'horizon-shorts': {
    price:  { tualmi: '$72',  patagonia: '$75',  vuori: '$74',  comp4: '$68'  },
    labels: { tualmi: 'Tualmi', patagonia: 'Patago.', vuori: 'Vuori', comp4: 'Lulu' },
    rows: [
      { label: 'Designed by women',        tualmi: true,  patagonia: false, vuori: false, comp4: false },
      { label: 'Women-specific fit',        tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'Distinctive colorways',     tualmi: true,  patagonia: false, vuori: true,  comp4: false },
      { label: 'Trail-ready construction',  tualmi: true,  patagonia: true,  vuori: false, comp4: false },
      { label: 'Ethical manufacturing',     tualmi: true,  patagonia: true,  vuori: false, comp4: false },
      { label: 'Pattern options',           tualmi: true,  patagonia: false, vuori: false, comp4: false },
    ],
  },
  'alpine-baby-tee': {
    price:  { tualmi: '$69',  patagonia: '$49',  vuori: '$64',  comp4: '$68'  },
    labels: { tualmi: 'Tualmi', patagonia: 'Patago.', vuori: 'Vuori', comp4: 'Lulu' },
    rows: [
      { label: 'Designed by women',        tualmi: true,  patagonia: false, vuori: false, comp4: false },
      { label: 'Women-specific fit',        tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'UPF 40 protection',         tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'Fashion-forward design',    tualmi: true,  patagonia: false, vuori: true,  comp4: false },
      { label: 'Ethical manufacturing',     tualmi: true,  patagonia: true,  vuori: false, comp4: false },
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const handle        = product.handle ?? '';
  const isInStock     = AVAILABLE_HANDLES.includes(handle);
  const isPreviewOnly = PREVIEW_ONLY_HANDLES.includes(handle);
  const isPreorder    = !isInStock && !isPreviewOnly;
  const isPurchasable = isInStock || isPreorder;

  const addItem = useCartStore((state) => state.addItem);

  const colorImageMap: Record<string, number> = {};
  product.colors.forEach((color, index) => {
    if (index < product.images.length) colorImageMap[color] = index;
  });

  const [selectedImage, setSelectedImage]     = useState(0);
  const [selectedSize, setSelectedSize]       = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor]     = useState(product.colors[0] || '');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [buyStatus, setBuyStatus]             = useState<'idle' | 'added' | 'error'>('idle');
  const [buyError, setBuyError]               = useState('');

  const compTable = compTableByHandle[handle] ?? null;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const imageIndex = colorImageMap[color];
    if (imageIndex !== undefined) setSelectedImage(imageIndex);
  };

  const handleAddToCart = () => {
    try {
      addItem(product, selectedSize, selectedColor, 1, {
        isPreorder,
        shippingWindow: product.shippingWindow,
      });
      setBuyStatus('added');
      setTimeout(() => setBuyStatus('idle'), 2000);
    } catch (e) {
      console.error('[addToCart] failed:', e);
      setBuyStatus('error');
      setBuyError('Something went wrong. Please try again.');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const statusLabel = isInStock
    ? 'Available Now'
    : isPreorder
      ? 'Pre-Order'
      : 'Spring 2026';

  const imageOverlay = isPreviewOnly ? (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ backgroundColor: 'rgba(250,250,247,0.92)', color: mid, fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '8px 24px' }}>
        Coming Soon
      </span>
    </div>
  ) : null;

  const Check = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
      <circle cx="7" cy="7" r="7" fill={brown} />
      <path d="M3.5 7L5.5 9.5L10.5 4.5" stroke="#FAFAF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const Ex = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
      <circle cx="7" cy="7" r="7" fill={rule} />
      <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF7' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px clamp(20px, 4vw, 48px) 80px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">

          {/* ── Left: images ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Main image */}
            <div className="product-main-image" style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: bgAlt,
              opacity: isPurchasable ? 1 : 0.8,
              aspectRatio: '2/3',
              maxHeight: '75vh',
            }}>
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

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="product-thumbnails" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      const matchingColor = product.colors.find((c) => colorImageMap[c] === index);
                      if (matchingColor) setSelectedColor(matchingColor);
                    }}
                    style={{
                      aspectRatio: '2/3',
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: selectedImage === index ? 1 : 0.4,
                      border: selectedImage === index ? `1.5px solid ${brown}` : '1.5px solid transparent',
                      background: bgAlt,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s, border-color 0.2s',
                    }}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="25vw" style={{ objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: details panel ── */}
          <div style={{ paddingTop: '8px' }}>

            {/* Status label */}
            <p style={{
              fontFamily: sans,
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: muted,
              marginBottom: '12px',
              marginTop: 0,
            }}>
              {statusLabel}
            </p>

            {/* Product name */}
            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 400,
              color: brown,
              margin: '0 0 10px',
              lineHeight: 1.1,
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: mid, margin: '0 0 6px' }}>
              ${(product.price / 100).toFixed(2)}
            </p>

            {isPreorder && product.shippingWindow && (
              <p style={{ fontFamily: sans, fontSize: '11px', color: muted, letterSpacing: '0.05em', margin: '0 0 32px' }}>
                {product.shippingWindow}
              </p>
            )}

            <div style={{ height: '1px', backgroundColor: rule, margin: '24px 0' }} />

            {/* Sizes */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.35em', textTransform: 'uppercase', color: muted, marginBottom: '10px', marginTop: 0 }}>
                  Size
                </p>
                <div className="product-sizes" style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px', overflowX: 'auto' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => isPurchasable && setSelectedSize(size)}
                      disabled={!isPurchasable}
                      style={{
                        padding: '8px 18px',
                        fontFamily: sans,
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        border: `1px solid ${selectedSize === size ? brown : rule}`,
                        backgroundColor: selectedSize === size ? brown : 'transparent',
                        color: selectedSize === size ? '#FAFAF7' : brown,
                        cursor: isPurchasable ? 'pointer' : 'not-allowed',
                        opacity: isPurchasable ? 1 : 0.4,
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
            {product.colors.length > 0 && product.colors[0] !== 'Default' && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.35em', textTransform: 'uppercase', color: muted, marginBottom: '10px', marginTop: 0 }}>
                  Color
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => isPurchasable && handleColorSelect(color)}
                      disabled={!isPurchasable}
                      style={{
                        padding: '8px 18px',
                        fontFamily: sans,
                        fontSize: '11px',
                        letterSpacing: '0.08em',
                        border: `1px solid ${selectedColor === color ? brown : rule}`,
                        backgroundColor: selectedColor === color ? brown : 'transparent',
                        color: selectedColor === color ? '#FAFAF7' : brown,
                        cursor: isPurchasable ? 'pointer' : 'not-allowed',
                        opacity: isPurchasable ? 1 : 0.4,
                        transition: 'all 0.15s',
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div style={{ marginBottom: '32px' }}>
              {isPurchasable ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={buyStatus === 'added'}
                    style={{
                      width: '100%',
                      backgroundColor: brown,
                      color: '#FAFAF7',
                      padding: '14px',
                      fontFamily: sans,
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: buyStatus === 'added' ? 'default' : 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => { if (buyStatus !== 'added') e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {buyStatus === 'added' ? 'Added to Cart ✓' : isPreorder ? 'Pre-Order Now' : 'Add to Cart'}
                  </button>
                  {isPreorder && (
                    <p style={{ fontFamily: sans, fontSize: '11px', color: muted, marginTop: '10px', textAlign: 'center', lineHeight: 1.7, letterSpacing: '0.03em' }}>
                      You'll be charged at checkout. {product.shippingWindow ?? 'Ships when collection drops.'}
                    </p>
                  )}
                  {buyStatus === 'error' && (
                    <p style={{ fontFamily: sans, fontSize: '12px', color: '#9B4040', marginTop: '8px', textAlign: 'center' }}>{buyError}</p>
                  )}
                </>
              ) : (
                <>
                  <button disabled style={{ width: '100%', backgroundColor: bgAlt, color: muted, padding: '14px', fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', border: 'none', cursor: 'not-allowed', marginBottom: '8px' }}>
                    Coming Soon — Spring 2026
                  </button>
                  <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, textAlign: 'center' }}>
                    Sign up on our homepage to get early access when this drops.
                  </p>
                </>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${rule}` }}>
              <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, lineHeight: 1.9, color: mid, margin: 0 }}>
                {product.description}
              </p>
            </div>

            {/* Comparison matrix */}
            {compTable && (
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${rule}` }}>
                <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '16px', marginTop: 0 }}>
                  Beyond compare
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '44%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '14%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ padding: '0 0 10px', textAlign: 'left', fontSize: '10px', color: 'transparent', borderBottom: `1px solid ${rule}` }}> </th>
                      {(['tualmi', 'patagonia', 'vuori', 'comp4'] as const).map((key) => {
                        const hi = key === 'tualmi';
                        return (
                          <th
                            key={key}
                            style={{
                              padding: '0 4px 10px',
                              textAlign: 'center',
                              fontFamily: sans,
                              fontSize: '9px',
                              letterSpacing: '0.08em',
                              fontWeight: hi ? 600 : 400,
                              color: hi ? brown : muted,
                              borderBottom: `2px solid ${hi ? brown : rule}`,
                            }}
                          >
                            <div>{compTable.labels[key]}</div>
                            <div style={{ fontSize: '10px', fontWeight: 400, color: hi ? mid : muted, marginTop: '3px' }}>
                              {compTable.price[key]}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {compTable.rows.map((row, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : bgAlt }}>
                        <td style={{ padding: '8px 0', fontFamily: sans, fontSize: '11px', fontWeight: 300, color: mid }}>{row.label}</td>
                        {(['tualmi', 'patagonia', 'vuori', 'comp4'] as const).map((brand) => (
                          <td key={brand} style={{ padding: '8px 4px', textAlign: 'center' }}>
                            {row[brand] ? <Check /> : <Ex />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Accordion */}
            <div>
              {[
                {
                  key: 'shipping',
                  label: 'Shipping & Returns',
                  content: (
                    <>
                      <p style={{ margin: '0 0 8px' }}>7-day returns and exchanges</p>
                      <p style={{ margin: 0 }}>
                        {isPreorder
                          ? (product.shippingWindow ?? 'Pre-order — ships when the collection drops.')
                          : 'Ships within 2–3 business days!'}
                      </p>
                    </>
                  ),
                },
                {
                  key: 'care',
                  label: 'Care Details',
                  content: (
                    <>
                      <p style={{ margin: '0 0 8px' }}>Hand wash cold</p>
                      <p style={{ margin: '0 0 8px' }}>Lay flat to dry</p>
                      <p style={{ margin: 0 }}>Do not bleach or iron</p>
                    </>
                  ),
                },
              ].map(({ key, label, content }) => (
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
                      fontSize: '9px',
                      fontWeight: 500,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: brown,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{label}</span>
                    <span style={{ fontSize: '16px', color: muted, fontWeight: 300 }}>{expandedSection === key ? '−' : '+'}</span>
                  </button>
                  {expandedSection === key && (
                    <div style={{ paddingBottom: '16px', fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid, lineHeight: 1.8 }}>
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
