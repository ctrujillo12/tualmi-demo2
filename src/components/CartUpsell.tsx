'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickAdd from '@/components/QuickAdd';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
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
        /* Three across on a phone rather than two.
           This row now sits BETWEEN the items and the order summary on mobile
           (see .cart-upsell-slot in globals.css), so its height is spent
           before the shopper reaches the total — two big tiles per row put
           three rows of merchandising in front of the number she came to
           read. At three across all five options fit in two short rows.

           The price moves to its own line here: "confetti · $68" does not fit
           on one line in a ~100px tile, and .cu-meta is a flex row, so it
           overflowed the tile rather than wrapping. */
        @media (max-width: 560px) {
          .cu-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            margin-top: 14px;
          }
          .cu-tile  { padding: 6px 6px 8px; border-radius: 10px; }
          /* Slightly squarer than the 3/4 above — a tall crop at this width is
             mostly leg, and the height is what we're trying to save. */
          .cu-photo { aspect-ratio: 4 / 5; border-radius: 6px; }
          .cu-meta  { flex-wrap: wrap; font-size: 10.5px; gap: 4px; margin-top: 7px; }
          .cu-sep   { display: none; }
          /* flex-basis alone gives it the whole line but leaves the text
             ranged left inside it, out of line with everything else. */
          .cu-price { flex-basis: 100%; text-align: center; }
          .cu-swatch { width: 8px; height: 8px; }
          .cu-name  { font-size: 9.5px; }
          .cu-note  { font-size: 9px; margin-top: 1px; }
        }
        .cu-tile {
          background: #fff;
          border-radius: 12px;
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
        }
        .cu-photo {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 8px;
          overflow: hidden;
          background: #FBF1F5;
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
          <div key={t.key} className="cu-tile">
            {(() => {
              const alt = t.color ? `${t.product.name} in ${t.color}` : t.product.name;
              const photo = t.image ? (
                <Image
                  src={t.image}
                  alt={alt}
                  fill
                  sizes="(max-width: 560px) 45vw, (max-width: 900px) 30vw, 240px"
                  style={{ objectFit: 'cover' }}
                />
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

            <p className="cu-meta">
              {t.color ? (
                <>
                  <span className="cu-swatch" style={{ background: t.swatch ?? 'transparent' }} aria-hidden />
                  {t.color.toLowerCase()}
                  <span className="cu-sep" aria-hidden style={{ opacity: 0.45 }}>·</span>
                </>
              ) : null}
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
