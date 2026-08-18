import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';

// Returns the CURRENT price + per-color images for a product, so the cart can
// refresh itself and never show stale (snapshotted) prices/photos.
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle');
  if (!handle) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const p = await getProduct(handle);
    if (!p) return NextResponse.json({ ok: false });

    // Build a color → image map from the Shopify variants
    const imageByColor: Record<string, string> = {};
    for (const v of p.variants ?? []) {
      const color = v.selectedOptions
        ?.find((o) => o.name.toLowerCase() === 'color')
        ?.value.toLowerCase();
      if (color && v.image?.url && !imageByColor[color]) {
        imageByColor[color] = v.image.url;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        price: p.price,
        name: p.name,
        featured: p.images?.[0] ?? null,
        imageByColor,
        // Variants MUST come back too. A cart item saved while Shopify was
        // unreachable has no variants (getProduct falls back to local data),
        // and the cart persists to localStorage — so without this it can never
        // recover and checkout fails forever with "no variant matched".
        //
        // They now also carry availability (availableForSale, quantityAvailable),
        // which is what the cart page and checkout guard read to catch anything
        // that sold out while it sat in someone's cart.
        variants: p.variants ?? [],
      },
      // Not cached. This is what the cart trusts immediately before checkout —
      // the one place where stale availability turns straight into an order
      // that can't be fulfilled. The cart sees a fraction of product-page
      // traffic, so the extra Shopify calls are cheap.
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ ok: false });
  }
}
