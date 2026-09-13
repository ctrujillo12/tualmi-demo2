// Shared color swatch definitions — used by ProductCard and ProductDetailClient.
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
