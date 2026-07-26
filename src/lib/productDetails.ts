// Static per-product detail content (fabric, care, features).
// Keyed by product handle so it works with both Shopify and local data.

export interface SizeChart {
  /** e.g. 'Garment measurements in cm' */
  note?: string;
  sizes: string[];
  rows: { label: string; values: (string | number)[] }[];
}

export type HighlightIcon =
  | 'moisture' | 'water' | 'feather' | 'recycled' | 'uv' | 'pocket' | 'stretch' | 'women' | 'cinch';

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
  fit?: string;
  origin?: string;
  tempGuide?: { standalone: string; layered: string };
  sizeChart?: SizeChart;
  /** Optional highlighted note near the CTA — e.g. a ship-date delay */
  shipNote?: string;
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
    shell: '90% Nylon, 10% Spandex',
    lining: '84% Nylon, 16% Spandex',
    weight: '200 GSM',
    highlights: [
      { icon: 'moisture', label: 'Moisture-wicking' },
      { icon: 'stretch',  label: '4-way stretch' },
      { icon: 'pocket',   label: 'Cargo pockets' },
      { icon: 'cinch',    label: 'Drawcord hem' },
      { icon: 'recycled', label: 'Recycled materials' },
    ],
    features: [
      '4-way stretch shell for full range of motion',
      'Moisture-wicking + quick-dry',
'Fold-over-style waistband',
      'Two cargo side pockets',
      'Adjustable drawcord at each hem',
      'Relaxed flared leg silhouette',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Low rise with a relaxed flared leg. True to size — size up if between sizes.',
    shipNote: 'Preorder opens July 31. Due to a small manufacturing delay, the pants ship in late August — order now to lock in your size and colorway.',
    sizeChart: {
      note: 'Garment measurements in inches, taken flat.',
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      rows: [
        { label: 'Length (top to hem)',        values: ['36.5"', '36.75"', '37.25"', '37.5"', '38"', '38.5"', '38.75"'] },
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
    shell: '100% Recycled Nylon',
    weight: '130-140 GSM',
    highlights: [
      { icon: 'moisture', label: 'Moisture-wicking' },
      { icon: 'water',    label: 'Water-resistant' },
      { icon: 'feather',  label: 'Ultra-light' },
      { icon: 'recycled', label: '100% recycled' },
      { icon: 'pocket',   label: 'Deep phone pockets' },
    ],
    features: [
      'Deep side pockets — big enough for your whole phone',
      'Water-resistant shell',
      'Moisture-wicking + quick-dry',
      'Mid-rise waistband',
      'Roomy, relaxed fit',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Mid-rise, relaxed fit. True to size.',
    sizeChart: {
      note: 'Garment measurements in inches, taken flat.',
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      rows: [
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
