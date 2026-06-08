// Static per-product detail content (fabric, care, features).
// Keyed by product handle so it works with both Shopify and local data.

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
    fit: 'Relaxed fit. Size up for a boxy look, true to size for a fitted silhouette.',
    tempGuide: {
      standalone: '40-65 degrees F (4-18 degrees C)',
      layered: 'Down to ~20 degrees F (-7 degrees C)',
    },
  },

  'summit-pant': {
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
    fit: 'High-rise with a relaxed flared leg. True to size - size up if between sizes.',
  },

  'horizon-shorts': {
    shell: '100% Recycled Nylon',
    weight: '130-140 GSM',
    features: [
      '4-way stretch',
      'Moisture-wicking + quick-dry',
      'Mid-rise waistband',
      'Side zip pockets',
      'Relaxed fit',
    ],
    care: [
      'Machine wash cold',
      'Hang dry',
      'Do not bleach',
      'Do not iron',
    ],
    fit: 'Mid-rise with a relaxed fit. True to size.',
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
