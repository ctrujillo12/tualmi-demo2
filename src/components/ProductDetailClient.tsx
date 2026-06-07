'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_DETAILS } from '@/lib/productDetails';
import { PRODUCT_COLORS } from '@/lib/productColors';

interface ProductDetailClientProps {
  product: Product;
  initialColor?: string;
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

interface CompRow {
  label: string;
  tualmi: boolean;
  patagonia: boolean;
  vuori: boolean;
  comp4: boolean;
}

/* COMPARISON MATRICES — hidden, keep for later
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
      { label: 'Women-specific fit',        tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'UPF 40 protection',         tualmi: true,  patagonia: false, vuori: false, comp4: true  },
      { label: 'Fashion-forward design',    tualmi: true,  patagonia: false, vuori: true,  comp4: false },
      { label: 'Ethical manufacturing',     tualmi: true,  patagonia: true,  vuori: false, comp4: false },
    ],
  },
};
*/

export default function ProductDetailClient({ product, initialColor }: ProductDetailClientProps) {
  const handle        = product.handle ?? '';
  const isInStock     = AVAILABLE_HANDLES.includes(handle);
  const isPreviewOnly = PREVIEW_ONLY_HANDLES.includes(handle);
  const isPreorder    = !isInStock && !isPreviewOnly;
  const isPurchasable = isInStock || isPreorder;

  const addItem = useCartStore((state) => state.addItem);

  const swatchColors = PRODUCT_COLORS[handle] ?? [];
  const colorCount   = Math.max(1, swatchColors.length || product.colors.length);
  const imgsPerColor = Math.max(1, Math.floor(product.images.length / colorCount));

  const getColorImages = (colorIdx: number): string[] => {
    const start = colorIdx * imgsPerColor;
    const end   = colorIdx === colorCount - 1
      ? product.images.length
      : start + imgsPerColor;
    return product.images.slice(start, end);
  };

  const [selectedImage, setSelectedImage]     = useState(0);
  const [selectedSize, setSelectedSize]       = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor]     = useState(() => {
    const fallback = swatchColors.length > 0 ? swatchColors[0].name : (product.colors[0] || '');
    if (initialColor && swatchColors.some(s => s.name === initialColor)) return initialColor;
    return fallback;
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [buyStatus, setBuyStatus]             = useState<'idle' | 'added' | 'error'>('idle');
  const [buyError, setBuyError]               = useState('');

  // const compTable    = compTableByHandle[handle] ?? null;  // comparison matrix hidden
  const fabricDetail = PRODUCT_DETAILS[handle] ?? null;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedImage(0);
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

  const accordionItems: { key: string; label: string; content: React.ReactNode }[] = [];

  if (fabricDetail) {
    accordionItems.push({
      key: 'material',
      label: 'Material',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', columnGap: '12px' }}>
            <span style={{ color: muted, fontWeight: 400, fontSize: '11px', letterSpacing: '0.05em' }}>Shell</span>
            <span>{fabricDetail.shell}</span>
            {fabricDetail.lining && (
              <>
                <span style={{ color: muted, fontWeight: 400, fontSize: '11px', letterSpacing: '0.05em' }}>Lining</span>
                <span>{fabricDetail.lining}</span>
              </>
            )}
            {fabricDetail.pocketLining && (
              <>
                <span style={{ color: muted, fontWeight: 400, fontSize: '11px', letterSpacing: '0.05em' }}>Pocket lining</span>
                <span>{fabricDetail.pocketLining}</span>
              </>
            )}
            {fabricDetail.weight && (
              <>
                <span style={{ color: muted, fontWeight: 400, fontSize: '11px', letterSpacing: '0.05em' }}>Weight</span>
                <span>{fabricDetail.weight}</span>
              </>
            )}
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

  if (fabricDetail?.fit) {
    accordionItems.push({
      key: 'fit',
      label: 'Fit & Sizing',
      content: <p style={{ margin: 0 }}>{fabricDetail.fit}</p>,
    });
  }

  accordionItems.push({
    key: 'care',
    label: 'Care',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(fabricDetail?.care ?? ['Machine wash cold', 'Hang dry', 'Do not bleach', 'Do not iron'])
          .map((line, i) => <p key={i} style={{ margin: 0 }}>{line}</p>)}
      </div>
    ),
  });

  accordionItems.push({
    key: 'shipping',
    label: 'Shipping & Returns',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ margin: 0 }}>7-day returns and exchanges</p>
        <p style={{ margin: 0 }}>
          {isPreorder ? 'Preorders ship late July 2026.' : 'Ships within 2-3 business days.'}
        </p>
      </div>
    ),
  });

  const statusLabel = isInStock ? 'Available Now' : isPreorder ? 'Pre-Order' : 'Spring 2026';

