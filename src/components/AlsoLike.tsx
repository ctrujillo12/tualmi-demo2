import Image from 'next/image';
import Link from 'next/link';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import type { Product } from '@/types';

/**
 * "you may also like" — the cross-sell row at the bottom of a product page.
 *
 * The problem it solves: the shorts and the pant were two islands. Someone who
 * landed on the pant from an ad had no way to discover the shorts short of
 * going back to the homepage and finding the collection, and nobody does that.
 * One card per colourway of the OTHER product, each a direct link into that
 * product page with the colourway already chosen.
 *
 * ── THE SHAPE ────────────────────────────────────────────────────────────
 * Built to the pattern every shopper already knows from every other DTC site
 * (Halfdays, Vuori, Outdoor Voices): a centred heading over a row of full
 * product cards — photo, product name, colourway, price, and a button — at
 * the page's own width, not a narrow strip.
 *
 * The first version of this was none of those things. It inherited the review
 * section's 780px column and capped its tiles at 250px, so on a 1440px screen
 * it was a small left-aligned huddle under the reviews with no heading weight
 * and no call to action — which reads as a widget that failed to load rather
 * than as the shop's recommendation. Width and card size ARE the design here:
 * a recommendation the page doesn't commit to is one nobody clicks.
 *
 * ── WHY A SERVER COMPONENT ───────────────────────────────────────────────
 * <CartUpsell> fetches /api/products from the browser because the cart page is
 * a client component and has no other option. This page is not: products/[id]
 * already awaits Shopify on the server, so the sibling is fetched there in the
 * same Promise.all and handed down as a prop. That costs no extra latency (the
 * two requests overlap), ships no JavaScript for this section, and — the part
 * that matters — the cards are in the HTML, so they are there on first paint
 * instead of popping in a second later on a phone on trail LTE.
 *
 * There are no carousel arrows on desktop for the same reason: every card
 * fits on screen at every width we serve, so arrows would be JavaScript for a
 * row that has nothing to scroll.
 *
 * ── WHICH PRODUCTS ───────────────────────────────────────────────────────
 * Whichever detail pages exist that aren't this one — see DETAIL_HANDLES in
 * lib/catalog.ts, which the page derives the list from. Not a hand-kept
 * "related products" map: with two products a map is two lines that can only
 * ever disagree with the catalogue, and with three it is six.
 *
 * Coming-soon products (fleece, tee) are deliberately absent. They have no
 * detail page, so hasDetailPage() sends them to /#collection — a recommendation
 * row whose cards bounce you to the homepage is worse than a shorter row.
 *
 * ── NO ADD-TO-CART ───────────────────────────────────────────────────────
 * Unlike the cart row, these cards are links. This page already has an
 * add-to-cart — a sticky one, pinned to the bottom of a phone screen — and a
 * second buy button for a different product a thumb's width away from it is
 * how someone ends up buying the wrong thing. Size also matters more here than
 * it does for a shopper topping up a cart she's already sized.
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';

/** $68 / $68.50 — whole dollars read cleaner on a card. */
const priceLabel = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

/**
 * One line of why, per product, shown once under the heading.
 *
 * Generic copy ("check out our other styles") is worth less than the space it
 * takes; this is the sentence that makes a shorts shopper look at the pant.
 * Under the heading rather than on each card, because with one sibling every
 * card is the same garment and the same sentence three times is noise.
 */
const PITCH: Record<string, string> = {
  'sierra-shorts': 'deep pockets, prints people stop you about',
  'juniper-pant': 'flare cargo fit, real pockets, fold-over waist',
};

type Card = {
  key: string;
  handle: string;
  name: string;
  price: number;
  color: string;
  swatch: string;
  image?: string;
};

