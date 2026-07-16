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
      'A mid-weight fleece — think Patagonia Synchilla -- but with the patterns and fit that brand never figured out. Chest zip pocket, snap collar, kangaroo pocket. The Wildflower daisy print looks vintage-shop, the Golden Hour stripe is pink stripes that are somehow also functional. Made by women. Finally fits like it.',
    price: 14900,
    images: ['/images-2/fleece-pink-bg.png', '/images-2/fleece-yellow-bg.png'],
    category: 'Outerwear',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Wildflower', 'Golden Hour'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships Late July 2026',
  },
  {
    id: 'pinnacles-pant',
    handle: 'pinnacles-pant',
    name: 'Pinnacles Pant',
    description:
      'Flare cargo pants that are also actually good for hiking. The fold-over waist you love, cargo pockets that fit your stuff, and a flared leg that that goes with everything. Cinch hem because the trail is real.',
    price: 9900,
    images: ['/images-2/pants-olive.png', '/images-2/pants-white-bg.png'],
    category: 'Bottoms',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
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
      'The layer you actually want under your fleece — and the top you wear when you ditch it. UPF 40 protection, second-skin fit, and the kind of cut that makes your shoulders look good on the summit. Light, breathable, and designed for the girl who doesn\'t leave her style at the trailhead.',
    price: 6900,
    images: ['/images-2/shirt-yellow-bg.png', '/images-2/shirt-pink-bg.png'],
    category: 'Tops',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Solstice', 'Petal'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships August 2026',
  },
  {
    id: 'sierra-shorts',
    handle: 'sierra-shorts',
    name: 'Sierra Shorts',
    description:
      'Inspired by the Patagonia Barely Baggies Shorts — but with the colorways they never made. Mid-rise, relaxed fit, with deep pockets big enough for your whole phone. Canyon is the raspberry-red that shows up in every good hiking photo. Dusk is pink gingham — picnic energy meets trail energy. Meadow is the retro circle print people will ask you about at the trailhead.',
    price: 7200,
    images: [
      '/images-2/shorts-red-bg.png',
      '/images-2/shorts-pink-bg.png',
      '/images-2/shorts-pattern-bg.png',
    ],
    category: 'Bottoms',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Canyon', 'Dusk', 'Meadow'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships Late July 2026',
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
  '3': 'pinnacles-pant',
  '4': 'pinnacles-pant',
  '5': 'alpine-baby-tee',
  '6': 'alpine-baby-tee',
  '7': 'sierra-shorts',
  '8': 'sierra-shorts',
  '9': 'sierra-shorts',
  '11': 'trailblazing-tote',
  // Old handles — keeps existing links working after the renames
  'summit-pant': 'pinnacles-pant',
  'horizon-shorts': 'sierra-shorts',
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