import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { getProduct } from '@/lib/products';
import { getSummary } from '@/lib/reviews';
import ProductReviews from '@/components/ProductReviews';
import AlsoLike from '@/components/AlsoLike';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_CENTS } from '@/lib/shipping';
import { PRODUCT_COLORS, PRODUCT_COLOR_IMAGES } from '@/lib/productColors';
import { isColorSoldOut } from '@/lib/inventory';

// Full product pages: the shorts and pant. Anything else redirects to the preview.
// Single source of truth — see lib/catalog.ts.
import { DETAIL_HANDLES, hasDetailPage } from '@/lib/catalog';
import { preorderAvailabilityDate, preorderShipLabel, isPreorderHandle } from '@/lib/preorder';

// NOTE ON LINK PREVIEWS
// The `openGraph` block is what Instagram, iMessage, Linktree, WhatsApp etc.
// show when someone shares the link. Without it these pages fall back to the
// site-wide image in app/layout.tsx, so every product link previewed
// identically. The images live in public/og/ and are regenerated with
// `python3 scripts/make-og-images.py`.
const OG_BASE = {
  siteName: 'Tualmi',
  type: 'website' as const,
};

const PAGE_METADATA: Record<string, Metadata> = {
  'sierra-shorts': {
    title: 'sierra shorts — mid-rise hiking shorts',
    description:
      'Mid-rise, relaxed-fit women’s hiking shorts in 100% recycled nylon — fast-dry and water-repellent performance, ultra-light. In Jam, Picnic, and Confetti — shipping now.',
    alternates: { canonical: '/products/sierra-shorts' },
    openGraph: {
      ...OG_BASE,
      title: 'Sierra Shorts — Tualmi',
      description:
        'Mid-rise, relaxed fit. 100% recycled, fast-dry and ultra-light. Built for the trail, cute everywhere else.',
      url: '/products/sierra-shorts',
      images: [{ url: '/og/sierra-shorts-og.jpg', width: 1200, height: 630, alt: 'Tualmi Sierra Shorts' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sierra Shorts — Tualmi',
      description: 'Mid-rise, relaxed fit. 100% recycled, fast-dry and ultra-light.',
      images: ['/og/sierra-shorts-og.jpg'],
    },
  },
  'juniper-pant': {
    title: 'juniper pant — flare cargo hiking pants',
    description:
      `Fashion-forward flare cargo hiking pants with a flattering fit and real cargo pockets. Made ethically in a WRAP-certified facility. Preorder now — ${preorderShipLabel().toLowerCase()}.`,
    alternates: { canonical: '/products/juniper-pant' },
    openGraph: {
      ...OG_BASE,
      title: 'Juniper Pant — Tualmi',
      description:
        'Flare cargo hiking pants, engineered for women. Real pockets, fold-over waist, flared leg.',
      url: '/products/juniper-pant',
      images: [{ url: '/og/juniper-pant-og.jpg', width: 1200, height: 630, alt: 'Tualmi Juniper Pant' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Juniper Pant — Tualmi',
      description: 'Flare cargo hiking pants, engineered for women. Designed in LA, made ethically.',
      images: ['/og/juniper-pant-og.jpg'],
    },
  },
};

/**
 * Regenerate this page at most every 5 minutes.
 *
 * Without this the page is prerendered at build time and never re-rendered,
 * because generateStaticParams below makes it fully static. Publishing a review
 * in Supabase would then change nothing on the live site until the next deploy
 * — which is exactly what happened: the review was published and the page went
 * on serving "write the first review" from the build output.
 *
 * The review read has its own 60s cache (lib/reviews.ts), so this is the outer
 * of two windows and the one that actually decides how stale the page can be.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return [
    { id: 'sierra-shorts' },
    { id: 'juniper-pant' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // No silent fallback to the shorts: an id with no entry used to ship
  // <title>sierra shorts</title> and a canonical pointing at the shorts,
  // self-canonicalising a different product onto it. Masked today because
  // hasDetailPage() redirects first, but it would go live the moment a third
  // product is added without its metadata.
  return PAGE_METADATA[id] ?? {};
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { id } = await params;
  const { color } = await searchParams;

  // ── Anything without a full detail page redirects to the landing preview ──
  if (!hasDetailPage(id)) {
    redirect('/#collection');
  }

  // ── Full product page: shorts & pant ──
  // Started together rather than chained: reviews don't depend on the product,
  // and awaiting them in sequence would add their latency to a page that
  // already waits on Shopify. The review read is cached for five minutes and
  // never throws — an outage costs the review section, not the page.
  //
  // The cross-sell row at the bottom joins the same batch. Its products are
  // fetched here rather than inside <AlsoLike> so they overlap with the two
  // requests this page already makes instead of adding a third round-trip
  // after them — the section is below the fold, and nothing below the fold
  // has earned the right to delay the hero.
  const siblings = DETAIL_HANDLES.filter((h) => h !== id);
  const [product, reviewSummary, alsoLike] = await Promise.all([
    getProduct(id),
    getSummary(id),
    // Individually caught: a sibling that fails to resolve costs its own tile,
    // not the product page it was recommended on.
    Promise.all(siblings.map((h) => getProduct(h).catch(() => null))).then((ps) =>
      ps.filter((sp): sp is NonNullable<typeof sp> => sp !== null),
    ),
  ]);
  if (!product) {
    notFound();
  }

  // Availability was hardcoded to PreOrder, so Google kept advertising
  // "pre-order" on products that had been shipping for weeks — and would go on
  // advertising it after they sold out. Derived from the live variants instead.
  const anySellable = (product!.variants ?? []).some((v) => v.availableForSale);

  // Shopify's answer is not the last word. Stock can be loaded in Shopify
  // while the boxes are still on a truck, and that is exactly the case this
  // guards: the pant had inventory and no `preorder` tag, so Shopify said in
  // stock and this page repeated it. PREORDER_HANDLES can override downward —
  // never upward, so it can only ever make the claim more cautious.
  const isPreorder = product!.isPreorder || isPreorderHandle(product!.handle ?? id);

  const availability =
    isPreorder ? 'https://schema.org/PreOrder'
    // No Shopify data (offline fallback) — don't announce a sold-out store to
    // Google on the strength of one failed request.
    : !product!.variants?.length ? 'https://schema.org/InStock'
    : anySellable ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  // Required by Merchant Center for preorder items, and dropped automatically
  // once the date passes — a preorder whose availabilityDate is in the past is
  // a feed error, not just stale wording.
  const availabilityDate = isPreorder ? preorderAvailabilityDate() : null;

  // ── STRUCTURED DATA ────────────────────────────────────────────────────────
  // One ProductGroup per page, with a Product per COLOURWAY under hasVariant.
  // This follows Google's own ProductGroup example: the offers live on the
  // variants, not on the group. Emitting both would describe the same thing
  // twice at two levels and is how you get "duplicate field" warnings.
  //
  // Colourways, not every size. The colourways are what have their own images
  // and their own URL (?color=), which is what a variant entity is FOR. Sizes
  // share both, so 21 size-variants would be 21 near-identical objects
  // pointing at one page.
  //
  // If a product ever has no colourway entry, the group collapses back to a
  // plain Product with a single Offer -- see the ternary at the bottom.
  const SITE_ORIGIN = 'https://tualmi.com';

  /**
   * Absolute URL for an image, WITHOUT double-prefixing one that is already
   * absolute.
   *
   * This is not hypothetical tidiness. product.images comes from Shopify and
   * holds absolute cdn.shopify.com URLs; PRODUCT_COLOR_IMAGES holds paths
   * relative to our own /public. Blindly prefixing produced
   *
   *   https://tualmi.comhttps://cdn.shopify.com/s/files/.../birch-front-1.jpg
   *
   * which Search Console reported as `Invalid URL in field "image"` -- a
   * CRITICAL merchant-listing error, so the page was ineligible for product
   * rich results entirely. It survived local testing because the offline
   * fallback in lib/products.ts uses relative paths, so the bug only appears
   * when Shopify actually answers.
   */
  const abs = (u: string) =>
    /^https?:\/\//i.test(u) ? u
    // Protocol-relative ("//cdn.shopify.com/..."). Fine in an <img>, not fine
    // in structured data, which wants a fully-qualified URL.
    : u.startsWith('//') ? `https:${u}`
    : `${SITE_ORIGIN}${u}`;
  const canonicalUrl = `${SITE_ORIGIN}/products/${product!.handle ?? id}`;
  const priceStr = (product!.price / 100).toFixed(2);

  // Shared by every Offer on the page. Both blocks are what Merchant Center
  // asks for, and both are DERIVED: the threshold and the flat rate come from
  // lib/shipping.ts, so the markup cannot promise a number the cart doesn't.
  const offerPolicies = {
    // 14 days from delivery, unworn and unwashed -- /footer-pages/returns.
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnMethod: 'https://schema.org/ReturnByMail',
      // The shopper pays return postage; we cover it only when the item is
      // faulty or wrong, which is a different policy and not what this field
      // describes.
      returnFees: 'https://schema.org/ReturnShippingFees',
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: (FLAT_SHIPPING_CENTS / 100).toFixed(2),
        currency: 'USD',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'US',
      },
      // Free over the threshold. Stated as a second, $0 rate that only applies
      // above it, which is how Google models a spend-based free-shipping rule.
      freeShippingThreshold: {
        '@type': 'DeliveryChargeSpecification',
        appliesToDeliveryMethod: 'https://purl.org/goodrelations/v1#DeliveryModeMail',
        eligibleTransactionVolume: {
          '@type': 'PriceSpecification',
          minPrice: (FREE_SHIPPING_THRESHOLD / 100).toFixed(2),
          priceCurrency: 'USD',
        },
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          // Preorders are the exception and are already declared by the
          // PreOrder availability above; this is the in-stock path.
          minValue: isPreorder ? 7 : 1,
          maxValue: isPreorder ? 21 : 3,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 2,
          maxValue: 7,
          unitCode: 'DAY',
        },
      },
    },
  } as const;

  const ratingBlock = reviewSummary.showSummary
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: reviewSummary.average,
          reviewCount: reviewSummary.count,
        },
        review: reviewSummary.reviews.slice(0, 5).map((r) => ({
          '@type': 'Review',
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          author: { '@type': 'Person', name: r.name },
          datePublished: r.date,
          reviewBody: r.body,
        })),
      }
    : {};

  const colourways = PRODUCT_COLORS[product!.handle ?? id] ?? [];
  const colourImages = PRODUCT_COLOR_IMAGES[product!.handle ?? id] ?? {};

  const hasVariant = colourways.map((c) => {
    // Per-colourway availability, not the product's. A sold-out colourway that
    // advertises itself as in stock is the single most reportable thing a
    // product feed can do.
    const soldOut = isPreorder ? false : isColorSoldOut(product!, c.name);
    const variantUrl = `${canonicalUrl}?color=${encodeURIComponent(c.name)}`;
    const img = colourImages[c.name]?.[0] ?? product!.images[0];
    return {
      '@type': 'Product',
      name: `${product!.name} in ${c.name}`,
      color: c.name,
      image: abs(img),
      url: variantUrl,
      size: product!.sizes,
      offers: {
        '@type': 'Offer',
        price: priceStr,
        priceCurrency: 'USD',
        availability: isPreorder
          ? 'https://schema.org/PreOrder'
          : soldOut
            ? 'https://schema.org/OutOfStock'
            : availability,
        ...(availabilityDate ? { availabilityDate } : {}),
        url: variantUrl,
        ...offerPolicies,
      },
    };
  });

  const productJsonLd = hasVariant.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        name: product!.name,
        description: product!.description,
        brand: { '@type': 'Brand', name: 'Tualmi' },
        image: abs(product!.images[0]),
        url: canonicalUrl,
        productGroupID: product!.handle ?? id,
        variesBy: ['https://schema.org/color', 'https://schema.org/size'],
        hasVariant,
        // The rating is the GROUP's: reviews are collected per product, not
        // per colourway, and splitting one pool across two variants would
        // report each colourway as having half the reviews it has.
        ...ratingBlock,
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product!.name,
        description: product!.description,
        brand: { '@type': 'Brand', name: 'Tualmi' },
        image: abs(product!.images[0]),
        offers: {
          '@type': 'Offer',
          price: priceStr,
          priceCurrency: 'USD',
          availability,
          url: canonicalUrl,
          ...offerPolicies,
        },
        ...ratingBlock,
      };

  // Breadcrumbs. Home > Shop > this product, matching the trail the nav now
  // actually offers -- /collections is a real page as of this change, so this
  // is not a breadcrumb to somewhere a visitor cannot go, which Google treats
  // as a violation.
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_ORIGIN}/collections` },
      { '@type': 'ListItem', position: 3, name: product!.name, item: canonicalUrl },
    ],
  };

  return (
    <main className="pdp-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product!} initialColor={color} reviews={reviewSummary} />
      <ProductReviews summary={reviewSummary} productHandle={id} />
      {/* Last, on purpose. Somebody still reading the reviews has not decided
          yet; somebody past them has, one way or the other, and that is the
          moment a different product is a suggestion rather than an
          interruption. */}
      <AlsoLike products={alsoLike} />
    </main>
  );
}
