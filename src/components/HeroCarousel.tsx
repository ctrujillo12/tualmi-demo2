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
 * Current sources: pants = the two-model road shot, cropped from a 3081x2431
 * original to 2560x1600 (wide) and 1440x2160 (tall), both composed so the two
 * figures and both colourways stay whole. Shorts = confetti2.png (centre band,
 * whole crouch in frame).
 * ─────────────────────────────────────────────────────────────────────────
 */

const sans = 'var(--font-montserrat), system-ui, sans-serif';

/** Sampled from the approved hero comp — the same sage as the shipping strip. */
const sage     = '#7C8252';
const sageDeep = '#6B7145';
const cream    = '#FEFFF9';

/** Tall ÷ wide of the PORTRAIT files. Sizes the phone hero so nothing crops. */
const PHOTO_RATIO = 1.5;

/** Used until the real header is measured, and if its markup ever changes. */
const HEADER_FALLBACK_PX = 72;

/** At or above this width: one static image. Below: the carousel. */
const WIDE_FROM_PX = 821;

/**
 * The product shown in the static desktop hero.
 *
 * The Juniper Pant, because the pant is what we are promoting first. This used
 * to be the Sierra Shorts on the reasoning that a preorder makes a poor first
 * screen when the alternative ships in two days — that reasoning still holds
 * and is now a deliberate trade, not an oversight. If the pant's ship date
 * slips, this one line is how you put the shorts back in front.
 */
const DESKTOP_SLIDE = 'juniper-pant';

type Slide = {
  handle: string;
  /**
   * Small line above the name — availability, not marketing.
   *
   * Optional, and it is an ALL-OR-NOTHING field: on a phone both slides are
   * seen one after the other, and a slide carrying an extra line the next one
   * lacks makes the copy jump as the carousel turns. Set it on every slide or
   * on none. Currently none, because the comp has no eyebrow.
   */
  eyebrow?: string;
  name: string;
  /** Fallback cents, used only when Shopify is unreachable at build time. */
  fallbackPrice: number;
  cta: string;
  /**
   * Headline treatment for the lead slide: a line of positioning instead of
   * the availability eyebrow and the price. A slide WITHOUT one keeps the
   * original eyebrow + price treatment, so the two can coexist.
   */
  tagline?: string;
  /**
   * Show the live price under the tagline. Same all-or-nothing rule as
   * eyebrow. Off on both slides today: the approved hero comp has no price in
   * it, and desktop shows the pant slide only, so turning it on for the pant
   * would put a price on a screen the comp says has none. Flip both to true
   * if you decide the hero should quote prices.
   */
  showPrice?: boolean;
  /** Landscape crop, desktop. */
  imageWide: string;
  /** Full portrait frame, phones. */
  image: string;
  alt: string;
};

const HERO = '/images-2/hero';

