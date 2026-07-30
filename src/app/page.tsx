import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LaunchCountdown from '@/components/LaunchCountdown';
import PanelShopLink from '@/components/PanelShopLink';

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
      image: `${SITE}/images-2/shortsandshoes.jpg`,
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
      image: `${SITE}/images-2/running-shorts1.jpg`,
      offers: {
        '@type': 'Offer', price: '108.00', priceCurrency: 'USD',
        availability: 'https://schema.org/PreOrder', url: `${SITE}/products/juniper-pant`,
      },
    },
    {
      '@type': 'Product',
      name: 'Tioga Tee',
      brand: { '@type': 'Brand', name: 'Tualmi' },
      category: 'Women’s Hiking Apparel',
      material: 'Sustainable, recycled materials',
      description:
        'A flattering, second-skin women’s hiking tee with UPF 40 sun protection and a women-specific cut. Sustainably made from recycled materials.',
      image: `${SITE}/images-2/shirt-yellow-bg.png`,
      offers: { '@type': 'Offer', availability: 'https://schema.org/PreOrder', priceCurrency: 'USD' },
    },
    {
      '@type': 'Product',
      name: 'Frolic Fleece',
      brand: { '@type': 'Brand', name: 'Tualmi' },
      category: 'Women’s Hiking Apparel',
      material: '100% recycled polyester',
      description:
        'A fashion-forward, mid-weight women’s hiking fleece with a chest zip pocket, snap collar, and kangaroo pocket. Made from 100% recycled polyester in prints the legacy brands never made.',
      image: `${SITE}/images-2/fleece-pink-bg.png`,
      offers: { '@type': 'Offer', availability: 'https://schema.org/PreOrder', priceCurrency: 'USD' },
    },
  ],
};

// ─── Product scroll panels ────────────────────────────────────────────────────
interface ProductPanel {
  handle: string;
  title: string;
  copy: string;
  availability: string;
  note?: string;   // small line under availability (e.g. ship delay)
  bg: string;      // section background
  accent: string;  // heading color
  body: string;    // paragraph color
  image: string;
}

