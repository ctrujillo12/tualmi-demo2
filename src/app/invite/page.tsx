'use client';


import TrailblazerSignup from '@/components/TrailblazerSignup';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';

export default function InvitePage() {
  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 32px)',
    }}>
      <main style={{
        maxWidth: '640px',
        width: '100%',
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
          Join the Trailblazing Club
        </p>

        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 48px)',
          fontWeight: 400,
          lineHeight: 1.3,
          color: black,
          marginBottom: '20px',
          fontFamily: 'var(--font-cedarville), cursive',
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
          Be part of our early community — new drops, trail guides, and a vote on what we make next. (plus special perks!!)
        </p>


        <TrailblazerSignup />
      </main>
    </div>
  );
}