const SLIDES: Slide[] = [
  {
    handle: 'juniper-pant',
    name: 'the juniper pants:',
    tagline: 'The most flattering hiking pants. Ever.',
    fallbackPrice: 10800,
    cta: 'shop',
    imageWide: `${HERO}/pants-wide.jpg`,
    image: `${HERO}/pants-tall.jpg`,
    alt: 'Two friends running down a mountain road, laughing, in the Juniper Pant in Birch and Olive',
  },
  {
    handle: 'sierra-shorts',
    name: 'the sierra shorts:',
    // Same shape as the pant's line — name, then one line of positioning — so
    // the two slides don't visibly change layout as the carousel turns. The
    // wording is the brand's own line from the site metadata rather than a
    // second "most flattering ... ever", which would read as a template.
    tagline: 'Built for the trail. Cute everywhere else.',
    fallbackPrice: 6800,
    cta: 'shop',
    imageWide: `${HERO}/shorts-wide.jpg`,
    image: `${HERO}/shorts-tall.jpg`,
    alt: 'Woman in the Sierra Shorts climbing sandstone at golden hour',
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
        /* Caps here, lowercase everywhere else on the site. The hero is the
           one place the brand shouts; the lowercase treatment resumes at the
           section headings directly below it. Change text-transform to
           lowercase if you want the quieter original back. */
        /* Sizes below are measured off the approved comp (1822x1044), not
           chosen: the headline's cap height there is 25px, which is a ~36px
           face — 1.98vw. The headline and the tagline come out very nearly
           the SAME size; the tagline is distinguished by weight and case, not
           by scale. Getting that wrong is what made the first pass read as a
           different design. */
        /* Weight 700, not 800. Everything else on this site — panel headings,
           buttons, the footer — is Montserrat 700, and an 800 hero was the
           single thing on the page set heavier than the rest of it.
           A NOTE ON THE COMP: it was set in a condensed face, not Montserrat.
           Montserrat is a wide typeface, so the same words at the same cap
           height run noticeably longer here than they do in the comp. That gap
           is a font difference, not a sizing bug, and it closes only by adding
           a condensed family to layout.tsx — which would be a new font on the
           site rather than the one we have. */
        /* ── All numbers below are measured off the close-up comp crop ──
           Scaled back to the comp's own 1822px width, it reads:
             headline    1.87vw, cap height 24px
             tagline     1.96vw  — LARGER than the headline, not smaller
             button text 1.87vw  — the same size as the headline
             button box  25vw wide, ~6.3% of frame height
             gaps        ~26px between all three, evenly
           The tagline being the biggest thing in the block is the detail that
           makes the comp read the way it does. */
        .hc-name {
          font-family: ${sans};
          font-weight: 700;
          font-size: clamp(19px, 1.87vw, 38px);
          letter-spacing: -0.04em;
          line-height: 1.1;
          text-transform: uppercase;
          margin: 0;
          text-shadow: 0 2px 18px rgba(24, 14, 10, 0.55);
          text-wrap: balance;
        }
        /* Sentence case on purpose — it is a sentence, and setting it in caps
           next to the name flattens the two into one block of shouting. */
        .hc-tagline {
          font-family: ${sans};
          font-weight: 400;
          font-size: clamp(20px, 1.96vw, 40px);
          letter-spacing: -0.03em;
          line-height: 1.25;
          margin: 0;
          text-shadow: 0 2px 16px rgba(24, 14, 10, 0.55);
          /* On a phone this line is wider than the screen and has to wrap.
             text-wrap: balance splits it into two even lines instead of
             leaving one orphaned word under a full one. Ignored by older
             browsers, which just get the ordinary ragged wrap.
             (No backticks in here -- this stylesheet is a JS template
             literal, and one would end it mid-rule.) */
          text-wrap: balance;
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
          /* Gap on .hc-copy spaces this evenly with the two lines above it,
             which is what the comp does — no extra top margin. */
          margin-top: 0;
          /* Comp: box is ~25vw wide around ~11vw of text, so the horizontal
             padding is generous — roughly 7vw a side. Corner is ~44% of the
             box height: emphatically rounded, but with flat top and bottom
             edges, so still a box rather than a pill. */
          /* Dialled back ~15% from the comp's own measurements, which made a
             button wide enough to compete with the headline above it. Same
             proportions, smaller box. */
          padding: clamp(11px, 1.3vh, 19px) clamp(32px, 5.8vw, 108px);
          /* In em, not px or vw, so the corner stays the same PROPORTION of
             the button at every breakpoint. On a vw clamp it drifted — 43% of
             the button's height at 1440 and 46% at 1822, which is why the
             curve looked inconsistent between screens.
             0.93em lands at ~48% of the height: smooth almost all the way
             round, with just enough straight edge top and bottom that it is
             still a box and not a pill. Raise toward 1em for a true pill. */
          border-radius: 0.93em;
          background: ${sage};
          color: ${cream};
          font-family: ${sans};
          font-size: clamp(14px, 1.6vw, 32px);
          font-weight: 700;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 8px 28px rgba(24, 14, 10, 0.28);
          transition: transform 0.18s ease, background 0.18s ease;
        }
        .hc-cta:hover { transform: translateY(-2px); background: ${sageDeep}; }
        .hc-cta:focus-visible { outline: 2px solid ${cream}; outline-offset: 4px; }

        /* Desktop: the copy sits left of centre because the models are on the
           right. Centred text would land on top of them. Below 821px the
           carousel takes over and the block re-centres, where the phone crop
           puts the models in the middle. */
        @media (min-width: ${WIDE_FROM_PX}px) {
          .hc-copy {
            /* All three lines in the comp are centred on 34.2% of the viewport
               width — left of centre, clear of the two models on the right.
               A full-width block spanning 0 to 68.4% centres its text on
               exactly that, at every width, with no clamp to drift. */
            right: auto;
            left: 0;
            width: 68.4%;
            /* Comp: the pill's bottom edge sits ~18% of the frame height up. */
            bottom: clamp(84px, 18vh, 200px);
            gap: clamp(14px, 2.5vh, 30px);
          }
        }

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
          /* Same relationship as desktop — tagline a touch larger than the
             name, button text level with the name. */
          .hc-name { font-size: clamp(20px, 5.4vw, 32px); }
          /* 5.6vw rather than the desktop 1.96vw ratio: at 390px the tagline
             is ~40 characters and has to take two lines whatever we do, so it
             is sized for two comfortable lines instead of two cramped ones. */
          .hc-tagline { font-size: clamp(17px, 5.6vw, 30px); }
          .hc-cta {
            padding: 12px clamp(26px, 7.6vw, 54px);
            font-size: clamp(15px, 4vw, 22px);
            /* border-radius intentionally not set here — the em rule above
               already scales it with the smaller mobile font size. */
          }
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
                {/* Every slide renders the same three or four elements, so
                    the carousel does not change shape between them. Which
                    optional lines appear is decided once in SLIDES, for all
                    slides at once — not per slide. */}
                {s.eyebrow && <p className="hc-eyebrow">{s.eyebrow}</p>}
                {/* h2, not h1 — the page's one h1 is the positioning line in
                    the about section. Two rotating h1s would fight it. */}
                <h2 className="hc-name">{s.name}</h2>
                {s.tagline && <p className="hc-tagline">{s.tagline}</p>}
                {s.showPrice && <p className="hc-price">{price}</p>}
                <Link
                  href={`/products/${s.handle}`}
                  className="hc-cta"
                  // On desktop the other slides are display:none, so they're
                  // already out of the tab order. On a phone this keeps the
                  // hidden slide's button unreachable mid-fade.
                  tabIndex={active ? 0 : -1}
                >
                  {s.cta}
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
