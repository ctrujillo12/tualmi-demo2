import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LaunchCountdown from '@/components/LaunchCountdown';
import PanelShopLink from '@/components/PanelShopLink';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';

// ─── Design tokens ────────────────────────────────────────────────────────────
const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const serif  = "'Cormorant Garamond', Georgia, serif";
const maroon = '#A9445C';
const blushBg = '#FBF1F5';

const HERO_IMAGE = '/images-2/funky-rock0.jpg';

// Product structured data — all items are shown on this page. Availability +
// verified fabric per item; PreOrder for the drop, InStock for the tote.
const SITE = 'https://tualmi.com';
const productsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Product',
      name: 'Sierra Shorts',
      brand: { '@type': 'Brand', name: 'Tualmi' },
      category: 'Women’s Hiking Apparel',
      material: '100% recycled nylon',
      description:
        'Mid-rise, relaxed-fit women’s hiking shorts with a flattering, women-engineered cut, deep pockets sized for a full phone, and bold, print-forward colorways. Made from 100% recycled nylon.',
      image: `${SITE}/images-2/model/jam-2.jpg`,
      offers: {
        '@type': 'Offer', price: '68.00', priceCurrency: 'USD',
        availability: 'https://schema.org/PreOrder', url: `${SITE}/products/sierra-shorts`,
      },
    },
    {
      '@type': 'Product',
      name: 'Juniper Pant',
      brand: { '@type': 'Brand', name: 'Tualmi' },
      category: 'Women’s Hiking Apparel',
      material: 'Sustainable, recycled materials',
      description:
        'Fashion-forward flare cargo pants that are genuinely trail-ready, with a flattering fold-over waist, functional cargo pockets, and a flared leg crafted for women’s proportions, not scaled down from a men’s pattern. Made from sustainable, recycled materials.',
      image: `${SITE}/images-2/model/birch-3.jpg`,
      offers: {
        '@type': 'Offer', price: '108.00', priceCurrency: 'USD',
        availability: 'https://schema.org/PreOrder', url: `${SITE}/products/juniper-pant`,
      },
    },
    // Tioga Tee & Frolic Fleece are "coming soon" — not listed as products yet.
  ],
};

// ─── Collection: one sticky panel per product, showing all its colorways ───────
interface DropProduct {
  handle: string;
  name: string;
  availability: string; // small eyebrow above the name ('' = hide it)
  shopLabel: string;    // CTA text, e.g. 'shop shorts'
  bg: string;      // panel background (drives the scroll color-change)
  accent: string;  // heading / text color
  colorways: { color: string; swatch: string; image: string }[];
}

// Landing-page cover shot per colorway. Kept separate from the product-page
// gallery order (PRODUCT_COLOR_IMAGES) so the landing can lead with a different
// photo than the PDP. Falls back to the gallery lead if unset.
const MP = '/images-2/model';
const LANDING_COVERS: Record<string, Record<string, string>> = {
  'sierra-shorts': {
    Jam:      `${MP}/jam-5.jpg`,
    Picnic:   `${MP}/picnic-2.jpg`,
    Confetti: `${MP}/confetti-1.jpg`,
  },
  'juniper-pant': {
    Birch: `${MP}/birch-4.jpg`,
    Olive: `${MP}/olive-3.jpg`,
  },
};

const coverFor = (handle: string, color: string) =>
  LANDING_COVERS[handle]?.[color] ?? PRODUCT_COLOR_IMAGES[handle]?.[color]?.[0] ?? '';

const DROP_PRODUCTS: DropProduct[] = [
  {
    handle: 'sierra-shorts',
    name: 'the sierra shorts',
    availability: '',
    shopLabel: 'shop shorts',
    bg: '#EED0C1',
    accent: '#A94E38',
    colorways: (PRODUCT_COLORS['sierra-shorts'] ?? []).map((c) => ({
      color: c.name,
      swatch: c.value,
      image: coverFor('sierra-shorts', c.name),
    })),
  },
  {
    handle: 'juniper-pant',
    name: 'the juniper pant',
    availability: 'preorder · ships late aug',
    shopLabel: 'shop pants',
    bg: '#C9D3AC',
    accent: '#68764A',
    colorways: (PRODUCT_COLORS['juniper-pant'] ?? []).map((c) => ({
      color: c.name,
      swatch: c.value,
      image: coverFor('juniper-pant', c.name),
    })),
  },
];

const COMING_SOON = [
  { name: 'tioga tee', image: '/images-2/model/tioga-1.jpg' },
  { name: 'frolic fleece', image: '/images-2/model/frolic-1.jpg' },
];

