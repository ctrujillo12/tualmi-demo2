// Shared color swatch definitions — used by ProductDetailClient, CartUpsell and the landing page.
// Keep these in sync with product.colors values from Shopify/localProducts.

export const PRODUCT_COLORS: Record<string, { name: string; value: string }[]> = {
  'trailblazing-fleece': [
    { name: 'Wildflower',  value: '#E8A0B8' },
    { name: 'Golden Hour', value: '#E8C84A' },
  ],
  'juniper-pant': [
    { name: 'Birch',       value: '#E4DCC8' },
    { name: 'Olive',       value: '#7A8352' },
  ],
  'alpine-baby-tee': [
    { name: 'Petal',       value: '#F2C4CE' },
    { name: 'Solstice',    value: '#D4A843' },
  ],
  // Order matches the image order in products.ts (berry → gingham → retro print)
  'sierra-shorts': [
    { name: 'Jam',      value: '#8E3A56' },
    { name: 'Picnic',   value: '#E7A6C0' },
    { name: 'Confetti', value: 'linear-gradient(135deg, #F2E9DA 0 25%, #A8C484 25% 50%, #7A5C3E 50% 75%, #E28FB4 75% 100%)' },
  ],
};

// Explicit gallery images per colorway (used when a product has different
// numbers of photos per color). Lead/front shot first.

/**
 * The September 2026 studio shoot. Both folders are shot on white at
 * 2400x3600 — the same 2:3 as the set they replace, so the gallery geometry
 * is unchanged.
 *
 * /images-2/model and the two per-shoot folders have been deleted from disk,
 * so there is nothing left to fall back to — these paths are the only product
 * photography the site has.
 *
 * NOTE: scripts/import-product-photos.py no longer drives these lists. It
 * numbered files jam-1.jpg, jam-2.jpg ... in gallery order; these are hand
 * picked from a much larger take, so the filename numbers are the
 * photographer's, not a running order. Re-running that script will NOT
 * regenerate this.
 */
/**
 * The re-edited September 2026 studio set. Every product photo on the site
 * comes from this one folder now; the per-shoot folders it replaced are gone
 * from disk, so any path still pointing at them is a 404.
 *
 * Filenames are colourway-angle-n, assigned by going through all 99 frames:
 * front / 34 / side / back / detail / fun, plus picnic-steph-* for the second
 * Picnic model and group-all-* for the multi-model frames. The number is just
 * a counter within that colourway and angle — it carries no ranking.
 */
const RE = '/images-2/reedited-photos/Highlights';

export const PRODUCT_COLOR_IMAGES: Record<string, Record<string, string[]>> = {
  /**
   * Same running order for every colourway, so flipping between them does not
   * rearrange the gallery:
   *
   *   1 front  2 three-quarter  3 side  4 back  5-7 details  8 a fun frame
   */
  'sierra-shorts': {
    Jam: [
      `${RE}/jam-front-5.jpg`,
      `${RE}/jam-34-1.jpg`,
      `${RE}/jam-side-1.jpg`,
      `${RE}/jam-back-1.jpg`,
      `${RE}/jam-detail-2.jpg`,   // waistband held at the elastic
      `${RE}/jam-detail-4.jpg`,   // hem + woven label
      `${RE}/jam-fun-1.jpg`,      // folded forward
      `${RE}/jam-fun-6.jpg`,      // lying down
    ],
    Picnic: [
      `${RE}/picnic-front-1.jpg`,
      `${RE}/picnic-34-1.jpg`,
      `${RE}/picnic-side-1.jpg`,
      `${RE}/picnic-back-2.jpg`,
      `${RE}/picnic-detail-2.jpg`, // gingham + woven label
      `${RE}/picnic-fun-4.jpg`,
      // Second model, kept as a block at the end so the gallery reads as
      // "and here she is on someone else" — see lib/models.ts.
      `${RE}/picnic-steph-34-2.jpg`,
      `${RE}/picnic-steph-side-1.jpg`,
      `${RE}/picnic-steph-fun-4.jpg`,
    ],
    Confetti: [
      `${RE}/confetti-front-1.jpg`,
      `${RE}/confetti-34-1.jpg`,
      `${RE}/confetti-side-1.jpg`,
      `${RE}/confetti-34-3.jpg`,   // three-quarter from behind
      `${RE}/confetti-detail-2.jpg`,
      `${RE}/confetti-detail-3.jpg`,
      `${RE}/confetti-fun-1.jpg`,
    ],
  },
  'juniper-pant': {
    Birch: [
      `${RE}/birch-front-1.jpg`,
      `${RE}/birch-34-1.jpg`,
      `${RE}/birch-side-1.jpg`,
      `${RE}/birch-back-1.jpg`,
      `${RE}/birch-detail-2.jpg`,  // fold-over waist + cargo pocket
      `${RE}/birch-detail-4.jpg`,  // cargo pocket + woven label
      `${RE}/birch-detail-5.jpg`,  // flare over the boot
      `${RE}/birch-fun-8.jpg`,
    ],
    // Olive runs full-length first, then close, then two poses. It is the one
    // colourway with no side profile in the gallery: olive-side-1 is the only
    // side frame in the set and it was cut, so there is nothing to put back.
    Olive: [
      `${RE}/olive-front-1.jpg`,
      `${RE}/olive-34-1.jpg`,
      `${RE}/olive-back-1.jpg`,
      `${RE}/olive-back-2.jpg`,    // second back angle — slot 4
      `${RE}/olive-detail-1.jpg`,  // fold-over waist + cargo pocket
      `${RE}/olive-detail-5.jpg`,  // cargo pocket label
      `${RE}/olive-fun-1.jpg`,     // crouched, tying a boot
      `${RE}/olive-fun-2.jpg`,     // lying down, knees up
    ],
  },
};

