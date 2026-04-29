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
      'A cozy fleece designed for the outdoors. Soft, breathable, and warm with a relaxed fit and reinforced seams. Perfect for hiking, camping, or everyday adventures.',
    price: 11000,
    images: ['/images-2/fleece-pink-bg.png', '/images-2/fleece-yellow-bg.png'],
    category: 'Outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Wildflower', 'Golden Hour'],
    stock: 100,
    variants: [],
  },
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
    variants: [],
  },
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
    variants: [],
  },
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
    variants: [],
  },
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
    variants: [],
  },
  {
    id: 'trailblazing-tote',
    handle: 'trailblazing-tote',
    name: 'Trailblazing Club Tote',
    description:
      'Elevated everyday tote made from 100% organic cotton canvas. Reusable & eco-conscious, durable for everyday use, soft yet structured feel. Dimensions: 15.5"L x 11.5"H x 6"D, 6" and 13" handles.',
    price: 3000,
    images: ['/images-2/tote_hp_bg.png'],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Natural'],
    stock: 100,
    variants: [],
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