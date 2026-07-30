'use client';

import Link from 'next/link';
import { useShopAccess, isBuyable } from '@/lib/useShopAccess';

const sans = 'var(--font-montserrat), system-ui, sans-serif';

/**
 * Landing-panel CTA for the shorts & pant. Reads "shop them →" once the shop is
 * open for this visitor, "preview →" otherwise.
 */
export default function PanelShopLink({
  handle,
  accent,
  color,
}: {
  handle: string;
  accent: string;
  color?: string;
}) {
  const { canShop, ready } = useShopAccess();
  const open = ready && isBuyable(handle, canShop);
  const href = color
    ? `/products/${handle}?color=${encodeURIComponent(color)}`
    : `/products/${handle}`;

  return (
    <Link
      href={href}
      style={{
        fontFamily: sans,
        fontSize: '13px',
        fontWeight: 700,
        color: accent,
        textTransform: 'lowercase',
        letterSpacing: '0.04em',
        textUnderlineOffset: '4px',
      }}
    >
      {open ? 'shop this →' : 'preview →'}
    </Link>
  );
}
