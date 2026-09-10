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
  label = 'shop this',
}: {
  handle: string;
  accent: string;
  color?: string;
  label?: string;
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
        // Was an underlined text link. It is the main call to action on each
        // band, so it now looks like one — same soft box and same weight as
        // the hero button, filled in the band's own accent colour.
        display: 'inline-block',
        padding: '14px 34px',
        borderRadius: '14px',
        background: accent,
        color: '#FEFFF9',
        fontFamily: sans,
        fontSize: '13.5px',
        fontWeight: 700,
        textTransform: 'lowercase',
        letterSpacing: '0.06em',
        textDecoration: 'none',
      }}
    >
      {open ? label : 'preview'}
    </Link>
  );
}
