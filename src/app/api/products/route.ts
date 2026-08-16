import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';

/**
 * Full product records by handle, for client components that need real
 * Shopify variants.
 *
 * The cart page is a client component, so it can't call getProduct() directly
 * the way page.tsx does. It needs whole products rather than the price/image
 * summary /api/product-refresh returns, because anything added to the cart has
 * to carry its variants — a line built from partial data fails at checkout
 * with "no variant matched".
 *
 * GET /api/products?handles=sierra-shorts,juniper-pant
 */

/** Bounded so a crafted query can't fan out into dozens of Shopify calls. */
const MAX_HANDLES = 6;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('handles') ?? '';
  const handles = Array.from(
    new Set(
      raw
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_HANDLES);

  if (handles.length === 0) {
    return NextResponse.json({ ok: false, products: [] }, { status: 400 });
  }

  try {
    // One bad handle shouldn't take the others down with it — the caller
    // renders whatever came back and skips the rest.
    const results = await Promise.all(
      handles.map((h) => getProduct(h).catch(() => null)),
    );
    const products = results.filter((p): p is NonNullable<typeof p> => p !== null);

    return NextResponse.json(
      { ok: true, products },
      // Same 5-minute window the rest of the storefront reads on; prices here
      // are only used for display, and the cart re-syncs on its own.
      { headers: { 'Cache-Control': 'public, max-age=300' } },
    );
  } catch {
    return NextResponse.json({ ok: false, products: [] });
  }
}
