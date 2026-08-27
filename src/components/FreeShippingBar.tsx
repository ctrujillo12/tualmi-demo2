'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import {
  freeShippingProgress,
  money,
  FREE_SHIPPING_THRESHOLD,
  FLAT_SHIPPING_CENTS,
} from '@/lib/shipping';
import { trackShippingNudge } from '@/lib/analytics';

/**
 * Free-shipping messaging, shown in two places with the same numbers.
 *
 * ── WHY THIS STOPPED SAYING "$62 TO GO" ──────────────────────────────────
 * The gap number is only motivating when the gap is closeable. Every item in
 * this shop costs at least $68, so a one-item cart is never a small top-up
 * away from the threshold — it is a whole second purchase away. "$62 away from
 * free US shipping" asked a shopper to spend $62 to save $7.99, which reads as
 * a penalty for buying one thing, and it was the loudest element on a screen
 * whose actual job is to get her to checkout.
 *
 * So the message below the threshold now does one of two things:
 *
 *   plain        — states what shipping costs. No ask, no bar-filling guilt.
 *                  Used in the header strip always, and in the cart whenever
 *                  nothing in the cart could close the gap in one step.
 *
 *   second_pair  — names the reachable outcome WITH its total: "add a second
 *                  pair — $136 total, and shipping's free". A total a shopper
 *                  can check beats a deficit she has to do arithmetic on, and
 *                  it points at something real (the colourways sitting in
 *                  <CartUpsell> directly below).
 *
 * Both fire trackShippingNudge so checkout completion can be compared between
 * them, and against the "$X to go" period before 27 Aug 2026.
 *
 * The threshold itself is unchanged and deliberate — $130, see lib/shipping.ts.
 * This is a copy change. It moves no margin.
 *
 * `variant`:
 *   'strip' — thin line in the site header, with a hairline progress fill
 *             along the bottom edge so mobile shows progress without needing
 *             a second row of UI
 *   'panel' — bordered block with a full progress bar, for the cart summary
 */
export default function FreeShippingBar({ variant = 'strip' }: { variant?: 'strip' | 'panel' }) {
  const total = useCartStore((s) => s.getTotal());
  const items = useCartStore((s) => s.items);

  // The cart is persisted, so it isn't readable until after hydration. Render
  // the plain promo first and upgrade to live progress once it's known.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { qualified, remaining, pct } = freeShippingProgress(total);
  const started = hydrated && total > 0;

  /**
   * The cheapest thing already in the cart, as a stand-in for "one more of
   * what you're clearly buying". Using something they've already chosen keeps
   * the suggested total honest — it's a number they can verify against the
   * line items — and it costs no extra data fetch.
   */
  const cheapestCents = items.length
    ? Math.min(...items.map((i) => i.product.price))
    : 0;
  const secondPairTotal = total + cheapestCents;

  /**
   * Only suggest the second pair when it's a proportionate way to close the
   * gap — when what you'd add is near what you still need.
   *
   * Without this the suggestion gets absurd at the top of the range. A cart
   * holding one $108 pant is $22 short, and "add a second pair" would mean
   * $108 to close a $22 gap — an answer five times the size of the question,
   * which reads as a shop that isn't listening. That cart gets the plain line
   * instead, and <CartUpsell> below is free to offer the $68 shorts on its own
   * terms.
   *
   * 1.5× is a judgement call, not a discovered constant. It keeps the one-pair
   * shorts cart (needs $62, add $68) and rejects the one-pant cart. Move it if
   * the price ladder changes.
   */
  const PROPORTIONATE = 1.5;
  const secondPairClears =
    !qualified &&
    cheapestCents > 0 &&
    secondPairTotal >= FREE_SHIPPING_THRESHOLD &&
    cheapestCents <= remaining * PROPORTIONATE;

  // ── Measurement ──
  // Keyed so the event fires when the message changes, not on every render.
  const lastTracked = useRef<string | null>(null);
  useEffect(() => {
    if (!started || qualified) return;
    const nudge = secondPairClears ? 'second_pair' : 'plain';
    const key = `${variant}:${nudge}:${total}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackShippingNudge(nudge, total / 100);
  }, [started, qualified, secondPairClears, total, variant]);

  // ── Header strip ──
  // Always the plain version. There is no room here for a sentence, and the
  // header is not where a shopper is deciding what else to buy.
  if (variant === 'strip') {
    const body = started ? (
      qualified ? (
        <>
          <span className="ship-spark" aria-hidden>✦</span>
          free US shipping <strong>unlocked</strong>
        </>
      ) : (
        <>
          {/* Stated, not demanded. She can see what shipping costs and what
              would make it free, and decide for herself. */}
          shipping <strong>{money(FLAT_SHIPPING_CENTS)}</strong> · free over{' '}
          <strong>{money(FREE_SHIPPING_THRESHOLD)}</strong>
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
            taking a second row of vertical space on a phone. Kept even though
            the gap number is gone: a quiet visual is encouraging where an
            explicit deficit is not. */}
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
        {/* Was "{remaining} to go". Now the cost itself, which is the number
            she is actually weighing — and it matches the Shipping line in the
            breakdown a few rows below instead of competing with it. */}
        {!qualified && (
          <span className="ship-panel-amount">{money(FLAT_SHIPPING_CENTS)} shipping</span>
        )}
      </div>

      <div
        className="ship-track"
        role="progressbar"
        aria-valuenow={Math.round(pct * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="ship-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>

      {!qualified && (
        <p className="ship-panel-note">
          {secondPairClears ? (
            <>
              add a second pair — <strong>{money(secondPairTotal)}</strong> total, and
              shipping&apos;s free
            </>
          ) : (
            // Nothing in the cart closes the gap in one step, so there is no
            // honest nudge to make. State the rule and leave her alone.
            <>free on US orders over {money(FREE_SHIPPING_THRESHOLD)}</>
          )}
        </p>
      )}
    </div>
  );
}