// ─── Social TikToks ───────────────────────────────────────────────────────────
const TIKTOKS = [
  {
    video: '/videos/clip-1.mp4',
    poster: '/videos/poster-1.jpg',
    url: 'https://www.tiktok.com/@tualmi.outdoors/video/7625759601576660238',
  },
  {
    video: '/videos/clip-2.mp4',
    poster: '/videos/poster-2.jpg',
    url: 'https://www.tiktok.com/@tualmi.outdoors/video/7611273720295984398',
  },
  {
    video: '/videos/clip-3.mp4',
    poster: '/videos/poster-3.jpg',
    url: 'https://www.tiktok.com/@tualmi.outdoors/video/7666576797592456461',
  },
  {
    video: '/videos/clip-4.mp4',
    poster: '/videos/poster-4.jpg',
    url: 'https://www.tiktok.com/@tualmi.outdoors',
  },
];

const TIKTOK_URL = 'https://www.tiktok.com/@tualmi.outdoors';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      {/* ══ 1 · HERO ══════════════════════════════════════════════════════ */}
      <section className="hero-viewport" style={{ position: 'relative', minHeight: '560px', overflow: 'hidden' }}>
        <Image
          src={HERO_IMAGE}
          alt="Tualmi Outdoors"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 33%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,12,8,0.18)' }} />

        {/* Centered logo lockup + subtle launch countdown */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(18px, 4vh, 32px)',
            zIndex: 1,
          }}
        >
          <div
            className="hero-center"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 56px)',
            }}
          >
            <span className="hero-est" style={heroEstStyle}>EST</span>
            <div className="hero-lockup" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images-2/logo2-brown.png"
                alt=""
                style={{ height: 'clamp(60px, 9vw, 120px)', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
              <span
                className="hero-wordmark"
                style={{
                  fontFamily: serif,
                  fontSize: 'clamp(64px, 10vw, 140px)',
                  fontWeight: 400,
                  color: 'white',
                  lineHeight: 1,
                }}
              >
                Tualmi
              </span>
            </div>
            <span className="hero-est" style={heroEstStyle}>2026</span>
          </div>

          <LaunchCountdown tone="light" />

          {/* Straight-to-product CTAs. Most cold traffic arrives on mobile from
              social and bounces before scrolling, so the two buys need to be
              reachable without any scrolling at all. */}
          <div className="hero-ctas">
            <Link href="/products/sierra-shorts" className="hero-cta">
              shop shorts
            </Link>
            <Link href="/products/juniper-pant" className="hero-cta">
              shop pants
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 2 · ABOUT ═════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: blushBg, padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 72px)', position: 'relative' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 'clamp(16px, 5vw, 64px)',
              letterSpacing: '-0.03em',
              color: maroon,
              margin: '0 0 clamp(32px, 5vw, 56px)',
              textTransform: 'lowercase',
              whiteSpace: 'nowrap',
            }}
          >
            actually cute outdoors gear.
          </h1>

          <p style={{ fontFamily: sans, fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 500, lineHeight: 2, color: '#D48CA0', margin: '0 0 clamp(20px, 3vw, 28px)', textAlign: 'left' }}>
            Tualmi is a women-owned outdoor apparel brand built on a simple idea: women deserve
            fashion-forward hiking gear engineered for their bodies, not scaled down from men&apos;s
            patterns. Every piece pairs technical, trail-ready performance with a flattering,
            women-specific fit and bold, print-forward colorways.
          </p>
          <p style={{ fontFamily: sans, fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 500, lineHeight: 2, color: '#D48CA0', margin: '0 0 clamp(28px, 4vw, 44px)', textAlign: 'left' }}>
            Sustainably made in a WRAP-certified facility.
          </p>

          <div style={{ textAlign: 'left' }}>
            <Link href="/invite" style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: maroon, textTransform: 'lowercase', textDecorationThickness: '1px', textUnderlineOffset: '4px' }}>
              join the club
            </Link>
          </div>
        </div>

        <Link
          href="/story"
          style={{
            position: 'absolute',
            left: 'clamp(20px, 4vw, 56px)',
            top: '50%',
            fontFamily: sans,
            fontSize: '13px',
            fontWeight: 500,
            color: maroon,
            textDecoration: 'none',
            textTransform: 'lowercase',
          }}
          className="hidden md:block"
        >
          our story
        </Link>
      </section>

      {/* ══ 3 · THE DROP — one panel per product, all colorways shown ═════ */}
      {/* Two stacked colored bands; the background changes from the shorts
          panel to the pants panel as you scroll between them. */}
      <div id="collection">
        {DROP_PRODUCTS.map((p) => (
          <section
            key={p.handle}
            className="panel-viewport"
            style={{
              // Normal stacked sections (no sticky overlap), so nothing ever
              // slides up over the preview button. Each colored band is shorter
              // than a screen; the color just changes as you scroll between them.
              position: 'relative',
              minHeight: '72svh',
              backgroundColor: p.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(56px, 7vh, 84px) clamp(16px, 4vw, 48px) clamp(48px, 6vh, 72px)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'clamp(16px, 2.4vh, 26px)', maxWidth: '1240px', width: '100%' }}>
              <div>
                {p.availability && (
                  <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '12px', letterSpacing: '0.18em', color: p.accent, margin: '0 0 8px', textTransform: 'lowercase' }}>
                    {p.availability}
                  </p>
                )}
                <h3 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 40px)', letterSpacing: '-0.02em', color: p.accent, margin: 0, textTransform: 'lowercase' }}>
                  {p.name}
                </h3>
              </div>

              {/* All colorways, side by side */}
              <div className="colorway-row">
                {p.colorways.map((cw) => (
                  <Link
                    key={cw.color}
                    href={`/products/${p.handle}?color=${encodeURIComponent(cw.color)}`}
                    className="colorway-tile"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="colorway-photo">
                      <Image
                        src={cw.image}
                        alt={`${p.name} in ${cw.color}`}
                        fill
                        quality={90}
                        sizes="(max-width: 768px) 33vw, 420px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: sans, fontWeight: 600, fontSize: '13px', color: p.accent, margin: '9px 0 0', textTransform: 'lowercase' }}>
                      <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: cw.swatch, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)', flexShrink: 0 }} />
                      {cw.color.toLowerCase()}
                    </p>
                  </Link>
                ))}
              </div>

              <PanelShopLink handle={p.handle} accent={p.accent} label={p.shopLabel} />
            </div>
          </section>
        ))}
      </div>

      {/* ══ 4b · COMING SOON (afterthought) ═══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, backgroundColor: blushBg, padding: 'clamp(56px, 8vw, 96px) clamp(24px, 6vw, 72px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '12px', letterSpacing: '0.22em', color: '#C9849A', margin: '0 0 20px', textTransform: 'lowercase' }}>
            also coming soon
          </p>
          <div style={{ display: 'inline-flex', gap: 'clamp(18px, 4vw, 40px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {COMING_SOON.map((cs) => (
              <div key={cs.name} style={{ width: 'clamp(120px, 30vw, 180px)' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white', opacity: 0.75 }}>
                  <Image src={cs.image} alt={cs.name} fill sizes="180px" style={{ objectFit: 'cover' }} />
                </div>
                <p style={{ fontFamily: sans, fontWeight: 600, fontSize: '13px', color: '#C9849A', margin: '10px 0 0', textTransform: 'lowercase' }}>
                  {cs.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5 · SOCIALS ═══════════════════════════════════════════════════ */}
      <section
        id="socials"
        style={{
          position: 'relative',
          zIndex: 1, // sits above the last sticky panel
          backgroundColor: '#F79EC6',
          padding: 'clamp(56px, 8vw, 96px) clamp(24px, 6vw, 72px) clamp(64px, 9vw, 110px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: sans, fontWeight: 600, fontSize: '14px', color: 'white', margin: '0 0 6px', textTransform: 'lowercase', letterSpacing: '0.02em' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images-2/instagram-white-icon.webp"
                alt=""
                style={{ height: '18px', width: '18px', objectFit: 'contain' }}
              />
              get to know
            </p>
            <h2
              style={{
                fontFamily: sans,
                fontWeight: 800,
                fontSize: 'clamp(38px, 6vw, 72px)',
                letterSpacing: '-0.02em',
                color: 'white',
                margin: '0 0 clamp(32px, 4vw, 48px)',
                textTransform: 'lowercase',
              }}
            >
              @tualmioutdoors
            </h2>
          </a>

          <div
            className="socials-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(16px, 2.5vw, 32px)',
            }}
          >
            {TIKTOKS.map((reel) => (
              <a key={reel.video} href={reel.url} target="_blank" rel="noopener noreferrer" aria-label="Watch on TikTok">
                <div style={{ position: 'relative', aspectRatio: '9 / 16', borderRadius: '14px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.25)' }}>
                  <video
                    src={reel.video}
                    poster={reel.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const heroEstStyle: CSSProperties = {
  fontFamily: sans,
  fontSize: 'clamp(14px, 1.8vw, 22px)',
  fontWeight: 500,
  letterSpacing: '0.2em',
  color: 'white',
};
