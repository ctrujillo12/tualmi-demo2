import type { Metadata } from 'next';
import ProductDropPanel from '@/components/ProductDropPanel';
import { getProduct } from '@/lib/products';
import { DROP_PRODUCTS } from '@/lib/dropProducts';

/**
 * /collections — the shop page.
 *
 * ── WHY THIS EXISTS AGAIN ────────────────────────────────────────────────
 * It used to be `redirect('/#collection')`. That was fine for a visitor and
 * bad for everything else: the nav's "shop" link, the only link on the site
 * whose job is "show me the products", pointed at a fragment on the homepage.
 * So the site had no crawlable page whose subject was the catalogue, and both
 * product pages were reachable from exactly one place. Google finds products
 * by following links, and it weighs a page by how much of the site points at
 * it, so the two pages we most want ranked were the two with the fewest ways
 * in. Breadcrumbs had nowhere to point either.
 *
 * ── WHY IT'S THE SAME PANELS AS THE LANDING PAGE ─────────────────────────
 * This used to reuse the "you may also like" cross-sell strip's small cards —
 * a different, deliberately-smaller design meant for a recommendation row at
 * the bottom of a page someone is already reading. On a phone that strip is
 * also a swipeable sideways carousel, which is right for a cross-sell nudge
 * and wrong for the one page whose entire job is "let me see everything for
 * sale" — that mismatch is why this page used to scroll sideways on a phone.
 *
 * So this now renders the *exact* same big panels as the landing page's
 * "THE DROP" section instead: same cover photos, same quick add-to-cart,
 * same colored bands, pants first. The data (DROP_PRODUCTS) and the panel
 * markup (<ProductDropPanel>) are shared with app/page.tsx via
 * lib/dropProducts.ts and components/ProductDropPanel.tsx, so the two can't
 * quietly drift into two different shop experiences. DROP_PRODUCTS is
 * already ordered pants-then-shorts (see that file), which is also the order
 * this page displays and lists in its structured data below.
 *
 * ── SERVER-RENDERED, DELIBERATELY ────────────────────────────────────────
 * Same reasoning as the landing page: the cards are in the HTML. A shop page
 * whose products arrive by client fetch is a shop page a crawler may see empty,
 * which would defeat the point of adding it.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'shop — tualmi',
  description:
    'Shop Tualmi: women’s hiking shorts and flare cargo hiking pants, designed in LA and made ethically in a WRAP-certified facility.',
  alternates: { canonical: '/collections' },
};

const SITE = 'https://tualmi.com';

export default async function CollectionsPage() {
  // Individually caught, like the landing page: one product failing to
  // resolve costs its own panel's live price and quick-add, not the whole
  // shop page — ProductDropPanel falls back to the static price and
  // QuickAdd's "view" link when resolvedProduct is null.
  const resolved = await Promise.all(
    DROP_PRODUCTS.map((d) => getProduct(d.handle).catch(() => null)),
  );
  const productFor = (handle: string) =>
    resolved.find((p) => p && (p.handle ?? p.id) === handle) ?? null;

  // An ItemList of the products, so the page reads as a catalogue rather than
  // as a page that happens to mention two products. Links only -- the prices
  // and availability live on the product pages' own ProductGroup markup, and
  // repeating them here would be two sources for one number. Order matches
  // DROP_PRODUCTS (pants, then shorts) so the structured data matches what's
  // actually on the page.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tualmi shop',
    itemListElement: DROP_PRODUCTS.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/products/${d.handle}`,
      name: productFor(d.handle)?.name ?? d.name,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/collections` },
    ],
  };

  return (
    <main className="pdp-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {DROP_PRODUCTS.map((d) => (
        <ProductDropPanel key={d.handle} drop={d} resolvedProduct={productFor(d.handle)} />
      ))}
    </main>
  );
}
