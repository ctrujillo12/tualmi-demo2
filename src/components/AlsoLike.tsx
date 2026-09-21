import Image from 'next/image';
import Link from 'next/link';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES, cardFraming } from '@/lib/productColors';
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

/**
 * How much of a card's height the model should fill, and where her centre
 * should sit. See cardFraming() in lib/productColors.ts for what these do.
 *
 * 0.84 leaves 8% of clear card above her head and below her feet. It is
 * generous on purpose: the measured boxes are the model INCLUDING hair and
 * boots, and a tighter target starts shaving both on the colourways that have
 * to scale up. 0.50 puts her dead centre, which is where she reads as
 * deliberately placed rather than as slightly slipped.
 */
const CARD_SUBJECT_HEIGHT = 0.84;
const CARD_SUBJECT_ANCHOR = 0.50;

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
  /** Scale + shift that make every model the same size. null = not measured. */
  framing: { scale: number; shiftPct: number } | null;
};

/**
 * Also used, with a different heading, as the grid on /collections. The card
 * design, the model-size normalisation and the responsive behaviour are the
 * hard parts and they are already solved here; a second component would be a
 * second place for them to drift. Only the heading and the one-line pitch
 * differ, so only those are props.
 */
export default function AlsoLike({
  products,
  heading = 'you may also like',
  /** null suppresses the per-product pitch line (the shop grid shows several). */
  pitch: pitchOverride,
}: {
  products: Product[];
  heading?: string;
  pitch?: string | null;
}) {
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
      framing: cardFraming(handle, c.name, CARD_SUBJECT_HEIGHT, CARD_SUBJECT_ANCHOR),
    }));
  });

  // Shopify down and the local fallback somehow empty, or a product with no
  // colourways defined. A heading over nothing is worse than no heading.
  if (cards.length === 0) return null;

  const only = products.length === 1 ? products[0] : null;
  const pitch =
    pitchOverride !== undefined ? pitchOverride : only ? PITCH[only.handle ?? only.id] : null;

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
        /* White, not blush: the whole studio set is shot on white paper, so a
           photo drawn with object-fit: contain letterboxes into a background
           the eye cannot tell from the photo's own. That is what makes it
           safe to stop cropping — see .al-shot below. */
        .al-photo {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }

        /* ── Two nested boxes, two jobs ──
           .al-shot carries the per-photo normalisation (a fixed scale and
           shift, from the measured subject box). .al-frame carries the hover
           zoom. They are separate elements because a single element can only
           have one transform: writing the hover zoom onto the same box would
           overwrite the normalisation and snap the model back to whatever
           size the photographer happened to frame her at, which is the bug
           this whole mechanism exists to fix.

           Composing them in one declaration with calc() and custom properties
           would work but could not be eased — an unregistered custom property
           is not animatable, so the zoom would jump rather than glide. */
        .al-frame {
          position: absolute;
          inset: 0;
        }
        .al-shot {
          position: absolute;
          inset: 0;
          transform: translateY(var(--al-shift, 0%)) scale(var(--al-scale, 1));
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
          .al-frame { transition: transform 260ms ease; }
          .al-link:hover .al-frame { transform: scale(1.04); }
          .al-link:hover .al-cta { background: ${maroon}; color: #fff; }
        }
        .al-link:active .al-cta { background: ${maroon}; color: #fff; }
        @media (prefers-reduced-motion: reduce) {
          .al-frame,
          .al-link:hover .al-frame { transition: none; transform: none; }
        }
      `}</style>

      <h2 id="al-heading" className="al-h">{heading}</h2>
      {pitch && <p className="al-pitch">{pitch}</p>}

      <ul className="al-row">
        {cards.map((c) => (
          <li key={c.key} className="al-card">
            <Link
              href={`/products/${c.handle}?color=${encodeURIComponent(c.color)}`}
              className="al-link"
            >
              <span className="al-photo">
                <span className="al-frame">
                  <span
                    className="al-shot"
                    style={
                      c.framing
                        ? ({
                            '--al-scale': String(c.framing.scale),
                            '--al-shift': `${c.framing.shiftPct}%`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {c.image && (
                      <Image
                        src={c.image}
                        alt={`${c.name} in ${c.color}`}
                        fill
                        /* Phone first: at 62% of a 390px screen the card is
                           about 240px wide, and the desktop cap is 360px.
                           Getting this wrong is the most expensive mistake on
                           a cellular connection — a full-width source here
                           would be megabytes fetched below the fold. */
                        sizes="(max-width: 700px) 65vw, 360px"
                        /* contain, not cover: the normalisation above already
                           decides how big the model is, and a crop on top of
                           it would take the decision back by cutting whatever
                           the scale-up pushes past the edge. Nothing is lost
                           to letterboxing because the card is white. */
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                  </span>
                </span>
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