  const imageOverlay = isPreviewOnly ? (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ backgroundColor: 'rgba(250,250,247,0.92)', color: mid, fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '8px 24px' }}>
        Coming Soon
      </span>
    </div>
  ) : null;

  const Check = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline-block' }}>
      <circle cx="7" cy="7" r="7" fill={brown} />
      <path d="M3.5 7L5.5 9.5L10.5 4.5" stroke="#FAFAF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const Ex = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline-block' }}>
      <circle cx="7" cy="7" r="7" fill={rule} />
      <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const activeColorIdx = swatchColors.length > 0
    ? swatchColors.findIndex(s => s.name === selectedColor)
    : product.colors.indexOf(selectedColor);
  const gallery     = getColorImages(Math.max(0, activeColorIdx));
  const activeImage = gallery[selectedImage] ?? gallery[0] ?? product.images[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF7' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px clamp(20px, 4vw, 48px) 80px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">

          {/* Left: images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="product-main-image" style={{ position: 'relative', lineHeight: 0 }}>
              <Image
                src={activeImage}
                alt={product.name}
                width={800}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  opacity: isPurchasable ? 1 : 0.8,
                  filter: isPurchasable ? 'none' : 'saturate(0.8)',
                }}
              />
              {imageOverlay}
            </div>

            {gallery.length > 1 && (
              <div className="product-thumbnails" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {gallery.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: selectedImage === i ? 1 : 0.4,
                      border: selectedImage === i ? `1.5px solid ${brown}` : '1.5px solid transparent',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s, border-color 0.2s',
                      lineHeight: 0,
                    }}
                  >
                    <Image src={image} alt={`${product.name} ${i + 1}`} width={200} height={300} sizes="25vw" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}

            <p style={{ fontFamily: sans, fontSize: '10px', fontWeight: 300, color: muted, letterSpacing: '0.03em', lineHeight: 1.6, margin: 0 }}>
              Photos show pre-production samples. Final color and fit may vary slightly.
            </p>
          </div>

          {/* Right: details panel */}
          <div style={{ paddingTop: '8px' }}>
            <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '12px', marginTop: 0 }}>
              {statusLabel}
            </p>

            <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 400, color: brown, margin: '0 0 10px', lineHeight: 1.1 }}>
              {product.name}
            </h1>

            <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: mid, margin: '0 0 6px' }}>
              ${(product.price / 100).toFixed(2)}
            </p>

            {isPreorder && (
              <p style={{ fontFamily: sans, fontSize: '11px', color: muted, letterSpacing: '0.05em', margin: '0 0 32px' }}>
                Preorders ship late July 2026
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
            {swatchColors.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.35em', textTransform: 'uppercase', color: muted, marginBottom: '10px', marginTop: 0 }}>
                  Color{' '}<span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>— {selectedColor}</span>
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {swatchColors.map((swatch) => {
                    const isSelected = selectedColor === swatch.name;
                    const isGradient = swatch.value.startsWith('linear-gradient');
                    return (
                      <button
                        key={swatch.name}
                        title={swatch.name}
                        onClick={() => isPurchasable && handleColorSelect(swatch.name)}
                        disabled={!isPurchasable}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? `2px solid ${brown}` : '2px solid transparent',
                          outline: isSelected ? 'none' : `1px solid ${rule}`,
                          outlineOffset: '1px',
                          background: isGradient ? swatch.value : undefined,
                          backgroundColor: isGradient ? undefined : swatch.value,
                          cursor: isPurchasable ? 'pointer' : 'not-allowed',
                          opacity: isPurchasable ? 1 : 0.4,
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
                    {buyStatus === 'added' ? 'Added to Cart' : isPreorder ? 'Pre-Order Now' : 'Add to Cart'}
                  </button>
                  {isPreorder && (
                    <p style={{ fontFamily: sans, fontSize: '11px', color: muted, marginTop: '10px', textAlign: 'center', lineHeight: 1.7, letterSpacing: '0.03em' }}>
                      {"You'll be charged at checkout. Preorders ship late July 2026."}
                    </p>
                  )}
                  {buyStatus === 'error' && (
                    <p style={{ fontFamily: sans, fontSize: '12px', color: '#9B4040', marginTop: '8px', textAlign: 'center' }}>{buyError}</p>
                  )}
                </>
              ) : (
                <>
                  <button disabled style={{ width: '100%', backgroundColor: bgAlt, color: muted, padding: '14px', fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', border: 'none', cursor: 'not-allowed', marginBottom: '8px' }}>
                    Coming Soon
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

            {/* COMPARISON MATRIX — hidden, keep for later
            {compTable && (
              <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: `1px solid ${rule}` }}>
                <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '16px', marginTop: 0 }}>
                  Fit check
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
                          <th key={key} style={{ padding: '0 4px 10px', textAlign: 'center', fontFamily: sans, fontSize: '9px', letterSpacing: '0.08em', fontWeight: hi ? 600 : 400, color: hi ? brown : muted, borderBottom: `2px solid ${hi ? brown : rule}` }}>
                            <div>{compTable.labels[key]}</div>
                            <div style={{ fontSize: '10px', fontWeight: 400, color: hi ? mid : muted, marginTop: '3px' }}>{compTable.price[key]}</div>
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
            */}

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
                    <span style={{ fontSize: '16px', color: muted, fontWeight: 300 }}>{expandedSection === key ? '-' : '+'}</span>
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
