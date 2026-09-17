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
 * One tile per colourway of the OTHER product, each a direct link into that
 * product page with the colourway already chosen.
 *
 * ── WHY A SERVER COMPONENT ───────────────────────────────────────────────
 * <CartUpsell> fetches /api/products from the browser because the cart page is
 * a client component and has no other option. This page is not: products/[id]
 * already awaits Shopify on the server, so the sibling is fetched there in the
 * same Promise.all and handed down as a prop. That costs no extra latency (the
 * two requests overlap), ships no JavaScript for this section, and — the part
 * that matters — the tiles are in the HTML, so they are there on first paint
 * instead of popping in a second later on a phone on trail LTE.
 *
 * ── WHICH PRODUCTS ───────────────────────────────────────────────────────
 * Whichever detail pages exist that aren't this one — see DETAIL_HANDLES in
 * lib/catalog.ts, which the page derives the list from. Not a hand-kept
 * "related products" map: with two products a map is two lines that can only
 * ever disagree with the catalogue, and with three it is six.
 *
 * Coming-soon products (fleece, tee) are deliberately absent. They have no
 * detail page, so hasDetailPage() sends them to /#collection — a recommendation
 * row whose tiles bounce you to the homepage is worse than a shorter row.
 *
 * ── NO ADD-TO-CART ───────────────────────────────────────────────────────
 * Unlike the cart row, these tiles are links only. This page already has an
 * add-to-cart — a sticky one, pinned to the bottom of a phone screen — and a
 * second buy button for a different product a thumb's width away from it is
 * how someone ends up buying the wrong thing. Size also matters more here than
 * it does for a shopper topping up a cart she's already sized.
 */

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';

/** $68 / $68.50 — whole dollars read cleaner on a small tile. */
const priceLabel = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

/**
 * One line of why, per product. Generic copy ("check out our other styles")
 * is worth less than the space it takes; this is the sentence that makes a
 * shorts shopper look at the pant.
 */
const PITCH: Record<string, string> = {
  'sierra-shorts': 'deep pockets, prints people stop you about',
  'juniper-pant': 'flare cargo fit, real pockets, fold-over waist',
};

type Tile = {
  key: string;
  handle: string;
  name: string;
  price: number;
  color: string;
  swatch: string;
  image?: string;
};

