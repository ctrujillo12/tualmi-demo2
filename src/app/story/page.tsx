import HeaderStaticBlack from '@/components/HeaderStaticBlack';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', 'DM Sans', system-ui, sans-serif";

const bg    = '#FAFAF7';
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';

export default function StoryPage() {
  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      <HeaderStaticBlack />

      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: 'clamp(80px, 12vw, 120px) clamp(20px, 5vw, 32px) clamp(64px, 10vw, 96px)',
        }}
      >
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '20px', fontFamily: sans }}>
          Our Story
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: black, marginBottom: 'clamp(40px, 6vw, 64px)', fontFamily: serif, lineHeight: 1.1 }}>
          Built on the trail.<br /><em>Designed for women.</em>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: muted, fontFamily: sans, fontWeight: 300, letterSpacing: '0.02em' }}>
            Created in Los Angeles. Designed for women who move.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Tualmi began on the trail. After years of hiking, backpacking, and spending time outdoors,
            we noticed a pattern: women's outdoor clothing was rarely designed with women in mind.
            Boxy cuts, muted colors, and gear that felt more like a uniform than a choice.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            We believe the outdoors should be a place where women can show up fully as themselves—
            confident, capable, and expressive. Clothing should support the adventure, not limit it.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            That's why we design functional outdoor apparel that feels considered, personal, and quietly confident.
            Pieces that perform on the trail and still reflect the individuality of the women who wear them.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            All of our garments are designed and manufactured in Los Angeles using sustainable materials
            and responsible production practices. We believe local manufacturing and thoughtful sourcing
            are essential to building a better future for both people and the planet.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Tualmi exists to help more women get outside, because when the clothes truly fit,
            the adventure doesn't have to end early.
          </p>
        </div>
      </main>
    </div>
  );
}