'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartItem from '@/components/CartItem';
import { useCartStore } from '@/store/cartStore';

// Landing-page design tokens
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';
const rule    = '#F0D9E1';

const FREE_TOTE_THRESHOLD = 149; // matches Shopify automatic discount

const TOTE_BASE = {
  id: 'trailblazing-tote', handle: 'trailblazing-tote', name: 'Trailblazing Tote',
  category: 'Accessories', images: ['/images-2/tote_hp_bg.png'], // image overridden at runtime from Shopify
  colors: [], sizes: ['One Size'], variants: [], description: '',
};
const TOTE_PAID = { ...TOTE_BASE, price: 1800 };
const TOTE_FREE = { ...TOTE_BASE, price: 0 };

export default function CartPage() {
  const { items, addItem, getTotal, hasPreorderItems, redirectToShopifyCheckout } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [toteAdded, setToteAdded] = useState(false);
  const [toteImage, setToteImage] = useState('/images-2/tote_hp_bg.png');

  useEffect(() => {
    fetch('/api/product-image?handle=trailblazing-tote')
      .then(r => r.json())
      .then(d => { if (d.image) setToteImage(d.image); })
      .catch(() => {});
  }, []);

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
      <main style={{ backgroundColor: blushBg, minHeight: '100vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(110px, 16vw, 170px) clamp(20px, 5vw, 32px)', textAlign: 'center' }}>
          <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: soft, margin: '0 0 18px', textTransform: 'lowercase' }}>
            your cart
          </p>
          <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(28px, 4.5vw, 44px)', letterSpacing: '-0.03em', color: maroon, margin: '0 0 36px', textTransform: 'lowercase' }}>
            nothing here yet.
          </h1>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              backgroundColor: maroon,
              color: 'white',
              padding: '14px 36px',
              fontFamily: sans,
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '100px',
              textDecoration: 'none',
              textTransform: 'lowercase',
            }}
          >
            back to the collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: blushBg, minHeight: '100vh', padding: 'clamp(96px, 13vw, 140px) clamp(20px, 4vw, 48px) clamp(64px, 9vw, 100px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: soft, margin: '0 0 10px', textTransform: 'lowercase' }}>
            your cart
          </p>
          <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.03em', color: maroon, margin: 0, textTransform: 'lowercase' }}>
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
            <Link
              href="/"
              style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: soft, textDecoration: 'underline', textUnderlineOffset: '4px', display: 'inline-block', marginTop: '8px', textTransform: 'lowercase' }}
            >
              back to shop
            </Link>
          </div>

          {/* Right: order summary */}
          <div className="cart-summary-panel" style={{ backgroundColor: 'white', borderRadius: '14px', padding: 'clamp(20px, 3vw, 32px)' }}>
            <h2 style={{ fontFamily: sans, fontWeight: 700, fontSize: '20px', letterSpacing: '-0.02em', color: maroon, margin: '0 0 24px', textTransform: 'lowercase' }}>
              order summary
            </h2>

            {/* Tote upsell */}
            {!hasTote && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px', marginBottom: '24px',
                backgroundColor: blushBg,
                border: `1.5px solid ${toteFree ? maroon : rule}`,
                borderRadius: '12px',
              }}>
                <div style={{ flexShrink: 0, width: '56px', height: '56px', position: 'relative', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image src={toteImage} alt="Trailblazing Tote" fill style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 700, color: maroon, margin: '0 0 2px', textTransform: 'lowercase' }}>
                    {toteFree ? 'you unlocked a free tote!' : 'add the trailblazing tote'}
                  </p>
                  <p style={{ fontFamily: sans, fontSize: '12px', color: soft, fontWeight: toteFree ? 700 : 500, margin: 0 }}>
                    {toteFree ? 'FREE — applied at checkout' : `$18.00 — spend $${FREE_TOTE_THRESHOLD}+ to get it free`}
                  </p>
                </div>
                <button
                  onClick={handleAddTote}
                  disabled={toteAdded}
                  aria-label="Add tote to cart"
                  style={{
                    flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: toteAdded ? soft : maroon,
                    color: 'white', border: 'none', fontSize: '18px', lineHeight: 1,
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
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>Subtotal</span>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: maroon }}>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>Est. Tax (8%)</span>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: maroon }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${rule}`, paddingTop: '12px' }}>
                <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: maroon }}>Total</span>
                <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: maroon }}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {containsPreorder && (
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: soft, marginBottom: '16px', lineHeight: 1.7 }}>
                Your order contains pre-order items. Payment is collected at checkout — the first collection is available 7/31.
              </p>
            )}

            {error && (
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: '#B85C49', marginBottom: '16px' }}>{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={isLoading}
              style={{
                width: '100%', padding: '15px 32px',
                backgroundColor: maroon, color: 'white',
                fontFamily: sans, fontSize: '14px', fontWeight: 700,
                textTransform: 'lowercase',
                border: 'none', borderRadius: '100px',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'redirecting…' : 'checkout'}
            </button>

            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: soft, textAlign: 'center', margin: '16px 0 0' }}>
              Need help?{' '}
              <a href="mailto:hello@tualmi.com" style={{ color: maroon, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                hello@tualmi.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