export default function AlsoLike({ products }: { products: Product[] }) {
  const tiles: Tile[] = products.flatMap((product) => {
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
  if (tiles.length === 0) return null;

  // The "see all" link only makes sense pointing somewhere specific. With one
  // sibling it names it; with more, the collection is the honest destination.
  const only = products.length === 1 ? products[0] : null;
  const seeAllHref = only ? `/products/${only.handle ?? only.id}` : '/#collection';
  const seeAllLabel = only ? `see the ${only.name.toLowerCase()}` : 'see everything';

  /**
   * With one sibling every tile is the same garment in a different colourway,
   * so its name and its pitch belong above the row, said once. Repeating
   * "sierra shorts / deep pockets, prints people stop you about" under all
   * three tiles cost two lines of height per tile on a phone to say the same
   * thing three times — and height here is the whole game, because the row
   * sits under the reviews with a sticky buy bar eating the bottom of the
   * screen. The moment there are two siblings the tiles mix products and the
   * name has to go back on them to mean anything.
   */
  const multi = products.length > 1;
  const pitch = only ? PITCH[only.handle ?? only.id] : null;

  return (
    <section className="al-root" aria-labelledby="al-heading">
      <style>{`
        .al-root {
          max-width: 780px;
          margin: 0 auto;
          /* Matches .rv-root in ProductReviews exactly — this is the next
             section of the same surface, and a different gutter would make
             the two read as two pages stitched together. */
          padding: clamp(22px, 3.5vw, 34px) 20px clamp(36px, 6vw, 56px);
          border-top: 1px solid ${rule};
        }

        .al-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .al-h {
          font-family: ${sans};
          font-size: clamp(19px, 2.4vw, 24px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: ${maroon};
          margin: 0;
          text-transform: lowercase;
        }
        /* A real tap target, not a 13px word. 44px is the floor every mobile
           accessibility guideline agrees on and this sits at 44 exactly. */
        .al-all {
          font-family: ${sans};
          font-size: 13px;
          font-weight: 700;
          color: ${maroon};
          text-decoration: none;
          text-transform: lowercase;
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          padding: 0 2px;
          border-bottom: 1px solid ${rule};
        }

        /* ══ THE ROW ═══════════════════════════════════════════════════════
           Phone first, because that is who this is for: a horizontal scroller
           that costs ONE tile of vertical height no matter how many
           colourways there are. Stacking them would put the third shorts
           colourway two thumb-flicks below the second, which is the same as
           not shipping it.

           46% wide is the number that makes both cases work. Two tiles (the
           pant, seen from the shorts page) fill the row with a sliver of
           margin and nothing looks broken. Three (the shorts, seen from the
           pant) put two on screen and cut the third down the middle, and a
           tile sliced by the screen edge is the only reliable way to say
           "this scrolls" without a row of dots nobody taps.

           The negative margin bleeds the row out to the screen edges and the
           matching padding puts the first tile back in line with the heading.
           A row that stops at the text margin reads as finished; one that runs
           off the edge reads as continuing. Both numbers repeat .al-root's
           own 20px padding, so they cannot drift apart. */
        .al-row {
          display: flex;
          gap: 10px;
          margin: 18px 0 0;
          padding: 2px 20px 2px;
          margin-inline: -20px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          scroll-snap-type: x mandatory;
          scroll-padding-left: 20px;
          scrollbar-width: none;
        }
        .al-row::-webkit-scrollbar { display: none; }

        /* ── The tile is the link ──
           Not the photo with a caption beside it: on a phone the whole card
           is the thing a thumb aims at, and a 120px-wide photo with a
           separate 11px word under it gives you two small targets where one
           large one belongs. */
        .al-tile {
          flex: 0 0 46%;
          scroll-snap-align: start;
          background: #fff;
          border-radius: 12px;
          padding: 8px 8px 12px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
        /* Touch feedback. Hover lives in its own block further down, behind
           a (hover: hover) query. */
        .al-tile:active { transform: scale(0.985); }

        /* display:block is redundant while .al-tile is a column flex container
           (its children are blockified), and load-bearing the moment that
           changes: a <span> that falls back to inline ignores width and
           aspect-ratio, and next/image's fill needs a positioned block to
           fill. Cheaper to state it than to debug it. */
        .al-photo {
          position: relative;
          display: block;
          width: 100%;
          /* Squarer than the 2/3 the gallery uses. This is a recognition
             shot, not a look at the garment, and every extra 100px of tile
             height is 100px further from the row below it. */
          aspect-ratio: 4 / 5;
          border-radius: 8px;
          overflow: hidden;
          background: #FBF1F5;
        }

        .al-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 9px 0 0;
          font-family: ${sans};
          font-size: 12px;
          font-weight: 600;
          color: ${maroon};
          text-transform: lowercase;
          line-height: 1.3;
        }
        .al-swatch {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
        }
        .al-price { margin-left: auto; font-weight: 700; }
        .al-name {
          font-family: ${sans};
          font-size: 11.5px;
          font-weight: 500;
          color: ${soft};
          text-transform: lowercase;
          margin: 3px 0 0;
          line-height: 1.4;
        }
        /* Sits under the heading, not on the tiles — see the note above the
           pitch constant. (No backticks in here: this whole block is a
           template literal, and one would end it mid-stylesheet.) */
        .al-pitch {
          font-family: ${sans};
          font-size: 12.5px;
          font-weight: 500;
          color: ${soft};
          text-transform: lowercase;
          margin: 6px 0 0;
          line-height: 1.6;
        }

        /* ── Wider screens ──
           Once every tile fits at a sane size the scroller has nothing left
           to do, so it becomes a plain grid — the section itself never goes
           anywhere, on any width.

           The columns stretch up to a 250px cap rather than sitting at a
           fixed 180px. Pinned at 180 the row used about 580 of the 780px
           column and the whole section read as a leftover strip under the
           reviews, which is how a cross-sell gets ignored on a desktop
           screen with room to spare. At the cap three tiles fill the column
           edge to edge, and two come out large enough to actually look at.

           auto-fit, not a fixed column count: two tiles take two columns
           instead of leaving a visible hole where a third would go. */
        @media (min-width: 560px) {
          .al-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(0, 250px));
            justify-content: start;
            gap: clamp(12px, 1.8vw, 18px);
            margin-top: 22px;
            margin-inline: 0;
            padding: 0;
            overflow: visible;
          }
          .al-tile { flex: none; padding: 10px 10px 14px; }
          .al-photo { aspect-ratio: 3 / 4; }
          /* Sized up with the tiles — 12px type under a 250px photo reads as
             a caption someone forgot to finish. */
          .al-meta { font-size: 13px; margin-top: 11px; }
          .al-name { font-size: 12.5px; }
        }

        /* Hover is a desktop-only affordance and the only thing on the tile
           that says it is clickable before you click it. Kept off touch
           (hover: hover) so a phone never leaves a tile stuck in its hover
           state after a tap. */
        @media (hover: hover) {
          .al-tile { transition: transform 140ms ease, box-shadow 140ms ease; }
          .al-tile:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(169, 68, 92, 0.10);
          }
          .al-tile:hover .al-name { color: ${maroon}; }
        }
        @media (prefers-reduced-motion: reduce) {
          .al-tile, .al-tile:hover { transition: none; transform: none; }
        }
      `}</style>

      <div className="al-top">
        <h2 id="al-heading" className="al-h">you may also like</h2>
        <Link href={seeAllHref} className="al-all">{seeAllLabel} →</Link>
      </div>
      {pitch && <p className="al-pitch">{pitch}</p>}

      <div className="al-row">
        {tiles.map((t) => (
          <Link
            key={t.key}
            href={`/products/${t.handle}?color=${encodeURIComponent(t.color)}`}
            className="al-tile"
          >
            <span className="al-photo">
              {t.image && (
                <Image
                  src={t.image}
                  alt={`${t.name} in ${t.color}`}
                  fill
                  /* Phone first: at 46% of a 390px screen the tile is ~180px
                     wide, so 50vw asks for roughly the right file instead of
                     the desktop one. Getting this wrong is the single most
                     expensive mistake on a cellular connection — a full-width
                     source here would be megabytes below the fold. 250px is
                     the desktop tile's cap, set in the grid below. */
                  sizes="(max-width: 560px) 50vw, 250px"
                  style={{ objectFit: 'cover' }}
                />
              )}
            </span>

            <span className="al-meta">
              <span className="al-swatch" style={{ background: t.swatch }} aria-hidden />
              {t.color.toLowerCase()}
              <span className="al-price">{priceLabel(t.price)}</span>
            </span>
            {multi && <span className="al-name">{t.name.toLowerCase()}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
