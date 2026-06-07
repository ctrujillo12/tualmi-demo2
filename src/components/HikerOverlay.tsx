'use client';

import { useEffect, useState } from 'react';

export default function HikerOverlay() {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [topPx, setTopPx] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const heroH = window.innerHeight;
      const vw = window.innerWidth;
      const isMobile = vw < 768;
      setScrollRatio(Math.min(scrollY / heroH, 1));
      // Hiker height: smaller on mobile so it doesn't crowd the screen
      const hikerH = isMobile
        ? Math.min(Math.max(72, vw * 0.22), 100)   // mobile: ~22vw, 72-100px
        : Math.min(Math.max(110, vw * 0.16), 210);  // desktop: 16vw, 110-210px
      setTopPx(heroH - scrollY - hikerH / 2);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  // Mobile: start closer to left edge, shorter drift so it stays clear of hero text
  const isMobileLayout = typeof window !== 'undefined' && window.innerWidth < 768;
  const startVw = isMobileLayout ? 2 : 8;
  const driftVw = isMobileLayout ? 9 : 14;
  const leftVw  = startVw + scrollRatio * driftVw;

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
        <path
          d="M3 14 C10 12.5, 20 15, 30 13.5 C40 12, 50 14.5, 54 13"
          stroke="#5C4A2A"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M3 26 C8 27.5, 18 24, 29 26.5 C38 28.5, 48 25, 54 26"
          stroke="#5C4A2A"
          strokeWidth="1.7"
          strokeLinecap="round"
          fill="none"
        />
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
          height: 'clamp(72px, 16vw, 210px)',
          width: 'auto',
          display: 'block',
        }}
      />
    </div>
  );
}
