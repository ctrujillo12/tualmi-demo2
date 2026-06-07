'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

const brown = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#A89080';
const rule  = '#E8E2D8';
const bgAlt = '#F2EDE4';
const sans  = 'var(--font-montserrat)';

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.product.id, item.selectedSize, item.selectedColor, newQuantity);
  };

  const handleRemove = () => {
    removeItem(item.product.id, item.selectedSize, item.selectedColor);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', paddingBottom: '28px', borderBottom: `1px solid ${rule}` }}>

      {/* Product image */}
      <Link
        href={`/products/${item.product.handle ?? item.product.id}`}
        style={{ position: 'relative', width: '100px', height: '130px', flexShrink: 0, backgroundColor: bgAlt, display: 'block' }}
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          sizes="100px"
          style={{ objectFit: 'contain' }}
        />
      </Link>

      {/* Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <Link
              href={`/products/${item.product.handle ?? item.product.id}`}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '18px', fontWeight: 400, color: brown, textDecoration: 'none', display: 'block', marginBottom: '6px' }}
            >
              {item.product.name}
            </Link>
            <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: mid, margin: '0 0 2px', letterSpacing: '0.03em' }}>
              Size: {item.selectedSize}
            </p>
            <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: mid, margin: 0, letterSpacing: '0.03em' }}>
              Color: {item.selectedColor}
            </p>
            {item.isPreorder && (
              <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: muted, marginTop: '8px' }}>
                Pre-Order · {item.shippingWindow ?? 'Ships when collection drops'}
              </p>
            )}
          </div>
          <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 400, color: brown, whiteSpace: 'nowrap' }}>
            ${((item.product.price * item.quantity) / 100).toFixed(2)}
          </p>
        </div>

        {/* Qty + Remove */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              style={{ width: '28px', height: '28px', border: `1px solid ${rule}`, background: 'none', color: brown, fontFamily: sans, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              −
            </button>
            <span style={{ width: '32px', textAlign: 'center', fontFamily: sans, fontSize: '12px', color: brown }}>
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              style={{ width: '28px', height: '28px', border: `1px solid ${rule}`, background: 'none', color: brown, fontFamily: sans, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              +
            </button>
          </div>
          <button
            onClick={handleRemove}
            style={{ fontFamily: sans, fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>

      </div>
    </div>
  );
}
