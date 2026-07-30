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
      { ok: true, price: p.price, name: p.name, featured: p.images?.[0] ?? null, imageByColor },
      { headers: { 'Cache-Control': 'public, max-age=60' } },
    );
  } catch {
    return NextResponse.json({ ok: false });
  }
}
