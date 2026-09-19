'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { freeShippingProgress, money } from '@/lib/shipping';
import { cartThumbFor } from '@/lib/productColors';
import { trackAddToCart } from '@/lib/analytics';
import type { Product } from '@/types';

/**
 * "You're $17 from free shipping — add the tote?" — one checkbox, under the
 * cart items.
 *
 * The arithmetic this exists for is in lib/shipping.ts: the threshold is $125
 * and a single Juniper Pant is $108, so the most common one-item cart on the
 * site lands $17 short, and the tote is priced to close exactly that gap. That
 * shopper is one tap from a better order and, today, has to find the tote in
 * the recommendation row at the bottom of the page to do it. This puts the tap
 * where the decision happens.
 *
 * ── WHY IT IS NOT PRE-TICKED ─────────────────────────────────────────────
 * Because a pre-ticked box that adds a paid item charges the people who did
 * not read it. The EU bans it outright for exactly that reason (Consumer
 * Rights Directive Art. 22 — no pre-ticked boxes for additional payments) and
 * we ship to Germany, France and Austria. In the US it is the standard recipe
 * for chargebacks and one-star reviews.
 *
 * It costs nothing to do it properly: ticking the box adds the tote in a
 * single click with no size step and no confirmation, which is the whole
 * benefit of pre-ticking without the part that is someone else's money.
 * Unticking removes it again.
 *
 * ── WHEN IT SHOWS ────────────────────────────────────────────────────────
 * Only when it is TRUE, which is narrower than it sounds:
 *
 *   • the cart is below the threshold, AND
 *   • the gap is no bigger than the tote, so adding it genuinely crosses the
 *     line — on a $68 cart the tote leaves you $40 short and the offer would
 *     be a lie, so there is no offer
 *   • OR the tote is already in the cart, in which case the row stays on
 *     screen, ticked, so it can be untaken back. A control that vanishes the
 *     moment you use it is a trap.
 *
 * "US" is load-bearing in the copy for the same reason it is in
 * FREE_SHIPPING_LABEL: the Shopify rule is United States only.
 *
 * ── NOT THE UPSELL ROW ───────────────────────────────────────────────────
 * <CartUpsell> at the bottom of the page still offers the tote among the
 * colourways, and still should — that row is browsing, this is a decision
 * about the order in hand. The two do not fight: once the tote is in the cart
 * the upsell row drops it from its tiles on its own.
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';

const TOTE_HANDLE = 'trailblazing-tote';

/**
 * Whether there is anything true to offer.
 *
 * Pulled out of the component and exported so it can be tested without a
 * browser, a cart and a Shopify response — this is the rule that decides
 * whether the page makes a promise it can keep, and it has more edge cases
 * than it looks like it does.
 */
export function shouldOfferTote(opts: {
  /** The tote is already a line in the cart. */
  inCart: boolean;
  /** The cart already clears the free-shipping threshold without it. */
  qualified: boolean;
  /** Cents still needed to clear it. */
  remaining: number;
  /** The tote's price in cents. */
  totePrice: number;
}): boolean {
  // Already taken: keep the row on screen and ticked, whatever else is true,
  // so it can be undone. A control that vanishes the moment you use it is a
  // trap, and this one can add $17 to an order.
  if (opts.inCart) return true;
  // Nothing to unlock.
  if (opts.qualified) return false;
  // The gap is bigger than the tote, so adding it would NOT get free
  // shipping. Saying otherwise is the one thing this row must never do.
  return opts.remaining <= opts.totePrice;
}

