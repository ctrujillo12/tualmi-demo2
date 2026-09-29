'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';
import {
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
  cartAttributesUpdate,
  cartDiscountCodesUpdate,
  getCart,
  checkoutUrlFor,
  type ShopifyCart,
} from '@/lib/shopify';
import type { ShopifyVariant } from '@/lib/shopify';
import { findVariant, maxPurchasable } from '@/lib/inventory';
import { attributionCartAttributes } from '@/lib/attribution';
import { getDiscountCode } from '@/lib/discount';
import { galleryImageFor } from '@/lib/productColors';
import { trackBeginCheckout } from '@/lib/analytics';
import { getGaIds } from '@/lib/ga';

interface CartStore {
  items: CartItem[];
  /**
   * The real Shopify cart backing this session, created on the shopper's
   * first add-to-cart (see the sync queue below) rather than at checkout.
   * Null until then, or if every sync attempt so far has failed (offline,
   * Shopify down) — checkout falls back to creating one on the spot in that
   * case, from whatever's already in Zustand.
   */
  shopifyCartId: string | null;
  /** Raw, as Shopify returned it — pass through checkoutUrlFor() before use. */
  shopifyCheckoutUrl: string | null;
  addItem: (
    product: Product,
    selectedSize: string,
    selectedColor: string,
    quantity?: number,
    options?: { isPreorder?: boolean; shippingWindow?: string }
  ) => void;
  removeItem: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  /** Re-sync each item's price + image from Shopify (kills stale snapshots). */
  refreshFromShopify: () => Promise<void>;
  /**
   * Builds a Shopify cart from the current items and navigates to the hosted
   * Shopify checkout. Throws if a variant can't be resolved.
   */
  redirectToShopifyCheckout: () => Promise<void>;
}

// ─── Variant resolver ─────────────────────────────────────────────────────────
/**
 * The Shopify variant for a cart line — exact size + colour, or nothing.
 *
 * This used to fall back twice: first to any variant in the same SIZE
 * regardless of colour, then to "whatever variant happens to be available".
 * Both are silent substitutions. Someone who picked Picnic / S could be
 * charged for, and shipped, Jam / S, with no error raised anywhere — from
 * Shopify's side it's a perfectly valid order. That's worse than a failed
 * checkout. A failed checkout is a support email; a wrong item is a return, a
 * refund, and a customer who doesn't come back.
 *
 * So: exact, or nothing. Callers surface the failure.
 */
type VariantResolution =
  | { ok: true; variant: ShopifyVariant }
  | { ok: false; reason: 'no-data' | 'no-match' | 'sold-out' };

function resolveVariant(item: CartItem): VariantResolution {
  const variants: ShopifyVariant[] | undefined = item.product.variants;
  if (!variants || variants.length === 0) return { ok: false, reason: 'no-data' };

  const variant = findVariant(item.product, item.selectedColor, item.selectedSize);
  if (!variant) return { ok: false, reason: 'no-match' };
  // Shopify would reject this at payment anyway. Better to say so here, where
  // the shopper can still change size instead of hitting a wall on checkout.
  if (!variant.availableForSale) return { ok: false, reason: 'sold-out' };

  return { ok: true, variant };
}

/** How a cart line reads to a shopper, e.g. "Sierra Shorts (Picnic / S)". */
function describeLine(item: CartItem): string {
  const opts = [item.selectedColor, item.selectedSize].filter(Boolean).join(' / ');
  return opts ? `${item.product.name} (${opts})` : item.product.name;
}

/** Identifies a cart line the same way Zustand's own add/remove/update do. */
function lineKey(item: { product: Product; selectedSize: string; selectedColor: string }): string {
  return `${item.product.id}::${item.selectedSize}::${item.selectedColor}`;
}

/**
 * The "Ships: ..." line attribute for a cart item, matching the wording
 * checkout has always attached to Shopify order line items. Pulled out so it
 * can be attached the same way whether a line first reaches Shopify via the
 * checkout-time cartCreate fallback or the ongoing add-to-cart sync below.
 */
function lineAttributesFor(item: CartItem): { key: string; value: string }[] | undefined {
  const window = (item.shippingWindow ?? '')
    .replace(/^in stock,\s*/i, '')
    .replace(/^ships\s+/i, '')
    .trim();
  return window ? [{ key: 'Ships', value: window }] : undefined;
}

/**
 * Cart lines Shopify won't accept as-is, with a reason. The cart page uses
 * this to warn before the shopper commits, and checkout refuses to proceed
 * while it's non-empty.
 *
 * Lines whose product carries no Shopify data at all are deliberately NOT
 * listed — that's the offline fallback, and blocking on it would take the
 * store down every time Shopify hiccups.
 */
