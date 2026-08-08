import type { Metadata } from 'next';
import DiscountRedirect from '@/components/DiscountRedirect';

/**
 * /discount/[code]?redirect=/products/sierra-shorts
 *
 * Creator links point here. The code is saved in the browser, the creator is
 * credited as the traffic source, and the shopper continues to a normal page
 * on our site. The code itself is applied to the Shopify cart at checkout
 * (see lib/shopify.ts → createCheckout).
 *
 * Not indexed — these are share links, not pages we want in search results.
 */
/**
 * Link previews for creator links.
 *
 * Without this the page inherits the site-wide OG card from app/layout.tsx, so
 * a creator's link to the shorts previewed as the generic homepage image. The
 * preview is the first thing their audience sees, so match it to wherever the
 * link actually goes.
 */
const OG_BY_DESTINATION: { match: string; title: string; description: string; image: string }[] = [
  {
    match: 'sierra-shorts',
    title: 'Sierra Shorts — Tualmi',
    description: 'Mid-rise, relaxed fit. 100% recycled, fast-dry and ultra-light.',
    image: '/og/sierra-shorts-og.jpg',
  },
  {
    match: 'juniper-pant',
    title: 'Juniper Pant — Tualmi',
    description: 'Flare cargo hiking pants, engineered for women. Sustainable recycled materials.',
    image: '/og/juniper-pant-og.jpg',
  },
];

const OG_FALLBACK = {
  title: 'Tualmi — actually cute hiking apparel',
  description: 'Built for the trail, cute everywhere else.',
  image: '/og/home-og.jpg',
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const redirect = typeof sp.redirect === 'string' ? sp.redirect : '';
  const og = OG_BY_DESTINATION.find((o) => redirect.includes(o.match)) ?? OG_FALLBACK;

  return {
    title: og.title,
    description: og.description,
    // Share links, not pages we want in search results.
    robots: { index: false, follow: false },
    openGraph: {
      siteName: 'Tualmi',
      type: 'website',
      title: og.title,
      description: og.description,
      images: [{ url: og.image, width: 1200, height: 630, alt: og.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: og.title,
      description: og.description,
      images: [og.image],
    },
  };
}

/** Only allow same-site paths. Blocks `//evil.com` and absolute URLs. */
function safeRedirect(raw: string | undefined): string {
  if (!raw) return '/';
  const value = decodeURIComponent(raw).trim();
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

/**
 * Any query param other than `redirect` is forwarded to the destination, so a
 * creator link can stay readable:
 *
 *   /discount/CAMI10?redirect=/products/sierra-shorts&color=Confetti
 *
 * instead of forcing the whole destination to be URL-encoded into one param.
 */
function buildTarget(
  redirect: string | undefined,
  all: Record<string, string | string[] | undefined>
): string {
  const base = safeRedirect(redirect);
  const [path, existingQuery] = base.split('?');

  const query = new URLSearchParams(existingQuery ?? '');
  for (const [key, value] of Object.entries(all)) {
    if (key === 'redirect' || value === undefined) continue;
    query.set(key, Array.isArray(value) ? value[0] : value);
  }

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export default async function DiscountPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const redirect = typeof sp.redirect === 'string' ? sp.redirect : undefined;

  return <DiscountRedirect code={code} redirectTo={buildTarget(redirect, sp)} />;
}
