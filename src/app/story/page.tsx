

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', 'DM Sans', system-ui, sans-serif";

const bg    = '#FAFAF7';
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';

export default function StoryPage() {
  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>


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
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, color: black, marginBottom: 'clamp(40px, 6vw, 64px)', fontFamily: 'var(--font-cedarville), cursive', lineHeight: 1.3 }}>
          For girls who love the outdoors <em>AND</em> their outfits.
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Rachel was backpacking through Yosemite, surrounded by mountains & doing exactly what she loves, when she
            looked down at her outfit and realized it just didn't feel like her at all.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            We're two college girls who clicked immediately over one shared opinion: outdoor gear for women
            is functional but completely forgettable. Like, it works, but it wasn't made <em>for</em> us.
            Not really. Rachel brings the trail cred and vision. Cheyenne is obsessed with how things are made
            and has strong opinions about every product she's ever owned. Together we're the perfect team.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            So we made Tualmi. Because we think the more you feel like yourself outside,
            the more you actually want to be out there. 
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            We make everything from 100% recycled materials using a WRAP-certified manufacturing process, 
            and designed to last because we're not interested in adding to the pile. 
            We'd rather make a few things you actually reach for
            than ten you forget you own.
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: muted, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em', fontStyle: 'italic' }}>
           Our first collection ships July 2026!
          </p>

          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Love, Rachel &amp; Cheyenne🌸
          </p>
        </div>
      </main>
    </div>
  );
}