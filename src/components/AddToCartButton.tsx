'use client';

// components/AddToCartButton.tsx

import { useState } from 'react';
import { createCheckout } from '@/lib/shopify';
import type { Product } from '@/types';

const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#3B2F1E';
const muted = '#8C7B6B';
const rule  = '#DDD5C8';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
}

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Use the first available variant, falling back to the very first one
  const variant =
    product.variants.find((v) => v.availableForSale) ?? product.variants[0];

  async function handleBuy() {
    if (!variant) {
      setStatus('error');
      setErrorMsg('This product has no available variants.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const checkoutUrl = await createCheckout([
        { variantId: variant.id, quantity },
      ]);
      window.location.href = checkoutUrl;
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  const soldOut = !variant?.availableForSale;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        onClick={handleBuy}
        disabled={status === 'loading' || soldOut}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          border: `1px solid ${status === 'loading' || soldOut ? rule : black}`,
          padding: '14px 40px',
          fontSize: '10px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: status === 'loading' || soldOut ? muted : black,
          backgroundColor: 'transparent',
          fontFamily: sans,
          cursor: status === 'loading' ? 'wait' : soldOut ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.2s ease, color 0.2s ease',
        }}
      >
        {status === 'loading' ? 'One moment…' : soldOut ? 'Sold out' : 'Buy now'}
      </button>

      {status === 'error' && (
        <p style={{ fontSize: '12px', color: '#9B4040', fontFamily: sans, textAlign: 'center' }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}