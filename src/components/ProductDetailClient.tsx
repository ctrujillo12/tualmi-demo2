'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_DETAILS, type HighlightIcon } from '@/lib/productDetails';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';

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

// ─── Feature-highlight icons (Halfday-style strip) ────────────────────────────
function HighlightGlyph({ icon }: { icon: HighlightIcon }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: maroon, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (icon) {
    case 'moisture': // single water drop
      return <svg {...common}><path d="M12 3.5c2.8 3 5 5.6 5 8.5a5 5 0 0 1-10 0c0-2.9 2.2-5.5 5-8.5Z" /></svg>;
    case 'water': // water-resistant — drop with a slash
      return <svg {...common}><path d="M12 3.5c2.8 3 5 5.6 5 8.5a5 5 0 0 1-10 0c0-2.9 2.2-5.5 5-8.5Z" /><path d="M5.5 5.5 18.5 18.5" /></svg>;
    case 'feather': // ultra-light
      return <svg {...common}><path d="M19 5a7 7 0 0 0-9.9 0L5 9.1a5.5 5.5 0 0 0 0 7.8L19 5Z" /><path d="M5 19 12 12" /><path d="M15.5 8.5 11 13" /></svg>;
    case 'recycled': // clean circular recycle / renew loop
      return <svg {...common}><path d="M20.5 8V3.5H16" /><path d="M20.5 3.5 16.5 7.5A7 7 0 0 0 5.2 9.6" /><path d="M3.5 16v4.5H8" /><path d="M3.5 20.5 7.5 16.5A7 7 0 0 0 18.8 14.4" /></svg>;
    case 'uv': // sun
      return <svg {...common}><circle cx="12" cy="12" r="3.8" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" /></svg>;
    case 'pocket': // pocket
      return <svg {...common}><rect x="4.5" y="4.5" width="15" height="15" rx="2.5" /><path d="M8.5 4.5v3a3.5 3.5 0 0 0 7 0v-3" /></svg>;
    case 'stretch': // expand both ways
      return <svg {...common}><path d="M3.5 12h17" /><path d="M7 8.5 3.5 12 7 15.5" /><path d="M17 8.5 20.5 12 17 15.5" /></svg>;
    case 'women': // female symbol
      return <svg {...common}><circle cx="12" cy="8" r="4.5" /><path d="M12 12.5v8M8.75 17.5h6.5" /></svg>;
    case 'cinch': // cinched hem / drawstring
      return <svg {...common}><path d="M8 4v6M16 4v6" /><path d="M8 10c1.3 1.3 2.5 1.3 4 1.3s2.7 0 4-1.3" /><path d="M9.5 11.2 8 20M14.5 11.2 16 20" /></svg>;
    default:
      return null;
  }
}

