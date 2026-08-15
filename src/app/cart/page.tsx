'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartItem from '@/components/CartItem';
import DiscountBadge from '@/components/DiscountBadge';
import FreeShippingBar from '@/components/FreeShippingBar';
import { freeShippingProgress, FLAT_SHIPPING_CENTS, money } from '@/lib/shipping';
import { useCartStore } from '@/store/cartStore';
import { useShopAccess } from '@/lib/useShopAccess';

// Landing-page design tokens
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';
const rule    = '#F0D9E1';

export default function CartPage() {
  const { items, getTotal, hasPreorderItems, redirectToShopifyCheckout, refreshFromShopify } = useCartStore();
  const { canShop, ready } = useShopAccess();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  /**
   * The cart is persisted to localStorage, which zustand only reads AFTER the
   * first client render. Until then `items` is [] — which was rendering
   * "nothing here yet." for a beat on every visit, even with a full cart.
   * Wait for hydration before deciding the cart is empty.
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Re-sync prices + photos from Shopify on load so the cart is never stale
  useEffect(() => { refreshFromShopify(); }, [refreshFromShopify]);

  const totalCents       = getTotal();
  const total            = totalCents / 100;
  const shipping         = freeShippingProgress(totalCents);
  // A real number, not "from $7.99". Tax is still Shopify's to compute, but
  // shipping is a rate we set, so there's no reason to make the shopper guess.
  const shippingCents    = shipping.qualified ? 0 : FLAT_SHIPPING_CENTS;
  const estimatedCents   = totalCents + shippingCents;
  // No local tax/total estimate — Shopify calculates both at checkout, and
  // showing a guess here only sets up a mismatch on the next screen.
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

  // Reading the saved cart — show nothing rather than a wrong empty state.
  if (!hydrated) {
    return (
      <main style={{ backgroundColor: blushBg, minHeight: '100vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(110px, 16vw, 170px) clamp(20px, 5vw, 32px)', textAlign: 'center' }}>
          <p style={{ fontFamily: sans, fontWeight: 600, fontSize: '14px', color: soft, textTransform: 'lowercase', margin: 0 }}>
            loading your cart…
          </p>
        </div>
      </main>
    );
  }

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
      {/* Building the Shopify cart takes a second or two. Without a clear
          signal the page just sits there and people assume it's broken. */}
      {isLoading && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: 'rgba(251,241,245,0.94)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '18px',
            padding: '24px', textAlign: 'center',
          }}
        >
          <div
            aria-hidden
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              border: `3px solid ${rule}`, borderTopColor: maroon,
              animation: 'tualmi-spin 0.8s linear infinite',
            }}
          />
          <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '16px', color: maroon, textTransform: 'lowercase', margin: 0 }}>
            taking you to checkout ✦
          </p>
          <p style={{ fontFamily: sans, fontWeight: 500, fontSize: '13px', color: soft, margin: 0, maxWidth: '280px', lineHeight: 1.6 }}>
            your cart is saved — you can always come back to it.
          </p>
          <style>{'@keyframes tualmi-spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      )}
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

            {/* How close they are to free shipping — the one number that
                changes behaviour at this step. */}
            <FreeShippingBar variant="panel" />

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>Subtotal</span>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: maroon }}>${total.toFixed(2)}</span>
              </div>
              {/* Shipping is the cost people are actually worried about, so it
                  gets a firm number. It read "from $7.99" while the line below
                  it showed the subtotal again — so the shopper tapped checkout
                  without knowing what they'd pay, and a vague shipping cost is
                  the most-cited reason carts get abandoned. */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>Shipping (US)</span>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 700, color: maroon }}>
                  {shipping.qualified ? 'FREE ✦' : money(FLAT_SHIPPING_CENTS)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>Tax</span>
                <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: soft }}>
                  calculated at checkout
                </span>
              </div>
              {/* This row said "Subtotal" twice — the same number labelled the
                  same way, top and bottom, with shipping quietly excluded. */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${rule}`, paddingTop: '12px' }}>
                <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: maroon }}>Estimated total</span>
                <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: maroon }}>${(estimatedCents / 100).toFixed(2)}</span>
              </div>
              <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: soft, margin: 0, lineHeight: 1.5 }}>
                {shipping.qualified
                  ? 'Shipping included. Tax added at checkout.'
                  : `Includes ${money(FLAT_SHIPPING_CENTS)} US shipping. Tax added at checkout. International shipping is quoted at checkout.`}
              </p>
            </div>

            {/* Reassures the shopper the creator code survived to checkout —
                the totals above can't reflect it, since Shopify computes the
                discount on its own checkout page. */}
            <DiscountBadge />

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
              disabled={isLoading || (ready && !canShop)}
              style={{
                width: '100%', padding: '15px 32px',
                backgroundColor: maroon, color: 'white',
                fontFamily: sans, fontSize: '14px', fontWeight: 700,
                textTransform: 'lowercase',
                border: 'none', borderRadius: '100px',
                cursor: (isLoading || (ready && !canShop)) ? 'default' : 'pointer',
                opacity: (isLoading || (ready && !canShop)) ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'taking you to checkout…' : (ready && !canShop ? 'opens friday · 11am pt' : 'checkout')}
            </button>
            {ready && !canShop && (
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: soft, textAlign: 'center', margin: '12px 0 0', lineHeight: 1.6 }}>
                Checkout opens Friday at 11am PT. Club members get 24-hour early access.
              </p>
            )}

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
