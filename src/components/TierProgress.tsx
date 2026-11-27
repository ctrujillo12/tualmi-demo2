'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { money } from '@/lib/shipping';
import {
  BF_TIERS,
  BF_MAX_PCT,
  tierFor,
  nextTier,
  bfDiscountCents,
} from '@/lib/blackFriday';

/**
 * Black Friday "spend more, save more" ladder.
 *
 * Only rendered by callers that already know the sale applies to this visitor
 * (useBlackFriday().active), so nothing here re-checks access.
 *
 *   'strip' — the header line on every page: current tier + the next step,
 *             with a hairline fill along the bottom edge
 *   'panel' — the cart: the full ladder with every tier marked, so she can see
 *             all five steps and exactly where she is on them
 *
 * The next-tier ask names a dollar gap AND the percent it unlocks, because
 * the reward for closing it is a bigger discount on the whole order, not just
 * on the extra item — that is the bit worth saying out loud.
 */

const TOP = BF_TIERS[BF_TIERS.length - 1].min;
/** Fill position for a subtotal: the ladder is linear from $0 to the top tier. */
const pos = (cents: number) => Math.min(1, cents / TOP);

export default function TierProgress({ variant }: { variant: 'strip' | 'panel' }) {
  const total = useCartStore((s) => s.getTotal());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const cents = hydrated ? total : 0;
  const tier = tierFor(cents);
  const next = nextTier(cents);
  const gap = next ? next.min - cents : 0;
  const saving = bfDiscountCents(cents, true);
  const pct = pos(cents);

  if (variant === 'strip') {
    const started = hydrated && total > 0;
    const body = !started ? (
      <>
        <span className="ship-spark" aria-hidden>✦</span>
        black friday is live · <strong>up to {BF_MAX_PCT}% off</strong>
        <span className="bf-strip-long"> · the more you spend, the more you save</span>
      </>
    ) : !tier ? (
      <>
        add <strong>{money(gap)}</strong> to unlock <strong>{next!.pct}% off</strong> your order
      </>
    ) : next ? (
      <>
        <strong>{tier.pct}% off</strong> unlocked · add <strong>{money(gap)}</strong> for{' '}
        <strong>{next.pct}%</strong>
      </>
    ) : (
      <>
        <span className="ship-spark" aria-hidden>✦</span>
        max discount unlocked · <strong>{tier.pct}% off</strong> your order
      </>
    );

    const inner = (
      <>
        <span className="ship-strip-text">{body}</span>
        <span className="ship-strip-fill" style={{ width: `${Math.round(pct * 100)}%` }} aria-hidden />
      </>
    );

    return started ? (
      <Link href="/cart" className="ship-strip bf-strip" data-qualified={next ? 'false' : 'true'}>
        {inner}
      </Link>
    ) : (
      <div className="ship-strip bf-strip" data-qualified="false">{inner}</div>
    );
  }

  // ── Cart panel ──
  return (
    <div className="bf-panel" data-max={next ? 'false' : 'true'}>
      <div className="bf-panel-head">
        <span className="bf-panel-msg">
          {tier ? (
            next ? <>black friday · <strong>{tier.pct}% off</strong> unlocked</> : <>max discount unlocked ✦ {tier.pct}% off</>
          ) : (
            <>black friday · spend more, save more</>
          )}
        </span>
        {saving > 0 && <span className="bf-panel-amount">−{money(saving)}</span>}
      </div>

      <div
        className="bf-ladder"
        role="progressbar"
        aria-label="black friday discount tier progress"
        aria-valuenow={Math.round(cents / 100)}
        aria-valuemin={0}
        aria-valuemax={TOP / 100}
        aria-valuetext={tier ? `${tier.pct}% off reached` : 'no tier reached yet'}
      >
        <div className="bf-track">
          <div className="bf-fill" style={{ width: `${pct * 100}%` }} />
        </div>
        {BF_TIERS.map((t) => {
          const reached = cents >= t.min;
          const current = tier?.min === t.min;
          return (
            <div
              key={t.min}
              className="bf-step"
              data-reached={reached ? 'true' : 'false'}
              data-current={current ? 'true' : 'false'}
              style={{ left: `${pos(t.min) * 100}%` }}
            >
              <span className="bf-dot" aria-hidden />
              <span className="bf-step-pct">{t.pct}%</span>
              <span className="bf-step-min">{money(t.min)}+</span>
            </div>
          );
        })}
      </div>

      <p className="bf-panel-note">
        {next ? (
          <>
            spend <strong>{money(gap)}</strong> more, get <strong>{next.pct}% off</strong> your whole cart
          </>
        ) : (
          <>you&apos;ve hit the top tier — {tier!.pct}% off everything in your cart</>
        )}
      </p>
      <p className="bf-panel-fine">applied automatically at checkout · ends monday 11:59 pm pt</p>
    </div>
  );
}

/**
 * Product page version: one plain sentence about the WHOLE cart —
 * "spend $42 more, get 25% off your whole cart" — plus the ladder showing
 * where the cart is now. (An earlier "add this → 30%" version projected this
 * item into the cart and added a second "then $X more" line; both read as
 * confusing, so it now just says what the header strip says, in full.)
 */
export function TierNudge() {
  const total = useCartStore((s) => s.getTotal());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const now = hydrated ? total : 0;
  const next = nextTier(now);
  const tier = tierFor(now);

  return (
    <div className="bf-panel bf-pdp" data-max={next ? 'false' : 'true'}>
      <p className="bf-pdp-msg">
        {now === 0 ? (
          <>the more you spend, the more you save — up to <strong>{BF_MAX_PCT}% off</strong> your whole cart</>
        ) : next ? (
          <>spend <strong>{money(next.min - now)}</strong> more, get <strong>{next.pct}% off</strong> your whole cart</>
        ) : (
          <>✦ you&apos;ve unlocked <strong>{tier!.pct}% off</strong> your whole cart</>
        )}
      </p>

      <div className="bf-ladder" aria-hidden>
        <div className="bf-track">
          <div className="bf-fill" style={{ width: `${pos(now) * 100}%` }} />
        </div>
        {BF_TIERS.map((t) => (
          <div
            key={t.min}
            className="bf-step"
            data-reached={now >= t.min ? 'true' : 'false'}
            data-current={tier?.min === t.min ? 'true' : 'false'}
            style={{ left: `${pos(t.min) * 100}%` }}
          >
            <span className="bf-dot" />
            <span className="bf-step-pct">{t.pct}%</span>
            <span className="bf-step-min">{money(t.min)}+</span>
          </div>
        ))}
      </div>
    </div>
  );
}
