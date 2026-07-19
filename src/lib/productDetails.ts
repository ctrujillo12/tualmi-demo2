// Static per-product detail content (fabric, care, features).
// Keyed by product handle so it works with both Shopify and local data.

export interface SizeChart {
  /** e.g. 'Garment measurements in cm' */
  note?: string;
  sizes: string[];
  rows: { label: string; values: (string | number)[] }[];
}

export interface FabricDetail {
  shell: string;
  lining?: string;
  pocketLining?: string;
  weight?: string;
  features?: string[];
  care?: string[];
  fit?: string;
  origin?: string;
  tempGuide?: { standalone: string; layered: string };
  sizeChart?: SizeChart;
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
      'Cinch hem',
    ],
    care: [
      'Machine wash cold, gentle cycle',
      'Tumble dry low',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Relaxed, oversized fit. Size up for a boxy look, true to size for a more fitted silhouette.\n\nFull size guide coming before launch. Our size S fit model: 5\'7" height · 15" shoulder · 33" chest · 26" waist · 37" hip.',
    tempGuide: {
      standalone: '40-65 degrees F (4-18 degrees C)',
      layered: 'Down to ~20 degrees F (-7 degrees C)',
    },
  },

  'juniper-pant': {
    shell: '90% Nylon, 10% Spandex',
    lining: '84% Nylon, 16% Spandex',
    weight: '200 GSM',
    features: [
      '4-way stretch shell',
      'Moisture-wicking + quick-dry',
      'Fold-over waistband',
      'Cargo side pockets',
      'Cinch ankle hem',
      'Flared leg silhouette',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Low rise with a relaxed flared leg. True to size — size up if between sizes.\n\nFull size guide coming before launch. Our size S fit model: 5\'7" height · 15" shoulder · 33" chest · 26" waist · 37" hip.',
  },

  'sierra-shorts': {
    shell: '100% Recycled Nylon',
    weight: '130-140 GSM',
    features: [
      'Inspired by the Patagonia Barely Baggy Shorts silhouette',
      'Deep side pockets — big enough for your whole phone',
      'Waterproof shell',
      'Moisture-wicking + quick-dry',
      'Mid-rise waistband',
      'Relaxed fit',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Mid-rise, relaxed fit — inspired by the Patagonia Barely Baggy Shorts. True to size.\n\nOur size S fit model: 5\'7" height · 15" shoulder · 33" chest · 26" waist · 37" hip.',
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
    fit: 'Fitted. Size up for a relaxed look.\n\nFull size guide coming before launch. Our size S fit model: 5\'7" height · 15" shoulder · 33" chest · 26" waist · 37" hip.',
  },
};