export function unsellableLines(items: CartItem[]): { item: CartItem; reason: 'no-match' | 'sold-out' }[] {
  const out: { item: CartItem; reason: 'no-match' | 'sold-out' }[] = [];
  for (const item of items) {
    const r = resolveVariant(item);
    if (!r.ok && r.reason !== 'no-data') out.push({ item, reason: r.reason });
  }
  return out;
}

function devLog(...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production') console.log('[cart:shopify]', ...args);
}

// ─── Shopify sync queue ────────────────────────────────────────────────────────
//
// Every add/remove/quantity-change updates Zustand immediately (optimistic —
// the UI never waits on Shopify), then queues a matching Shopify call here.
// The queue is a single promise chain so rapid clicks (double-tapping "add",
// spamming the quantity stepper) hit Shopify in the same order the shopper
// clicked them, instead of racing and possibly landing in reverse order.
//
// Each queued step reads CURRENT state via get() when it actually runs, not
// when it was enqueued, so it always acts on the latest quantities and the
// latest shopifyLineId — including one set by the step just before it.
let syncQueue: Promise<void> = Promise.resolve();

function queueSync(fn: () => Promise<void>): void {
  syncQueue = syncQueue.then(fn).catch((err) => {
    // A failed sync never surfaces to the shopper — Shopify is a mirror of
    // Zustand here, not the source of truth, so a hiccup here just means this
    // one line is out of sync until the next mutation (or checkout's
    // recreate-on-gone fallback) fixes it.
    console.error('[cart:shopify] sync step failed (UI unaffected):', err);
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => {
      /**
       * Rebuilds the Shopify cart from scratch out of whatever's currently in
       * Zustand. Used the first time anything is added (no cart yet) and
       * whenever a mutation comes back null (Shopify no longer recognises the
       * stored cart id — expired, or manually voided in the admin).
       */
      async function recreateCart(): Promise<ShopifyCart | null> {
        const items = get().items;
        const lines: { variantId: string; quantity: number; attributes?: { key: string; value: string }[] }[] = [];
        // key -> variantId, so the returned cart's lines (order not assumed to
        // match what was sent) can be matched back to the right Zustand row.
        const keyToVariant = new Map<string, string>();
        for (const item of items) {
          const resolved = resolveVariant(item);
          if (!resolved.ok) continue; // best-effort — same offline fallback as checkout
          lines.push({ variantId: resolved.variant.id, quantity: item.quantity, attributes: lineAttributesFor(item) });
          keyToVariant.set(lineKey(item), resolved.variant.id);
        }
        if (lines.length === 0) {
          set({ shopifyCartId: null, shopifyCheckoutUrl: null });
          return null;
        }

        try {
          const cart = await cartCreate(lines);
          devLog('cartCreate (recreate) ->', cart.id, cart.lines);
          const claimed = new Set<string>();
          set((state) => ({
            shopifyCartId: cart.id,
            shopifyCheckoutUrl: cart.checkoutUrl,
            items: state.items.map((item) => {
              const variantId = keyToVariant.get(lineKey(item));
              if (!variantId) return item;
              const line = cart.lines.find((l) => l.variantId === variantId && !claimed.has(l.id));
              if (!line) return item;
              claimed.add(line.id);
              return { ...item, shopifyLineId: line.id };
            }),
          }));
          return cart;
        } catch (err) {
          console.error('[cart:shopify] recreateCart failed:', err);
          return null;
        }
      }

      /** Attaches a just-learned Shopify CartLine id onto its Zustand item. */
      function attachLineId(key: string, shopifyLineId: string) {
        set((state) => ({
          items: state.items.map((item) =>
            lineKey(item) === key ? { ...item, shopifyLineId } : item
          ),
        }));
      }

      /**
       * Syncs one line to Shopify so it matches whatever Zustand currently
       * holds for it: creates the cart if this is the very first item,
       * cartLinesAdd if the line hasn't reached Shopify yet, or
       * cartLinesUpdate (to the line's current quantity) if it has. Covers
       * both addItem and updateQuantity — both just want "make Shopify agree
       * with this line's current quantity".
       */
      async function syncLine(key: string) {
        const current = get().items.find((i) => lineKey(i) === key);
        if (!current) return; // removed again before this step ran
        const resolved = resolveVariant(current);
        if (!resolved.ok) {
          devLog('skip sync — no resolvable variant for', describeLine(current), resolved.reason);
          return;
        }

        const { shopifyCartId } = get();
        if (!shopifyCartId) {
          await recreateCart();
          return;
        }

        if (current.shopifyLineId) {
          const updated = await cartLinesUpdate(shopifyCartId, [
            { id: current.shopifyLineId, quantity: current.quantity },
          ]);
          if (updated === null) {
            devLog('cart gone on update — recreating from current cart contents');
            await recreateCart();
            return;
          }
          devLog('cartLinesUpdate ->', updated.id, `qty=${current.quantity}`, describeLine(current));
          return;
        }

        const updated = await cartLinesAdd(shopifyCartId, [
          { variantId: resolved.variant.id, quantity: current.quantity, attributes: lineAttributesFor(current) },
        ]);
        if (updated === null) {
          devLog('cart gone on add — recreating from current cart contents');
          await recreateCart();
          return;
        }
        devLog('cartLinesAdd ->', updated.id, describeLine(current));
        // Match this line back by variant id. Guard against grabbing a line
        // some OTHER Zustand row already claimed (two rows resolving to the
        // same variant shouldn't normally happen, but would otherwise attach
        // the same shopifyLineId to both).
        const alreadyKnown = new Set(get().items.map((i) => i.shopifyLineId).filter(Boolean));
        const freshLine = updated.lines.find(
          (l) => l.variantId === resolved.variant.id && !alreadyKnown.has(l.id)
        );
        if (freshLine) attachLineId(key, freshLine.id);
        else devLog('could not match new line back to', describeLine(current));
      }

      /** Removes one line from the existing Shopify cart, if it ever synced. */
      async function syncRemove(shopifyCartId: string | null, shopifyLineId: string | undefined) {
        if (!shopifyCartId || !shopifyLineId) return; // never reached Shopify — nothing to remove
        const updated = await cartLinesRemove(shopifyCartId, [shopifyLineId]);
        if (updated === null) {
          devLog('cart gone on remove — recreating from current cart contents');
          await recreateCart();
          return;
        }
        devLog('cartLinesRemove ->', updated.id, shopifyLineId);
      }

      return {
        items: [],
        shopifyCartId: null,
        shopifyCheckoutUrl: null,

        addItem: (product, selectedSize, selectedColor, quantity = 1, options) => {
          set((state) => {
            const existing = state.items.find(
              (i) =>
                i.product.id === product.id &&
                i.selectedSize === selectedSize &&
                i.selectedColor === selectedColor
            );

            if (existing) {
              // Never let repeated taps push a line past what Shopify has. When
              // the quantity isn't readable this is a no-op cap, not a block.
              const wanted = existing.quantity + quantity;
              const allowed = maxPurchasable(product, selectedColor, selectedSize, wanted);
              return {
                items: state.items.map((i) =>
                  i === existing ? { ...i, quantity: Math.max(existing.quantity, allowed) } : i
                ),
              };
            }

            return {
              items: [
                ...state.items,
                {
                  product,
                  selectedSize,
                  selectedColor,
                  quantity,
                  isPreorder: options?.isPreorder ?? false,
                  shippingWindow: options?.shippingWindow,
                },
              ],
            };
          });

          // Fire-and-forget: Shopify is a mirror of Zustand, never a gate on it.
          const key = lineKey({ product, selectedSize, selectedColor });
          queueSync(() => syncLine(key));
        },

        removeItem: (productId, selectedSize, selectedColor) => {
          const toRemove = get().items.find(
            (i) =>
              i.product.id === productId &&
              i.selectedSize === selectedSize &&
              i.selectedColor === selectedColor
          );

          set((state) => ({
            items: state.items.filter(
              (i) =>
                !(i.product.id === productId &&
                  i.selectedSize === selectedSize &&
                  i.selectedColor === selectedColor)
            ),
          }));

          if (toRemove) {
            const { shopifyCartId } = get();
            const { shopifyLineId } = toRemove;
            queueSync(() => syncRemove(shopifyCartId, shopifyLineId));
          }
        },

        updateQuantity: (productId, selectedSize, selectedColor, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId, selectedSize, selectedColor);
            return;
          }
          set((state) => ({
            items: state.items.map((i) => {
              if (
                i.product.id !== productId ||
                i.selectedSize !== selectedSize ||
                i.selectedColor !== selectedColor
              ) {
                return i;
              }
              // Raising the quantity is capped at real stock; lowering it always
              // goes through, even below what's currently sellable.
              const capped =
                quantity > i.quantity
                  ? Math.max(i.quantity, maxPurchasable(i.product, selectedColor, selectedSize, quantity))
                  : quantity;
              return { ...i, quantity: capped };
            }),
          }));

          const key = lineKey({
            product: { id: productId } as Product,
            selectedSize,
            selectedColor,
          });
          queueSync(() => syncLine(key));
        },

        clearCart: () => set({ items: [] }),

        getTotal: () =>
          get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

        getItemCount: () =>
          get().items.reduce((sum, i) => sum + i.quantity, 0),

        refreshFromShopify: async () => {
          const { items } = get();
          if (items.length === 0) return;

          const handles = [...new Set(items.map((i) => i.product.handle ?? i.product.id))];
          const results = await Promise.all(
            handles.map(async (h) => {
              try {
                const res = await fetch(`/api/product-refresh?handle=${encodeURIComponent(h)}`);
                const data = await res.json();
                return [h, data] as const;
              } catch {
                return [h, { ok: false }] as const;
              }
            }),
          );
          const byHandle = Object.fromEntries(results);

          set({
            items: get().items.map((item) => {
              const key = item.product.handle ?? item.product.id;
              const d = byHandle[key];
              if (!d || !d.ok) return item;
              // The gallery first, for the reason documented on cartThumbFor():
              // Shopify's per-variant images are all the same product-level photo
              // today, so imageByColor returns one colourway's picture for every
              // colour. This runs on EVERY cart load, so getting it wrong here
              // silently re-broke any thumbnail the add path got right. The old
              // `?? d.featured` tail was worse still — featured is by definition
              // a single colourway's photo.
              const colorImg =
                galleryImageFor(item.product.handle ?? item.product.id, item.selectedColor) ??
                d.imageByColor?.[(item.selectedColor || '').toLowerCase()] ??
                item.product.images[0];
              return {
                ...item,
                product: {
                  ...item.product,
                  price: typeof d.price === 'number' ? d.price : item.product.price,
                  images: colorImg ? [colorImg] : item.product.images,
                  // Re-attach live variants. Items added while Shopify was down
                  // have none, and without this they can never check out.
                  variants: Array.isArray(d.variants) && d.variants.length
                    ? d.variants
                    : item.product.variants,
                },
              };
            }),
          });
        },

        redirectToShopifyCheckout: async () => {
          if (get().items.length === 0) throw new Error('Cart is empty');

          // Self-heal stale carts. Items added while Shopify was unreachable were
          // saved with no variants and persist in localStorage indefinitely, so
          // checkout would fail forever with "no variant matched". Re-fetch
          // before giving up rather than dead-ending the customer.
          if (get().items.some((i) => !i.product.variants?.length)) {
            console.warn('[cart] Item(s) missing variants — refreshing from Shopify before checkout');
            try {
              await get().refreshFromShopify();
            } catch (e) {
              console.error('[cart] Pre-checkout refresh failed:', e);
            }
          }

          const items = get().items;
          const lines: { variantId: string; quantity: number; attributes?: { key: string; value: string }[] }[] = [];
          const soldOut: string[] = [];
          const unresolved: string[] = [];

          for (const item of items) {
            const resolved = resolveVariant(item);

            if (!resolved.ok) {
              // A line that can't be matched used to be skipped silently — the
              // shopper then paid for a cart quietly missing an item and only
              // found out when the box arrived. Every failure is now surfaced.
              if (resolved.reason === 'sold-out') soldOut.push(describeLine(item));
              else unresolved.push(describeLine(item));
              console.warn(
                `[cart] ${resolved.reason} for "${item.product.name}" ` +
                `(${item.selectedSize} / ${item.selectedColor}).`,
              );
              continue;
            }

            // Last line of defence on quantity. The stepper already caps at
            // what's in stock, but a cart can sit in localStorage for days while
            // the stock behind it sells down.
            const allowed = maxPurchasable(item.product, item.selectedColor, item.selectedSize, item.quantity);
            if (allowed < item.quantity) {
              if (allowed <= 0) {
                soldOut.push(describeLine(item));
                continue;
              }
              console.warn(`[cart] Trimming "${describeLine(item)}" from ${item.quantity} to ${allowed} — that's all Shopify has.`);
            }

            // Any line with a ship window carries it onto the Shopify order, so
            // fulfilment sees the same promise the shopper was shown. Same
            // helper the ongoing add-to-cart sync uses, so a line gets the same
            // "Ships: ..." attribute whether it reached Shopify at first
            // add-to-cart or only here, in the checkout-time fallback.
            lines.push({
              variantId: resolved.variant.id,
              quantity: Math.max(1, allowed),
              attributes: lineAttributesFor(item),
            });
          }

          // Sold out is a different conversation from a technical failure, so it
          // gets its own message: it names what went, and the fix is in the
          // shopper's hands rather than ours.
          if (soldOut.length > 0) {
            throw new Error(
              `${soldOut.join(' and ')} just sold out. Please remove ` +
              `${soldOut.length > 1 ? 'those items' : 'that item'} from your cart — ` +
              'everything else is ready to go.',
            );
          }

          if (unresolved.length > 0 || lines.length === 0) {
            // Customer-facing wording — the old message was internal debugging
            // text about the Storefront API, which means nothing to a shopper.
            throw new Error(
              'We couldn’t start checkout just now. Please refresh the page and try again — ' +
              'if it keeps happening, email hello@tualmi.com and we’ll take your order directly.'
            );
          }

          // Carries "Referred by / Campaign / ..." onto the Shopify order so
          // affiliate sales can be reconciled exactly, not guessed by timestamp,
          // and pre-applies any creator code picked up at /discount/[code].
          const code = getDiscountCode();

          // Last event we can fire ourselves — the purchase happens on Shopify's
          // domain, so that one has to come from Shopify's own GA4 integration.
          trackBeginCheckout(
            items.map((i) => ({
              item_id: i.product.handle ?? i.product.id,
              item_name: i.product.name,
              price: i.product.price / 100,
              item_variant: `${i.selectedColor} / ${i.selectedSize}`,
              quantity: i.quantity,
            })),
            get().getTotal() / 100,
            code ?? undefined,
          );

          // GA4 ids ride along on the cart so the orders webhook can replay a
          // server-side `purchase` into the SAME GA4 session. Without this, the
          // Shop Pay hop through shop.app makes every sale look like "direct".
          // Keys starting with "_" are hidden from customer-facing order views.
          const ga = await getGaIds();
          const cartAttributes = [
            ...attributionCartAttributes(),
            ...(ga.clientId ? [{ key: '_ga_client_id', value: ga.clientId }] : []),
            ...(ga.sessionId ? [{ key: '_ga_session_id', value: ga.sessionId }] : []),
          ];

          // Let any in-flight add/update/remove finish first, so checkout never
          // races an item that's still being written to the Shopify cart.
          await syncQueue;

          let cart: ShopifyCart | null = null;
          const { shopifyCartId } = get();

          if (shopifyCartId) {
            // Reuse the cart that's been tracking this shopper since their
            // first add-to-cart — this is the entire point of Commit 2: the
            // cart Shopify sees during checkout is the SAME cart it's been
            // seeing (and could report on) this whole visit, not a new one
            // sprung into existence at the last second.
            cart = await getCart(shopifyCartId);
            if (!cart) {
              devLog('stored cart id no longer valid at checkout — recreating');
            }
          }

          if (!cart) {
            // No cart yet (first-ever sync never landed) or it expired —
            // build one now from the already-validated, already-trimmed lines
            // computed above, so checkout still works.
            cart = await cartCreate(lines, cartAttributes);
            devLog('cartCreate (at checkout) ->', cart.id);
            if (code) {
              cart = (await cartDiscountCodesUpdate(cart.id, [code])) ?? cart;
            }
            set({ shopifyCartId: cart.id, shopifyCheckoutUrl: cart.checkoutUrl });
          } else {
            cart = (await cartAttributesUpdate(cart.id, cartAttributes)) ?? cart;
            if (code) {
              cart = (await cartDiscountCodesUpdate(cart.id, [code])) ?? cart;
            }
            set({ shopifyCheckoutUrl: cart.checkoutUrl });
          }

          const checkoutUrl = checkoutUrlFor(cart.checkoutUrl);
          devLog('redirecting to checkout ->', cart.id, checkoutUrl);

          // Deliberately NOT clearing the cart here. Shopify's checkout — and
          // Shop Pay especially — is a place people back out of: to check a size,
          // compare a colour, or grab a discount code. Emptying the cart on the
          // way out meant hitting Back landed them on "nothing here yet." and the
          // sale was gone. The cart is cheap to keep; an abandoned checkout is not.
          window.location.href = checkoutUrl;
        },
      };
    },
    {
      // Bumped to -v2 to discard old saved carts that snapshotted stale
      // prices/photos from before the Shopify data was updated.
      name: 'tualmi-cart-v2',
      // shopifyCartId / shopifyCheckoutUrl / shopifyLineId (per item) persist
      // by default along with everything else — that's what lets a returning
      // visitor's next add-to-cart land on the SAME Shopify cart instead of
      // creating a new one every page load.
    }
  )
);
