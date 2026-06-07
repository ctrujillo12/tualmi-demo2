'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartItem from '@/components/CartItem';
import { useCartStore } from '@/store/cartStore';

const brown = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#A89080';
const rule  = '#E8E2D8';
const sans  = 'var(--font-montserrat)';
const serif = "'Cormorant Garamond', Georgia, serif";

const FREE_TOTE_THRESHOLD = 149; // matches Shopify automatic discount

const TOTE_BASE = {
  id: 'trailblazing-tote', handle: 'trailblazing-tote', name: 'Trailblazing Tote',
  category: 'Accessories', images: ['/images-2/tote-main.png'],
  colors: [], sizes: ['One Size'], variants: [], description: '',
};
const TOTE_PAID = { ...TOTE_BASE, price: 1800 };
const TOTE_FREE = { ...TOTE_BASE, price: 0 };

export default function CartPage() {
  const { items, addItem, getTotal, hasPreorderItems, redirectToShopifyCheckout } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [toteAdded, setToteAdded] = useState(false);

  const totalCents       = getTotal();
  const total            = totalCents / 100;
  const tax              = total * 0.08;
  const grandTotal       = total + tax;
  const containsPreorder = hasPreorderItems();
  const hasTote          = items.some(i => i.product.handle === 'trailblazing-tote');
  const toteFree         = total >= FREE_TOTE_THRESHOLD;

  const handleAddTote = () => {
    addItem((toteFree ? TOTE_FREE : TOTE_PAID) as never, 'One Size', 'Natural', 1);
    setToteAdded(true);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await redirectToShopifyCheckout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 32px)', backgroundColor: '#FAFAF7', minHeight: '100vh' }}>
        <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '16px', marginTop: 0 }}>
          Your Cart
        </p>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: brown, margin: '0 0 48px', lineHeight: 1.1 }}>
          Nothing here yet.
        </h1>
        <Link href="/" style={{ fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FAFAF7', backgroundColor: brown, padding: '13px 32px', textDecoration: 'none', display: 'inline-block' }}>
          Shop the Collection
        </Link>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#FAFAF7', minHeight: '100vh', padding: 'clamp(80px, 10vw, 100px) clamp(20px, 4vw, 48px) 80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '12px', marginTop: 0 }}>
            Your Cart
          </p>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: brown, margin: 0, lineHeight: 1.1 }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </h1>
        </div>

        <div className="cart-grid">

          {/* Left: items */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, index) => (
                <CartItem
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  item={item}
                />
              ))}
            </div>
            <Link href="/" style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: muted, textDecoration: 'none', display: 'inline-block', marginTop: '24px' }}>
              Back to Shop
            </Link>
          </div>

          {/* Right: order summary */}
          <div className="cart-summary-panel">
            <h2 style={{ fontFamily: serif, fontSize: '22px', fontWeight: 400, color: brown, margin: '0 0 24px' }}>
              Order Summary
            </h2>

            {/* Tote upsell */}
            {!hasTote && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px', marginBottom: '24px',
                backgroundColor: toteFree ? '#EEF5E6' : '#F5F0E8',
                border: `1.5px solid ${toteFree ? '#B8D4A0' : '#E4D9C8'}`,
              }}>
                <div style={{ flexShrink: 0, width: '56px', height: '56px', position: 'relative', backgroundColor: '#EDE8DF' }}>
                  <Image src="/images-2/tote-main.png" alt="Trailblazing Tote" fill style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: sans, fontSize: '10px', fontWeight: 600, color: brown, margin: '0 0 2px', letterSpacing: '0.04em' }}>
                    {toteFree ? 'You unlocked a free tote!' : 'Add the Trailblazing Tote'}
                  </p>
                  <p style={{ fontFamily: sans, fontSize: '10px', color: toteFree ? '#5A8A3A' : mid, fontWeight: toteFree ? 600 : 400, margin: 0 }}>
                    {toteFree ? 'FREE — applied at checkout' : `$18.00 — spend $${FREE_TOTE_THRESHOLD}+ to get it free`}
                  </p>
                </div>
                <button
                  onClick={handleAddTote}
                  disabled={toteAdded}
                  aria-label="Add tote to cart"
                  style={{
                    flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: toteAdded ? '#A89080' : brown,
                    color: '#FAFAF7', border: 'none', fontSize: '20px', lineHeight: 1,
                    cursor: toteAdded ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {toteAdded ? '✓' : '+'}
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: sans, fontSize: '12px', color: mid }}>Subtotal</span>
                <span style={{ fontFamily: sans, fontSize: '12px', color: brown }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: sans, fontSize: '12px', color: mid }}>Est. Tax (8%)</span>
                <span style={{ fontFamily: sans, fontSize: '12px', color: brown }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${rule}`, paddingTop: '12px' }}>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: brown }}>Total</span>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: brown }}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {containsPreorder && (
              <p style={{ fontFamily: sans, fontSize: '11px', color: muted, marginBottom: '16px', lineHeight: 1.6 }}>
                Your order contains pre-order items. Payment is collected at checkout — preorders ship late July 2026.
              </p>
            )}

            {error && (
              <p style={{ fontFamily: sans, fontSize: '11px', color: '#A87060', marginBottom: '16px' }}>{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              style={{
                width: '100%', padding: '15px 32px',
                backgroundColor: brown, color: '#FAFAF7',
                fontFamily: sans, fontSize: '9px', fontWeight: 600,
                letterSpacing: '0.28em', textTransform: 'uppercase',
                border: 'none', cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Redirecting…' : 'Checkout'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
