'use client';

import Link from 'next/link';
import { useShopAccess, isBuyable } from '@/lib/useShopAccess';

const sans = 'var(--font-montserrat), system-ui, sans-serif';

/**
 * Landing-panel CTA for the shorts & pant. Reads "shop them →" once the shop is
 * open for this visitor, "preview →" otherwise.
 */
export default function PanelShopLink({ handle, accent }: { handle: string; accent: string }) {
  const { canShop, ready } = useShopAccess();
  const open = ready && isBuyable(handle, canShop);

  return (
    <Link
      href={`/products/${handle}`}
      style={{
        fontFamily: sans,
        fontSize: '13px',
        fontWeight: 600,
        color: accent,
        textTransform: 'lowercase',
        textUnderlineOffset: '4px',
      }}
    >
      {open ? 'shop them →' : 'preview →'}
    </Link>
  );
}
