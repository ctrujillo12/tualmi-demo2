// src/lib/products.ts
//
// Local fallback data matches your Shopify products exactly:
//   - Same handles as the Shopify URL slugs
//   - Same prices (in cents)
//   - Same consolidated products (colors are variants, not separate products)
//   - Same sizes per product type
//
// Once Shopify is live, getProducts() / getProduct() will pull from the API
// automatically and this fallback is bypassed.

import { getAllProducts as shopifyGetAll, getProductByHandle, toProduct } from './shopify';
import type { Product } from '@/types';

// ─── Fallback local data ──────────────────────────────────────────────────────

export const localProducts: Product[] = [
  // ── Trailblazing Fleece ── handle: trailblazing-fleece ─────────────────────
  // Colors: Wildflower, Golden Hour  |  Sizes: XS S M L XL  |  $110
  {
    id: 'trailblazing-fleece',
    handle: 'trailblazing-fleece',
    name: 'Trailblazing Fleece',
    description:
      'A cozy fleece designed for the outdoors. Soft, breathable, and warm with a relaxed fit and reinforced seams. Perfect for hiking, camping, or everyday adventures.',
    price: 11000,
    images: ['/images-2/fleece-pink-bg.png', '/images-2/fleece-yellow-bg.png'],
    category: 'Outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Wildflower', 'Golden Hour'],
    stock: 100,
  },

  // ── Summit Pant ── handle: summit-pant ─────────────────────────────────────
  // Colors: Moss, Birch  |  Sizes: XS S M L XL  |  $90
  {
    id: 'summit-pant',
    handle: 'summit-pant',
    name: 'Summit Pant',
    description:
      'Durable hiking pants built for all terrains. Stretch fabric for mobility, reinforced stitching, and multiple pockets for essentials.',
    price: 9000,
    images: ['/images-2/pants-olive.png', '/images-2/pants-white-bg.png'],
    category: 'Bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Moss', 'Birch'],
    stock: 100,
  },

  // ── Alpine Baby Tee ── handle: alpine-baby-tee ─────────────────────────────
  // Colors: Solstice, Petal  |  Sizes: XS S M L XL  |  $40
  {
    id: 'alpine-baby-tee',
    handle: 'alpine-baby-tee',
    name: 'Alpine Baby Tee',
    description:
      'Engineered with ultra-soft performance fabric, this tee offers a second-skin feel while providing UPF 40 protection and the perfect fit that flexes with your moves. Light, breathable, and designed with your workouts in mind.',
    price: 4000,
    images: ['/images-2/shirt-yellow-bg.png', '/images-2/shirt-pink-bg.png'],
    category: 'Tops',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Solstice', 'Petal'],
    stock: 100,
  },

  // ── Horizon Shorts ── handle: horizon-shorts ───────────────────────────────
  // Colors: Canyon, Dusk, Meadow  |  Sizes: XS S M L XL  |  $70
  {
    id: 'horizon-shorts',
    handle: 'horizon-shorts',
    name: 'Horizon Shorts',
    description:
      'Lightweight, breathable shorts for summer hikes or trail running. Mid-rise waist, comfortable fit, and easy movement.',
    price: 7000,
    images: [
      '/images-2/shorts-red-bg.png',
      '/images-2/shorts-pink-bg.png',
      '/images-2/shorts-pattern-bg.png',
    ],
    category: 'Bottoms',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Canyon', 'Dusk', 'Meadow'],
    stock: 100,
  },

  // ── Carabiner ── handle: carabiner ─────────────────────────────────────────
  // No size/color variants  |  $22
  {
    id: 'carabiner',
    handle: 'carabiner',
    name: 'Carabiner',
    description: 'A decorative carabiner for your adventures.',
    price: 2200,
    images: ['/images-2/carabiner.png'],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Silver'],
    stock: 100,
  },

  // ── Trailblazing Club Tote ── handle: trailblazing-tote ─────
  // No size variants  |  $18
  {
    id: 'trailblazing-tote',
    handle: 'trailblazing-tote',
    name: 'Trailblazing Club Tote',
    description:
      'Elevated everyday tote made from 100% organic cotton canvas. Reusable & eco-conscious, durable for everyday use, soft yet structured feel.',
    price: 3000,
    images: ['/images-2/tote_hp_bg.png'],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Natural'],
    stock: 100,
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all products.
 * Tries Shopify first; falls back to local data if the store has no products yet.
 */
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

/**
 * Returns a single product by its Shopify handle or old numeric string ID.
 * Falls back to local data when the store isn't populated yet.
 *
 * Accepts:
 *   - Shopify handle:  "trailblazing-fleece"
 *   - Old numeric id:  "1", "2", etc. (matched via legacyIdMap below)
 */

// Maps old numeric IDs → new Shopify handles, so existing /products/[id] URLs
// still resolve correctly during the transition.
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
  // Resolve old numeric IDs to handles
  const handle = legacyIdMap[id] ?? id;

  try {
    const sp = await getProductByHandle(handle);
    if (sp) return toProduct(sp);
  } catch (err) {
    console.warn('[products] Shopify product fetch failed, using local data:', err);
  }

  // Fallback: match by handle or id
  return localProducts.find((p) => p.handle === handle || p.id === id) ?? null;
}