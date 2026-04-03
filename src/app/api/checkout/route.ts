// src/app/api/checkout/route.ts
//
// This route is no longer needed for Shopify.
// Checkout is now handled client-side via the Storefront API's cartCreate mutation
// in src/store/cartStore.ts → redirectToShopifyCheckout().
//
// Keeping this file so any stale references don't 404, but it simply
// returns a 410 Gone to make the change obvious during debugging.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'This Stripe checkout endpoint has been removed. ' +
        'Checkout is now handled via the Shopify Storefront API.',
    },
    { status: 410 }
  );
}