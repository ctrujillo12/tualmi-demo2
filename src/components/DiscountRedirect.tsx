'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveDiscountCode, normalizeCode } from '@/lib/discount';
import { seedAttribution } from '@/lib/attribution';

/**
 * Stores a creator's discount code, credits them as the traffic source, then
 * forwards the visitor to a normal page on our own site.
 *
 * Renders a brief branded holding screen rather than a blank flash — this is
 * the first thing a creator's audience sees.
 */
export default function DiscountRedirect({
  code,
  redirectTo,
}: {
  code: string;
  redirectTo: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const clean = normalizeCode(code);
    if (clean) {
      saveDiscountCode(clean);
      // The code is also the affiliate signal — a creator sharing CAMI10 gets
      // credited on the order even though the link carries no utm_source.
      seedAttribution({
        utm_source: clean.toLowerCase(),
        utm_medium: 'affiliate',
        utm_campaign: 'creator-code',
        landing_page: redirectTo,
      });
    }
    router.replace(redirectTo);
  }, [code, redirectTo, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FBF1F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-montserrat), system-ui, sans-serif',
          fontSize: '15px',
          fontWeight: 600,
          color: '#A9445C',
          textTransform: 'lowercase',
          textAlign: 'center',
          margin: 0,
        }}
      >
        applying your discount ✦
      </p>
    </div>
  );
}
