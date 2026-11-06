import type { Metadata } from 'next';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import ProductDropPanel from '@/components/ProductDropPanel';
import { getProduct } from '@/lib/products';
import { DROP_PRODUCTS } from '@/lib/dropProducts';
import { DEFAULT_OG } from '@/lib/og';

// Per-page, NOT in layout.tsx: a canonical set in the root layout is inherited
// by every page that doesn't override it (cart, share...) and would point them
// all at the homepage.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  // Spread, not just { url }: a page's openGraph REPLACES the layout's, so
  // setting only the url dropped the image and the link previewed bare.
  openGraph: { ...DEFAULT_OG, url: '/' },
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const sans   = 'var(--font-montserrat), system-ui, sans-serif';

/**
 * Palette.
 *
 * Anchored on the sage sampled from the approved hero comp (#7C8252) — the
 * same green as the shipping strip above the nav, so the top of the page and
 * the bottom of it are visibly the same brand.
 *
 * The page used to run on #A9445C maroon over #FBF1F5 blush, with a #F79EC6
 * socials band that was the loudest thing on the site and the reason the whole
 * page read as "bright pink". Pink is still here — it owns the shorts band and
 * the small eyebrows — it just no longer runs the page.
 */
const sage     = '#7C8252';  // green  — hero CTA, shipping strip, socials
const sageDeep = '#5F6742';  // green  — headings and labels on light grounds
const cream    = '#F7F2E4';  // cream  — the light ground, replacing blush
const ink      = '#5F5C46';  // body copy; blush-pink text on cream is unreadable
const rose     = '#C97C93';  // pink   — eyebrows and accents
const brick    = '#A9503A';  // red    — links and the shorts band accent

// Structured data for the homepage: a list of what's for sale, by URL.
//
// This used to be a hand-typed Product block per item, with its own price and
// availability. That was a second, static source for numbers the product pages
// already derive live from Shopify, and it drifted (both bottoms sat at
// PreOrder here long after they shipped; Sierra in Picnic is on preorder now
// and this block still said InStock). Merchant Center suspends accounts for
// exactly that mismatch, and the account has already had one Misrepresentation
// rejection. Product markup also belongs on the product's own page, not on a
// page that lists several. So the homepage now points at the product pages
// and lets their ProductGroup markup be the single source of truth.
const SITE = 'https://www.tualmi.com';
const productsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Tualmi women’s hiking clothes',
  itemListElement: [
    { '@type': 'ListItem', position: 1, url: `${SITE}/products/juniper-pant`, name: 'Juniper Pant: women’s flare cargo hiking pants' },
    { '@type': 'ListItem', position: 2, url: `${SITE}/products/sierra-shorts`, name: 'Sierra Shorts: women’s recycled nylon hiking shorts' },
  ],
};

// ─── Collection: one sticky panel per product, showing all its colorways ───────
// DropProduct, priceLabel, colorwaysFor, DROP_PRODUCTS etc. moved to
// lib/dropProducts.ts, alongside components/ProductDropPanel.tsx (the panel
// markup itself) — the shop page (app/collections/page.tsx) renders the exact
// same panels now, so the data and the JSX both live in one place rather than
// as two copies that could drift.

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

/**
 * Where the socials block sends people.
 *
 * The videos are TikToks and each tile still opens the clip on TikTok — that's
 * where they live. But every *social* link on the site (the icon and the big
 * handle here, the tag prompt on /in-the-wild) points at Instagram, which is
 * the account we want people to land on and follow.
 */
