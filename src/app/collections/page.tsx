import type { Metadata } from 'next';
import AlsoLike from '@/components/AlsoLike';
import { getProduct } from '@/lib/products';
import { DETAIL_HANDLES } from '@/lib/catalog';

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
 * The sticky scroll section on the landing page stays exactly as it is. This
 * is not a replacement for it; it is the destination that section, the nav and
 * the breadcrumbs can all name.
 *
 * ── WHY IT REUSES <AlsoLike> ─────────────────────────────────────────────
 * Because the cross-sell row already IS a product grid: one card per
 * colourway, photo, name, colourway, price, link, and the per-image scale
 * normalisation that makes the models the same size across cards. Rebuilding
 * that here would duplicate the fiddliest CSS in the repo and guarantee the
 * two grids drift apart. Only the heading changes.
 *
 * ── SERVER-RENDERED, DELIBERATELY ────────────────────────────────────────
 * Same reasoning as the cross-sell row: the cards are in the HTML. A shop page
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
  // Individually caught, like the cross-sell row: one product failing to
  // resolve costs its own cards, not the whole shop page.
  const products = (
    await Promise.all(DETAIL_HANDLES.map((h) => getProduct(h).catch(() => null)))
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  // An ItemList of the products, so the page reads as a catalogue rather than
  // as a page that happens to mention two products. Links only -- the prices
  // and availability live on the product pages' own ProductGroup markup, and
  // repeating them here would be two sources for one number.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tualmi shop',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/products/${p.handle ?? p.id}`,
      name: p.name,
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
      <AlsoLike products={products} heading="shop" pitch={null} />
    </main>
  );
}
