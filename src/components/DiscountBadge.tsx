'use client';

import { useEffect, useState } from 'react';
import { getDiscountCode } from '@/lib/discount';

/**
 * Confirms an active creator code, inline in the page.
 *
 * Deliberately NOT a floating site-wide bar: the header is fixed to the top
 * (z 50) and AccessBanner is a fixed pill at the bottom (z 80), so a global
 * strip collides with one or the other. Showing it inline in the two places
 * that matter — the product page CTA and the cart summary — keeps those layers
 * clean and puts the reassurance exactly where price doubt happens.
 *
 * Renders nothing when no code is stored, and nothing on the server (the code
 * lives in localStorage), so there's no hydration mismatch.
 */
export default function DiscountBadge() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    setCode(getDiscountCode());
  }, []);

  if (!code) return null;

  return (
    <div className="discount-inline">
      <span className="discount-inline-code">✦ code {code} applied</span>
      <span className="discount-inline-note">discount shows at checkout</span>
    </div>
  );
}