const INSTAGRAM_URL = 'https://www.instagram.com/tualmioutdoors';

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Home() {
  // Fetched here (server-side) so the landing-page quick-add builds cart lines
  // from real Shopify variants rather than partial static config.
  const [shortsProduct, pantProduct] = await Promise.all([
    getProduct('sierra-shorts').catch(() => null),
    getProduct('juniper-pant').catch(() => null),
  ]);
  const productFor = (handle: string) =>
    handle === 'sierra-shorts' ? shortsProduct : handle === 'juniper-pant' ? pantProduct : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />
      {/* ══ 1 · HERO — shoppable carousel ═══════════════════════════════ */}
      {/* One slide per product: photo, price, and a button straight to the
          PDP. Prices are handed down from the Shopify fetch above so the hero
          can't drift from the panels further down the page. */}
      <HeroCarousel
        prices={{
          'sierra-shorts': shortsProduct?.price,
          'juniper-pant': pantProduct?.price,
        }}
      />

      {/* ══ 2 · THE DROP — one panel per product, all colorways shown ═════ */}
      {/* Two stacked colored bands; the background changes from the shorts
          panel to the pants panel as you scroll between them. Panel markup
          lives in components/ProductDropPanel.tsx, shared with the shop page
          (/collections) — see lib/dropProducts.ts for why. */}
      <div id="collection">
        {DROP_PRODUCTS.map((p) => (
          <ProductDropPanel key={p.handle} drop={p} resolvedProduct={productFor(p.handle)} />
        ))}
      </div>

      {/* ══ 3 · ABOUT ═════════════════════════════════════════════════════ */}
      {/* Below the products at every width (Oct 2026): the hero already
          sells, so the first scroll goes to the products and the brand
          story follows for anyone still deciding. */}
      {/* Kept short on mobile (see .home-about in globals.css): every pixel of
          brand copy here is a pixel between an ad click and a product. */}
      <section className="home-about" style={{ backgroundColor: cream, padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 72px)', position: 'relative' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          {/* The slogan, matched to the story page's heading so the two read
              as one brand rather than two drafts.

              SIZE: this is five characters longer than "actually cute outdoors
              gear." was, and the line is nowrap, so the old clamp overflowed
              the 860px column — 1140px at the 64px cap, and 347px into 342px
              of usable width on a 390px phone. (The old slogan overflowed too
              above a 1280px viewport, at 959px; nothing clips it, so it went
              unnoticed.) 45px / 4.4vw holds one line from a 320px iPhone SE
              up, measured in a browser rather than eyeballed. If you want the big type back, drop whiteSpace and let
              it wrap to two lines instead. */}
          <h1
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 'clamp(15px, 4.4vw, 45px)',
              letterSpacing: '-0.03em',
              color: sageDeep,
              margin: '0 0 clamp(32px, 5vw, 56px)',
              textTransform: 'lowercase',
              whiteSpace: 'nowrap',
            }}
          >
            gear for a new kind of outdoorsy.
          </h1>

          {/* ── The about copy ──
              Supplied copy, used as written. It's the same language as the
              story page (src/app/story/page.tsx), so if you edit one, edit the
              other or the two pages start contradicting each other.

              No em dashes anywhere in this section. */}
          
          <p className="home-about-extra" style={{ fontFamily: sans, fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 500, lineHeight: 2, color: ink, margin: '0 0 clamp(20px, 3vw, 28px)', textAlign: 'left' }}>
            Why is so much women&apos;s outdoor gear still boxy, muted, and designed around the same
            very specific idea of what an &ldquo;outdoorsy person&rdquo; should look like?
          </p>
          <p style={{ fontFamily: sans, fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 500, lineHeight: 2, color: ink, margin: '0 0 clamp(20px, 3vw, 28px)', textAlign: 'left' }}>
            Tualmi makes technical outdoor gear designed for women from the start. Flattering fits,
            playful prints, and the performance to keep up with wherever you&apos;re headed; because you don&apos;t have to look, dress, or act a certain way to belong outside.
          </p>
          <p className="home-about-extra" style={{ fontFamily: sans, fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 500, lineHeight: 2, color: ink, margin: '0 0 clamp(28px, 4vw, 44px)', textAlign: 'left' }}>
            We make everything with a WRAP Gold Standard certified manufacturer, sustainably,
            ethically, and designed to last because we&apos;re not interested in adding to the pile.
          </p>

          {/* Both links live in the flow, so they are there at every width.
              "read our full story" used to be an absolutely-positioned link
              shown only above xl — this section is the only place on the
              landing page that tells the brand story, and on a phone it ended
              with no way to hear the rest of it. */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', textAlign: 'left' }}>
            <Link href="/trail-club" style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: brick, textTransform: 'lowercase', textDecorationThickness: '1px', textUnderlineOffset: '4px' }}>
              join the club
            </Link>
            <Link href="/story" style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: sageDeep, textTransform: 'lowercase', textDecorationThickness: '1px', textUnderlineOffset: '4px' }}>
              read our full story
            </Link>
          </div>
        </div>

      </section>

      {/* ══ 5 · SOCIALS ═══════════════════════════════════════════════════ */}
      <section
        id="socials"
        style={{
          position: 'relative',
          zIndex: 1, // sits above the last sticky panel
          // Sage, not the old #F79EC6 hot pink. This band and the shipping
          // strip at the very top are now the same green, so the page opens
          // and closes on the same color.
          backgroundColor: sage,
          padding: 'clamp(56px, 8vw, 96px) clamp(24px, 6vw, 72px) clamp(64px, 9vw, 110px)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tualmi on Instagram"
            style={{ textDecoration: 'none' }}
          >
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