export default function AlsoLike({ products }: { products: Product[] }) {
  const cards: Card[] = products.flatMap((product) => {
    const handle = product.handle ?? product.id;
    return (PRODUCT_COLORS[handle] ?? []).map((c) => ({
      key: `${handle}-${c.name}`,
      handle,
      name: product.name,
      price: product.price,
      color: c.name,
      swatch: c.value,
      image: PRODUCT_COLOR_IMAGES[handle]?.[c.name]?.[0] ?? product.images?.[0],
    }));
  });

  // Shopify down and the local fallback somehow empty, or a product with no
  // colourways defined. A heading over nothing is worse than no heading.
  if (cards.length === 0) return null;

  const only = products.length === 1 ? products[0] : null;
  const pitch = only ? PITCH[only.handle ?? only.id] : null;

  return (
    <section className="al-root" aria-labelledby="al-heading">
      <style>{`
        /* Page width, not the review column's 780px. The product above it is
           laid out in a 1200px shell with the same side padding (.pdp-shell in
           globals.css) — matching both is what makes this read as the last
           section of the page rather than a box bolted under it. */
        .al-root {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(44px, 6vw, 76px) clamp(20px, 4vw, 48px) clamp(56px, 8vw, 92px);
          border-top: 1px solid ${rule};
        }

        /* Centred, and at heading weight. The old version was left-aligned at
           19px, which put it in the same visual class as a form label. */
        .al-h {
          font-family: ${sans};
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: ${maroon};
          margin: 0;
          text-align: center;
          text-transform: lowercase;
        }
        .al-pitch {
          font-family: ${sans};
          font-size: clamp(12.5px, 1.5vw, 14px);
          font-weight: 500;
          color: ${soft};
          margin: 8px auto 0;
          max-width: 460px;
          text-align: center;
          text-transform: lowercase;
          line-height: 1.6;
        }

        /* ══ THE ROW ═══════════════════════════════════════════════════════
           Desktop: flex, not grid. The cards share the row and grow into it
           up to a 360px cap, so three fill the 1104px of content width edge
           to edge and two centre themselves as a deliberate pair instead of
           leaving a hole where a third would go. auto-fit grid columns can't
           do both — at a fixed track size three cards wrap, and at 1fr two
           cards blow up to 540px each. */
        .al-row {
          display: flex;
          justify-content: center;
          gap: clamp(14px, 2vw, 26px);
          margin: clamp(26px, 3.5vw, 40px) 0 0;
          padding: 0;
          list-style: none;
        }
        /* display:flex on the card so the link inside stretches to the row's
           full height — that is what lets the buttons line up across cards
           when one product's name wraps to two lines and another's doesn't. */
        .al-card {
          display: flex;
          flex: 1 1 0;
          min-width: 0;
          max-width: 360px;
        }

        /* ── Phone: a swipeable carousel ──
           The same shape every shopper has used on every other store. Cards
           at 62% so one sits square in the middle of the screen with the next
           one cut by the edge — that slice is what says the row scrolls, and
           it does the job no dots or arrows would earn their JavaScript for.

           The negative margin bleeds the row to the screen edges and the
           matching padding puts the first card back in line with the heading.
           Both repeat .al-root's own side padding, so they cannot drift. */
        @media (max-width: 700px) {
          .al-row {
            justify-content: flex-start;
            gap: 12px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
            scroll-snap-type: x mandatory;
            scroll-padding-left: clamp(20px, 4vw, 48px);
            margin-inline: calc(-1 * clamp(20px, 4vw, 48px));
            padding-inline: clamp(20px, 4vw, 48px);
            padding-block: 2px;
            scrollbar-width: none;
          }
          .al-row::-webkit-scrollbar { display: none; }
          .al-card {
            flex: 0 0 62%;
            max-width: none;
            scroll-snap-align: start;
          }
        }

        /* ── The card ──
           The whole card is one link. On a phone the card is what a thumb
           aims at, and a photo with a separate small word under it gives you
           two small targets where one large one belongs. The button inside is
           an affordance, not a second destination — it goes to the same
           place, which is why it is a <span> and not a nested anchor. */
        .al-link {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-width: 0;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        .al-photo {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 14px;
          overflow: hidden;
          background: #F3DCE5;
        }
        .al-body {
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 14px 6px 0;
        }
        .al-name {
          font-family: ${sans};
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: ${maroon};
          margin: 0;
          text-transform: lowercase;
        }
        .al-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin: 7px 0 14px;
          font-family: ${sans};
          font-size: 13px;
          font-weight: 600;
          color: ${soft};
          text-transform: lowercase;
          line-height: 1.3;
        }
        .al-swatch {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
        }
        .al-price { color: ${maroon}; font-weight: 700; }

        /* A real button, because "SHOP NOW" is the thing these rows have in
           common everywhere and the thing that tells a shopper the card is a
           destination and not a photo. margin-top:auto pins it to the bottom
           so the buttons line up across cards even when a name wraps. */
        .al-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          margin-top: auto;
          padding: 0 26px;
          border: 1.5px solid ${maroon};
          border-radius: 100px;
          background: transparent;
          font-family: ${sans};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: ${maroon};
          text-transform: lowercase;
        }

        /* Hover is a desktop-only affordance and the only thing that says the
           card is clickable before you click it. Behind (hover: hover) so a
           phone never leaves a card stuck in its hover state after a tap. */
        @media (hover: hover) {
          .al-photo img { transition: transform 260ms ease; }
          .al-link:hover .al-photo img { transform: scale(1.04); }
          .al-link:hover .al-cta { background: ${maroon}; color: #fff; }
        }
        .al-link:active .al-cta { background: ${maroon}; color: #fff; }
        @media (prefers-reduced-motion: reduce) {
          .al-photo img,
          .al-link:hover .al-photo img { transition: none; transform: none; }
        }
      `}</style>

      <h2 id="al-heading" className="al-h">you may also like</h2>
      {pitch && <p className="al-pitch">{pitch}</p>}

      <ul className="al-row">
        {cards.map((c) => (
          <li key={c.key} className="al-card">
            <Link
              href={`/products/${c.handle}?color=${encodeURIComponent(c.color)}`}
              className="al-link"
            >
              <span className="al-photo">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={`${c.name} in ${c.color}`}
                    fill
                    /* Phone first: at 62% of a 390px screen the card is about
                       240px wide, and the desktop cap is 360px. Getting this
                       wrong is the most expensive mistake on a cellular
                       connection — a full-width source here would be
                       megabytes fetched below the fold. */
                    sizes="(max-width: 700px) 65vw, 360px"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </span>

              <span className="al-body">
                <span className="al-name">{c.name.toLowerCase()}</span>
                <span className="al-meta">
                  <span className="al-swatch" style={{ background: c.swatch }} aria-hidden />
                  {c.color.toLowerCase()}
                  <span aria-hidden style={{ opacity: 0.45 }}>·</span>
                  <span className="al-price">{priceLabel(c.price)}</span>
                </span>
                <span className="al-cta">shop now</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
