import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HomeHero from '@/components/HomeHero';
import TrailblazerSignup from '@/components/TrailblazerSignup';
import type { Product } from '@/types';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', 'DM Sans', system-ui, sans-serif";

// Palette
const bg    = '#FAFAF8';   // near-white with a breath of warmth
const bgAlt = '#F2F0EB';   // soft oat — section contrast without going brown
const black = '#111110';   // off-black, not harsh
const mid   = '#6B6B67';   // medium gray for body text
const muted = '#A8A8A3';   // muted labels / tags
const rule  = '#E2E0DA';   // hairline dividers

export default async function Home() {
  const products = await getProducts();

  const tote = products.find((p) => p.handle === 'trailblazing-tote');
  const previewProducts = products.filter((p) => p.handle !== 'trailblazing-tote');

  return (
    <div style={{ backgroundColor: bg }}>

      {/* ─── HERO ─── */}
      <HomeHero />

      {/* ─── MANIFESTO ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: '96px 32px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '40px', fontFamily: sans }}>
            Why we exist
          </p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 58px)', lineHeight: 1.1, fontWeight: 400, color: black, marginBottom: '32px', fontFamily: serif }}>
            The outdoors has always been{' '}
            <em>for women.</em>
            <br />
            The gear just never caught up.
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: mid, maxWidth: '680px', marginBottom: '16px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Tualmi was built on the trail. After years of hiking and backpacking in clothes
            designed for men—or designed to blend in—we got tired of waiting for someone else
            to solve it. So we did.
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: mid, maxWidth: '680px', marginBottom: '48px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            We make functional outdoor apparel for women who want to show up fully as themselves—
            on the mountain, in the canyon, at the trailhead, and everywhere in between. Every piece
            is designed by women, ethically and intentionally manufactured, and made from materials
            we'd stake our names on.
          </p>
          <Link
            href="/story"
            style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: black, borderBottom: `1px solid ${black}`, paddingBottom: '2px', textDecoration: 'none', fontFamily: sans }}
          >
            Read our story →
          </Link>
        </div>
      </section>

      {/* ─── THREE PILLARS ─── */}
      <section id="our-story" style={{ borderTop: `1px solid ${rule}`, borderBottom: `1px solid ${rule}`, padding: '96px 32px', backgroundColor: bgAlt }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '80px', textAlign: 'center', fontFamily: sans }}>
            What makes us different
          </p>

          {([
            {
              n: '01',
              title: <><em>Sustainable</em> materials.<br />Not greenwashing.</>,
              body: `We use recycled and low-impact fabrics because it's the right thing to do, not because it makes good copy. Every material is chosen for its environmental footprint first—then its performance. We'll tell you exactly what's in your clothes and why.`,
              tags: 'Recycled nylon · Deadstock fabrics · Low-impact dyes',
            },
            {
              n: '02',
              title: <>Made with intention.<br /><em>Transparently.</em></>,
              body: `Most outdoor brands won't tell you where their clothes are made or why. We will. Our collection is manufactured at Springtex, a facility we chose for its labor standards and quality control—not just its price point. Ethical manufacturing isn't about geography. It's about accountability.`,
              tags: 'Vetted manufacturing · Fair labor standards · Full transparency',
            },
            {
              n: '03',
              title: <>By women.<br /><em>For women.</em></>,
              body: `We're a women-founded company making gear for women—which sounds obvious but is still genuinely rare in the outdoor industry. Every fit, every pocket placement, every design decision comes from someone who's actually worn it on a real trail. We design for function that doesn't ask you to compromise on how you look.`,
              tags: 'Women-founded · Fit-tested by women · Designed for real bodies',
            },
          ] as const).map((pillar, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(160px, 1fr) 2fr',
                gap: '56px',
                alignItems: 'start',
                borderTop: i > 0 ? `1px solid ${rule}` : 'none',
                paddingTop: i > 0 ? '72px' : '0',
                marginTop: i > 0 ? '72px' : '0',
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '88px', lineHeight: 1, fontFamily: serif, color: rule, marginBottom: '12px', userSelect: 'none' }}>
                  {pillar.n}
                </span>
                <h3 style={{ fontSize: '22px', fontWeight: 400, color: black, lineHeight: 1.35, fontFamily: serif }}>
                  {pillar.title}
                </h3>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <p style={{ fontSize: '14px', lineHeight: 1.9, color: mid, marginBottom: '24px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
                  {pillar.body}
                </p>
                <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: muted, fontFamily: sans }}>
                  {pillar.tags}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED TOTE ─── */}
      {tote && (
        <section style={{ padding: '96px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, textAlign: 'center', marginBottom: '72px', fontFamily: sans }}>
              Available for preorder
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
              <div style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden', backgroundColor: bgAlt }}>
                <Image src={tote.images[1]} alt={tote.name} fill style={{ objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <p style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: muted, marginBottom: '12px', fontFamily: sans }}>
                    {tote.category}
                  </p>
                  <h2 style={{ fontSize: '32px', fontWeight: 400, color: black, marginBottom: '16px', fontFamily: serif }}>
                    {tote.name}
                  </h2>
                  <p style={{ fontSize: '14px', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
                    {tote.description}
                  </p>
                </div>
                <p style={{ fontSize: '18px', color: black, fontFamily: serif }}>
                  ${(tote.price / 100).toFixed(2)}
                </p>
                <Link
                  href={`/products/${tote.handle ?? tote.id}`}
                  style={{
                    display: 'inline-block',
                    width: 'fit-content',
                    border: `1px solid ${black}`,
                    padding: '14px 40px',
                    fontSize: '10px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: black,
                    textDecoration: 'none',
                    fontFamily: sans,
                  }}
                >
                  Preorder Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── PREVIEW COLLECTION ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: '96px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, textAlign: 'center', marginBottom: '72px', fontFamily: sans }}>
            Launching Spring 2026 — Preview Drop 1
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {previewProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRAILBLAZER'S CLUB ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: '120px 32px', backgroundColor: bgAlt }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '32px', fontFamily: sans }}>
            Trailblazer's Club
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: black, marginBottom: '24px', fontFamily: serif }}>
            You found us{' '}
            <em>before everyone else.</em>
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: mid, marginBottom: '12px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Join the Trailblazer's Club for early access to limited drops, behind-the-scenes
            from production, and perks reserved for the people who showed up first.
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.9, color: mid, marginBottom: '56px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            No noise. Just your spot.
          </p>
          <TrailblazerSignup />
        </div>
      </section>

    </div>
  );
}