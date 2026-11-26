'use client';

import { useEffect, useState } from 'react';

/**
 * ── Black Friday 2026 ────────────────────────────────────────────────────
 *
 * Two releases of the same tiered sale:
 *
 *   early access   Thu 26 Nov, 4:00 pm PT — only browsers that arrived through
 *                  the Klaviyo email link (?access=BF_ACCESS_CODE)
 *   public         Fri 27 Nov, 4:00 pm PT — everyone, automatically
 *   ends           Mon 30 Nov, 11:59 pm PT (Cyber Monday)
 *
 * HOW THE DISCOUNT IS CHARGED
 * Each tier is a real Shopify discount code (Discounts → tag
 * "black-friday-2026"): amount off order, minimum subtotal, valid Thu 4pm PT →
 * Mon 11:59pm PT, combines with shipping discounts only. The codes are random
 * so nobody can guess them; nothing shows them on the site. At checkout the
 * site picks the ONE code for the tier this cart reached and applies it to the
 * Shopify cart (store/cartStore.ts). The tier minimum is enforced by Shopify,
 * so a code can't be used on a smaller order even if it leaks.
 *
 * WHO GETS IT WHEN is decided here, on the site: before Friday 4pm only a
 * browser holding the early-access flag gets a code at checkout. From Friday
 * 4pm every browser does, with no deploy or switch needed.
 *
 * If a code is ever renamed in Shopify, change it here in the same sitting —
 * Shopify silently drops an unknown code and the shopper pays full price.
 */

/** Pacific is UTC-8 (PST) on all of these dates. */
export const BF_EARLY_MS  = new Date('2026-11-26T16:00:00-08:00').getTime();
export const BF_PUBLIC_MS = new Date('2026-11-27T16:00:00-08:00').getTime();
export const BF_END_MS    = new Date('2026-11-30T23:59:59-08:00').getTime();

/**
 * The secret in the Klaviyo button link:
 *   https://www.tualmi.com/?access=listbf26-wk7r
 * Any page works (e.g. /products/sierra-shorts?access=listbf26-wk7r) and extra
 * utm params are fine. Deliberately NOT the July launch code ("trailblazer"):
 * that one is public by now and is already saved in thousands of browsers.
 */
export const BF_ACCESS_CODE = 'listbf26-wk7r';
export const BF_ACCESS_LINK = `https://www.tualmi.com/?access=${BF_ACCESS_CODE}`;

/** New key for the same reason — old launch-access browsers don't carry over. */
const STORAGE_KEY = 'tualmi_bf26_early';

export interface BfTier {
  /** Order subtotal needed, in cents. */
  min: number;
  pct: number;
  /** Shopify discount code that charges this tier. */
  code: string;
}

/** Ascending. Must match the codes in Shopify exactly. */
export const BF_TIERS: BfTier[] = [
  { min: 5000,  pct: 15, code: 'BF15-D29BY2' },
  { min: 10000, pct: 20, code: 'BF20-EWPUS2' },
  { min: 15000, pct: 25, code: 'BF25-YEZG3B' },
  { min: 20000, pct: 30, code: 'BF30-BK474C' },
  { min: 25000, pct: 35, code: 'BF35-66UGB3' },
];

export const BF_MAX_PCT = BF_TIERS[BF_TIERS.length - 1].pct;

/** Highest tier this subtotal reaches, or null below the first. */
export function tierFor(cents: number): BfTier | null {
  let hit: BfTier | null = null;
  for (const t of BF_TIERS) if (cents >= t.min) hit = t;
  return hit;
}

/** The next tier up, or null once the top tier is reached. */
export function nextTier(cents: number): BfTier | null {
  return BF_TIERS.find((t) => cents < t.min) ?? null;
}

/** What the tier takes off, in cents (display estimate; Shopify charges it). */
export function bfDiscountCents(cents: number, active: boolean): number {
  if (!active) return 0;
  const t = tierFor(cents);
  return t ? Math.round((cents * t.pct) / 100) : 0;
}

/** Saves the early-access flag if this URL carries the email link's code, then tidies the URL. */
export function captureBfAccess(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('access');
    if (code && code.trim().toLowerCase() === BF_ACCESS_CODE) {
      localStorage.setItem(STORAGE_KEY, '1');
      url.searchParams.delete('access');
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  } catch {
    /* storage blocked — they'll get the sale at the public open */
  }
}

export function hasEarlyFlag(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

export type BfPhase =
  | 'before'        // nobody shopping the sale yet
  | 'early-waiting' // has the link, early access not open yet
  | 'early-locked'  // early access is live, but not for this visitor
  | 'live'          // sale applies to this visitor
  | 'ended';

export function bfPhase(now: number, hasEarly: boolean): BfPhase {
  if (now > BF_END_MS) return 'ended';
  if (now >= BF_PUBLIC_MS) return 'live';
  if (now >= BF_EARLY_MS) return hasEarly ? 'live' : 'early-locked';
  return hasEarly ? 'early-waiting' : 'before';
}

/**
 * Non-hook check for checkout: does this browser get the sale right now?
 * Read at the moment of the checkout tap, so it is never stale.
 */
export function bfActiveNow(): boolean {
  if (typeof window === 'undefined') return false;
  return bfPhase(Date.now(), hasEarlyFlag()) === 'live';
}

/** Code to send to Shopify for this cart, or null. */
export function bfCodeFor(subtotalCents: number): string | null {
  if (!bfActiveNow()) return null;
  return tierFor(subtotalCents)?.code ?? null;
}

export interface BfState {
  ready: boolean;
  phase: BfPhase;
  active: boolean;
  hasEarly: boolean;
}

/**
 * Same answer on server and first client render (nothing unlocked, not
 * active), then the real one after hydration. Re-checks every second so the
 * 4pm flips happen on an open tab without a reload.
 */
export function useBlackFriday(): BfState {
  const [state, setState] = useState<BfState>({
    ready: false, phase: 'before', active: false, hasEarly: false,
  });

  useEffect(() => {
    captureBfAccess();
    const compute = (): BfState => {
      const hasEarly = hasEarlyFlag();
      const phase = bfPhase(Date.now(), hasEarly);
      return { ready: true, phase, active: phase === 'live', hasEarly };
    };
    setState(compute());
    const id = setInterval(() => {
      const next = compute();
      setState((prev) =>
        prev.phase === next.phase && prev.hasEarly === next.hasEarly ? prev : next,
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
