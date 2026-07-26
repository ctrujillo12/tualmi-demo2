// src/lib/products.ts

import { getAllProducts as shopifyGetAll, getProductByHandle, toProduct } from './shopify';
import type { Product } from '@/types';

// ─── Fallback local data ──────────────────────────────────────────────────────

export const localProducts: Product[] = [
  {
    id: 'trailblazing-fleece',
    handle: 'trailblazing-fleece',
    name: 'Frolic Fleece',
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
    shippingWindow: 'Coming soon',
  },
  {
    id: 'juniper-pant',
    handle: 'juniper-pant',
    name: 'Juniper Pant',
    description:
      'Meet the Juniper — the most flattering hiking pants you’ll own. They feel like your favorite pair of everyday pants, just built for the trail. Fold-over waist, real cargo pockets, and a flared leg in colorways that go with everything. Cinch hem for when the trail gets muddy.',
    price: 10800,
    // Gallery driven by PRODUCT_COLOR_IMAGES; lead shot per colorway
    images: ['/images-2/product-photos/juniper4.jpg', '/images-2/product-photos/olive1.jpg'],
    category: 'Bottoms',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Birch', 'Olive'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: 'Ships August',
  },
  {
    id: 'alpine-baby-tee',
    handle: 'alpine-baby-tee',
    name: 'Tioga Tee',
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
    shippingWindow: 'Coming soon',
  },
  {
    id: 'sierra-shorts',
    handle: 'sierra-shorts',
    name: 'Sierra Shorts',
    description:
      'Our no-fuss, perfect hiking shorts. Comfy enough to live in all summer, with deep pockets that can fit your whole phone. And the prints? People stop us to ask about them — every single time.',
    price: 6800,
    // Gallery is driven per-colorway by PRODUCT_COLOR_IMAGES; these are the
    // lead shots (also used for the cart thumbnail + schema image)
    images: [
      '/images-2/product-photos/jam1.jpg',
      '/images-2/product-photos/picnic1.jpg',
      '/images-2/product-photos/confetti5.jpg',
    ],
    category: 'Bottoms',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Jam', 'Picnic', 'Confetti'],
    stock: 100,
    variants: [],
    isPreorder: true,
    shippingWindow: '',
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

// ─── Renames & removals ───────────────────────────────────────────────────────
// Shopify may still use the old handles/names — normalize whatever it returns
// so the rest of the site only ever sees the new ones.

const HANDLE_RENAMES: Record<string, { id: string; handle: string; name: string }> = {
  'summit-pant': { id: 'juniper-pant', handle: 'juniper-pant', name: 'Juniper Pant' },
  'pinnacles-pant': { id: 'juniper-pant', handle: 'juniper-pant', name: 'Juniper Pant' },
  'juniper-pants': { id: 'juniper-pant', handle: 'juniper-pant', name: 'Juniper Pant' },
  'horizon-shorts': { id: 'sierra-shorts', handle: 'sierra-shorts', name: 'Sierra Shorts' },
};

// Site handle → alternate Shopify handles to try, in order
const ALT_SHOPIFY_HANDLES: Record<string, string[]> = {
  'juniper-pant': ['juniper-pants', 'summit-pant', 'pinnacles-pant'],
  'sierra-shorts': ['horizon-shorts'],
};

// Products removed from the site entirely (may still exist in Shopify)
const REMOVED_HANDLES = ['carabiner'];

// Our curated copy, keyed by handle — always wins over whatever Shopify returns
const localByHandle: Record<string, Product> = Object.fromEntries(
  localProducts.map((p) => [p.handle ?? p.id, p]),
);

function normalizeProduct(p: Product): Product {
  const rename = HANDLE_RENAMES[p.handle ?? p.id];
  let out = rename ? { ...p, ...rename } : p;

  // Force our own name + description + price + ship window (Shopify shouldn't override the site)
  const local = localByHandle[out.handle ?? ''];
  if (local) {
    out = {
      ...out,
      name: local.name,
      description: local.description,
      price: local.price,
      shippingWindow: local.shippingWindow,
    };
  }
  return out;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  try {
    const shopifyProducts = await shopifyGetAll();
    if (shopifyProducts.length > 0) {
      return shopifyProducts
        .map(toProduct)
        .map(normalizeProduct)
        .filter((p) => !REMOVED_HANDLES.includes(p.handle ?? p.id));
    }
  } catch (err) {
    console.warn('[products] Shopify fetch failed, using local data:', err);
  }
  return localProducts;
}

const legacyIdMap: Record<string, string> = {
  '1': 'trailblazing-fleece',
  '2': 'trailblazing-fleece',
  '3': 'juniper-pant',
  '4': 'juniper-pant',
  '5': 'alpine-baby-tee',
  '6': 'alpine-baby-tee',
  '7': 'sierra-shorts',
  '8': 'sierra-shorts',
  '9': 'sierra-shorts',
  '11': 'trailblazing-tote',
  // Old handles — keeps existing links working after the renames
  'summit-pant': 'juniper-pant',
  'pinnacles-pant': 'juniper-pant',
  'juniper-pants': 'juniper-pant',
  'horizon-shorts': 'sierra-shorts',
};

export async function getProduct(id: string): Promise<Product | null> {
  const handle = legacyIdMap[id] ?? id;

  if (REMOVED_HANDLES.includes(handle)) return null;

  try {
    // Try the site handle first, then any alternate Shopify handles
    let sp = await getProductByHandle(handle);
    for (const alt of ALT_SHOPIFY_HANDLES[handle] ?? []) {
      if (sp) break;
      sp = await getProductByHandle(alt);
    }
    if (sp) return normalizeProduct(toProduct(sp));
  } catch (err) {
    console.warn('[products] Shopify product fetch failed, using local data:', err);
  }

  return localProducts.find((p) => p.handle === handle || p.id === id) ?? null;
}