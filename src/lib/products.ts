// src/lib/products.ts

import { getAllProducts as shopifyGetAll, getProductByHandle, toProduct } from './shopify';
import type { Product } from '@/types';

// ─── Fallback local data ──────────────────────────────────────────────────────

export const localProducts: Product[] = [
  {
    id: 'trailblazing-fleece',
    handle: 'trailblazing-fleece',
    name: 'Trailblazing Fleece',
    description:
      'You know that feeling when your outfit is too cute to stay on the trail? That\'s this fleece. The Wildflower colorway is a butter-yellow daisy print that looks like it was pulled from your dream vintage shop, except it\'s actually built for the mountain. Chest zip pocket, snap collar, kangaroo pocket — everything you need for the ridge, the trailhead coffee stop, and wherever the day takes you after. The Golden Hour stripe? Pink stripes shouldn\'t be this functional, but here we are. Made by women. Finally fits like it.',
    price: 14900,
    images: ['/images-2/fleece-pink-bg.png', '/images-2/fleece-yellow-bg.png'],
    category: 'Outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Wildflower', 'Golden Hour'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships Late July 2026',
  },
  {
    id: 'summit-pant',
    handle: 'summit-pant',
    name: 'Summit Pant',
    description:
      'Flare cargo pants that are also actually good for hiking. We know. The Summit Pant has the fold-over waist you love, cargo pockets that fit your actual stuff, and a flared leg that hits different at the trailhead. Moss is olive green because you have taste. Birch is the neutral you\'ve been reaching for since Patagonia stopped trying — the cargo flare that goes with everything, from weekend trip to campus to coffee. Cinch hem because the trail is real.',
    price: 9900,
    images: ['/images-2/pants-olive.png', '/images-2/pants-white-bg.png'],
    category: 'Bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Moss', 'Birch'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships Late July 2026',
  },
  {
    id: 'alpine-baby-tee',
    handle: 'alpine-baby-tee',
    name: 'Alpine Baby Tee',
    description:
      'The layer you actually want under your fleece — and the top you wear when you ditch it. UPF 40 protection, second-skin fit, and the kind of cut that makes your shoulders look good on the summit. Solstice is your golden-hour yellow. Petal is the pink that goes with everything. Light, breathable, and designed for the girl who doesn\'t leave her style at the trailhead.',
    price: 6900,
    images: ['/images-2/shirt-yellow-bg.png', '/images-2/shirt-pink-bg.png'],
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Solstice', 'Petal'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships August 2026',
  },
  {
    id: 'horizon-shorts',
    handle: 'horizon-shorts',
    name: 'Horizon Shorts',
    description:
      'Three colorways, one pair of shorts that becomes your whole summer. Canyon is a deep raspberry-red that shows up in every great photo from every great trip — wear it with the Wildflower fleece or literally nothing else and it still works. Dusk is the pink gingham situation: picnic energy meets trail energy, the shorts you wear on a Zion trip and refuse to take off for the rest of the summer. Meadow is the retro circle print — green, pink, brown, and cream — the pair people are going to ask about. Mid-rise, relaxed fit, made for moving.',
    price: 7200,
    images: [
      '/images-2/shorts-red-bg.png',
      '/images-2/shorts-pink-bg.png',
      '/images-2/shorts-pattern-bg.png',
    ],
    category: 'Bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Canyon', 'Dusk', 'Meadow'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships Late July 2026',
  },
  {
    id: 'carabiner',
    handle: 'carabiner',
    name: 'Carabiner',
    description:
      'The finishing touch. Clip it to your bag, your belt loop, your water bottle — wherever it goes, it goes with everything. A little piece of Tualmi for your everyday adventures.',
    price: 2200,
    images: ['/images-2/carabiner.png'],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Silver'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships August 2026',
  },
  {
    id: 'trailblazing-tote',
    handle: 'trailblazing-tote',
    name: 'Trailblazing Club Tote',
    description:
      'The tote that goes everywhere you do. Made from 100% organic cotton canvas — soft but structured, light but durable, reusable because obviously. The kind of bag that looks good on the trail, at the farmers market, and in every photo in between. Dimensions: 15.5"L x 11.5"H x 6"D, with 6" and 13" handles.',
    price: 2500,
    images: ['/images-2/tote_hp_bg.png'],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Natural'],
    stock: 100,
    variants: [],
    // tote is in stock — no preorder fields
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  try {
    const shopifyProducts = await shopifyGetAll();
    if (shopifyProducts.length > 0) {
      return shopifyProducts.map(toProduct);
    }
  } catch (err) {
    console.warn('[products] Shopify fetch failed, using local data:', err);
  }
  return localProducts;
}

const legacyIdMap: Record<string, string> = {
  '1': 'trailblazing-fleece',
  '2': 'trailblazing-fleece',
  '3': 'summit-pant',
  '4': 'summit-pant',
  '5': 'alpine-baby-tee',
  '6': 'alpine-baby-tee',
  '7': 'horizon-shorts',
  '8': 'horizon-shorts',
  '9': 'horizon-shorts',
  '10': 'carabiner',
  '11': 'trailblazing-tote',
};

export async function getProduct(id: string): Promise<Product | null> {
  const handle = legacyIdMap[id] ?? id;

  try {
    const sp = await getProductByHandle(handle);
    if (sp) return toProduct(sp);
  } catch (err) {
    console.warn('[products] Shopify product fetch failed, using local data:', err);
  }

  return localProducts.find((p) => p.handle === handle || p.id === id) ?? null;
}