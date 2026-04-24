import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HomeHero from '@/components/HomeHero';
import TrailblazerSignup from '@/components/TrailblazerSignup';
import type { Product } from '@/types';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', 'DM Sans', system-ui, sans-serif";

// Palette — earthy brown
const bg    = '#FAFAF7';
const bgAlt = '#F2EDE4';
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';
const rule  = '#DDD5C8';

export default async function Home() {
  const products = await getProducts();

  const tote = products.find((p) => p.handle === 'trailblazing-tote');
  const previewProducts = products.filter((p) => p.handle !== 'trailblazing-tote');

  return (
    <div style={{ backgroundColor: bg }}>

      {/* ─── HERO ─── */}
      <HomeHero />

      {/* ─── MANIFESTO ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 32px)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '32px', fontFamily: sans }}>
            Why we exist
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 6vw, 58px)', lineHeight: 1.1, fontWeight: 400, color: black, marginBottom: '24px', fontFamily: serif }}>
            The outdoors has always been{' '}
            <em>for women.</em>
            <br />
            The gear just never caught up.
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, marginBottom: '16px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Tualmi was built on the trail. After years of hiking and backpacking in clothes
            designed for men—or designed to blend in—we got tired of waiting for someone else
            to solve it. So we did.
          </p>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, marginBottom: '40px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
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

      {/* ─── FEATURED TOTE ─── */}
      {tote && (
        <section style={{ padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 32px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 72px)', fontFamily: sans }}>
              Available Tuesday, April 28th
            </p>

            {/* Stacks on mobile, side-by-side on desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
              gap: 'clamp(32px, 6vw, 80px)',
              alignItems: 'center',
            }}>
              <div style={{ aspectRatio: '4/5', position: 'relative', overflow: 'hidden', backgroundColor: bgAlt }}>
                <Image src={tote.images[1]} alt={tote.name} fill style={{ objectFit: 'contain' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: muted, marginBottom: '10px', fontFamily: sans }}>
                    {tote.category}
                  </p>
                  <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 400, color: black, marginBottom: '14px', fontFamily: serif }}>
                    {tote.name}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
                    {tote.description}
                  </p>
                </div>
                <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: muted, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
                  Join the Trailblazer's Club below for 20% off when we launch Tuesday.
                </p>
                <p style={{ fontSize: '18px', color: black, fontFamily: serif }}>
                  ${(tote.price / 100).toFixed(2)}
                </p>
                <a
                  href="#trailblazers"
                  style={{
                    display: 'block',
                    textAlign: 'center',
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
                  Get 20% off — join the list
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── PREVIEW COLLECTION ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 32px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 72px)', fontFamily: sans }}>
            Launching Summer 2026 — Preview Drop 1
          </p>

          {/* 1 col mobile → 2 col tablet → 3 col desktop */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 'clamp(24px, 4vw, 32px)',
          }}>
            {previewProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} showPrice={false} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRAILBLAZER'S CLUB ─── */}
      <section id="trailblazers" style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(64px, 10vw, 120px) clamp(20px, 5vw, 32px)', backgroundColor: bgAlt }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '28px', fontFamily: sans }}>
            Trailblazer's Club
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: black, marginBottom: '20px', fontFamily: serif }}>
            You found us{' '}
            <em>before everyone else.</em>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, marginBottom: '12px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            Join the Trailblazer's Club for early access to limited drops, behind-the-scenes
            from production, and perks reserved for the people who showed up first.
          </p>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, marginBottom: '48px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            No noise. Just your spot.
          </p>
          <TrailblazerSignup />
        </div>
      </section>

    </div>
  );
}