import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'our story',
  description:
    'Tualmi makes technical outdoor gear designed for women from the start — flattering fits, playful prints, unexpected color, and real performance. Sustainably and ethically made in a WRAP Gold Standard certified facility.',
  alternates: { canonical: '/story' },
};

// ─── Landing-page design tokens ───────────────────────────────────────────────
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';

const bodyStyle = {
  fontFamily: sans,
  fontWeight: 500,
  fontSize: 'clamp(14px, 1.6vw, 16px)',
  lineHeight: 2,
  color: soft,
  margin: 0,
  textAlign: 'left' as const,
};

export default function StoryPage() {
  return (
    <div style={{ backgroundColor: blushBg, minHeight: '100vh' }}>
      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: 'clamp(96px, 14vw, 160px) clamp(24px, 5vw, 32px) clamp(64px, 10vw, 120px)',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.14em',
            color: soft,
            margin: '0 0 18px',
            textTransform: 'lowercase',
            textAlign: 'center',
          }}
        >
          our story
        </p>

        {/* Heading — centered, lowercase, maroon */}
        <h1
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            color: maroon,
            margin: '0 0 clamp(40px, 6vw, 64px)',
            textTransform: 'lowercase',
            textAlign: 'center',
          }}
        >
          gear for a new kind of outdoorsy.
        </h1>

        {/* Body — left-aligned */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <p style={{ ...bodyStyle, color: maroon, fontWeight: 600 }}>
            Tualmi exists to make the outdoors feel like it belongs to more of us.
          </p>

          <p style={bodyStyle}>
            For too long, outdoors gear has been built around one idea of &ldquo;outdoorsy&rdquo; —
            rugged, serious, and masculine. Women have been left with gear designed for men and
            scaled down, or told that looking cute and being taken seriously outdoors are mutually
            exclusive.
          </p>

          <p style={bodyStyle}>We think women deserve better.</p>

          <p style={bodyStyle}>
            Tualmi makes technical outdoor gear designed for women from the start — with flattering
            fits, playful prints, unexpected color, and the performance to actually take outside.
          </p>

          <p style={bodyStyle}>
            Sustainably and ethically manufactured in a WRAP Gold Standard certified facility.
          </p>

          {/* <p style={bodyStyle}>
            Love, Rachel &amp; Cheyenne🌸
          </p> */}
        </div>
      </main>
    </div>
  );
}
