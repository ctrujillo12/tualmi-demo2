'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickAdd from '@/components/QuickAdd';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import type { Product } from '@/types';

/**
 * "You might also like" — every colourway of the drop that isn't already in
 * the cart, addable without leaving the page.
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

/** $68 / $68.50 — whole dollars read cleaner on a small tile. */
const priceLabel = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

type Tile = {
  key: string;
  product: Product;
  handle: string;
  color: string;
  swatch: string;
  image?: string;
};

export default function CartUpsell() {
  const items = useCartStore((s) => s.items);
  const [products, setProducts] = useState<Product[] | null>(null);

  // Client-side fetch: this page is a client component, so it can't call
  // getProduct() the way the landing page does. Products carry their Shopify
  // variants, which is what makes the added line survive checkout.
  useEffect(() => {
    let alive = true;
    fetch(`/api/products?handles=${UPSELL_HANDLES.join(',')}`)
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

  const tiles: Tile[] = UPSELL_HANDLES.flatMap((handle) => {
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
    <section className="cu-root" aria-labelledby="cu-heading">
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
        @media (max-width: 560px) {
          .cu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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
            <Link
              href={`/products/${t.handle}?color=${encodeURIComponent(t.color)}`}
              className="cu-photo"
              aria-label={`${t.product.name} in ${t.color}`}
            >
              {t.image && (
                <Image
                  src={t.image}
                  alt={`${t.product.name} in ${t.color}`}
                  fill
                  sizes="(max-width: 560px) 45vw, (max-width: 900px) 30vw, 240px"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </Link>

            <p className="cu-meta">
              <span className="cu-swatch" style={{ background: t.swatch }} aria-hidden />
              {t.color.toLowerCase()}
              <span aria-hidden style={{ opacity: 0.45 }}>·</span>
              <span style={{ fontWeight: 700 }}>{priceLabel(t.product.price)}</span>
            </p>
            <p className="cu-name">{t.product.name.toLowerCase()}</p>

            <div className="cu-add">
              <QuickAdd
                product={t.product}
                color={t.color}
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