// ─── Lifestyle strip ────────────────────────────────────────────────────────
//
// Outdoor shots — trail, rocks, a clothesline — shown in a small row further
// down the product page, under the description.
//
// Kept out of PRODUCT_COLOR_IMAGES on purpose. The main gallery is white-
// background studio frames whose job is to show the garment accurately; a
// backlit hillside dropped into that sequence makes the studio shots look
// inconsistent and the outdoor ones look like an accident. Separating them
// lets each do its own job.
//
// Generated by LIFESTYLE_PLAN in scripts/import-product-photos.py, at a
// smaller max edge than the gallery since these render as thumbnails.
const LP = '/images-2/lifestyle';
export const PRODUCT_LIFESTYLE_IMAGES: Record<string, Record<string, string[]>> = {
  'sierra-shorts': {
    Jam:      [`${LP}/jam-life-1.jpg`, `${LP}/jam-life-2.jpg`, `${LP}/jam-life-3.jpg`, `${LP}/jam-life-4.jpg`],
    Picnic:   [`${LP}/picnic-life-1.jpg`, `${LP}/picnic-life-2.jpg`, `${LP}/picnic-life-3.jpg`, `${LP}/picnic-life-4.jpg`, `${LP}/picnic-life-5.jpg`, `${LP}/picnic-life-6.jpg`],
    Confetti: [`${LP}/confetti-life-1.jpg`, `${LP}/confetti-life-2.jpg`, `${LP}/confetti-life-3.jpg`, `${LP}/confetti-life-4.jpg`, `${LP}/confetti-life-5.jpg`, `${LP}/confetti-life-6.jpg`],
  },
};

/**
 * Where the model actually stands inside each card's lead photo.
 *
 * ── THE PROBLEM ───────────────────────────────────────────
 * The studio set is not framed to a common scale. Measured against the frame
 * height, the model fills 87% of birch-front-1 and 73% of olive-front-1, so
 * the two Juniper cards in "you may also like" showed the same garment at two
 * noticeably different sizes — which reads as a mistake rather than as two
 * colourways. The shorts have the same spread: jam 87%, picnic 75%,
 * confetti 76%.
 *
 * Cropping cannot fix that. The difference is how far away the model stood,
 * not where the crop lands, so every crop of jam is bigger than every crop of
 * picnic. What fixes it is scaling each photo by the amount that makes her the
 * same height in every card, then shifting her to the same place. These
 * numbers are what that is computed from.
 *
 * `top` and `bottom` are her bounding box as a fraction of the frame height —
 * 0 the top edge, 1 the bottom. Nothing else about the photo is recorded
 * because nothing else is needed: the shoot is one subject on white paper, so
 * her vertical extent IS the framing.
 *
 * ── REGENERATING ────────────────────────────────────────
 * `python3 scripts/measure-card-framing.py` prints this block. Re-run it when
 * a lead photo changes. A colourway with no entry renders un-normalised, so a
 * missing row degrades to a slightly-off card rather than a broken one.
 */
export type SubjectBox = { top: number; bottom: number };

export const PRODUCT_CARD_SUBJECT: Record<string, Record<string, SubjectBox>> = {
  'sierra-shorts': {
    Jam:      { top: 0.0850, bottom: 0.9561 },
    Picnic:   { top: 0.1367, bottom: 0.8900 },
    Confetti: { top: 0.1606, bottom: 0.9200 },
  },
  'juniper-pant': {
    Birch:    { top: 0.0511, bottom: 0.9203 },
    Olive:    { top: 0.1881, bottom: 0.9169 },
  },
};

/**
 * The scale and vertical shift that put this colourway's model at the same
 * height, in the same place, as every other card's.
 *
 * Returns null for a photo that has not been measured — the caller then draws
 * it plain rather than guessing at it.
 *
 * `targetHeight` is how much of the CARD's height she should fill and `anchor`
 * is where her centre should sit, both as fractions of the card. The card
 * draws the photo with object-fit: contain, so the frame's height maps 1:1
 * onto the card's and the arithmetic stays this short:
 *
 *   scale = targetHeight / (the share of the frame she fills)
 *   shift = anchor − (where her centre lands once scaled)
 *
 * Applied as `translateY(shift) scale(scale)`. CSS reads a transform list
 * right to left, so she is scaled first and the shift is then measured in
 * plain card-height units instead of scaled ones — which is the only reason
 * these two numbers can be computed independently of each other.
 */
