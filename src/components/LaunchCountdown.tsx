'use client';

import { useEffect, useState } from 'react';
import { PUBLIC_LAUNCH_MS } from '@/lib/useShopAccess';

// Single source of truth for the launch time lives in useShopAccess
const LAUNCH_MS = PUBLIC_LAUNCH_MS;

const sans = 'var(--font-montserrat), system-ui, sans-serif';

function remaining() {
  const diff = LAUNCH_MS - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff / 3_600_000) % 24);
  const m = Math.floor((diff / 60_000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

/**
 * Subtle launch countdown. Renders nothing once the shop is open.
 * `tone` controls text color for light vs. dark backgrounds.
 */
export default function LaunchCountdown({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const [t, setT] = useState<ReturnType<typeof remaining> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(remaining());
    const id = setInterval(() => setT(remaining()), 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted, or once the public launch has passed
  if (!mounted || !t) return null;

  const color = tone === 'light' ? 'rgba(255,255,255,0.92)' : '#A9445C';
  const parts = [
    t.d > 0 ? `${t.d}d` : null,
    `${t.h}h`,
    `${t.m}m`,
    t.d === 0 ? `${t.s}s` : null,
  ].filter(Boolean).join(' ');

  return (
    <p
      style={{
        fontFamily: sans,
        fontSize: 'clamp(11px, 1.3vw, 13px)',
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'lowercase',
        color,
        margin: 0,
        textAlign: 'center',
      }}
    >
      shop opens friday · 11am pt · {parts}
    </p>
  );
}
