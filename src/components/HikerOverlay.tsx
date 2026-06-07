'use client';

import { useEffect, useRef, useState } from 'react';

export default function HikerOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      const el = containerRef.current;
      if (!el) return;

      const scrollY = window.scrollY;
      const vw      = window.innerWidth;
      const vh      = window.innerHeight;
      const isMobile = vw < 768;

      // Hero height matches the CSS: 65vh on mobile, 100vh on desktop
      const heroH = isMobile ? vh * 0.65 : vh;

      // Scroll ratio 0→1 over one hero height
      const ratio = Math.min(scrollY / heroH, 1);

      // Hiker rendered height (must match the CSS clamp on the <img>)
      const hikerH = isMobile
        ? Math.min(Math.max(72, vw * 0.22), 100)   // ~22vw, 72–100px
        : Math.min(Math.max(110, vw * 0.16), 210);  // ~16vw, 110–210px

      // Vertical: keep hiker centre exactly on the hero/content border in viewport space
      const topPx = heroH - scrollY - hikerH / 2;

      // Horizontal drift
      const startVw = isMobile ? 2 : 8;
      const driftVw = isMobile ? 9 : 14;
      const leftVw  = startVw + ratio * driftVw;

      // Write directly to DOM — no React re-render, no jank
      el.style.top  = `${topPx}px`;
      el.style.left = `${leftVw}vw`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Don't render on server — avoids SSR/hydration mismatch
  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="hiker-overlay"
      style={{
        position: 'fixed',
        top: '0px',
        left: '8vw',
        zIndex: 20,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        // top tracks scroll instantly (scroll-locked); left eases for the drift effect
        transition: 'left 0.08s linear',
      }}
    >
      {/* Hand-drawn motion lines */}
      <svg
        width="56"
        height="52"
        viewBox="0 0 56 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: 0, opacity: 0.65, flexShrink: 0 }}
      >
        <path d="M3 14 C10 12.5, 20 15, 30 13.5 C40 12, 50 14.5, 54 13" stroke="#5C4A2A" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        <path d="M3 26 C8 27.5, 18 24, 29 26.5 C38 28.5, 48 25, 54 26" stroke="#5C4A2A" strokeWidth="1.7" strokeLinecap="round" fill="none" />
        <path d="M3 38 C12 36.5, 24 40, 35 37.5 C43 35.5, 50 38, 54 37" stroke="#5C4A2A" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      </svg>

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
