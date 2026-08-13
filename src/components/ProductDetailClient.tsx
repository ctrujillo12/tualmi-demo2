'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_DETAILS, type HighlightIcon } from '@/lib/productDetails';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import { useShopAccess, isBuyable, GATED_HANDLES, PREORDER_HANDLES } from '@/lib/useShopAccess';
import DiscountBadge from '@/components/DiscountBadge';
import ImageLightbox from '@/components/ImageLightbox';
import ShareButton from '@/components/ShareButton';
import { trackViewItem, trackAddToCart } from '@/lib/analytics';

interface ProductDetailClientProps {
  product: Product;
  initialColor?: string;
}

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
  const common = { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: maroon, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
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
  const { canShop, ready } = useShopAccess();
  const isPreorder = PREORDER_HANDLES.includes(handle);
  const isGated    = GATED_HANDLES.includes(handle);
  const buyable    = isBuyable(handle, canShop);   // sellable AND shop open (if gated)
  const lockedForLaunch = isGated && !canShop;     // sellable but shop not open yet

  const shippingLabel = isPreorder
    ? (product.shippingWindow || 'Ships August')
    : buyable
      ? 'In stock, ships in 1–2 business days'
      : (product.shippingWindow ?? 'Coming soon');

  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

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

  const [focusIdx, setFocusIdx]           = useState(0); // mobile hero photo
  // Deliberately NO default size. Pre-selecting the first option (2XS) meant
  // people could add to cart without ever choosing, and only discover the
  // wrong size on delivery. One-size products are the exception — there's
  // nothing to choose.
  const [selectedSize, setSelectedSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState(() => {
    const fallback = swatchColors.length > 0 ? swatchColors[0].name : (product.colors[0] || '');
    // Case-insensitive so shared links work whether they say Confetti or confetti.
    if (initialColor) {
      const match = swatchColors.find(
        (s) => s.name.toLowerCase() === initialColor.trim().toLowerCase()
      );
      if (match) return match.name;
    }
    return fallback;
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  // Only tracks failures now — the "added" state is derived from the cart
  // itself (see cartQty), so the button can't disagree with what's in the cart.
  const [buyStatus, setBuyStatus] = useState<'idle' | 'added' | 'error'>('idle');

  const fabricDetail = PRODUCT_DETAILS[handle] ?? null;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setFocusIdx(0);
    // Persist the choice in the URL so a refresh keeps the same colorway
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('color', color);
      window.history.replaceState(null, '', url.toString());
    }
  };

  const handleAddToCart = () => {
    try {
      const colorIdx = swatchColors.length > 0
        ? swatchColors.findIndex((s) => s.name === selectedColor)
        : product.colors.indexOf(selectedColor);
      const colorImages = getColorImages(Math.max(0, colorIdx));

      // Cart image: prefer the Shopify variant image for the selected color,
      // then the Shopify product image, then the local gallery as a fallback.
      const colorLower = selectedColor.toLowerCase();
      const variantImg = product.variants?.find((v) =>
        v.image?.url &&
        v.selectedOptions?.some((o) => o.name.toLowerCase() === 'color' && o.value.toLowerCase() === colorLower),
      )?.image?.url;
      const shopifyProductImg = product.images.find((u) => u.startsWith('http'));
      const cartImg = variantImg ?? shopifyProductImg ?? colorImages[0];

      // Items with a future ship window (e.g. the pant's late-August window)
      // are flagged as preorder so the date carries onto the Shopify order.
      const shipWindow = product.shippingWindow ?? '';
      const shipsLater = !!shipWindow && !shipWindow.toLowerCase().startsWith('in stock');
      addItem(
        { ...product, images: cartImg ? [cartImg] : colorImages },
        selectedSize, selectedColor, 1,
        { isPreorder: shipsLater, shippingWindow: shipsLater ? shipWindow : undefined },
      );
      trackAddToCart({
        item_id: handle,
        item_name: product.name,
        price: product.price / 100,
        item_variant: `${selectedColor} / ${selectedSize}`,
        quantity: 1,
      });
      setBuyStatus('added');
    } catch (e) {
      console.error('[addToCart] failed:', e);
      setBuyStatus('error');
    }
  };

  const toggleSection = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section);

  /**
   * How many of THIS exact size+colour are already in the cart. Drives the
   * +/- stepper below, so the control always reflects real cart state — if the
   * shopper switches size or colour, the stepper resets to "add to cart"
   * because that's a different line item.
   */
  const cartQty = useCartStore(
    (state) =>
      state.items.find(
        (i) =>
          i.product.id === product.id &&
          i.selectedSize === selectedSize &&
          i.selectedColor === selectedColor
      )?.quantity ?? 0
  );

  const setQty = (next: number) =>
    updateQuantity(product.id, selectedSize, selectedColor, next);

  /** Soft cap on the quantity stepper. Shopify enforces real stock at checkout. */
  const MAX_QTY = 10;

  // ── Sticky mobile buy bar ──────────────────────────────────────────────────
  // 95.6% of traffic is mobile and 92.8% of product viewers never add to cart.
  // The buy box sits under a tall gallery, so most people never scroll to a
  // live CTA. This keeps one pinned to the bottom of the screen instead.
  // Tap any gallery photo to open it full-screen with zoom.
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const sizeRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [flashSize, setFlashSize] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Primary buy action. If no size is chosen we don't dead-end the tap —
   * scroll the picker into view and flash it, so the button always does
   * something rather than sitting inert.
   */
  const handleBuy = () => {
    if (!selectedSize) {
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setFlashSize(true);
      window.setTimeout(() => setFlashSize(false), 1600);
      return;
    }
    handleAddToCart();
  };

  // GA4 view_item — once per product, not on every colour/size change.
  useEffect(() => {
    trackViewItem({
      item_id: handle,
      item_name: product.name,
      price: product.price / 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  // ── Accordion content ──
  const accordionItems: { key: string; label: string; content: React.ReactNode }[] = [];

  if (fabricDetail) {
    accordionItems.push({
      key: 'material',
      label: 'the technical stuff',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, opacity: 0.85 }}>For the gear nerds, here&apos;s exactly what you&apos;re getting.</p>
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
        {shippingLabel && <p style={{ margin: 0 }}>{shippingLabel}.</p>}
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
        <div className="pdp-layout">

          {/* ── Left: gallery ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Desktop: uniform 2-up grid */}
            <div className="pdp-gallery">
              {gallery.map((image, i) => (
                <div
                  key={image}
                  className="pdp-tile pdp-tile--zoom"
                  onClick={() => setLightboxIdx(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setLightboxIdx(i)}
                  aria-label="View photo full screen"
                >
                  <Image
                    src={image}
                    alt={`${product.name} — ${selectedColor} ${i + 1}`}
                    fill
                    // The first tile is the LCP element on desktop. Without
                    // priority it's lazy-loaded, so the browser doesn't even
                    // request it until after layout — that's the few seconds of
                    // blank white box. The rest stay lazy.
                    priority={i === 0}
                    quality={82}
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    // contain, not cover: the tile is 2/3 to match the shoot,
                    // so nothing is letterboxed — but if a future photo has a
                    // different ratio it will be shown whole on blush rather
                    // than silently cropped.
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>

            {/* Mobile: hero + 2 big supporting, then a tappable thumbnail strip */}
            <div className="pdp-gallery--mobile">
              <div
                className="pdp-m-hero pdp-tile--zoom"
                onClick={() => setLightboxIdx(focusIdx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setLightboxIdx(focusIdx)}
                aria-label="View photo full screen"
              >
                <Image
                  src={gallery[focusIdx] ?? gallery[0]}
                  alt={`${product.name} — ${selectedColor}`}
                  fill
                  // LCP element on mobile — same reasoning as the desktop tile.
                  priority
                  quality={82}
                  sizes="100vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              {(gallery[1] || gallery[2]) && (
                <div className="pdp-m-big2">
                  {[1, 2].map((i) => gallery[i] && (
                    <div
                      key={gallery[i]}
                      className="pdp-tile pdp-tile--zoom"
                      onClick={() => setLightboxIdx(i)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setLightboxIdx(i)}
                      aria-label="View photo full screen"
                    >
                      <Image src={gallery[i]} alt={`${product.name} — ${selectedColor} ${i + 1}`} fill sizes="50vw" style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
              {gallery.length > 1 && (
                <div className="pdp-m-thumbs">
                  {gallery.map((image, i) => (
                    <button
                      key={image}
                      className={i === focusIdx ? 'active' : ''}
                      onClick={() => setFocusIdx(i)}
                      aria-label={`View photo ${i + 1}`}
                    >
                      <Image src={image} alt="" fill sizes="58px" style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: details ── */}
          <div>
            {/* Trust strip. Analytics showed most cold traffic lands straight
                on a product page and never sees the homepage story, so the
                credibility signals have to live here too. */}
            <div className="pdp-topbar">
              <div className="pdp-strip pdp-strip--trust pdp-strip--inline">
              {['women-owned', 'WRAP-certified', 'recycled fabric'].map((claim, i) => (
                <span key={claim} className="pdp-strip-item">
                  {i > 0 && <span className="pdp-strip-sep">·</span>}
                  <span className="pdp-strip-mark">✦</span>
                  {claim}
                </span>
              ))}
              </div>
              <ShareButton
                productName={product.name}
                color={selectedColor}
                price={product.price}
              />
            </div>

            {ready && (
              <p style={{ ...eyebrowStyle, marginBottom: '12px' }}>
                {lockedForLaunch
                  ? 'opens friday · 11am pt'
                  : buyable && !isPreorder
                    ? 'available now'
                    : shippingLabel.toLowerCase()}
              </p>
            )}

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
                className="pdp-highlights"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '12px 16px',
                  padding: '14px 16px',
                  marginBottom: '26px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  width: 'fit-content',
                  maxWidth: '100%',
                }}
              >
                {fabricDetail.highlights.map((h) => (
                  <div key={h.label} className="pdp-hl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '56px', textAlign: 'center' }}>
                    <HighlightGlyph icon={h.icon} />
                    <span style={{ fontFamily: sans, fontSize: '9.5px', fontWeight: 600, color: maroon, lineHeight: 1.2, textTransform: 'lowercase' }}>
                      {h.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
              <div
                ref={sizeRef}
                style={{
                  // 22px clears the size pills before the model note below.
                  marginBottom: '22px',
                  // Flashes when someone taps buy without choosing a size.
                  borderRadius: '12px',
                  padding: flashSize ? '10px' : 0,
                  margin: flashSize ? '-10px -10px 12px' : undefined,
                  backgroundColor: flashSize ? '#FBF1F5' : 'transparent',
                  boxShadow: flashSize ? `0 0 0 2px ${maroon}` : 'none',
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <p style={{ ...eyebrowStyle, fontSize: '12px', marginBottom: '10px' }}>size</p>
                <div className="pdp-sizes">
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

            {/* Model reference — sizing context, so it sits under the size row
                with real breathing room rather than jammed against it. */}
            {fabricDetail?.modelNote && (
              <p
                style={{
                  fontFamily: sans,
                  fontSize: '12.5px',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  color: soft,
                  margin: '0 0 26px',
                }}
              >
                {fabricDetail.modelNote}
              </p>
            )}

            {/* Colors */}
            {swatchColors.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <p style={{ ...eyebrowStyle, fontSize: '12px', marginBottom: '10px' }}>
                  color · {selectedColor.toLowerCase()}
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

            {/* Ship-date / delay note */}
            {fabricDetail?.shipNote && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  border: `1px solid ${rule}`,
                }}
              >
                <p style={{ ...bodyStyle, fontSize: '13px', lineHeight: 1.6, color: maroon, fontWeight: 500 }}>
                  ✦ {fabricDetail.shipNote}
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{ marginBottom: '36px' }}>
              {/* Only renders when a creator code is stored — see lib/discount.ts */}
              <DiscountBadge />

              {/* Preorder timing, stated next to the price rather than buried
                  in an accordion. Unexpected wait times are a top reason people
                  abandon at this exact point. */}
              {isPreorder && shippingLabel && (
                <p
                  style={{
                    fontFamily: sans, fontSize: '12.5px', fontWeight: 600,
                    color: maroon, backgroundColor: blushBg,
                    border: `1px solid ${rule}`, borderRadius: '10px',
                    padding: '10px 14px', margin: '0 0 12px', lineHeight: 1.5,
                  }}
                >
                  ✦ preorder — {shippingLabel.toLowerCase()}. you&apos;re charged today and
                  we ship the moment it lands.
                </p>
              )}
              {buyable ? (
                /* ── Buyable: add to cart ── */
                <>
                  {cartQty === 0 ? (
                    <button
                      onClick={handleBuy}
                      style={{
                        display: 'block',
                        width: '100%',
                        boxSizing: 'border-box',
                        backgroundColor: maroon,
                        cursor: 'pointer',
                        color: 'white',
                        padding: '16px 28px',
                        fontFamily: sans,
                        fontSize: '15px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'lowercase',
                        border: 'none',
                        borderRadius: '100px',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {/* Always a real, live CTA with the price in it. Tapping
                          without a size opens the picker instead of doing
                          nothing — a dead button reads as a broken page. */}
                      {isPreorder ? 'preorder' : 'add to cart'} — ${(product.price / 100).toFixed(2)}
                    </button>
                  ) : (
                    /* ── In the cart: quantity stepper ── */
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: `1.5px solid ${maroon}`,
                        borderRadius: '100px',
                        padding: '6px 8px',
                        backgroundColor: 'white',
                      }}
                    >
                      <button
                        onClick={() => setQty(cartQty - 1)}
                        aria-label={cartQty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                        style={{
                          width: '44px', height: '44px', flexShrink: 0,
                          borderRadius: '50%', border: 'none', cursor: 'pointer',
                          backgroundColor: blushBg, color: maroon,
                          fontFamily: sans, fontSize: '20px', fontWeight: 700, lineHeight: 1,
                        }}
                      >
                        −
                      </button>

                      <span
                        style={{
                          fontFamily: sans, fontSize: '14px', fontWeight: 700,
                          color: maroon, textTransform: 'lowercase', textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cartQty} in cart
                      </span>

                      <button
                        onClick={() => cartQty < MAX_QTY && setQty(cartQty + 1)}
                        disabled={cartQty >= MAX_QTY}
                        aria-label="Increase quantity"
                        style={{
                          width: '44px', height: '44px', flexShrink: 0,
                          borderRadius: '50%', border: 'none',
                          cursor: cartQty >= MAX_QTY ? 'not-allowed' : 'pointer',
                          backgroundColor: maroon, color: 'white',
                          opacity: cartQty >= MAX_QTY ? 0.4 : 1,
                          fontFamily: sans, fontSize: '20px', fontWeight: 700, lineHeight: 1,
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                  {cartQty > 0 && (
                    <Link
                      href="/cart"
                      style={{
                        display: 'block',
                        width: '100%',
                        boxSizing: 'border-box',
                        marginTop: '10px',
                        padding: '14px 28px',
                        textAlign: 'center',
                        border: `1.5px solid ${maroon}`,
                        borderRadius: '100px',
                        color: maroon,
                        fontFamily: sans,
                        fontSize: '15px',
                        fontWeight: 700,
                        textTransform: 'lowercase',
                        textDecoration: 'none',
                      }}
                    >
                      view cart & check out →
                    </Link>
                  )}
                  {buyStatus === 'error' && (
                    <p style={{ ...bodyStyle, color: '#B85C49', textAlign: 'center', marginTop: '12px' }}>
                      something went wrong. please try again.
                    </p>
                  )}

                  {/* Shipping + returns, visible at the decision point instead
                      of collapsed inside the accordion further down the page. */}
                  <div className="pdp-strip pdp-strip--assure">
                    {[
                      // Preorders don't ship in 2–3 days — the banner above
                      // states their real window instead.
                      {
                        label: isPreorder ? 'ships from LA' : 'ships in 2–3 days',
                        href: '/footer-pages/shipping',
                      },
                      { label: 'easy returns', href: '/footer-pages/returns' },
                      { label: 'free exchanges', href: '/footer-pages/exchanges' },
                    ].map((x, i) => (
                      <Link key={x.label} href={x.href} className="pdp-strip-item">
                        {i > 0 && <span className="pdp-strip-sep">·</span>}
                        <span className="pdp-strip-mark">✦</span>
                        {x.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : lockedForLaunch ? (
                /* ── Sellable but shop not open yet ── */
                <>
                  <div
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      backgroundColor: 'rgba(169,68,92,0.12)',
                      color: maroon,
                      padding: '16px 28px',
                      fontFamily: sans,
                      fontSize: '15px',
                      fontWeight: 700,
                      textTransform: 'lowercase',
                      borderRadius: '100px',
                      textAlign: 'center',
                    }}
                  >
                    opens friday · 11am pt
                  </div>
                  <p style={{ ...bodyStyle, fontSize: '12px', textAlign: 'center', marginTop: '10px', lineHeight: 1.7 }}>
                    Club members shop 24 hours early.{' '}
                    <Link href="/invite" style={{ color: maroon, fontWeight: 600, textUnderlineOffset: '3px' }}>
                      join the club →
                    </Link>
                  </p>
                </>
              ) : (
                /* ── Not sellable yet (coming soon) ── */
                <>
                  <Link
                    href="/invite"
                    style={{
                      display: 'block',
                      boxSizing: 'border-box',
                      backgroundColor: maroon,
                      color: 'white',
                      padding: '16px 28px',
                      fontFamily: sans,
                      fontSize: '15px',
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

      {lightboxIdx !== null && (
        <ImageLightbox
          images={gallery}
          index={lightboxIdx}
          alt={`${product.name} — ${selectedColor}`}
          onClose={() => setLightboxIdx(null)}
          onIndexChange={setLightboxIdx}
        />
      )}

      {/* ── Sticky mobile buy bar ──
          Mobile only, appears once the hero image scrolls past. Keeps a live
          CTA on screen for the whole page instead of leaving it stranded under
          a tall gallery. */}
      {buyable && (
        <div
          className="pdp-buybar"
          data-visible={showStickyBar ? 'true' : 'false'}
          aria-hidden={!showStickyBar}
        >
          <div className="pdp-buybar-info">
            <span className="pdp-buybar-name">{product.name}</span>
            <span className="pdp-buybar-meta">
              {selectedColor.toLowerCase()}
              {selectedSize ? ` · ${selectedSize}` : ' · pick a size'}
            </span>
          </div>
          {/* Once it's in the cart the bar becomes a link to the cart. It used
              to keep calling handleBuy while reading "in cart", so tapping it
              silently piled on quantity and never went anywhere. */}
          {cartQty > 0 ? (
            <Link href="/cart" className="pdp-buybar-cta">
              view cart ({cartQty}) →
            </Link>
          ) : (
            <button onClick={handleBuy} className="pdp-buybar-cta">
              {isPreorder ? 'preorder' : 'add'} — ${(product.price / 100).toFixed(2)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
