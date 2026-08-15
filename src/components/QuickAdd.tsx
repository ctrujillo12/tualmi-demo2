'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useShopAccess, isBuyable } from '@/lib/useShopAccess';
import { PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import { trackAddToCart } from '@/lib/analytics';

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
 */
export default function QuickAdd({
  product,
  color,
  accent,
}: {
  product: Product | null;
  color: string;
  accent: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const { canShop, ready } = useShopAccess();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handle = product?.handle ?? '';
  const shoppable = ready && isBuyable(handle, canShop) && !!product;

  // Shop closed, or Shopify data unavailable — fall back to the product page.
  if (!shoppable) {
    return (
      <Link
        href={`/products/${handle}?color=${encodeURIComponent(color)}`}
        className="qa-btn"
        style={{ color: accent, borderColor: accent }}
      >
        view
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

    router.push('/cart');
  };

  if (open) {
    return (
      <div className="qa-sizes">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => add(s)}
            className="qa-size"
            style={{ color: accent, borderColor: accent }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setOpen(false)}
          className="qa-size qa-size--close"
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
