import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import { shipPhrase } from '@/lib/shipWindow';

/**
 * "The drop" — one big colored panel per product, every colorway shown as a
 * large cover photo with quick add-to-cart. This started as landing-page-only
 * data (app/page.tsx), and now also drives the shop page
 * (app/collections/page.tsx) — see components/ProductDropPanel.tsx for the
 * shared rendering. Pulled out here so the two pages cannot end up with two
 * different card designs, two different cover photos, or two different
 * colorway orders for the same product.
 */
export interface DropProduct {
  handle: string;
  name: string;
  availability: string; // small eyebrow above the name ('' = hide it)
  shopLabel: string;    // CTA text, e.g. 'shop shorts'
  /** Fallback price in cents, used only if Shopify is unreachable at build. */
  price: number;
  bg: string;      // panel background (drives the scroll color-change on the landing page)
  accent: string;  // heading / text color
  colorways: { color: string; swatch: string; image: string }[];
}

/** $68 / $68.50 — whole dollars read cleaner on a card. */
export const priceLabel = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

const RE = '/images-2/reedited-photos/Highlights';

// Cover shot per colorway. Kept separate from the product-page gallery order
// (PRODUCT_COLOR_IMAGES) so these panels can lead with a different photo than
// the PDP. Falls back to the gallery lead if unset.
/**
 * Moved onto the September 2026 studio shoot alongside the product galleries —
 * leaving these on the old set would have put two different shoots of the same
 * shorts on one page.
 *
 * These are the same frames the galleries lead with. The block above still
 * exists so these panels CAN lead with something different; delete a
 * colourway here and coverFor() falls back to that colourway's gallery lead
 * anyway.
 */
const LANDING_COVERS: Record<string, Record<string, string>> = {
  'sierra-shorts': {
    // Smiling, straight-on — the only open-smile front frame in the Jam set.
    // Not the Jam gallery lead (that's jam-front-5), so the tile and the PDP
    // open on different photographs.
    Jam:      `${RE}/jam-front-3.jpg`,
    Picnic:   `${RE}/picnic-front-1.jpg`,
    // Leaning three-quarter — not in the Confetti gallery, so the landing tile
    // and the product page do not open on the same photograph.
    Confetti: `${RE}/confetti-34-2.jpg`,
  },
  'juniper-pant': {
    Birch: `${RE}/birch-34-1.jpg`,
    // Not the gallery lead for Olive: a second full-length standing shot beside
    // Birch's made the pants band repetitive. This one is a waist-to-hem crop —
    // fold-over waist, cargo pocket, label and flare in one frame — which fills
    // the 2:3 tile and gives the row something to look at.
    Olive: `${RE}/olive-detail-1.jpg`,
  },
};

const coverFor = (handle: string, color: string) =>
  LANDING_COVERS[handle]?.[color] ?? PRODUCT_COLOR_IMAGES[handle]?.[color]?.[0] ?? '';

/**
 * Colourway tiles for one panel, in the order they should appear.
 *
 * PRODUCT_COLORS is deliberately not reordered to achieve this. It also drives
 * the swatch order on the product page and — because the gallery is indexed off
 * it — which colourway a PDP opens on. Sorting it to fix this row would have
 * silently changed the product page's default colour as a side effect.
 *
 * Anything missing from `order` keeps its original position at the end, so a
 * new colourway appears rather than vanishing.
 */
const colorwaysFor = (handle: string, order?: string[]) => {
  const all = PRODUCT_COLORS[handle] ?? [];
  const rank = (name: string) => {
    const i = order ? order.indexOf(name) : -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...all]
    .sort((a, b) => rank(a.name) - rank(b.name))
    .map((c) => ({ color: c.name, swatch: c.value, image: coverFor(handle, c.name) }));
};

// Same two colors as the landing page's palette (sageDeep / brick in
// app/page.tsx) — duplicated here rather than imported so this file has no
// dependency on the landing page. If the landing palette changes, update
// both.
const sageDeep = '#5F6742';
const brick    = '#A9503A';

/**
 * Order matters: this is the order the panels appear in on both pages the
 * pant leads because the pant is what we are promoting. The landing hero
 * sends people to the same product (DESKTOP_SLIDE in HeroCarousel) — change
 * one and change the other, or the first screen and the first panel disagree.
 * The shop page (/collections) was built to put pants first for the same
 * reason, so it reads this array in the same order rather than picking its
 * own.
 *
 * The panels also alternate green then pink on the landing page, which is why
 * the pant's panel is the sage one: it carries the hero's colour straight
 * down into the page.
 */
export const DROP_PRODUCTS: DropProduct[] = [
  {
    handle: 'juniper-pant',
    name: 'the juniper pant',
    // In stock. Derived, not typed, so the day disappears from the panel on
    // its own once it has passed rather than sitting here advertising a date
    // that is already gone.
    availability: `in stock · ${shipPhrase()}`,
    shopLabel: 'shop pants',
    price: 10800,
    bg: '#D7DDC3',
    accent: sageDeep,
    colorways: colorwaysFor('juniper-pant'),
  },
  {
    handle: 'sierra-shorts',
    name: 'the sierra shorts',
    availability: '',
    shopLabel: 'shop shorts',
    price: 6800,
    bg: '#EFDBE0',
    accent: brick,
    colorways: colorwaysFor('sierra-shorts', ['Picnic', 'Confetti', 'Jam']),
  },
];
