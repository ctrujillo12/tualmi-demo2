import Link from 'next/link';

const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';

export default function VotePage() {
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
      backgroundColor: '#FAFAF7',
    }}>
      <main style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: muted,
          marginBottom: '28px',
          fontFamily: sans,
        }}>
          Trailblazing Club
        </p>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.3,
          color: black,
          marginBottom: '24px',
          fontFamily: 'var(--font-cedarville), cursive',
        }}>
          Thank u for voting 
        </h1>

        <p style={{
          fontSize: 'clamp(13px, 2vw, 15px)',
          lineHeight: 1.9,
          color: mid,
          marginBottom: '12px',
          fontFamily: sans,
          fontWeight: 300,
          letterSpacing: '0.015em',
        }}>
          We love hearing from you and read every single response!
        <p style={{
          fontSize: 'clamp(13px, 2vw, 15px)',
          lineHeight: 1.9,
          color: muted,
          marginBottom: '40px',
          fontFamily: sans,
          fontWeight: 300,
          letterSpacing: '0.015em',
          fontStyle: 'italic',
        }}>
          Lauching July 31
        </p>

        <Link
          href="/"
          style={{
            fontFamily: sans,
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: mid,
            textDecoration: 'none',
            borderBottom: `1px solid ${mid}`,
            paddingBottom: '2px',
          }}
        >
          Back to Tualmi
        </Link>
      </main>
    </div>
  );
}
