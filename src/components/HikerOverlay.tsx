'use client';

import { useEffect, useState } from 'react';

export default function HikerOverlay() {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [topPx, setTopPx] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const heroH = window.innerHeight;
      // Ratio drives horizontal drift (0 → 1 over one hero height of scroll)
      setScrollRatio(Math.min(scrollY / heroH, 1));
      // Keep the SVG centre locked to the hero/about border in viewport space.
      // Border is at heroH from page top → heroH - scrollY from viewport top.
      // SVG is 52px tall; centre is 26px from top → shift up by 26px.
      // Hiker height matches CSS clamp(110px, 16vw, 210px)
      const hikerH = Math.min(Math.max(110, window.innerWidth * 0.16), 210);
      // Set container top so the hiker's vertical centre is exactly on the border
      setTopPx(heroH - scrollY - hikerH / 2);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Hiker drifts from 8vw → 22vw as user scrolls through the hero
  const leftVw = 8 + scrollRatio * 14;

  // Hide until mounted so there's no SSR mismatch
  if (topPx === null) return null;

  return (
    <div
      className="hiker-overlay"
      style={{
        position: 'fixed',
        top: `${topPx}px`,
        left: `${leftVw}vw`,
        zIndex: 20,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        transition: 'left 0.08s linear',
      }}
    >
      {/* Hand-drawn motion lines — to the left of the hiker */}
      <svg
        width="56"
        height="52"
        viewBox="0 0 56 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: 0, opacity: 0.65, flexShrink: 0 }}
      >
        {/* Line 1 — slight upward wobble */}
        <path
          d="M3 14 C10 12.5, 20 15, 30 13.5 C40 12, 50 14.5, 54 13"
          stroke="#5C4A2A"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Line 2 — slight downward wobble */}
        <path
          d="M3 26 C8 27.5, 18 24, 29 26.5 C38 28.5, 48 25, 54 26"
          stroke="#5C4A2A"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Line 3 — shorter, tailing off on the right */}
        <path
          d="M3 38 C12 36.5, 24 40, 35 37.5 C43 35.5, 50 38, 54 37"
          stroke="#5C4A2A"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Hiker image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images-2/hiker.png"
        alt=""
        style={{
          height: 'clamp(110px, 16vw, 210px)',
          width: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}
