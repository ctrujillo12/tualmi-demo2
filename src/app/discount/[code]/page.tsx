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
export const metadata: Metadata = {
  title: 'applying your discount',
  robots: { index: false, follow: false },
};

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
