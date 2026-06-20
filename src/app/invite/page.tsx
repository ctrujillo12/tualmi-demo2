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
      marginTop: '64px',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 32px)',
      boxSizing: 'border-box',
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
          marginBottom: '16px',
          fontFamily: sans,
          fontWeight: 300,
          letterSpacing: '0.015em',
        }}>
          Help us build the Tualmi community from the ground up 💗
        </p>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 28px',
          display: 'inline-flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left',
        }}>
          {[
            '24-hour early access to our launch before anyone else 🤫',
            'A vote on what we make for our next collection !!',
          ].map((item) => (
            <li key={item} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontFamily: sans,
              fontSize: 'clamp(13px, 2vw, 14px)',
              fontWeight: 300,
              color: mid,
              lineHeight: 1.7,
              letterSpacing: '0.015em',
            }}>
              <span style={{ color: mid, fontSize: '16px', lineHeight: 1.4, flexShrink: 0 }}>✦</span>
              {item}
            </li>
          ))}
        </ul>


        <TrailblazerSignup />
      </main>
    </div>
  );
}