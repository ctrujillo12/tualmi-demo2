'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useShopAccess, isBuyable } from '@/lib/useShopAccess';
import { PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import { trackAddToCart } from '@/lib/analytics';
import { availability, isColorSoldOut } from '@/lib/inventory';
import { SOLD_OUT_LABEL } from '@/lib/lowStock';

/**
 * Quick add from a landing-page colourway tile.
 *
 * Two steps, deliberately: tap "+ add", tap a size — then straight to the
 * cart, where quantity can be changed. Apparel can't be added without a size,
 * so the size row is the one unavoidable step.
 *
 * `product` comes from the server (page.tsx fetches it via getProduct) so cart
 * lines carry real Shopify variants — building them from partial data is what
 * causes "no variant matched" at checkout.
 *
 * `stayOnPage` is for the cart's "you might also like" row: adding from there
 * shouldn't navigate to the cart, because that's the page you're already on.
 * It confirms inline instead. Everything else — the variant snapshot, the
 * preorder flags, the analytics event — stays on this one code path, so the
 * two entry points can't drift.
 */
export default function QuickAdd({
  product,
  color,
  accent,
  stayOnPage = false,
  sizeVariant = 'pill',
}: {
  product: Product | null;
  color: string;
  accent: string;
  /** Confirm inline instead of navigating to /cart. */
  stayOnPage?: boolean;
  /**
   * 'pill'  — bordered buttons. Fine in a wide tile.
   * 'link'  — plain text on one line, underlined on press. For narrow tiles
   *           (the cart's "you might also like" cards) where seven bordered
   *           pills wrap onto three rows and shove the card out of shape.
   */
  sizeVariant?: 'pill' | 'link';
}) {
  const addItem = useCartStore((s) => s.addItem);
  const { canShop, ready } = useShopAccess();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Confirmation is a state, not a toast — it reverts so the tile can be used
  // again (someone adding two colourways in a row).
  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 1900);
    return () => clearTimeout(t);
  }, [justAdded]);

  const handle = product?.handle ?? '';
  // Nothing left in this colourway — the tile becomes a link rather than an
  // "+ add" that opens a size row with every size struck through.
  const colorGone = isColorSoldOut(product, color);
  const shoppable = ready && isBuyable(handle, canShop) && !!product && !colorGone;

  // Shop closed, sold out, or Shopify data unavailable — fall back to the
  // product page.
  if (!shoppable) {
    return (
      <Link
        href={`/products/${handle}?color=${encodeURIComponent(color)}`}
        className="qa-btn"
        style={{ color: accent, borderColor: accent, opacity: colorGone ? 0.6 : 1 }}
      >
        {colorGone ? SOLD_OUT_LABEL : 'view'}
      </Link>
    );
  }

  const sizes = product.sizes.filter((s) => s && s !== 'One Size');

  const add = (size: string) => {
    const gallery = PRODUCT_COLOR_IMAGES[handle]?.[color] ?? product.images;
    const shopifyImg = product.images.find((u) => u.startsWith('http'));
    const image = shopifyImg ?? gallery?.[0] ?? product.images[0];

    const shipWindow = product.shippingWindow ?? '';
    const shipsLater = !!shipWindow && !shipWindow.toLowerCase().startsWith('in stock');

    addItem(
      { ...product, images: image ? [image] : product.images },
      size,
      color,
      1,
      { isPreorder: shipsLater, shippingWindow: shipsLater ? shipWindow : undefined },
    );

    trackAddToCart({
      item_id: handle || product.id,
      item_name: product.name,
      price: product.price / 100,
      item_variant: `${color} / ${size}`,
      quantity: 1,
      image_url: image,
      url: `/products/${handle}?color=${encodeURIComponent(color)}`,
    });

    if (stayOnPage) {
      setOpen(false);
      setJustAdded(true);
      return;
    }
    router.push('/cart');
  };

  if (justAdded) {
    return (
      <p className="qa-btn qa-added" role="status" style={{ color: accent, borderColor: accent }}>
        added ✦
      </p>
    );
  }

  if (open) {
    const asLink = sizeVariant === 'link';
    const sizeClass = `qa-size${asLink ? ' qa-size--link' : ''}`;
    return (
      <div className={`qa-sizes${asLink ? ' qa-sizes--link' : ''}`}>
        {sizes.map((s) => {
          // This row is one tap from the cart, so a sold-out size here goes
          // straight into an order that can't be fulfilled. Same rule as the
          // product page: shown, struck through, not tappable.
          const soldOut = availability(product, color, s).status === 'sold-out';
          return (
            <button
              key={s}
              onClick={() => !soldOut && add(s)}
              disabled={soldOut}
              aria-label={soldOut ? `${s} — ${SOLD_OUT_LABEL}` : s}
              className={sizeClass}
              style={{
                color: accent,
                borderColor: accent,
                textDecoration: soldOut ? 'line-through' : undefined,
                opacity: soldOut ? 0.4 : 1,
                cursor: soldOut ? 'not-allowed' : undefined,
              }}
            >
              {s}
            </button>
          );
        })}
        <button
          onClick={() => setOpen(false)}
          className={`${sizeClass} qa-size--close`}
          aria-label="Close size picker"
          style={{ color: accent, borderColor: accent }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="qa-btn"
      style={{ color: accent, borderColor: accent }}
    >
      <span className="qa-plus" aria-hidden>+</span> add
    </button>
  );
}
