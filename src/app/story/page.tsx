import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'our story',
  description:
    'Tualmi makes technical outdoor gear designed for women from the start — flattering fits, playful prints, and real performance. Made with a WRAP Gold Standard certified manufacturer.',
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
          {/* The mission line carries the most weight, so it gets the maroon
              emphasis the launch-date line used to have. */}
          <p style={{ ...bodyStyle, color: maroon, fontWeight: 600 }}>
            Tualmi exists to make the outdoors feel like it belongs to more of us.
          </p>

          <p style={bodyStyle}>
            Our founder, Rachel, was backpacking through Yosemite when she asked herself: why is so
            much women&apos;s outdoor gear still boxy, muted, and designed around the same very
            specific idea of what an &ldquo;outdoorsy person&rdquo; should look like?
          </p>

          <p style={bodyStyle}>
            She came home with an idea: gear that felt more like the women actually wearing it.
            Together with her co-founder Cheyenne, she built Tualmi — outdoors gear that wasn&apos;t
            just men&apos;s gear resized.
          </p>

          <p style={bodyStyle}>
            Tualmi makes technical outdoor gear designed for women from the start — with flattering
            fits, playful prints, and the performance to actually take outside.
          </p>

          <p style={{ ...bodyStyle, color: maroon, fontWeight: 600 }}>
            You don&apos;t have to look, dress, or act a certain way to belong outside.
          </p>

          <p style={bodyStyle}>
            We make everything with a WRAP Gold Standard certified manufacturer, sustainably,
            ethically, and designed to last because we&apos;re not interested in adding to the pile.
            We&apos;d rather make a few things you actually reach for than ten you forget you own.
          </p>

          <p style={bodyStyle}>
            Love, Rachel &amp; Cheyenne🌸
          </p>
        </div>
      </main>
    </div>
  );
}
