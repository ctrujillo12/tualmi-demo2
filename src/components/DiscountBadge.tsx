'use client';

import { useEffect, useState } from 'react';
import { getDiscountCode } from '@/lib/discount';

/**
 * Shows the shopper that a creator code is active and will be applied.
 *
 * Without this the discount is invisible until the Shopify checkout page,
 * which reads as a broken promise — someone clicks a creator's "10% off" link,
 * sees full price the whole way through, and abandons before ever reaching the
 * step where the discount appears.
 *
 * `variant`:
 *   'bar'    — slim site-wide strip under the header
 *   'inline' — a line inside the cart's order summary
 *
 * The code is stored client-side, so this renders nothing on the server and
 * fades in after mount. That avoids a hydration mismatch.
 */
export default function DiscountBadge({ variant = 'bar' }: { variant?: 'bar' | 'inline' }) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(getDiscountCode());
  }, []);

  if (!code) return null;

  const sans = 'var(--font-montserrat), system-ui, sans-serif';

  if (variant === 'inline') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#FBF1F5',
          border: '1px dashed #A9445C',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, color: '#A9445C' }}>
          ✦ code {code} applied
        </span>
        <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: '#C9849A' }}>
          discount shows at checkout
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#A9445C',
        padding: '7px 16px',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: sans,
          fontSize: '12px',
          fontWeight: 600,
          color: '#fff',
          textTransform: 'lowercase',
          letterSpacing: '0.01em',
        }}
      >
        ✦ your discount code <strong style={{ fontWeight: 800 }}>{code}</strong> is saved — applied automatically at checkout
      </span>
    </div>
  );
}
