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

  'pinnacles-pant': {
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
      note: 'Garment measurements in centimetres (cm).',
      sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
      rows: [
        { label: 'Waist (relaxed)',              values: [62, 67, 72, 77, 82, 87, 92] },
        { label: 'Hip',                          values: [100.5, 105.5, 110.5, 115.5, 120.5, 125.5, 130.5] },
        { label: 'Thigh',                        values: [66, 69, 72, 75, 78, 81, 84] },
        { label: 'Length',                       values: [26, 27, 28, 29, 30, 31, 32] },
        { label: 'Front rise (excl. waistband)', values: [21.6, 22.8, 24, 25.2, 26.4, 27.6, 28.8] },
        { label: 'Back rise (excl. waistband)',  values: [30.6, 31.8, 33, 34.2, 35.4, 36.6, 37.8] },
        { label: 'Leg opening',                  values: [66, 69, 72, 75, 78, 81, 84] },
        { label: 'Waistband height',             values: [3.8, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8] },
        { label: 'Drawcord (exposed, per side)', values: [23, 23, 23, 23, 23, 23, 23] },
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
