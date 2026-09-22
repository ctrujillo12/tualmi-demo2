// src/lib/products.ts

import { getAllProducts as shopifyGetAll, getProductByHandle, toProduct } from './shopify';
import type { Product } from '@/types';
import { shipByLabel, HANDLING_COPY } from './shipWindow';

// ─── Fallback local data ──────────────────────────────────────────────────────

export const localProducts: Product[] = [
  {
    id: 'trailblazing-fleece',
    handle: 'trailblazing-fleece',
    name: 'Frolic Fleece',
    description:
      'A mid-weight fleece with the patterns and fit the big brands never figured out. Chest zip pocket, snap collar, kangaroo pocket. The Wildflower daisy print looks vintage-shop, and the Golden Hour stripe is pink stripes that are somehow also functional. Made by women. It finally fits like it should.',
    price: 14900,
    // The four *-bg.png files these two entries pointed at have never existed
    // in public/. Harmless today (neither product has a detail page), but they
    // are the images a Shopify outage would fall back to. Pointed at the real
    // "coming soon" tiles the landing page already uses.
    images: ['/images-2/Website Photos/Fleece Coming Soon/1.png'],
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
      'Meet the Juniper, the most flattering hiking pants you’ll own. They feel like your favorite pair of everyday pants, just built for the trail. Fold-over waist, real cargo pockets, and a flared leg in colorways that go with everything. Cinch hem for when the trail gets muddy.',
    price: 10800,
    // Gallery driven by PRODUCT_COLOR_IMAGES; lead shot per colorway
    images: ['/images-2/reedited-photos/Highlights/birch-front-1.jpg', '/images-2/reedited-photos/Highlights/olive-front-1.jpg'],
    category: 'Bottoms',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Birch', 'Olive'],
    stock: 100,
    variants: [],
    // Stock landed 22 Sept 2026, so this is no longer a preorder. The window
    // is a function call rather than a literal so it stops naming a day once
    // that day has gone by -- see lib/shipWindow.ts.
    isPreorder: false,
    shippingWindow: shipByLabel(),
  },
  {
    id: 'alpine-baby-tee',
    handle: 'alpine-baby-tee',
    name: 'Tioga Tee',
    description:
      'The layer you actually want under your fleece, and the top you wear when you ditch it. UPF 40 protection, second-skin fit, and the kind of cut that makes your shoulders look good on the summit. Light, breathable, and designed for the girl who doesn\'t leave her style at the trailhead.',
    price: 6900,
    images: ['/images-2/Website Photos/Top Coming Soon/2.png'],
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
      'Our no-fuss, perfect hiking shorts. Comfy enough to live in all summer, with deep pockets that can fit your whole phone. And the prints? People stop us to ask about them every single time.',
    price: 6800,
    // Gallery is driven per-colorway by PRODUCT_COLOR_IMAGES; these are the
    // lead shots (also used for the cart thumbnail + schema image)
    images: [
      '/images-2/reedited-photos/Highlights/jam-front-5.jpg',
      '/images-2/reedited-photos/Highlights/picnic-front-1.jpg',
      '/images-2/reedited-photos/Highlights/confetti-front-1.jpg',
    ],
    category: 'Bottoms',
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Jam', 'Picnic', 'Confetti'],
    stock: 100,
    variants: [],
    // Shipping, like the pant. Same note as above: this is the OFFLINE
    // FALLBACK only, but it is what renders when Shopify is unreachable, and
    // it was still emitting schema.org/PreOrder for a product that has been
    // shipping for weeks.
    isPreorder: false,
    shippingWindow: `In stock, ships in ${HANDLING_COPY}`,
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

/**
 * Real, buyable products that are deliberately kept OUT of every listing.
 *
 * The tote is a cart-page add-on, not a line in the shop: it exists to bridge
 * the last few dollars to free shipping, and putting it in the grid next to
 * the pant would just give a shopper a cheaper thing to buy instead. So
 * getProducts() (the shop, the landing page) skips it, while getProduct()
 * still resolves it by handle for /api/products and the cart add-on.
 *
 * This is the difference between "unlisted" and REMOVED_HANDLES above, which
 * is "gone" — a removed handle 404s on purpose.
 */
const UNLISTED_HANDLES = ['trailblazing-tote'];

/**
 * The Shopify handle that actually answered, per site handle.
 *
 * Our handles and Shopify's are not the same — Shopify still calls these
 * products `summit-pant` and `horizon-shorts`. getProduct() walks the alias
 * list until one answers, so before this cache a single Juniper page view
 * spent THREE sequential Storefront round-trips (juniper-pant, miss →
 * juniper-pants, miss → summit-pant, hit) and a shorts view spent two, every
 * time the 60s data cache lapsed.
 *
 * Chained requests are the worst shape for this: three round-trips is three
 * chances to be slow and three times the rate-limit cost, on the two pages
 * that matter most, and they add up rather than overlap. Remember which handle
 * won and go straight to it next time.
 *
 * Process-local and self-healing — if a remembered handle stops answering, the
 * walk runs again and re-caches, so products can be renamed in Shopify without
 * a deploy.
 *
 * The real fix is to rename the products in Shopify so the handles match the
 * site's and the first attempt always hits. This makes that unnecessary rather
 * than urgent.
 */
const resolvedShopifyHandle = new Map<string, string>();

// Our curated copy, keyed by handle — always wins over whatever Shopify returns
const localByHandle: Record<string, Product> = Object.fromEntries(
  localProducts.map((p) => [p.handle ?? p.id, p]),
);

function normalizeProduct(p: Product): Product {
  const rename = HANDLE_RENAMES[p.handle ?? p.id];
  let out = rename ? { ...p, ...rename } : p;

  // Curated copy the site controls: name, description, ship window.
  // Price and images come straight from Shopify (source of truth).
  const local = localByHandle[out.handle ?? ''];
  if (local) {
    out = {
      ...out,
      name: local.name,
      description: local.description,
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
        .filter((p) => {
          const h = p.handle ?? p.id;
          return !REMOVED_HANDLES.includes(h) && !UNLISTED_HANDLES.includes(h);
        });
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
    // Whichever handle answered last time first, then the site handle, then the
    // aliases. Deduped, so a remembered handle is never asked for twice.
    const known = resolvedShopifyHandle.get(handle);
    const candidates = [
      ...new Set([
        ...(known ? [known] : []),
        handle,
        ...(ALT_SHOPIFY_HANDLES[handle] ?? []),
      ]),
    ];

    for (const candidate of candidates) {
      const sp = await getProductByHandle(candidate);
      if (sp) {
        resolvedShopifyHandle.set(handle, candidate);
        return normalizeProduct(toProduct(sp));
      }
    }
  } catch (err) {
    console.warn('[products] Shopify product fetch failed, using local data:', err);
  }

  return localProducts.find((p) => p.handle === handle || p.id === id) ?? null;
}