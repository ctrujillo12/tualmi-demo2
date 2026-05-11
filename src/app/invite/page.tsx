'use client';

import HeaderStaticBlack from '@/components/HeaderStaticBlack';
import TrailblazerSignup from '@/components/TrailblazerSignup';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';

export default function InvitePage() {
  return (
    <>
      <HeaderStaticBlack />

      <main style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: 'clamp(64px, 10vw, 120px) clamp(20px, 5vw, 32px)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: muted,
          marginBottom: '28px',
          fontFamily: sans,
        }}>
          Trailblazer's Club
        </p>

        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.15,
          color: black,
          marginBottom: '20px',
          fontFamily: serif,
        }}>
          You found us <em>before everyone else.</em>
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 2vw, 14px)',
          lineHeight: 1.9,
          color: mid,
          marginBottom: '12px',
          fontFamily: sans,
          fontWeight: 300,
          letterSpacing: '0.015em',
        }}>
          Be the first to join the club. Special perks and early access to limited drops.
        </p>

        <p style={{
          fontSize: 'clamp(13px, 2vw, 14px)',
          lineHeight: 1.9,
          color: mid,
          marginBottom: '48px',
          fontFamily: sans,
          fontWeight: 300,
          letterSpacing: '0.015em',
        }}>
          No noise. Just your spot.
        </p>

        <TrailblazerSignup />
      </main>
    </>
  );
}