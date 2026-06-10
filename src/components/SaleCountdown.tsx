'use client';

import { useState, useEffect } from 'react';

const SALE_END = new Date('2026-05-06T00:00:00-07:00').getTime(); // midnight PT May 6

const serif = "'Cormorant Garamond', Georgia, serif";
const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#3B2F1E';
const muted = '#8C7B6B';

function getTimeLeft(now: number) {
  const diff = Math.max(0, SALE_END - now);
  const h = Math.floor(diff / 1000 / 60 / 60);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { h, m, s, done: diff === 0 };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function SaleCountdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTime(getTimeLeft(Date.now()));
    const id = setInterval(() => setTime(getTimeLeft(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time || time.done) return null;

  return (
    <div style={{
      border: '1px solid #C9A96E',
      backgroundColor: '#FBF6EE',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      <p style={{
        fontSize: '10px',
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: muted,
        fontFamily: sans,
        margin: 0,
      }}>
        Trailblazing Club — 50% off ends tonight
      </p>

      <p style={{
        fontFamily: serif,
        fontSize: 'clamp(18px, 3vw, 24px)',
        fontWeight: 400,
        color: black,
        margin: 0,
        letterSpacing: '0.02em',
      }}>
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </p>

      <p style={{
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: muted,
        fontFamily: sans,
        margin: 0,
      }}>
        Use your code at checkout — offer expires at midnight PT
      </p>
    </div>
  );
}