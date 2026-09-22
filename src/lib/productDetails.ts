// Static per-product detail content (fabric, care, features).
// Keyed by product handle so it works with both Shopify and local data.

export interface SizeChart {
  /** e.g. 'Garment measurements in cm' */
  note?: string;
  sizes: string[];
  rows: { label: string; values: (string | number)[] }[];
}

export type HighlightIcon =
  | 'moisture' | 'water' | 'feather' | 'recycled' | 'uv' | 'pocket' | 'stretch' | 'fit' | 'cinch'
  | 'waist';

export interface Highlight {
  icon: HighlightIcon;
  label: string;
}

export interface FabricDetail {
  shell: string;
  lining?: string;
  pocketLining?: string;
  weight?: string;
  features?: string[];
  /** Short, icon-backed selling points shown as a strip near the top */
  highlights?: Highlight[];
  care?: string[];
  /**
   * Fit and sizing.
   *
   * A string renders as prose (paragraphs split on a blank line); an array
   * renders as bullets. Bullets for anything with more than one idea in it:
   * this block sits beside the size picker and gets scanned, not read, and a
   * five-clause paragraph about rise, length and what to do between sizes is
   * the kind of thing people skip and then get wrong.
   *
   * Do not end it with a pointer to the size guide — the component already
   * renders that line whenever a sizeChart exists.
   */
  fit?: string | string[];
  /** Model reference line, e.g. "rachel is 5'6\" and wearing a size small" */
  modelNote?: string;
  origin?: string;
  tempGuide?: { standalone: string; layered: string };
  sizeChart?: SizeChart;
  /** Optional highlighted note near the CTA — e.g. a ship-date delay */
  shipNote?: string;
  /**
   * The questions people actually ask before buying, answered.
   *
   * Rendered FIRST in the accordion, above the spec list, because these are
   * decision questions and the spec list is reference material.
   *
   * Every answer here is a factual claim about the garment and gets held to
   * the same bar as the feature list: if nobody has confirmed it, it does not
   * go in. An unanswered question costs a sale; a wrong answer costs a return
   * and the customer.
   */
  /**
   * One line, directly under the price, before anything else.
   *
   * The page had no answer to "why is this $108?" above the fold. The
   * strongest sentence on the page -- "they feel like your favorite pair of
   * everyday pants, just built for the trail" -- was in the Shopify
   * description, which renders BELOW the buy box, i.e. after the shopper has
   * already decided. This is that promise, moved to where the decision
   * happens.
   *
   * It is a promise, not a spec list. The specs are the chips right beneath
   * it; repeating them here would be the third time the page says
   * "4-way stretch" before you have scrolled.
   */
  tagline?: string;

  faq?: { q: string; a: string }[];
  /**
   * The three claims in the strip above the product name.
   *
   * Per product, because they are factual claims about THIS garment and not
   * every garment is made the same way. Omit to get DEFAULT_TRUST_CLAIMS in
   * components/ProductDetailClient.tsx.
   */
  trustClaims?: string[];
}

