'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import LaunchCountdown from '@/components/LaunchCountdown';

/**
 * Landing hero.
 *
 * Two different things depending on the screen:
 *
 *   desktop → ONE static image. No rotation, no dots, nothing moving.
 *   phones  → a two-slide carousel: swipe, tap the dots, auto-advances.
 *
 * Which product gets the desktop hero is DESKTOP_SLIDE below — one line.
 *
 * The split is deliberate rather than a compromise. On a phone a carousel is
 * how people expect to browse (they already swipe everything) and vertical
 * space is scarce enough that a second product would otherwise be a long
 * scroll away. On desktop a rotating hero mostly means the thing someone was
 * reading disappears, and both products are already side by side in the
 * panels further down the page.
 *
 * ── TWO CROPS PER SLIDE, AND WHY ─────────────────────────────────────────
 * A full-screen hero on a laptop is landscape; the shoot is 2:3 portrait. Fit
 * a portrait file into a landscape screen and about 40% of its height is all
 * you ever see — which is how you end up with a hero of somebody's knees.
 * No CSS setting fixes that: the visible slice is fixed by the two shapes.
 *
 * So each slide carries two files, and the browser picks one:
 *
 *   imageWide → a landscape crop, composed on the product, for desktop
 *   image     → the full portrait frame, for phones
 *
 * A phone screen is already portrait, so it shows the whole photo uncropped
 * and needs no special crop. Only the desktop file is cropped, and it is
 * cropped deliberately in an editor rather than blindly by the browser.
 *
 * ── SWAPPING A PHOTO ─────────────────────────────────────────────────────
 * Replace the files in /public/images-2/hero/. The wide ones want to be
 * roughly 16:10 and composed so the product fills the frame; the tall ones are
 * just the full portrait shot. Keep the wide file at least ~1600px across.
 * Nothing in this component needs to change — the paths stay the same.
 *
 * Current sources: shorts = confetti2.png (centre band, whole crouch in frame);
 * pants = model/olive-1.jpg (waist to knee, so the fold-over waist, both cargo
 * pockets, the carabiner and the flare are all visible). The pants file is the
 * one weak link — only a 1065px-wide copy of that shot exists in the repo, so
 * the wide crop is upscaled slightly. Drop in the original export and it
 * sharpens up with no code change.
 * ─────────────────────────────────────────────────────────────────────────
 */

const sans = 'var(--font-montserrat), system-ui, sans-serif';

/** Tall ÷ wide of the PORTRAIT files. Sizes the phone hero so nothing crops. */
const PHOTO_RATIO = 1.5;

/** Used until the real header is measured, and if its markup ever changes. */
const HEADER_FALLBACK_PX = 72;

/** At or above this width: one static image. Below: the carousel. */
const WIDE_FROM_PX = 821;

/**
 * The product shown in the static desktop hero. Sierra Shorts because it is
 * the one that's actually in stock — a preorder makes a poor first screen when
 * the alternative can ship in two days. Change the handle to switch it.
 */
const DESKTOP_SLIDE = 'sierra-shorts';

type Slide = {
  handle: string;
  /** Small line above the name — availability, not marketing. */
  eyebrow: string;
  name: string;
  /** Fallback cents, used only when Shopify is unreachable at build time. */
  fallbackPrice: number;
  cta: string;
  /** Landscape crop, desktop. */
  imageWide: string;
  /** Full portrait frame, phones. */
  image: string;
  alt: string;
};

const HERO = '/images-2/hero';

const SLIDES: Slide[] = [
  {
    handle: 'sierra-shorts',
    eyebrow: 'in stock · ships in 2–3 days',
    name: 'the sierra shorts',
    fallbackPrice: 6800,
    cta: 'shop shorts',
    imageWide: `${HERO}/shorts-wide.jpg`,
    image: `${HERO}/shorts-tall.jpg`,
    alt: 'Woman in the Sierra Shorts climbing sandstone at golden hour',
  },
  {
    handle: 'juniper-pant',
    eyebrow: 'preorder · ships mid sept',
    name: 'the juniper pant',
    fallbackPrice: 10800,
    cta: 'shop pants',
    imageWide: `${HERO}/pants-wide.jpg`,
    image: `${HERO}/pants-tall.jpg`,
    alt: 'Woman wearing the Juniper Pant in the Olive colorway',
  },
];

const DESKTOP_INDEX = Math.max(
  0,
  SLIDES.findIndex((s) => s.handle === DESKTOP_SLIDE),
);

/** $68 / $68.50 — whole dollars read cleaner in a hero. */
const priceLabel = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

const ROTATE_MS = 6000;
/** Horizontal travel, in px, that counts as a swipe rather than a tap. */
const SWIPE_PX = 44;

