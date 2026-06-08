import { NextRequest, NextResponse } from 'next/server';
import { getProductByHandle } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle');
  if (!handle) return NextResponse.json({ error: 'Missing handle' }, { status: 400 });

  try {
    const product = await getProductByHandle(handle);
    const image = product?.images?.edges?.[0]?.node?.url ?? null;
    return NextResponse.json({ image }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return NextResponse.json({ image: null });
  }
}