const PRODUCT_PANELS: ProductPanel[] = [
  {
    handle: 'sierra-shorts',
    title: 'the sierra shorts:',
    copy: 'Fast-dry and water-repellent performance, ultra-light, with roomy, wide-leg room. Made from 100% recycled material in patterns people will ask you about on the trail.',
    availability: 'available july 31',
    bg: '#F6E3DC',
    accent: '#B85C49',
    body: '#CC8271',
    image: '/images-2/shortsandshoes.jpg',
  },
  {
    handle: 'juniper-pant',
    title: 'the juniper pant:',
    copy: "Flare cargo hiking pants with a fold-over waist, cargo pockets, and a flattering flared leg. The hiking pants you've been dreaming of.",
    availability: 'preorder july 31',
    note: 'ships late august (small delay, worth the wait)',
    bg: '#D9DFC5',
    accent: '#7C8A55',
    body: '#96A26D',
    image: '/images-2/product-photos/juniper.jpeg',  },
  {
    handle: 'alpine-baby-tee',
    title: 'the tioga tee:',
    copy: 'A flattering, second-skin hiking tee with UPF 40 sun protection and a women-specific cut that looks good on the summit. Sustainably made from recycled materials.',
    availability: 'coming soon',
    bg: '#FBE9EF',
    accent: '#EC9DBC',
    body: '#F2B7CD',
    image: '/images-2/shorts-holdinghands.jpg',  },
  {
    handle: 'trailblazing-fleece',
    title: 'the frolic fleece:',
    copy: 'A mid-weight fleece with a chest zip pocket, snap collar, and kangaroo pocket.',
    availability: 'coming soon',
    bg: '#FCF8E3',
    accent: '#D2BE35',
    body: '#DBCB6A',
    image: '/images-2/cayla-redshorts.jpg',  },
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

      {/* ══ 3 · PREVIEW OUR COLLECTION ════════════════════════════════════ */}
      <section style={{ backgroundColor: maroon, padding: 'clamp(64px, 9vw, 120px) clamp(24px, 6vw, 72px)', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 'clamp(36px, 6vw, 72px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'white',
            margin: 0,
            textTransform: 'lowercase',
          }}
        >
          the first collection,
          <br />
          coming this summer
        </h2>
        <Link
          href="#collection"
          style={{
            display: 'inline-block',
            marginTop: 'clamp(24px, 3.5vw, 40px)',
            fontFamily: sans,
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            textTransform: 'lowercase',
            textUnderlineOffset: '4px',
          }}
        >
          preview our collection →
        </Link>
      </section>

      {/* ══ 4 · STICKY PRODUCT SCROLL ═════════════════════════════════════ */}
      {/* Each panel sticks while the next scrolls up over it */}
      <div id="collection">
        {PRODUCT_PANELS.map((panel) => (
          <section
            key={panel.handle}
            className="panel-viewport"
            style={{
              position: 'sticky',
              top: 0,
              minHeight: '560px',
              backgroundColor: panel.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(24px, 5vw, 64px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(32px, 6vw, 96px)',
                maxWidth: '1040px',
                width: '100%',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {/* Photo */}
              <div
                className="panel-photo"
                style={{
                  position: 'relative',
                  // Capped by viewport height too, so the 4:5 card always fits
                  // on shorter screens (Windows laptops etc.)
                  width: 'min(clamp(280px, 38vw, 460px), 58svh)',
                  aspectRatio: '4 / 5',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Image
                  src={panel.image}
                  alt={panel.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 340px"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Copy */}
              <div style={{ maxWidth: '440px', textAlign: 'left' }}>
                <p
                  style={{
                    fontFamily: sans,
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.14em',
                    color: panel.accent,
                    margin: '0 0 10px',
                    textTransform: 'lowercase',
                  }}
                >
                  {panel.availability}
                </p>
                {panel.note && (
                  <p
                    style={{
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: '11px',
                      lineHeight: 1.5,
                      color: panel.body,
                      margin: '-4px 0 14px',
                      textTransform: 'lowercase',
                    }}
                  >
                    {panel.note}
                  </p>
                )}
                {['sierra-shorts', 'juniper-pant'].includes(panel.handle) ? (
                  <Link href={`/products/${panel.handle}`} style={{ textDecoration: 'none' }}>
                    <h3
                      style={{
                        fontFamily: sans,
                        fontWeight: 700,
                        fontSize: 'clamp(24px, 3vw, 34px)',
                        letterSpacing: '-0.02em',
                        color: panel.accent,
                        margin: '0 0 clamp(20px, 3vw, 32px)',
                        textTransform: 'lowercase',
                      }}
                    >
                      {panel.title}
                    </h3>
                  </Link>
                ) : (
                  <h3
                    style={{
                      fontFamily: sans,
                      fontWeight: 700,
                      fontSize: 'clamp(24px, 3vw, 34px)',
                      letterSpacing: '-0.02em',
                      color: panel.accent,
                      margin: '0 0 clamp(20px, 3vw, 32px)',
                      textTransform: 'lowercase',
                    }}
                  >
                    {panel.title}
                  </h3>
                )}
                <p
                  style={{
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 'clamp(14px, 2vw, 22px)',
                    lineHeight: 1.75,
                    color: panel.body,
                    margin: '0 0 clamp(20px, 3vw, 28px)',
                  }}
                >
                  {panel.copy}
                </p>
                {['sierra-shorts', 'juniper-pant'].includes(panel.handle) ? (
                  <PanelShopLink handle={panel.handle} accent={panel.accent} />
                ) : (
                  <Link
                    href="/invite"
                    style={{
                      fontFamily: sans,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: panel.accent,
                      textTransform: 'lowercase',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    join the club
                  </Link>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

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
