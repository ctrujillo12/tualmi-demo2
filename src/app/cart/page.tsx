'use client';

import { useState } from 'react';
import Link from 'next/link';
import CartItem from '@/components/CartItem';
import { useCartStore } from '@/store/cartStore';

const brown = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#A89080';
const rule  = '#E8E2D8';
const sans  = 'var(--font-montserrat)';
const serif = "'Cormorant Garamond', Georgia, serif";

export default function CartPage() {
  const { items, getTotal, hasPreorderItems, redirectToShopifyCheckout } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();
  const tax = total * 0.08;
  const grandTotal = total + tax;
  const containsPreorder = hasPreorderItems();

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
        <Link
          href="/"
          style={{ fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#FAFAF7', backgroundColor: brown, padding: '13px 32px', textDecoration: 'none', display: 'inline-block' }}
        >
          Shop the Collection
        </Link>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#FAFAF7', minHeight: '100vh', padding: 'clamp(80px, 10vw, 100px) clamp(20px, 4vw, 48px) 80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '12px', marginTop: 0 }}>
            Your Cart
          </p>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: brown, margin: 0, lineHeight: 1.1 }}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }} className="lg:cart-grid">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '0' }} className="cart-layout">

            {/* ── Items + Summary two-column on desktop ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '48px' }}>
              <div style={{ display: 'grid', gap: '48px' }} className="cart-two-col">

                {/* Left: items */}
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {items.map((item, index) => (
                      <CartItem
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                        item={item}
                      />
                    ))}
                  </div>
                  <Link
                    href="/"
                    style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: muted, textDecoration: 'none', display: 'inline-block', marginTop: '24px' }}
                  >
                    ← Continue Shopping
                  </Link>
                </div>

                {/* Right: order summary */}
                <div style={{ borderTop: `1px solid ${rule}`, paddingTop: '28px' }} className="summary-panel">
                  <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '24px', marginTop: 0 }}>
                    Order Summary
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid }}>Subtotal</span>
                      <span style={{ fontFamily: sans, fontSize: '12px', color: brown }}>${(total / 100).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid }}>Shipping</span>
                      <span style={{ fontFamily: sans, fontSize: '12px', color: mid }}>Calculated at checkout</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid }}>Est. Tax</span>
                      <span style={{ fontFamily: sans, fontSize: '12px', color: brown }}>${(tax / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${rule}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                    <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: brown }}>Total</span>
                    <span style={{ fontFamily: sans, fontSize: '14px', color: brown }}>${(grandTotal / 100).toFixed(2)}</span>
                  </div>

                  {containsPreorder && (
                    <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: muted, lineHeight: 1.7, marginBottom: '20px' }}>
                      Your cart contains pre-order items. You'll be charged at checkout, and pre-order items will ship when the collection drops.
                    </p>
                  )}

                  {error && (
                    <p style={{ fontFamily: sans, fontSize: '11px', color: '#9B4040', marginBottom: '16px' }}>{error}</p>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      backgroundColor: brown,
                      color: '#FAFAF7',
                      padding: '14px',
                      fontFamily: sans,
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      border: 'none',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                      marginBottom: '12px',
                    }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.6' : '1'; }}
                  >
                    {isLoading ? 'Redirecting…' : 'Checkout'}
                  </button>

                  <p style={{ fontFamily: sans, fontSize: '10px', fontWeight: 300, color: muted, textAlign: 'center', margin: 0 }}>
                    Secure checkout powered by Shopify
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .cart-two-col {
            grid-template-columns: 3fr 2fr !important;
          }
          .summary-panel {
            border-top: none !important;
            padding-top: 0 !important;
            border-left: 1px solid #E8E2D8;
            padding-left: 40px;
          }
        }
      `}</style>
    </main>
  );
}
