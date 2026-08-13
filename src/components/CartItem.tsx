'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { PRODUCT_COLOR_IMAGES } from '@/lib/productColors';

interface CartItemProps {
  item: CartItemType;
}

// Landing-page design tokens
const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.product.id, item.selectedSize, item.selectedColor, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.product.id, item.selectedSize, item.selectedColor);
  };

  const productUrl = `/products/${item.product.handle ?? item.product.id}`;

  /**
   * First usable image: what was saved with the cart line, else the live
   * gallery for that colourway, else nothing (and we render a text tile).
   * Empty strings are filtered out — next/image renders a blank box for those
   * rather than failing loudly.
   */
  const handle = item.product.handle ?? item.product.id;
  const galleryFallback =
    PRODUCT_COLOR_IMAGES[handle]?.[item.selectedColor]?.[0] ?? item.product.images?.[1];
  const thumb = [item.product.images?.[0], galleryFallback].find(
    (src): src is string => typeof src === 'string' && src.trim().length > 0
  );

  return (
    <div style={{ display: 'flex', gap: '20px', paddingBottom: '28px', marginBottom: '28px', borderBottom: `1px solid ${rule}` }}>

      {/* Product image.
          The cart stores whatever image was current when the item was added, so
          the entry can be missing (empty array), stale, or point at a file that
          no longer exists — which rendered as a blank white box next to a $146
          total. Fall back through the live gallery, then to a branded tile, so
          this can never be empty again. */}
      <Link
        href={productUrl}
        style={{ position: 'relative', width: '100px', height: '130px', flexShrink: 0, backgroundColor: '#FBF1F5', display: 'block', borderRadius: '8px', overflow: 'hidden' }}
      >
        {thumb ? (
          <Image
            src={thumb}
            alt={item.product.name}
            fill
            sizes="100px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: sans, fontSize: '11px', fontWeight: 700,
              color: maroon, textTransform: 'lowercase', textAlign: 'center',
              padding: '8px', lineHeight: 1.3,
            }}
          >
            {item.product.name}
          </span>
        )}
      </Link>

      {/* Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <Link
              href={productUrl}
              style={{ fontFamily: sans, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em', color: maroon, textDecoration: 'none', display: 'block', marginBottom: '6px', textTransform: 'lowercase' }}
            >
              {item.product.name}
            </Link>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: soft, margin: '0 0 2px' }}>
              Size: {item.selectedSize}
            </p>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: soft, margin: 0 }}>
              Color: {item.selectedColor}
            </p>
            {item.isPreorder && (
              <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 700, color: soft, marginTop: '8px', textTransform: 'lowercase', letterSpacing: '0.08em' }}>
                pre-order · {item.shippingWindow ?? 'ships when collection drops'}
              </p>
            )}
          </div>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: maroon, whiteSpace: 'nowrap', margin: 0 }}>
            ${((item.product.price * item.quantity) / 100).toFixed(2)}
          </p>
        </div>

        {/* Qty + Remove */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${rule}`, borderRadius: '100px', overflow: 'hidden' }}>
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              style={{ width: '30px', height: '30px', border: 'none', background: 'none', color: maroon, fontFamily: sans, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              −
            </button>
            <span style={{ width: '28px', textAlign: 'center', fontFamily: sans, fontSize: '13px', fontWeight: 600, color: maroon }}>
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              style={{ width: '30px', height: '30px', border: 'none', background: 'none', color: maroon, fontFamily: sans, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              +
            </button>
          </div>
          <button
            onClick={handleRemove}
            style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, color: soft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'lowercase', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            remove
          </button>
        </div>

      </div>
    </div>
  );
}
