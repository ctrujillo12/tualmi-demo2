import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'our story',
  description:
    'Two college friends who love the outdoors and their outfits — making hiking apparel from recycled materials in a WRAP-certified facility. First collection available 7/31.',
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
          for girls who love the outdoors <em>and</em> their outfits.
        </h1>

        {/* Body — left-aligned */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <p style={bodyStyle}>
            Rachel was backpacking through Yosemite, surrounded by mountains &amp; doing exactly what she loves, when she
            looked down at her outfit and realized it just didn&apos;t feel like her at all.
          </p>

          <p style={bodyStyle}>
            We&apos;re two girls who clicked immediately over one shared opinion: outdoor gear for women
            is functional but completely forgettable. It works, but it wasn&apos;t made <em>for</em> us.
            Not really. Rachel brings the trail cred and vision. Cheyenne is an engineer obsessed with  
            things made tastefully. Together we&apos;re the perfect team.
          </p>

          <p style={bodyStyle}>
            So we made Tualmi. Because we think the more you feel like yourself outside,
            the more you actually want to be out there.
          </p>

          <p style={bodyStyle}>
            We make everything with a certified sustainable, WRAP-certified manufacturer,
            and designed to last because we&apos;re not interested in adding to the pile.
            We&apos;d rather make a few things you actually reach for
            than ten you forget you own.
          </p>

          <p style={{ ...bodyStyle, color: maroon, fontWeight: 600 }}>
            Our first collection is available 7/31!
          </p>

          <p style={bodyStyle}>
            Love, Rachel & Cheyenne🌸
          </p>
        </div>
      </main>
    </div>
  );
}
