'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBlackFriday, bfPhase, BF_MAX_PCT, BF_PUBLIC_MS, type BfPhase } from '@/lib/blackFriday';
import { OPEN_EARLY_ACCESS_EVENT } from '@/components/WelcomePopup';

/**
 * Small Black Friday pill at the top of the landing-page hero, for EVERY
 * visitor, so the sale is the first thing they see. One line, no countdown.
 *
 *   before Fri 4pm, no link   "black friday · up to 35% off · opens fri 4pm pt"  → signup popup
 *   early access (link)       "early access is live · up to 35% off"            → /collections
 *   Fri 4pm → Mon             "black friday is live · up to 35% off"            → /collections
 *   after Monday              nothing
 */
export default function BlackFridayHero() {
  const bf = useBlackFriday();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Rendered only in the browser. The homepage HTML is cached (~60s), so a
  // copy built before Fri 4pm can be served just after it; deciding the text
  // on the server would then disagree with the browser and break hydration.
  if (now === null) return null;
  const phase: BfPhase = bf.ready ? bf.phase : bfPhase(now, false);
  if (phase === 'ended') return null;

  const live = phase === 'live';
  const earlyLive = live && now !== null && now < BF_PUBLIC_MS;

  const text = live ? (
    <>{earlyLive ? 'early access is live' : 'black friday is live'} · <strong>up to {BF_MAX_PCT}% off</strong> <span aria-hidden>→</span></>
  ) : phase === 'early-waiting' ? (
    <>you&apos;re in · black friday early access opens <strong>thu 4pm pt</strong></>
  ) : (
    <>black friday · <strong>up to {BF_MAX_PCT}% off</strong> · <span className="bfh-long">opens to everyone </span>fri 4pm pt <span aria-hidden>→</span></>
  );

  if (live) {
    return <Link href="/collections" className="bfh-pill" data-live="true"><span className="bfh-dot" aria-hidden />{text}</Link>;
  }
  if (phase === 'early-waiting') {
    return <span className="bfh-pill">{text}</span>;
  }
  return (
    <button
      type="button"
      className="bfh-pill"
      onClick={() => window.dispatchEvent(new Event(OPEN_EARLY_ACCESS_EVENT))}
    >
      {text}
    </button>
  );
}