export default function ToteNudge() {
  const items      = useCartStore((s) => s.items);
  const total      = useCartStore((s) => s.getTotal());
  const addItem    = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const [tote, setTote] = useState<Product | null>(null);

  // Client-side, like <CartUpsell>: the cart page is a client component and
  // cannot call getProduct(). The product carries its Shopify variants, which
  // is what makes the added line survive checkout.
  useEffect(() => {
    let alive = true;
    fetch(`/api/products?handles=${TOTE_HANDLE}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`/api/products responded ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!alive) return;
        if (!d?.ok) throw new Error('/api/products returned ok:false');
        setTote((d.products as Product[])[0] ?? null);
      })
      .catch((err) => {
        // A missing nudge is not worth an error in front of a shopper. Say so
        // in development, where "why is it not showing?" is a real question.
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[ToteNudge] hidden — could not load the tote.', err);
        }
      });
    return () => { alive = false; };
  }, []);

  if (!tote) return null;

  const line = items.find((i) => (i.product.handle ?? i.product.id) === TOTE_HANDLE);
  const inCart = !!line;

  const { qualified, remaining } = freeShippingProgress(total);
  if (!shouldOfferTote({ inCart, qualified, remaining, totePrice: tote.price })) {
    return null;
  }

  /**
   * The total WITH the tote, not the gap without it.
   *
   * <FreeShippingBar> worked this out the hard way and the note above it is
   * worth reading: "$17 away from free US shipping" asks a shopper to do
   * arithmetic on a deficit and reads as a penalty for what she already
   * chose. A total she can check against the threshold she has been shown all
   * session says the same thing as an outcome. Same pattern as that
   * component's "add a second pair — $136 total" line, so the cart speaks with
   * one voice.
   */
  const withTote = money(total + tote.price);

  // One-size product: the same resolution <QuickAdd> uses, off the product
  // rather than a hardcoded 'One Size', because findVariant() keys on
  // Shopify's own option value and a plain single-variant product has none.
  const soleSize = tote.sizes?.length === 1 ? tote.sizes[0] : '';
  const price = money(tote.price);

  function toggle() {
    if (line) {
      removeItem(line.product.id, line.selectedSize, line.selectedColor);
      return;
    }
    if (!tote) return;

    const image = cartThumbFor(TOTE_HANDLE, '', tote.variants) ?? tote.images[0];
    addItem({ ...tote, images: image ? [image] : tote.images }, soleSize, '', 1);

    trackAddToCart({
      item_id: TOTE_HANDLE,
      item_name: tote.name,
      price: tote.price / 100,
      item_variant: soleSize,
      quantity: 1,
      image_url: image,
      url: '/cart',
    });
  }

  const thumb = cartThumbFor(TOTE_HANDLE, '', tote.variants) ?? tote.images?.[0];

  return (
    <label className="tn-row" data-on={inCart}>
      <style>{`
        /* Small on purpose — this is a footnote to the cart, not a second
           product card. Capped rather than full-width so it reads as an aside
           beside the items rather than as another row of the list. */
        .tn-row {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 440px;
          margin: 14px 0 0;
          padding: 9px 12px 9px 10px;
          border: 1px solid ${rule};
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        @media (hover: hover) {
          .tn-row { transition: border-color 140ms ease, background 140ms ease; }
          .tn-row:hover { border-color: ${soft}; }
        }
        /* Ticked, it stops being an offer and becomes a receipt. */
        .tn-row[data-on='true'] {
          border-color: ${soft};
          background: #FDF6F9;
        }

        /* A real checkbox: focus ring, space bar, VoiceOver, and the label
           wrapping it makes the whole row one 40px-tall tap target without a
           line of JavaScript. accent-color tints the native control, which
           beats redrawing one and losing all of the above. */
        .tn-box {
          flex: 0 0 auto;
          width: 17px;
          height: 17px;
          margin: 0;
          accent-color: ${maroon};
          cursor: pointer;
        }

        .tn-thumb {
          position: relative;
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border-radius: 7px;
          overflow: hidden;
          background: #FBF1F5;
        }

        /* No text-transform: lowercase here, unlike most copy on the site.
           It would render "US" as "us", and this line is a shipping promise
           whose scope is the whole point of the word. The copy is written
           lowercase instead. <FreeShippingBar> does the same. */
        .tn-text {
          font-family: ${sans};
          font-size: 12px;
          font-weight: 600;
          line-height: 1.45;
          color: ${soft};
        }
        .tn-text strong { font-weight: 700; color: ${maroon}; }

        @media (max-width: 560px) {
          .tn-row { max-width: none; gap: 9px; padding: 9px 10px; }
          .tn-text { font-size: 11.5px; }
          .tn-thumb { width: 30px; height: 30px; }
        }
      `}</style>

      <input
        type="checkbox"
        className="tn-box"
        checked={inCart}
        onChange={toggle}
      />

      {thumb && (
        <span className="tn-thumb">
          <Image src={thumb} alt="" fill sizes="34px" style={{ objectFit: 'cover' }} />
        </span>
      )}

      <span className="tn-text">
        {inCart ? (
          <>
            {tote.name.toLowerCase()} added ({price}) — <strong>US shipping&rsquo;s free</strong>
          </>
        ) : (
          <>
            add the {tote.name.toLowerCase()} ({price}) — <strong>{withTote}</strong> total, and{' '}
            <strong>US shipping&rsquo;s free</strong>
          </>
        )}
      </span>
    </label>
  );
}
