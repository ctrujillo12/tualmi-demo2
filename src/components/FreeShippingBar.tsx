'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { freeShippingProgress, money, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

/**
 * Free-shipping progress, shown in two places with the same numbers.
 *
 * The message follows the shopper down the funnel: a plain promo when the cart
 * is empty, a live "add $X more" nudge once they've started, and a reward state
 * once they qualify. A static banner that never changes is the version people
 * learn to ignore.
 *
 * `variant`:
 *   'strip' — thin line in the site header, with a hairline progress fill
 *             along the bottom edge so mobile shows progress without needing
 *             a second row of UI
 *   'panel' — bordered block with a full progress bar, for the cart summary
 */
export default function FreeShippingBar({ variant = 'strip' }: { variant?: 'strip' | 'panel' }) {
  const total = useCartStore((s) => s.getTotal());

  // The cart is persisted, so it isn't readable until after hydration. Render
  // the plain promo first and upgrade to live progress once it's known.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { qualified, remaining, pct } = freeShippingProgress(total);
  const started = hydrated && total > 0;

  // ── Header strip ──
  if (variant === 'strip') {
    const body = started ? (
      qualified ? (
        <>
          <span className="ship-spark" aria-hidden>✦</span>
          free US shipping <strong>unlocked</strong>
        </>
      ) : (
        <>
          <strong>{money(remaining)}</strong> away from free US shipping
        </>
      )
    ) : (
      <>
        {/* "earn" rather than a flat statement of fact — the idle state is the
            one a shopper sees before they've added anything, so it should read
            as something to go get, not a policy line. */}
        earn free US shipping over <strong>{money(FREE_SHIPPING_THRESHOLD)}</strong>
      </>
    );

    const inner = (
      <>
        <span className="ship-strip-text">{body}</span>
        {/* Hairline fill along the bottom edge — progress at a glance without
            taking a second row of vertical space on a phone. */}
        <span
          className="ship-strip-fill"
          style={{ width: started ? `${Math.round(pct * 100)}%` : '0%' }}
          aria-hidden
        />
      </>
    );

    // Once there's something in the cart the strip becomes a shortcut to it.
    return started ? (
      <Link
        href="/cart"
        className="ship-strip"
        data-qualified={qualified ? 'true' : 'false'}
      >
        {inner}
      </Link>
    ) : (
      <div className="ship-strip" data-qualified="false">
        {inner}
      </div>
    );
  }

  // ── Cart panel ──
  return (
    <div className="ship-panel" data-qualified={qualified ? 'true' : 'false'}>
      <div className="ship-panel-head">
        <span className="ship-panel-msg">
          {qualified ? 'free US shipping unlocked ✦' : 'free US shipping'}
        </span>
        {!qualified && (
          <span className="ship-panel-amount">{money(remaining)} to go</span>
        )}
      </div>
      <div className="ship-track" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="ship-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>
      {!qualified && (
        <p className="ship-panel-note">
          on US orders over {money(FREE_SHIPPING_THRESHOLD)}
        </p>
      )}
    </div>
  );
}
