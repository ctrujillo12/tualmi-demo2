'use client';

import {
  SQUARE_MPID,
  SQUARE_PLACEMENT_CART,
  SQUARE_PLACEMENT_PRODUCT,
} from '@/lib/afterpay';

/**
 * Afterpay "pay in 4" messaging, rendered by Square's square-marketplace.js
 * (loaded in app/layout.tsx). Square draws the copy, the installment math and
 * the required disclaimer itself, so none of that lives here.
 *
 * Placement rule from Square: immediately below the price (product page) or
 * the cart total (cart page), with `amount` matching the number shown there.
 */
type Props = {
  pageType: 'product' | 'cart';
  /** The price shown on the page, in cents. */
  cents: number;
  skus?: (string | null | undefined)[];
  categories?: (string | null | undefined)[];
};

const list = (xs: (string | null | undefined)[] = []) =>
  [...new Set(xs.filter((x): x is string => !!x && x.trim().length > 0))].join(',');

export default function SquarePlacement({ pageType, cents, skus, categories }: Props) {
  const amount = (cents / 100).toFixed(2);
  return (
    <div className="afterpay-line">
      {/* Keyed on the amount so a size/color or quantity change re-renders the
          placement with the new number rather than relying on the widget to
          notice an attribute change. */}
      <square-placement
        key={amount}
        data-mpid={SQUARE_MPID}
        data-placement-id={pageType === 'product' ? SQUARE_PLACEMENT_PRODUCT : SQUARE_PLACEMENT_CART}
        data-page-type={pageType}
        data-amount={amount}
        data-currency="USD"
        data-consumer-locale="en_US"
        data-item-skus={list(skus)}
        data-item-categories={list(categories)}
        data-is-eligible="true"
      />
    </div>
  );
}

// <square-placement> is a custom element; tell TypeScript it exists.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'square-placement': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        [attr: `data-${string}`]: string | undefined;
      };
    }
  }
}
