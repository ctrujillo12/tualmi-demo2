'use client';

import { useState, useEffect } from 'react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// 7:00 PM Pacific Time on April 28, 2026
const LAUNCH_TIME = new Date('2026-04-28T19:00:00-07:30').getTime();

const serif = "'Cormorant Garamond', Georgia, serif";
const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";

const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';
const rule  = '#DDD5C8';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface LaunchGateProps {
  /** The CTA rendered when the shop is open */
  openContent: React.ReactNode;
  /** Optional override — shown instead of countdown while locked */
  lockedContent?: React.ReactNode;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTimeLeft(now: number) {
  const diff = Math.max(0, LAUNCH_TIME - now);
  const h = Math.floor(diff / 1000 / 60 / 60);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { h, m, s, done: diff === 0 };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// ─── COUNTDOWN DISPLAY ────────────────────────────────────────────────────────
function Countdown() {
  // null on server — populated only after mount to avoid hydration mismatch
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTime(getTimeLeft(Date.now()));
    const id = setInterval(() => {
      setTime(getTimeLeft(Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Render a stable placeholder until client kicks in
  const { h, m, s } = time ?? { h: 0, m: 0, s: 0 };
  const ready = time !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* Digit blocks — invisible until client hydrates to avoid mismatch */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', opacity: ready ? 1 : 0, transition: 'opacity 0.2s ease' }}>
        {h > 0 && (
          <>
            <DigitBlock label="hr"  value={pad(h)} />
            <Colon />
          </>
        )}
        <DigitBlock label="min" value={pad(m)} />
        <Colon />
        <DigitBlock label="sec" value={pad(s)} />
      </div>

      {/* Locked CTA */}
      <div
        style={{
          display: 'block',
          textAlign: 'center',
          border: `1px solid ${rule}`,
          padding: '14px 40px',
          fontSize: '10px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: muted,
          fontFamily: sans,
          cursor: 'not-allowed',
          userSelect: 'none',
        }}
      >
        Opening at 7 PM PT
      </div>

      <p style={{ fontSize: '11px', color: muted, fontFamily: sans, letterSpacing: '0.05em' }}>
        Stay on this page — the shop opens automatically.
      </p>
    </div>
  );
}

function DigitBlock({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <span
        style={{
          fontFamily: serif,
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 400,
          color: black,
          lineHeight: 1,
          minWidth: '2.2ch',
          textAlign: 'center',
          // subtle fade-in on each tick via CSS animation defined below
          display: 'inline-block',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: '9px',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: muted,
          fontFamily: sans,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <span
      style={{
        fontFamily: serif,
        fontSize: 'clamp(28px, 5vw, 44px)',
        color: rule,
        lineHeight: 1,
        paddingBottom: '18px', // align with digits above label
        userSelect: 'none',
      }}
    >
      :
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * LaunchGate — renders children when the shop is open, countdown when locked.
 *
 * Kill switch: set NEXT_PUBLIC_SHOP_OPEN=false in Netlify env vars to re-lock
 * regardless of the clock. Set to "true" to force-open before launch time
 * (useful for testing).
 */
export default function LaunchGate({ openContent, lockedContent }: LaunchGateProps) {
  const envFlag = process.env.NEXT_PUBLIC_SHOP_OPEN; // "true" | "false" | undefined

  // Force-closed via env (kill switch)
  const forceClosed = envFlag === 'false';
  // Force-open via env (for testing or manual early open)
  const forceOpen   = envFlag === 'true';

  const [isOpen, setIsOpen] = useState(() => {
    if (forceClosed) return false;
    if (forceOpen)   return true;
    return Date.now() >= LAUNCH_TIME;
  });

  useEffect(() => {
    if (forceClosed || forceOpen || isOpen) return;

    const ms = LAUNCH_TIME - Date.now();
    if (ms <= 0) { setIsOpen(true); return; }

    const t = setTimeout(() => setIsOpen(true), ms);
    return () => clearTimeout(t);
  }, [forceClosed, forceOpen, isOpen]);

  if (isOpen) {
    return <>{openContent}</>;
  }

  return lockedContent ? <>{lockedContent}</> : <Countdown />;
}