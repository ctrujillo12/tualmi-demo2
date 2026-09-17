'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickAdd from '@/components/QuickAdd';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES, cardFraming } from '@/lib/productColors';
import type { Product } from '@/types';

/**
 * "You might also like" — the standard DTC cart recommendation row: every
 * colourway of the drop that isn't already in the cart, plus the one-size
 * add-ons, all addable without leaving the page.
 *
 * The tote sits in here as an ordinary tile rather than in the order summary.
 * A cheap add-on pinned under the subtotal, next to a shipping number, reads
 * as a squeeze — the shopper can see you're selling her the gap. In the
 * recommendation row it's just the cheapest thing on offer, one tap away, and
 * she can do the free-shipping arithmetic herself if she wants to. Nothing
 * here mentions the threshold; <FreeShippingBar> already owns that message.
 *
 * Sits under the whole cart, below the checkout button. The order of operations
 * matters: someone reads the total, decides they're done, and only then is it
 * fair to show them a second pair of shorts. Putting this above the summary
 * would push the total down the page, which is the number they came to see.
 *
 * Adding uses the same <QuickAdd> as the landing page, with `stayOnPage` so it
 * confirms inline instead of navigating to the cart you're already on. Sharing
 * that component is deliberate — it owns the variant snapshot, the preorder
 * flags and the analytics event, and a second copy of that logic here would
 * drift and start producing cart lines that fail at checkout.
 *
 * NOT RENDERING? There are exactly three reasons, and the last two log a
 * warning in development:
 *   1. the cart is empty — cart/page.tsx returns its "nothing here yet"
 *      screen before it ever reaches this component
 *   2. /api/products didn't answer (a new route folder sometimes needs the
 *      dev server restarted)
 *   3. every colourway is already in the cart, so there is nothing to offer
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';

/** Which products to offer, in order. Colourways come from PRODUCT_COLORS. */
const UPSELL_HANDLES = ['sierra-shorts', 'juniper-pant'];

/**
 * One-size add-ons, shown first — they're the low-commitment tile, which is
 * where the eye goes and what most carts actually add. No colourway, no size
 * step, no product-page link (the tote is unlisted; see UNLISTED_HANDLES in
 * lib/products.ts, and there's no merchandised page to send anyone to).
 */
const ADDON_HANDLES = ['trailblazing-tote'];

/**
 * How much of a tile's height the model should fill, and where her centre
 * should sit — the same treatment the product page's "you may also like" row
 * uses, and the same numbers, so a shopper who came from that page sees the
 * garment at the size she just saw it at. See cardFraming() in
 * lib/productColors.ts for the arithmetic and why it is needed at all: the
 * studio set is not framed to a common scale, so jam's model is a fifth
 * larger than picnic's in the raw files.
 *
 * These work at BOTH of this tile's aspect ratios (3/4 on desktop, 4/5 on a
 * phone) without a second set of numbers. object-fit: contain fits a 2:3
 * source by its height in any box wider than 2:3, so the frame's height maps
 * 1:1 onto the tile's height at either ratio and the scale means the same
 * thing in both.
 */
const TILE_SUBJECT_HEIGHT = 0.84;
const TILE_SUBJECT_ANCHOR = 0.50;

/**
 * The one detail an add-on tile has to earn its click with.
 *
 * A tote is a shape everyone thinks they already know, so "tote bag · $__"
 * tells a shopper nothing she can decide on. The two things that are actually
 * true of this one — the fabric and the size — are what make it worth a tap.
 */
const ADDON_NOTES: Record<string, string> = {
  // U+2011 non-breaking hyphen: at three tiles across, a normal hyphen let
  // "extra-wide" break as "extra-" / "wide" and turned a two-line note into a
  // ragged three.
  'trailblazing-tote': '100% organic cotton · extra\u2011wide',
};

/** Everything fetched in one call, add-ons first. */
const ALL_HANDLES = [...ADDON_HANDLES, ...UPSELL_HANDLES];

/**
 * What stands in for a colourway on a one-size tile.
 *
 * "One Size" rather than something invented: it is the same words Shopify
 * puts on the variant and the same words QuickAdd and the cart line already
 * use for it, so a shopper sees one phrase for this idea across the whole
 * checkout rather than three.
 */
