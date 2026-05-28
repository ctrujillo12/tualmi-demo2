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
const muted = '#8C7B6B';
const rule  = '#DDD5C8';
const bgAlt = '#F2EDE4';

// ─── Per-product feature callouts ────────────────────────────────────────────

const productFeatures: Record<string, string[]> = {
  'trailblazing-fleece': [
    'Snap collar + chest zip pocket',
    'Kangaroo pocket with clean finish',
    'Relaxed fit — actually designed for a woman\'s body',
    'Patterns designed by women, not afterthought colorways',
  ],
  'summit-pant': [
    'Fold-over waist for real comfort on trail',
    'Cargo pockets that actually fit your stuff',
    'Flared leg — functional and fashion-forward',
    'Cinch hem for versatile styling',
  ],
  'alpine-baby-tee': [
    'UPF 40 sun protection',
    'Second-skin performance fit',
    'Lightweight and breathable for layering',
    'Cut for the female form, not a men\'s S',
  ],
  'horizon-shorts': [
    'Mid-rise waist — stays put on trail',
    'Relaxed fit for real movement',
    'Three colorways: bold, playful, and statement',
    'Light enough for trail running, cute enough for everything else',
  ],
  'trailblazing-tote': [
    '100% organic cotton canvas',
    '200gsm — soft but structured',
    '6" and 13" handles for two carry styles',
    'Reusable, eco-conscious, and actually cute',
  ],
  'carabiner': [
    'Decorative + functional',
    'Clips to bag, belt loop, or water bottle',
    'Matches the collection aesthetic',
  ],
};

// ─── Value proposition matrix data ───────────────────────────────────────────

type CheckValue = true | false | string;

interface CompRow {
  label: string;
  tualmi: CheckValue;
  patagonia: CheckValue;
  vuori: CheckValue;
  lululemon: CheckValue;
}