export default function ProductDetailClient({ product, initialColor }: ProductDetailClientProps) {
  const handle       = product.handle ?? '';
  const isInStock    = AVAILABLE_HANDLES.includes(handle);
  const shippingLabel = isInStock
    ? 'In stock — ships in 1–2 business days'
    : (product.shippingWindow ?? 'Coming soon');

  const addItem = useCartStore((state) => state.addItem);

  const swatchColors = PRODUCT_COLORS[handle] ?? [];
  const colorImageMap = PRODUCT_COLOR_IMAGES[handle];
  const colorCount   = Math.max(1, swatchColors.length || product.colors.length);
  const imgsPerColor = Math.max(1, Math.floor(product.images.length / colorCount));

  const getColorImages = (colorIdx: number): string[] => {
    // Prefer an explicit per-color image list (handles uneven photo counts)
    const colorName = swatchColors[colorIdx]?.name ?? product.colors[colorIdx];
    if (colorImageMap && colorName && colorImageMap[colorName]?.length) {
      return colorImageMap[colorName];
    }
    // Fallback: split product.images evenly across colors
    const start = colorIdx * imgsPerColor;
    const end   = colorIdx === colorCount - 1 ? product.images.length : start + imgsPerColor;
    return product.images.slice(start, end);
  };

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
    // Persist the choice in the URL so a refresh keeps the same colorway
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('color', color);
      window.history.replaceState(null, '', url.toString());
    }
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
      label: 'the technical stuff',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, opacity: 0.85 }}>For the gear nerds — here&apos;s exactly what you&apos;re getting.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '6px', columnGap: '12px' }}>
            <span style={{ color: soft, opacity: 0.8 }}>Fabric</span>
            <span>{fabricDetail.shell}</span>
            {fabricDetail.lining && (<><span style={{ color: soft, opacity: 0.8 }}>Lining</span><span>{fabricDetail.lining}</span></>)}
            {fabricDetail.pocketLining && (<><span style={{ color: soft, opacity: 0.8 }}>Pocket lining</span><span>{fabricDetail.pocketLining}</span></>)}
            {fabricDetail.weight && (<><span style={{ color: soft, opacity: 0.8 }}>Weight</span><span>{fabricDetail.weight}</span></>)}
          </div>
          {fabricDetail.features && fabricDetail.features.length > 0 && (
            <ul style={{ margin: '2px 0 0', padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
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

  if (fabricDetail?.sizeChart) {
    const chart = fabricDetail.sizeChart;
    accordionItems.push({
      key: 'sizeguide',
      label: 'size guide',
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 8px 8px 0', borderBottom: `1.5px solid ${maroon}` }}> </th>
                {chart.sizes.map((s) => (
                  <th key={s} style={{ padding: '6px 4px 8px', textAlign: 'center', fontFamily: sans, fontSize: '12px', fontWeight: 700, color: maroon, textTransform: 'lowercase', borderBottom: `1.5px solid ${maroon}` }}>
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.rows.map((row) => (
                <tr key={row.label} style={{ borderBottom: `1px solid ${rule}` }}>
                  <td style={{ padding: '7px 8px 7px 0', fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft, whiteSpace: 'nowrap' }}>{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} style={{ padding: '7px 4px', textAlign: 'center', fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {chart.note && (
            <p style={{ ...bodyStyle, fontSize: '12px', margin: '8px 0 0' }}>{chart.note}</p>
          )}
        </div>
      ),
    });
  }

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: blushBg }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(88px, 12vw, 130px) clamp(20px, 4vw, 48px) clamp(64px, 9vw, 110px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Left: gallery — 2-up (full-width hero on mobile) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="pdp-gallery">
              {gallery.map((image, i) => {
                // Odd trailing photo spans full width on desktop; first photo is
                // the full-width hero on mobile (see globals.css)
                const isLastOdd = gallery.length % 2 === 1 && i === gallery.length - 1;
                const cls = 'pdp-tile'
                  + (isLastOdd ? ' pdp-tile--wide' : '')
                  + (i === 0 ? ' pdp-tile--hero' : '');
                return (
                  <div key={image} className={cls}>
                    <Image
                      src={image}
                      alt={`${product.name} — ${selectedColor} ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={i === 0}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                );
              })}
            </div>

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

            <p style={{ ...bodyStyle, fontWeight: 600, color: maroon, marginBottom: '24px' }}>
              ${(product.price / 100).toFixed(2)}
            </p>

            {/* Feature highlights — Halfday-style icon strip */}
            {fabricDetail?.highlights && fabricDetail.highlights.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '18px 22px',
                  padding: '20px',
                  marginBottom: '28px',
                  backgroundColor: 'white',
                  borderRadius: '14px',
                  width: 'fit-content',
                  maxWidth: '100%',
                }}
              >
                {fabricDetail.highlights.map((h) => (
                  <div key={h.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', width: '72px', textAlign: 'center' }}>
                    <HighlightGlyph icon={h.icon} />
                    <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 600, color: maroon, lineHeight: 1.25, textTransform: 'lowercase' }}>
                      {h.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

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
                    join the club for early access
                  </Link>
                  <p style={{ ...bodyStyle, fontSize: '12px', textAlign: 'center', marginTop: '10px', lineHeight: 1.7 }}>
                    Trailblazers get 24-hour early access before anyone else.
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
                  <p style={{ ...bodyStyle, fontSize: '13px', marginTop: '12px' }}>
                    Full measurements in the <span style={{ color: maroon, fontWeight: 600 }}>size guide</span> below.
                  </p>
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