const ONE_SIZE_LABEL = 'One Size';

/** $68 / $68.50 — whole dollars read cleaner on a small tile. */
const priceLabel = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

type Tile = {
  key: string;
  product: Product;
  handle: string;
  /** null for a one-size add-on — no colourway, no swatch, no page link. */
  color: string | null;
  swatch: string | null;
  image?: string;
  /** Add-ons only: the fabric/fit line under the name. */
  note?: string;
  /** Scale + shift that make every model the same size. null = unmeasured. */
  framing?: { scale: number; shiftPct: number } | null;
};

export default function CartUpsell({ className = '' }: { className?: string }) {
  const items = useCartStore((s) => s.items);
  const [products, setProducts] = useState<Product[] | null>(null);

  // Client-side fetch: this page is a client component, so it can't call
  // getProduct() the way the landing page does. Products carry their Shopify
  // variants, which is what makes the added line survive checkout.
  useEffect(() => {
    let alive = true;
    fetch(`/api/products?handles=${ALL_HANDLES.join(',')}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`/api/products responded ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!alive) return;
        if (!d?.ok) throw new Error('/api/products returned ok:false');
        setProducts(d.products as Product[]);
      })
      .catch((err) => {
        // A failed upsell is not worth an error state in front of a shopper —
        // the section just doesn't render. But silence made this impossible to
        // debug ("why is the section missing?"), so say so in development.
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[CartUpsell] hidden — could not load products.', err);
        }
      });
    return () => { alive = false; };
  }, []);

  if (!products) return null;

  const byHandle = new Map(products.map((p) => [p.handle ?? p.id, p]));

  const inCart = (handle: string, color: string) =>
    items.some(
      (i) =>
        (i.product.handle ?? i.product.id) === handle &&
        i.selectedColor.toLowerCase() === color.toLowerCase(),
    );

  const addonTiles: Tile[] = ADDON_HANDLES.flatMap((handle) => {
    const product = byHandle.get(handle);
    if (!product) return [];
    // Already in the cart — offering it again is the thing that makes a
    // recommendation row feel like an upsell rather than a suggestion.
    if (items.some((i) => (i.product.handle ?? i.product.id) === handle)) return [];
    return [{
      key: handle,
      product,
      handle,
      color: null,
      swatch: null,
      image: product.images?.[0],
      note: ADDON_NOTES[handle],
    }];
  });

  const colorTiles: Tile[] = UPSELL_HANDLES.flatMap((handle) => {
    const product = byHandle.get(handle);
    if (!product) return [];
    return (PRODUCT_COLORS[handle] ?? [])
      .filter((c) => !inCart(handle, c.name))
      .map((c) => ({
        key: `${handle}-${c.name}`,
        product,
        handle,
        color: c.name,
        swatch: c.value,
        image: PRODUCT_COLOR_IMAGES[handle]?.[c.name]?.[0] ?? product.images?.[0],
        framing: cardFraming(handle, c.name, TILE_SUBJECT_HEIGHT, TILE_SUBJECT_ANCHOR),
      }));
  });

  const tiles: Tile[] = [...addonTiles, ...colorTiles];

  // Cart already has one of everything — say nothing rather than show an
  // empty heading.
  if (tiles.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[CartUpsell] hidden — every colourway is already in the cart.',
        { loaded: products.map((p) => p.handle ?? p.id) },
      );
    }
    return null;
  }

  return (
    <section className={`cu-root ${className}`.trim()} aria-labelledby="cu-heading">
      <style>{`
        .cu-root {
          margin-top: clamp(48px, 7vw, 76px);
          padding-top: clamp(28px, 4vw, 40px);
          border-top: 1px solid #F0D9E1;
        }
        /* On a phone this row moves above the order summary, where that big
           desktop margin becomes a dead band under "back to shop". Lives here
           rather than in globals.css on purpose: this <style> block is
           rendered in the body, so it beats a same-specificity rule in the
           stylesheet no matter what that rule says. 768px, not 560px, to match
           the breakpoint that does the reordering. */
        @media (max-width: 768px) {
          .cu-root { margin-top: 0; padding-top: 22px; }
        }
        .cu-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(10px, 1.6vw, 18px);
          margin-top: 20px;
        }
        /* Five tiles is the maximum (3 shorts + 2 pants), so at four across the
           last row never looks abandoned. */
        @media (max-width: 900px) {
          .cu-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        /* ── Phone: one swipeable row, not a grid ──────────────────────
           This row sits BETWEEN the items and the order summary on mobile
           (see .cart-upsell-slot in globals.css), so every pixel of its height
           is spent before the shopper reaches her total. A grid cost two rows
           of tiles no matter how small they got; a scroller costs one, and
           it holds any number of colourways without ever getting taller.

           Tiles are 40% wide so two and a half are visible — the cut-off
           third is what tells you the row scrolls. Bleeding out to the screen
           edges does the same job: a row that stops short of the margin reads
           as finished. The negative margin repeats the page's own side
           padding from cart/page.tsx, so the two can't drift apart. */
        .cu-tile {
          background: #fff;
          border-radius: 12px;
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
        }
        /* White, not blush. The whole studio set is shot on white paper, so a
           photo drawn with object-fit: contain letterboxes into a background
           the eye cannot separate from the photo — which is what makes it safe
           to stop cropping these (see .cu-shot). The tote still fills its tile
           edge to edge, so on that one tile this colour is never visible. */
        .cu-photo {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        /* Carries the per-photo normalisation. Its own box, not the <img>'s,
           because next/image owns that element's style and this has to
           survive any change there. A tile with no measurement (the tote,
           whose photo comes from Shopify at runtime and cannot be measured
           here) gets no custom properties and the defaults leave it alone. */
        .cu-shot {
          position: absolute;
          inset: 0;
          transform: translateY(var(--cu-shift, 0%)) scale(var(--cu-scale, 1));
        }
        .cu-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: 9px 0 0;
          font-family: ${sans};
          font-size: 12px;
          font-weight: 600;
          color: ${maroon};
          text-transform: lowercase;
          line-height: 1.3;
        }
        .cu-swatch {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
        }
        /* A one-size tile keeps the swatch's SPACE so its label starts on the
           same line as every other label, but not its fill — an invented
           colour would be a claim about a product that doesn't come in one.
           The ring above is inherited, so what's left is an empty circle,
           which reads as "nothing to pick here" rather than as a dot that
           failed to load. */
        .cu-swatch[data-empty='true'] { background: transparent; }
        .cu-name {
          font-family: ${sans};
          font-size: 11px;
          font-weight: 500;
          color: ${soft};
          text-align: center;
          text-transform: lowercase;
          margin: 3px 0 0;
        }
        .cu-note {
          font-family: ${sans};
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: ${soft};
          text-align: center;
          text-transform: lowercase;
          margin: 2px 0 0;
          opacity: 0.85;
          line-height: 1.4;
        }
        /* Pushes the button to the bottom so tiles line up even when a name
           wraps to two lines. */
        .cu-add { margin-top: auto; }

        /* ── Phone ── ORDER MATTERS, and it did not use to ───────────────
           This block sat ABOVE the base rules it overrides. Media queries
           add no specificity, so on a phone every property declared in
           both places lost to the desktop value further down the sheet:
           the 4/5 photo stayed 3/4, 7px tile padding stayed 10px, the 9px
           swatch stayed 10px, and the 11px/10px/9.5px type all stayed at
           desktop size. Only the handful of properties with no base rule
           — the grid's flex scroller, .cu-sep, .cu-price — ever applied,
           which is why it looked broadly right and was wrong in detail.
           Nothing here changed except where it sits. Keep it last. */
        @media (max-width: 560px) {
          .cu-grid {
            display: flex;
            grid-template-columns: none;
            gap: 8px;
            margin-top: 14px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            margin-inline: calc(-1 * clamp(20px, 4vw, 48px));
            padding-inline: clamp(20px, 4vw, 48px);
            /* Room for the tile shadow and the snap to settle without
               clipping; the scrollbar itself is hidden below. */
            padding-bottom: 2px;
            scrollbar-width: none;
          }
          .cu-grid::-webkit-scrollbar { display: none; }

          .cu-tile {
            flex: 0 0 40%;
            scroll-snap-align: start;
            padding: 7px 7px 9px;
            border-radius: 10px;
          }
          /* Squarer than the 3/4 above — a tall crop at this width is mostly
             leg, and height is the whole point of this exercise. */
          .cu-photo { aspect-ratio: 4 / 5; border-radius: 7px; }
          .cu-meta  { flex-wrap: wrap; font-size: 11px; gap: 4px; margin-top: 7px; }
          .cu-sep   { display: none; }
          /* flex-basis alone gives it the whole line but leaves the text
             ranged left inside it, out of line with everything else. */
          .cu-price { flex-basis: 100%; text-align: center; }
          .cu-swatch { width: 9px; height: 9px; }
          .cu-name  { font-size: 10px; }
          .cu-note  { font-size: 9.5px; margin-top: 1px; }

          /* An add-on drops its name here and lets the note carry the tile.
             "trailblazing tote" above "100% organic cotton · extra-wide" is
             two lines saying one thing, and in a row this short the taller
             tile sets the height for every other tile in it. The photo
             already says it's a tote; the note says the part worth knowing. */
          .cu-tile--addon .cu-name { display: none; }
        }
      `}</style>

      <h2
        id="cu-heading"
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 'clamp(19px, 2.4vw, 24px)',
          letterSpacing: '-0.02em',
          color: maroon,
          margin: 0,
          textTransform: 'lowercase',
        }}
      >
        you might also like
      </h2>
      <p
        style={{
          fontFamily: sans,
          fontSize: '12.5px',
          fontWeight: 500,
          color: soft,
          margin: '6px 0 0',
          lineHeight: 1.6,
        }}
      >
        add straight to your order — one shipment, one checkout.
      </p>

      <div className="cu-grid">
        {tiles.map((t) => (
          <div key={t.key} className={t.color ? 'cu-tile' : 'cu-tile cu-tile--addon'}>
            {(() => {
              const alt = t.color ? `${t.product.name} in ${t.color}` : t.product.name;
              const photo = t.image ? (
                <span
                  className="cu-shot"
                  style={
                    t.framing
                      ? ({
                          '--cu-scale': String(t.framing.scale),
                          '--cu-shift': `${t.framing.shiftPct}%`,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  <Image
                    src={t.image}
                    alt={alt}
                    fill
                    sizes="(max-width: 560px) 45vw, (max-width: 900px) 30vw, 240px"
                    /* contain once the photo has been measured, because the
                       scale above already decides how big the model is and a
                       crop on top of it would cut whatever the scale-up pushes
                       past the edge. An unmeasured photo keeps cover, so it
                       still fills its tile rather than floating in a white box
                       at whatever size it happens to be. */
                    style={{ objectFit: t.framing ? 'contain' : 'cover' }}
                  />
                </span>
              ) : null;

              // An add-on has no product page to link to, so its photo is a
              // plain frame. A dead link here would be worse than none.
              return t.color ? (
                <Link
                  href={`/products/${t.handle}?color=${encodeURIComponent(t.color)}`}
                  className="cu-photo"
                  aria-label={alt}
                >
                  {photo}
                </Link>
              ) : (
                <div className="cu-photo">{photo}</div>
              );
            })()}

            {/* Swatch · label · price, on every tile without exception.
                The add-on used to render the price ALONE here, so in a row of
                tiles that all read "● jam · $68" the tote read "$17" — centred,
                on its own, at a different height from every price beside it.
                One tile built differently from its neighbours is the thing the
                eye catches first, and what it catches is "broken", not
                "cheaper". A one-size product has no colourway to name, so it
                says so. */}
            <p className="cu-meta">
              <span
                className="cu-swatch"
                data-empty={t.color ? undefined : 'true'}
                style={t.swatch ? { background: t.swatch } : undefined}
                aria-hidden
              />
              {(t.color ?? ONE_SIZE_LABEL).toLowerCase()}
              <span className="cu-sep" aria-hidden style={{ opacity: 0.45 }}>·</span>
              <span className="cu-price" style={{ fontWeight: 700 }}>{priceLabel(t.product.price)}</span>
            </p>
            <p className="cu-name">{t.product.name.toLowerCase()}</p>
            {t.note && <p className="cu-note">{t.note}</p>}

            <div className="cu-add">
              <QuickAdd
                product={t.product}
                color={t.color ?? ''}
                accent={maroon}
                stayOnPage
                sizeVariant="link"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