export function cardFraming(
  handle: string | undefined | null,
  color: string | undefined | null,
  targetHeight: number,
  anchor: number,
): { scale: number; shiftPct: number } | null {
  if (!handle || !color) return null;

  const byColor = PRODUCT_CARD_SUBJECT[handle];
  if (!byColor) return null;

  // Case-insensitive for the same reason cartThumbFor() is: colourway strings
  // arrive from Shopify, from a URL query and from localStorage, and those
  // three do not agree on casing.
  const key = Object.keys(byColor).find((k) => k.toLowerCase() === color.toLowerCase());
  if (!key) return null;

  const { top, bottom } = byColor[key];
  const height = bottom - top;
  // A zero or inverted box would divide by zero or flip the photo upside down.
  if (!(height > 0)) return null;

  const scale = targetHeight / height;
  const centre = (top + bottom) / 2;
  const shift = anchor - ((centre - 0.5) * scale + 0.5);

  // Rounded because these end up in the HTML on every card, and a card does
  // not need the fifteenth decimal place of a scale factor.
  return {
    scale: Math.round(scale * 1000) / 1000,
    shiftPct: Math.round(shift * 10000) / 100,
  };
}

/**
 * The photo the cart should show for a given colourway.
 *
 * PRODUCT_COLOR_IMAGES above is the exact source the product-page gallery
 * renders from, so this returns, by construction, the first photo the shopper
 * was just looking at.
 *
 * IT DELIBERATELY BEATS SHOPIFY'S OWN IMAGE. The re-edited studio photos live
 * here, in the repo; Shopify still holds the original shoot. Every add-to-cart
 * path used to prefer the Shopify CDN URL and fall back to this, which is why
 * cart thumbnails were the old photos. Worse, two of those paths fell back to
 * the product's FIRST Shopify image rather than the selected variant's, so a
 * Picnic line could show a Jam photo — wrong shoot and wrong colourway.
 *
 * Matching is case-insensitive: cart lines persist in localStorage, so an old
 * entry can carry whatever casing was in use the day it was added.
 */
export function galleryImageFor(
  handle: string | undefined | null,
  color: string | undefined | null,
): string | undefined {
  if (!handle) return undefined;
  const gallery = PRODUCT_COLOR_IMAGES[handle];
  if (!gallery) return undefined;

  const want = (color ?? '').trim().toLowerCase();
  const key = Object.keys(gallery).find((k) => k.toLowerCase() === want);
  const hit = key ? gallery[key]?.[0] : undefined;

  // No colourway match (a renamed colour, or a product with one gallery) —
  // the product's own first photo still beats a stale Shopify URL.
  return hit ?? Object.values(gallery)[0]?.[0];
}

/**
 * The Shopify image for a specific colourway.
 *
 * THIS IS THE COLOURWAY FIX. Every add-to-cart path used to fall back to
 * `product.images.find(u => u.startsWith('http'))` — the product's FIRST
 * Shopify image, which belongs to whichever colourway Shopify happens to list
 * first. Adding Picnic could bank a Jam photo. A variant-scoped lookup can
 * only ever return the colour the shopper actually chose, so the fallback
 * below is the local gallery for that same colour, never a colour-agnostic
 * product image.
 */
export function shopifyImageForColor(
  variants: { image?: { url?: string } | null; selectedOptions?: { name: string; value: string }[] }[] | undefined | null,
  color: string | undefined | null,
): string | undefined {
  const want = (color ?? '').trim().toLowerCase();
  if (!want || !variants?.length) return undefined;
  return variants.find((v) =>
    v.image?.url &&
    v.selectedOptions?.some((o) => o.name.toLowerCase() === 'color' && o.value.toLowerCase() === want),
  )?.image?.url ?? undefined;
}

/**
 * The cart thumbnail for a colourway: the local gallery first, Shopify second.
 *
 * WHY THE GALLERY WINS, checked against live Shopify data on 14 Sept 2026:
 * the photos are uploaded to the PRODUCT but not assigned to the VARIANTS, so
 * every variant inherits the product's featured image. All 21 Sierra Shorts
 * variants — Jam, Picnic and Confetti alike — report `picnic-front-2.jpg`,
 * and both Juniper colourways report `birch-front-1.jpg`. Shopify is
 * currently incapable of saying which photo is which colourway, so trusting it
 * would put a Picnic photo on a Jam line. PRODUCT_COLOR_IMAGES is keyed BY
 * colourway, so it cannot make that mistake.
 *
 * If the images are later assigned per variant in Shopify (Products → the
 * product → Variants → select a variant → its image), this order still holds
 * and stays correct — both sources would then agree, and the gallery is the
 * one that also feeds the product page, so the cart keeps matching the page
 * the item was added from.
 */
export function cartThumbFor(
  handle: string | undefined | null,
  color: string | undefined | null,
  variants?: { image?: { url?: string } | null; selectedOptions?: { name: string; value: string }[] }[] | null,
): string | undefined {
  return galleryImageFor(handle, color) ?? shopifyImageForColor(variants, color);
}
