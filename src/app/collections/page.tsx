import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import QuickAdd from '@/components/QuickAdd';
import { getProduct } from '@/lib/products';
import { DROP_PRODUCTS, priceLabel } from '@/lib/dropProducts';

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
 * ── WHY IT'S A GRID NOW (Oct 2026) ──────────────────────────────────────
 * It rendered the landing page's big "THE DROP" panels, described below. On
 * a phone those stack every colorway full-width, so a shopper saw the Juniper
 * Pant and nothing else until she scrolled a long way. This is now a plain
 * shop grid instead: one small card per colorway, two across on a phone and
 * four on desktop, no descriptions. Data still comes from DROP_PRODUCTS so
 * the cover photos and colorway order match the landing page.
 *
 * ── (HISTORY) WHY IT WAS THE SAME PANELS AS THE LANDING PAGE ─────────────
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
  title: 'shop women’s hiking shorts & pants',
  description:
    'Shop Tualmi: women’s hiking shorts and flare cargo hiking pants, designed in LA and made ethically in a WRAP-certified facility.',
  alternates: { canonical: '/collections' },
};

const SITE = 'https://www.tualmi.com';
const TOTE_HANDLE = 'trailblazing-tote';

export default async function CollectionsPage() {
  // Individually caught, like the landing page: one product failing to
  // resolve costs its own panel's live price and quick-add, not the whole
  // shop page — ProductDropPanel falls back to the static price and
  // QuickAdd's "view" link when resolvedProduct is null.
  const [resolved, tote] = await Promise.all([
    Promise.all(DROP_PRODUCTS.map((d) => getProduct(d.handle).catch(() => null))),
    // The tote is unlisted (UNLISTED_HANDLES in lib/products.ts): it has no
    // product page and stays out of every product list except two places --
    // the cart's "you might also like" row and this grid. Fetched by handle so
    // the listing filter doesn't hide it here.
    getProduct(TOTE_HANDLE).catch(() => null),
  ]);
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
    <main className="pdp-main header-clear">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="shop-wrap">
        <h1 className="shop-title">shop</h1>
        <div className="shop-grid">
          {DROP_PRODUCTS.flatMap((d) => {
            const product = productFor(d.handle);
            const price = product?.price ?? d.price;
            const compareAt = product?.compareAtPrice;
            const onSale = compareAt !== undefined && compareAt > price;
            // "the juniper pant" -> "juniper pant": a card title, not a heading.
            const name = d.name.replace(/^the /, '');
            return d.colorways.map((cw) => (
              <div key={`${d.handle}-${cw.color}`} className="shop-card">
                <Link
                  href={`/products/${d.handle}?color=${encodeURIComponent(cw.color)}`}
                  className="shop-card-link"
                >
                  <div className="shop-card-photo">
                    <Image
                      src={cw.image}
                      alt={`${name} in ${cw.color}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <p className="shop-card-name">{name}</p>
                  <p className="shop-card-meta">
                    <span className="shop-card-swatch" style={{ background: cw.swatch }} />
                    {cw.color.toLowerCase()}
                  </p>
                  <p className="shop-card-price">
                    {onSale && <s>{priceLabel(compareAt)}</s>}
                    {priceLabel(price)}
                  </p>
                </Link>
                <QuickAdd product={product} color={cw.color} accent="#A9445C" sizeVariant="link" />
              </div>
            ));
          })}
          {/* Last, after the garments. No link: there is no tote page to
              send anyone to, and a dead link is worse than none. One size, so
              QuickAdd adds it straight away with no size step. Left out of
              the ItemList above for the same reason -- it has no URL. */}
          {tote && tote.images?.[0] && (
            <div className="shop-card">
              <div className="shop-card-photo">
                <Image
                  src={tote.images[0]}
                  alt={tote.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <p className="shop-card-name">{tote.name.toLowerCase()}</p>
              <p className="shop-card-meta">one size</p>
              <p className="shop-card-price">
                {tote.compareAtPrice !== undefined && tote.compareAtPrice > tote.price && (
                  <s>{priceLabel(tote.compareAtPrice)}</s>
                )}
                {priceLabel(tote.price)}
              </p>
              <QuickAdd product={tote} color="" accent="#A9445C" sizeVariant="link" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