export default function HeroCarousel({
  prices = {},
}: {
  /** Live Shopify prices in cents, keyed by handle. Falls back per slide. */
  prices?: Record<string, number | undefined>;
}) {
  const [index, setIndex] = useState(DESKTOP_INDEX);
  // Auto-advance stops while someone is hovering, tabbing through, or has
  // asked the OS for less motion. A carousel that moves under a thumb about
  // to tap the button is a carousel that loses the tap.
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // null until measured on the client. The LAYOUT is driven by CSS media
  // queries either way; this only governs behaviour — timers, swipe, the
  // carousel ARIA role — none of which should exist on desktop.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  // Height of the fixed header, measured rather than hard-coded. Phones start
  // the hero below it so the top of the photo isn't behind an opaque bar.
  // Re-measures on resize: the nav wraps to two rows when narrow.
  const [topInset, setTopInset] = useState(HEADER_FALLBACK_PX);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${WIDE_FROM_PX}px)`);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = document.querySelector('.site-nav-wrap');
    if (!el) return;                     // header markup changed — keep the fallback
    const measure = () => setTopInset(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Someone who swiped to slide 2 on a phone and then rotated to landscape /
  // widened the window would otherwise land on the wrong static hero.
  useEffect(() => {
    if (isDesktop) setIndex(DESKTOP_INDEX);
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop !== false || paused || reducedMotion) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [isDesktop, paused, reducedMotion]);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start == null || isDesktop) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) < SWIPE_PX) return;
    go(index + (dx < 0 ? 1 : -1));
  };

  // Arrow keys once the carousel itself has focus — the only way to reach
  // slide 2 without a touchscreen. Pointless on desktop, where there is only
  // ever one slide.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isDesktop) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1); }
  };

  // Only announce a carousel where there is one. On desktop this is a plain
  // banner with one image, so the roving-slide semantics would be a lie.
  const carousel = isDesktop === false;

  return (
    <>
      <style>{`
        /* ══ DESKTOP — one static image ════════════════════════════════════
           Every other slide is display:none, which also keeps its photo from
           being downloaded at all (see loading="lazy" below) and keeps its
           button out of the tab order without any JS. */
        .hc-root {
          position: relative;
          width: 100%;
          overflow: hidden;
          height: 100svh;
          min-height: 640px;
          isolation: isolate;
          background: #2A1F1A;
        }
        .hc-slide { display: none; }
        .hc-slide[data-desktop='true'] {
          display: block;
          position: absolute;
          inset: 0;
          opacity: 1;
          pointer-events: auto;
        }
        .hc-dots { display: none; }

        .hc-figure {
          position: absolute;
          inset: 0;
          margin: 0;
          z-index: 0;
        }
        .hc-photo {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        /* Legibility scrim, weighted to the bottom where the type sits, with a
           light wash over the rest so white text survives a bright photo. */
        .hc-scrim {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              to top,
              rgba(24, 14, 10, 0.66) 0%,
              rgba(24, 14, 10, 0.40) 28%,
              rgba(24, 14, 10, 0.14) 60%,
              rgba(24, 14, 10, 0.12) 100%
            );
        }

        .hc-copy {
          position: absolute;
          left: 0;
          right: 0;
          bottom: clamp(72px, 12vh, 132px);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          padding: 0 clamp(20px, 5vw, 48px);
          color: #fff;
        }
        .hc-eyebrow {
          font-family: ${sans};
          font-size: clamp(11px, 1.2vw, 13px);
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: lowercase;
          margin: 0;
          opacity: 0.92;
          text-shadow: 0 1px 8px rgba(24, 14, 10, 0.5);
        }
        .hc-name {
          font-family: ${sans};
          font-weight: 700;
          font-size: clamp(32px, 5vw, 64px);
          letter-spacing: -0.03em;
          line-height: 1.04;
          text-transform: lowercase;
          margin: 0;
          text-shadow: 0 2px 18px rgba(24, 14, 10, 0.55);
        }
        .hc-price {
          font-family: ${sans};
          font-weight: 600;
          font-size: clamp(15px, 1.7vw, 19px);
          margin: 0;
          opacity: 0.95;
          text-shadow: 0 1px 10px rgba(24, 14, 10, 0.5);
        }
        .hc-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 16px 38px;
          border-radius: 999px;
          background: #fff;
          color: #1A1210;
          font-family: ${sans};
          font-size: clamp(13px, 1.5vw, 15px);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: lowercase;
          text-decoration: none;
          box-shadow: 0 8px 28px rgba(24, 14, 10, 0.28);
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .hc-cta:hover { transform: translateY(-2px); background: #F6EFEA; }
        .hc-cta:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }

        .hc-dot {
          position: relative;
          width: 30px;
          height: 3px;
          border: 0;
          border-radius: 999px;
          padding: 0;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.42);
          transition: background 0.25s ease, width 0.25s ease;
        }
        .hc-dot[aria-current='true'] { background: #fff; width: 44px; }
        /* Tap target without a visible box. */
        .hc-dot::before { content: ''; position: absolute; inset: -14px -4px; }

        /* ══ PHONES — the carousel ═════════════════════════════════════════
           Screen is already portrait, so the full frame fits edge to edge with
           nothing cropped, starting below the header. */
        @media (max-width: ${WIDE_FROM_PX - 1}px) {
          .hc-root {
            height: calc(var(--hc-top-inset, ${HEADER_FALLBACK_PX}px) + 100vw * ${PHOTO_RATIO});
            min-height: 0;
            background: none;
          }
          .hc-slide,
          .hc-slide[data-desktop='true'] {
            display: block;
            position: absolute;
            inset: var(--hc-top-inset, ${HEADER_FALLBACK_PX}px) 0 0 0;
            opacity: 0;
            pointer-events: none;
            transition: opacity 700ms ease;
          }
          .hc-slide[data-active='true'] {
            opacity: 1;
            pointer-events: auto;
          }
          @media (prefers-reduced-motion: reduce) {
            .hc-slide { transition: none; }
          }

          .hc-dots {
            display: flex;
            position: absolute;
            left: 0;
            right: 0;
            bottom: clamp(20px, 3vh, 28px);
            z-index: 4;
            justify-content: center;
            gap: 10px;
          }
          .hc-copy { bottom: clamp(52px, 9vh, 88px); gap: 10px; }
          .hc-name { font-size: clamp(32px, 8vw, 44px); }
          .hc-cta { padding: 15px 32px; }
        }
        @media (max-width: 400px) {
          .hc-name { font-size: 30px; }
          .hc-eyebrow { font-size: 10.5px; letter-spacing: 0.16em; }
        }
      `}</style>

      <section
        className="hc-root"
        style={{ '--hc-top-inset': `${topInset}px` } as React.CSSProperties}
        aria-label="Shop the collection"
        {...(carousel
          ? { 'aria-roledescription': 'carousel' as const, tabIndex: 0 }
          : {})}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {SLIDES.map((s, i) => {
          const active = i === index;
          const onDesktop = i === DESKTOP_INDEX;
          const price = priceLabel(prices[s.handle] ?? s.fallbackPrice);
          return (
            <div
              key={s.handle}
              className="hc-slide"
              data-active={active}
              data-desktop={onDesktop}
              {...(carousel
                ? {
                    role: 'group' as const,
                    'aria-roledescription': 'slide' as const,
                    'aria-label': `${i + 1} of ${SLIDES.length}: ${s.name}`,
                    'aria-hidden': !active,
                  }
                : {})}
            >
              {/* Plain <picture>, not next/image: next/image serves one file at
                  every width, and the whole point here is a different CROP per
                  breakpoint. These files are pre-sized and compressed, so the
                  optimiser has nothing left to do anyway. */}
              <figure className="hc-figure">
                <picture>
                  <source media={`(min-width: ${WIDE_FROM_PX}px)`} srcSet={s.imageWide} />
                  <img
                    className="hc-photo"
                    src={s.image}
                    alt={s.alt}
                    // The desktop slide is the LCP, so it is never lazy. The
                    // others are display:none on desktop, so lazy keeps the
                    // browser from fetching a photo it will never show; on a
                    // phone they're on screen and load immediately anyway.
                    loading={onDesktop ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={onDesktop ? 'high' : 'auto'}
                  />
                </picture>
              </figure>
              <div className="hc-scrim" />

              <div className="hc-copy">
                <p className="hc-eyebrow">{s.eyebrow}</p>
                {/* h2, not h1 — the page's one h1 is the positioning line in
                    the about section. Two rotating h1s would fight it. */}
                <h2 className="hc-name">{s.name}</h2>
                <p className="hc-price">{price}</p>
                <Link
                  href={`/products/${s.handle}`}
                  className="hc-cta"
                  // On desktop the other slides are display:none, so they're
                  // already out of the tab order. On a phone this keeps the
                  // hidden slide's button unreachable mid-fade.
                  tabIndex={active ? 0 : -1}
                >
                  {s.cta}
                  <span aria-hidden>→</span>
                </Link>
                <LaunchCountdown tone="light" />
              </div>
            </div>
          );
        })}

        <div className="hc-dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.handle}
              type="button"
              className="hc-dot"
              aria-current={i === index}
              aria-label={`Show ${s.name}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
