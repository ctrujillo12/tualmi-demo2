'use client';

import { useBlackFriday, saleUnit } from '@/lib/blackFriday';

/**
 * Black Friday price + ribbon for shop cards (homepage, /collections).
 * Server components (ShopCard) can't read the visitor's sale access, so these
 * small client pieces do. Before hydration, and for visitors the sale doesn't
 * apply to yet, they render the regular price / nothing.
 */
const label = (cents: number) => {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
};

export function SalePrice({ cents, compareAt }: { cents: number; compareAt?: number }) {
  const { active } = useBlackFriday();
  const sale = active ? saleUnit(cents) : null;
  if (sale) {
    return (
      <>
        <s>{label(cents)}</s>
        <span className="bf-sale-price">{label(sale.price)}</span>
      </>
    );
  }
  return (
    <>
      {compareAt !== undefined && compareAt > cents && <s>{label(compareAt)}</s>}
      {label(cents)}
    </>
  );
}

/** Diagonal corner ribbon, e.g. "15% off". Parent must be position:relative + overflow:hidden. */
export function SaleRibbon({ cents }: { cents: number }) {
  const { active } = useBlackFriday();
  const sale = active ? saleUnit(cents) : null;
  if (!sale) return null;
  return <span className="bf-ribbon" aria-label={`${sale.pct}% off`}>{sale.pct}% off</span>;
}