export const PRODUCT_DETAILS: Record<string, FabricDetail> = {
  'trailblazing-fleece': {
    shell: '100% Recycled Polyester',
    pocketLining: 'Cotton Jersey',
    weight: '290-300 GSM',
    features: [
      '100% recycled polyester construction',
      'Double-sided brushed fleece interior',
      'Chest zip pocket',
      'Button collar with kangaroo pocket',
      'Adjustable drawcord hem',
    ],
    care: [
      'Machine wash cold, gentle cycle',
      'Tumble dry low',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Relaxed, oversized fit. Size up for a boxy look, true to size for a more fitted silhouette.',
    tempGuide: {
      standalone: '40-65 degrees F (4-18 degrees C)',
      layered: 'Down to ~20 degrees F (-7 degrees C)',
    },
  },

  'juniper-pant': {
    // NOT 'recycled fabric': the pant's shell is virgin nylon/spandex. The
    // default claim list says recycled and would have been false here.
    trustClaims: ['women-owned', 'WRAP-certified', 'designed in LA'],
    shell: '90% Nylon, 10% Spandex',
    lining: '84% Nylon, 16% Spandex',
    weight: '200 GSM',
    tagline: 'Fits like your favorite pants. Built for the trail.',
    // ── THE $108 QUESTION ───────────────────────────────────────
    // These six are the answer to "why not $60?", so they lead with what a
    // cheaper pant does NOT have. Two changes worth naming:
    //
    //   'Flattering fit' → 'Flared leg'. The old label was a claim every
    //   brand makes and nobody can check; the flare is the actual silhouette
    //   and the reason someone wants this pant over a straight nylon hiker.
    //
    //   'Snap-close pockets' → 'Cargo pockets'. The snap is the detail, not
    //   the selling point. Kept to two words like the rest: these sit in a
    //   single row of six, so a three-word label is the one that wraps to a
    //   third line and makes the strip look broken.
    //
    //   'Foldover waist' is new and is the single most distinctive thing
    //   about the garment -- it had no chip at all.
    highlights: [
      { icon: 'waist',    label: 'Foldover waist' },
      { icon: 'fit',      label: 'Flared leg' },
      { icon: 'pocket',   label: 'Cargo pockets' },
      { icon: 'stretch',  label: '4-way stretch' },
      { icon: 'cinch',    label: 'Cinchable hems' },
      { icon: 'moisture', label: 'Moisture-wicking' },
    ],
    // ── WHO OWNS WHAT ───────────────────────────────────────────
    // Three blocks describe this pant and they kept saying the same things in
    // different words. Each fact now lives in exactly one of them:
    //
    //   fit       — how it sits on you and what size to order
    //   features  — the spec sheet: fabric and hardware, terse, no sentences
    //   faq       — the questions with a nuance or a "no" in the answer
    //
    // So: no silhouette or rise here (that is fit), and no explaining (that is
    // the faq). If you add a line here, check it is not already answered.
    features: [
      '4-way stretch',
      'Moisture-wicking, quick-dry',
      'Elastic-tape waistband with an internal drawstring',
      'Two cargo side pockets, snap closures',
      '10" drawcord at each hem',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    // Read on a phone, in a few seconds, standing up. Five short lines, no em
    // dashes, nothing that needs a second pass.
    //
    // No measurements beyond the inseam. Every rise figure this block has
    // carried has been wrong or disputed at some point, and the size chart
    // right below already holds the whole column for anyone who wants it. The
    // rise belongs here as a shape word, not a number.
    fit: [
      '29" inseam',
      'Mid-rise',
      'Relaxed flared leg, roomy through the hip and thigh',
      'True to size. Between sizes, size down.',
      'Waist and hip different sizes? Go by hip. The waist adjusts.',
    ],
    // modelNote removed: it said "rachel is 5'6"" on every colourway, which
    // the September 2026 shoot made false — it was shot with a different model
    // per colourway, and Picnic with two. This is now derived per photograph
    // from lib/models.ts. Edit it there, not here.
    // No shipNote — the preorder callout above the add-to-cart button (in
    // ProductDetailClient) already states the ship window, and having both
    // showed two competing preorder cards. Set this only for a genuinely
    // different message, e.g. an unexpected delay.
    faq: [
      {
        q: 'Can I unfold the waistband?',
        a: 'Partly. It’s stitched down at the sides with the front and back left loose, so you can pull it up for a '
         + 'bit more coverage, useful under a pack strap. It won’t open all the way out into a mid-rise. Elastic '
         + 'tape holds it up, and there’s an internal drawstring if you want it tighter.',
      },
      {
        q: 'Are they see-through? Especially Birch?',
        a: 'No. Fully opaque in every colourway, Birch included.',
      },
      {
        q: 'What fits in the pockets?',
        a: 'Two deep cargo pockets, one on each leg, each with a snap. A phone goes in and stays in.',
      },
      {
        q: 'Are they water resistant?',
        a: 'No. The fabric is moisture-wicking and quick-dry, so it handles sweat and dries fast, but it is not a '
         + 'rain pant.',
      },
      {
        q: 'Do they make that hiking-pant noise?',
        a: 'A bit of rustle when you walk. It’s a technical nylon, not a cotton pant.',
      },
    ],
    sizeChart: {
      note: 'Garment measurements in inches, taken flat. Inseam is 29" on every size.',
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      rows: [
        { label: 'Length (top to hem)',        values: ['36.5"', '36.75"', '37.25"', '37.5"', '38"', '38.5"', '38.75"'] },
        // Constant across sizes, and the single most-asked pant measurement.
        // Kept as a row anyway so it is visible in the table people scan, not
        // only in the note above it.
        { label: 'Inseam',                     values: ['29"', '29"', '29"', '29"', '29"', '29"', '29"'] },
        { label: 'Waist',                       values: ['22.75"', '24.75"', '26.75"', '28.75"', '30.75"', '32.75"', '34.75"'] },
        { label: 'Hip',                         values: ['33.75"', '35.75"', '37.75"', '39.75"', '41.75"', '43.75"', '45.75"'] },
        { label: 'Thigh',                       values: ['20"', '21.25"', '22.5"', '23.5"', '24.75"', '26"', '27.25"'] },
        { label: 'Front rise',                  values: ['8.25"', '8.5"', '8.75"', '9.25"', '9.5"', '9.75"', '10"'] },
        { label: 'Back rise',                   values: ['11.5"', '12"', '12.25"', '12.5"', '12.75"', '13.25"', '13.5"'] },
        { label: 'Waistband height',            values: ['4.5"', '4.5"', '4.5"', '4.5"', '4.5"', '4.5"', '4.5"'] },
        { label: 'Leg opening (½)',             values: ['10.25"', '10.75"', '11.25"', '11.75"', '12.25"', '12.75"', '13.25"'] },
        { label: 'Drawcord (exposed, per side)',values: ['10"', '10"', '10"', '10"', '10"', '10"', '10"'] },
      ],
    },
  },

  'sierra-shorts': {
    // Stated outright rather than inherited from DEFAULT_TRUST_CLAIMS. The
    // default used to carry 'recycled fabric' and the shorts relied on it,
    // which is exactly how the pant ended up claiming it too. The product that
    // can truthfully say this is the one that says it.
    trustClaims: ['women-owned', 'WRAP-certified', 'recycled fabric'],
    shell: '100% Recycled Nylon',
    weight: '130-140 GSM',
    highlights: [
      { icon: 'moisture', label: 'Fast-dry' },
      { icon: 'water',    label: 'Water-repellent' },
      { icon: 'feather',  label: 'Ultra-light' },
      { icon: 'recycled', label: '100% recycled' },
      { icon: 'pocket',   label: 'Deep phone pockets' },
    ],
    features: [
      '3" inseam',
      'Deep side pockets, big enough for your whole phone',
      'Water-repellent shell',
      'Fast-dry performance',
      'Mid-rise waistband',
      'Roomy, relaxed fit',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Mid-rise, relaxed fit with a 3" inseam. True to size.',
    // modelNote removed: it said "rachel is 5'6"" on every colourway, which
    // the September 2026 shoot made false — it was shot with a different model
    // per colourway, and Picnic with two. This is now derived per photograph
    // from lib/models.ts. Edit it there, not here.
    sizeChart: {
      note: 'Garment measurements in inches, taken flat. Inseam is 3" on every size.',
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      rows: [
        // Same on every size — kept as a row anyway so it's visible in the
        // chart people actually scan, not just in the note above it.
        { label: 'Inseam',                       values: ['3"', '3"', '3"', '3"', '3"', '3"', '3"'] },
        { label: 'Waist (relaxed)',              values: ['24.5"', '26.5"', '28.25"', '30.25"', '32.25"', '34.25"', '36.25"'] },
        { label: 'Hip',                          values: ['39.5"', '41.5"', '43.5"', '45.5"', '47.5"', '49.5"', '51.5"'] },
        { label: 'Thigh',                        values: ['26"', '27.25"', '28.25"', '29.5"', '30.75"', '32"', '33"'] },
        { label: 'Length',                       values: ['10.25"', '10.75"', '11"', '11.5"', '11.75"', '12.25"', '12.5"'] },
        { label: 'Front rise (excl. waistband)', values: ['8.5"', '9"', '9.5"', '10"', '10.5"', '10.75"', '11.25"'] },
        { label: 'Back rise (excl. waistband)',  values: ['12"', '12.5"', '13"', '13.5"', '14"', '14.5"', '15"'] },
        { label: 'Leg opening',                  values: ['26"', '27.25"', '28.25"', '29.5"', '30.75"', '32"', '33"'] },
        { label: 'Waistband height',             values: ['1.5"', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"'] },
        { label: 'Drawcord (exposed, per side)', values: ['9"', '9"', '9"', '9"', '9"', '9"', '9"'] },
      ],
    },
  },

  'alpine-baby-tee': {
    shell: '95% Polyester, 5% Spandex',
    weight: 'Lightweight',
    features: [
      'UPF 40+ sun protection',
      'Second-skin stretch fit',
      'Moisture-wicking',
      'Flatlock seams to prevent chafing',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Fitted. Size up for a relaxed look.',
  },
};
