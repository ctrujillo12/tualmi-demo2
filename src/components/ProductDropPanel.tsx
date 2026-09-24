import Image from 'next/image';
import Link from 'next/link';
import QuickAdd from '@/components/QuickAdd';
import PanelShopLink from '@/components/PanelShopLink';
import { priceLabel, type DropProduct } from '@/lib/dropProducts';
import type { Product } from '@/types';

const sans = 'var(--font-montserrat), system-ui, sans-serif';

/**
 * One "the drop" panel: a full-bleed colored band with the product name,
 * price, and every colorway as a big cover-photo tile with quick add-to-cart.
 *
 * Extracted from the landing page (app/page.tsx, "THE DROP" section) so the
 * shop page (app/collections/page.tsx) can show the *exact* same big cards,
 * the same cover photos and the same quick-add — rather than a second,
 * smaller card design (the old /collections reused the cross-sell strip's
 * cards, which is a different, deliberately-smaller design meant for a
 * recommendation row, not the shop page itself) that would only drift from
 * this one over time. See lib/dropProducts.ts for the shared data.
 *
 * Styling relies on the same globals.css classes as the landing page
 * (.panel-viewport, .colorway-row, .colorway-tile, .colorway-photo) — on
 * mobile those already stack the colorways vertically instead of scrolling
 * sideways, so nothing extra is needed here to keep the page scrolling only
 * the ordinary way, down.
 */
export default function ProductDropPanel({
  drop,
  resolvedProduct,
}: {
  drop: DropProduct;
  /** Live Shopify product, for QuickAdd and the live price. null falls back
   *  to drop.price and lets QuickAdd render its "view" fallback. */
  resolvedProduct: Product | null;
}) {
  const panelPrice = priceLabel(resolvedProduct?.price ?? drop.price);

  return (
    <section
      className="panel-viewport"
      style={{
        position: 'relative',
        minHeight: '72svh',
        backgroundColor: drop.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(56px, 7vh, 84px) clamp(16px, 4vw, 48px) clamp(48px, 6vh, 72px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'clamp(16px, 2.4vh, 26px)',
          maxWidth: '1240px',
          width: '100%',
        }}
      >
        <div>
          {drop.availability && (
            <p
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.18em',
                color: drop.accent,
                margin: '0 0 8px',
                textTransform: 'lowercase',
              }}
            >
              {drop.availability}
            </p>
          )}
          <h3
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 'clamp(26px, 3.4vw, 40px)',
              letterSpacing: '-0.02em',
              color: drop.accent,
              margin: 0,
              textTransform: 'lowercase',
            }}
          >
            {drop.name}
          </h3>
          <p
            style={{
              fontFamily: sans,
              fontWeight: 700,
              fontSize: 'clamp(15px, 1.8vw, 19px)',
              color: drop.accent,
              margin: '6px 0 0',
              opacity: 0.9,
            }}
          >
            {panelPrice}
          </p>
        </div>

        {/* All colorways, side by side (stacked on mobile — see globals.css) */}
        <div className="colorway-row">
          {drop.colorways.map((cw) => (
            <div key={cw.color} className="colorway-tile">
              <Link
                href={`/products/${drop.handle}?color=${encodeURIComponent(cw.color)}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="colorway-photo">
                  <Image
                    src={cw.image}
                    alt={`${drop.name} in ${cw.color}`}
                    fill
                    quality={90}
                    sizes="(max-width: 768px) 33vw, 420px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <p
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: '13px',
                    color: drop.accent,
                    margin: '9px 0 0',
                    textTransform: 'lowercase',
                  }}
                >
                  <span
                    style={{
                      width: '11px',
                      height: '11px',
                      borderRadius: '50%',
                      background: cw.swatch,
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                      flexShrink: 0,
                    }}
                  />
                  {cw.color.toLowerCase()}
                  <span aria-hidden style={{ opacity: 0.5 }}>·</span>
                  <span style={{ fontWeight: 700 }}>{panelPrice}</span>
                </p>
              </Link>
              <QuickAdd product={resolvedProduct} color={cw.color} accent={drop.accent} />
            </div>
          ))}
        </div>

        <PanelShopLink handle={drop.handle} accent={drop.accent} label={drop.shopLabel} />
      </div>
    </section>
  );
}