const compTableByHandle: Record<string, { price: Record<string, string>; rows: CompRow[] }> = {
  'trailblazing-fleece': {
    price: { tualmi: '$149', patagonia: '$149', vuori: '$188', lululemon: 'N/A' },
    rows: [
      { label: 'Designed by women', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
      { label: 'Women-specific fit', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
      { label: 'Fashion-forward patterns', tualmi: true,  patagonia: false, vuori: true,  lululemon: false },
      { label: 'Technical outdoor use', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
      { label: 'Ethical manufacturing', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
      { label: 'Chest zip pocket', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
    ],
  },
  'summit-pant': {
    price: { tualmi: '$99', patagonia: '$99', vuori: '$118', lululemon: '$128' },
    rows: [
      { label: 'Designed by women', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
      { label: 'Women-specific fit', tualmi: true,  patagonia: false, vuori: false, lululemon: true  },
      { label: 'Fashion-forward cut', tualmi: true,  patagonia: false, vuori: true,  lululemon: true  },
      { label: 'Trail-ready construction', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
      { label: 'Cargo pockets', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
      { label: 'Flare silhouette', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
    ],
  },
  'horizon-shorts': {
    price: { tualmi: '$72', patagonia: '$75', vuori: '$74', lululemon: '$68' },
    rows: [
      { label: 'Designed by women', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
      { label: 'Women-specific fit', tualmi: true,  patagonia: false, vuori: false, lululemon: true  },
      { label: 'Distinctive colorways', tualmi: true,  patagonia: false, vuori: true,  lululemon: false },
      { label: 'Trail-ready construction', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
      { label: 'Ethical manufacturing', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
      { label: 'Pattern options', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
    ],
  },
  'alpine-baby-tee': {
    price: { tualmi: '$69', patagonia: '$49', vuori: '$64', lululemon: '$68' },
    rows: [
      { label: 'Designed by women', tualmi: true,  patagonia: false, vuori: false, lululemon: false },
      { label: 'Women-specific fit', tualmi: true,  patagonia: false, vuori: false, lululemon: true  },
      { label: 'UPF 40 protection', tualmi: true,  patagonia: false, vuori: false, lululemon: true  },
      { label: 'Fashion-forward design', tualmi: true,  patagonia: false, vuori: true,  lululemon: false },
      { label: 'Ethical manufacturing', tualmi: true,  patagonia: true,  vuori: false, lululemon: false },
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

  const features  = productFeatures[handle] ?? [];
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

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7.5" fill={brown} />
      <path d="M4.5 8L7 10.5L11.5 5.5" stroke="#FAFAF7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7.5" fill={rule} />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke={muted} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const renderCell = (val: CheckValue) => {
    if (val === true)  return <CheckIcon />;
    if (val === false) return <XIcon />;
    return <span style={{ fontSize: '12px', color: mid }}>{val}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF7' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">

        {/* ── Top section: image + buy panel ── */}
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

          {/* Buy panel */}
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

            <div style={{ marginBottom: '16px' }}>
              {isPurchasable ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={buyStatus === 'added'}
                    style={{
                      width: '100%', backgroundColor: brown, color: '#FAFAF7',
                      padding: '14px', fontSize: '11px', letterSpacing: '0.2em',
                      textTransform: 'uppercase', border: 'none',
                      cursor: buyStatus === 'added' ? 'default' : 'pointer',
                      transition: 'opacity 0.2s, background-color 0.2s',
                    }}
                    onMouseEnter={e => { if (buyStatus !== 'added') e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    {buyStatus === 'added'
                      ? 'ADDED TO CART ✓'
                      : isPreorder
                        ? 'PRE-ORDER NOW'
                        : 'ADD TO CART'}
                  </button>
                  {isPreorder && (
                    <p style={{ fontSize: '11px', color: muted, marginTop: '10px', textAlign: 'center', lineHeight: 1.6, letterSpacing: '0.03em' }}>
                      You'll be charged at checkout. {product.shippingWindow ?? 'Ships when collection drops.'}
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
            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${rule}` }}>
              <p style={{ fontSize: '13px', lineHeight: 1.8, color: mid }}>
                {product.description}
              </p>
            </div>

            {/* Feature callouts */}
            {features.length > 0 && (
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: `1px solid ${rule}` }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '6px 0', fontSize: '12px', color: mid, lineHeight: 1.5 }}>
                      <span style={{ color: brown, marginTop: '1px', flexShrink: 0 }}>—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accordion */}
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

        {/* ── Value proposition matrix ── */}
        {compTable && (
          <div style={{ marginTop: '80px', paddingTop: '60px', borderTop: `1px solid ${rule}` }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: '8px' }}>
              Why Tualmi
            </p>
            <h2 style={{ fontSize: '18px', fontWeight: 400, color: brown, marginBottom: '8px' }}>
              See how we compare
            </h2>
            <p style={{ fontSize: '13px', color: mid, marginBottom: '40px', maxWidth: '480px' }}>
              Same price. Better fit. Actually designed for you.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '520px' }}>
                <colgroup>
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '17%' }} />
                  <col style={{ width: '17%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 0', textAlign: 'left', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: muted, borderBottom: `1px solid ${rule}` }}></th>
                    {[
                      { key: 'tualmi',    label: 'Tualmi',    highlight: true  },
                      { key: 'patagonia', label: 'Patagonia', highlight: false },
                      { key: 'vuori',     label: 'Vuori',     highlight: false },
                      { key: 'lululemon', label: 'Lululemon', highlight: false },
                    ].map(({ key, label, highlight }) => (
                      <th key={key} style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11px', letterSpacing: '0.08em', color: highlight ? brown : mid, fontWeight: highlight ? 600 : 400, borderBottom: `2px solid ${highlight ? brown : rule}` }}>
                        {label}
                        <div style={{ fontSize: '12px', fontWeight: 400, color: highlight ? brown : muted, marginTop: '4px' }}>
                          {compTable.price[key]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compTable.rows.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#FAFAF7' : bgAlt }}>
                      <td style={{ padding: '12px 0', fontSize: '12px', color: mid }}>{row.label}</td>
                      {(['tualmi', 'patagonia', 'vuori', 'lululemon'] as const).map((brand) => (
                        <td key={brand} style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {renderCell(row[brand])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: '11px', color: muted, marginTop: '16px' }}>
              Prices and features reflect standard retail at time of comparison.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}