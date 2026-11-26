'use client';

import { useEffect, useState } from 'react';
import { useBlackFriday, BF_PUBLIC_MS } from '@/lib/blackFriday';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#34402B';

/**
 * Black Friday 2026: confirms the email link worked. Shown only to browsers
 * that came through it, until the sale opens to everyone on Friday 4pm.
 *
 * Subtle confirmation for members who unlocked early access.
 * Sits as a small pill at the bottom of the screen (doesn't shift layout).
 * Disappears once the shop is public (early access is no longer special).
 */
export default function AccessBanner() {
  const { ready, hasEarly, phase } = useBlackFriday();
  const publicOpen = phase === 'ended' || (ready && Date.now() >= BF_PUBLIC_MS);
  const canShop = phase === 'live';
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { setDismissed(sessionStorage.getItem('tualmi_bf_access_banner') === 'closed'); } catch { /* ignore */ }
  }, []);

  if (!ready || !hasEarly || publicOpen || dismissed) return null;

  const message = canShop
    ? '✦ black friday early access is live — up to 35% off before everyone else'
    : '✦ you’re in — black friday early access opens thursday 4pm pt';

  const close = () => {
    setDismissed(true);
    try { sessionStorage.setItem('tualmi_bf_access_banner', 'closed'); } catch { /* ignore */ }
  };

  return (
    <div
      // Desktop only: on a phone the header strip already says this, and a
      // floating pill there sat on top of the cart/product checkout bars.
      className="bf-access-pill"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 'clamp(14px, 3vh, 24px)',
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: 'calc(100vw - 24px)',
        padding: '10px 14px 10px 18px',
        backgroundColor: maroon,
        color: 'white',
        borderRadius: '100px',
        boxShadow: '0 6px 22px rgba(120,40,60,0.28)',
      }}
    >
      <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, textTransform: 'lowercase', lineHeight: 1.3 }}>
        {message}
      </span>
      <button
        onClick={close}
        aria-label="Dismiss"
        style={{
          flexShrink: 0,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.22)',
          color: 'white',
          fontSize: '13px',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}
