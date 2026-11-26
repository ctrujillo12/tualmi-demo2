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
        black friday is live · <strong>up to {BF_MAX_PCT}% off</strong> · the more you spend, the more you save
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
            add <strong>{money(gap)}</strong> more to get <strong>{next.pct}% off</strong> your whole order
            {tier ? <> (up from {tier.pct}%)</> : null}
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
 * Product page version: shows where the cart lands IF she adds this item.
 *
 * The cart ladder says where you are; this one says what this button does to
 * it ("adding this gets your order to 20% off"), which is the moment the
 * nudge is worth most. The solid fill is what's already in the cart, the
 * lighter segment is this item. Only rendered when the sale applies.
 */
export function TierNudge({ addCents }: { addCents: number }) {
  const total = useCartStore((s) => s.getTotal());
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const now = hydrated ? total : 0;
  const withItem = now + addCents;
  const tierNow = tierFor(now);
  const tierWith = tierFor(withItem);
  const next = nextTier(withItem);
  const jumps = !!tierWith && tierWith.pct !== tierNow?.pct;

  return (
    <div className="bf-panel bf-pdp" data-max={next ? 'false' : 'true'}>
      <div className="bf-panel-head" style={{ marginBottom: '12px' }}>
        <span className="bf-panel-msg">
          {jumps ? (
            <>add this → <strong>{tierWith!.pct}% off</strong> your whole order</>
          ) : tierWith ? (
            <>you&apos;re at <strong>{tierWith.pct}% off</strong> with this in your cart</>
          ) : (
            <>black friday · <strong>15% off</strong> at {money(BF_TIERS[0].min)}</>
          )}
        </span>
        {tierWith && <span className="bf-panel-amount">−{money(bfDiscountCents(withItem, true))}</span>}
      </div>

      <div className="bf-ladder" aria-hidden>
        <div className="bf-track">
          <div className="bf-fill bf-fill-ghost" style={{ width: `${pos(withItem) * 100}%` }} />
          <div className="bf-fill bf-fill-now" style={{ width: `${pos(now) * 100}%` }} />
        </div>
        {BF_TIERS.map((t) => (
          <div
            key={t.min}
            className="bf-step"
            data-reached={withItem >= t.min ? 'true' : 'false'}
            data-current={tierWith?.min === t.min ? 'true' : 'false'}
            style={{ left: `${pos(t.min) * 100}%` }}
          >
            <span className="bf-dot" />
            <span className="bf-step-pct">{t.pct}%</span>
            <span className="bf-step-min">{money(t.min)}+</span>
          </div>
        ))}
      </div>

      <p className="bf-panel-note">
        {next ? (
          <>then <strong>{money(next.min - withItem)}</strong> more gets you <strong>{next.pct}% off</strong></>
        ) : (
          <>that&apos;s the top tier — {tierWith!.pct}% off everything</>
        )}
      </p>
    </div>
  );
}
