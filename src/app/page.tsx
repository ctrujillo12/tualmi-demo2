import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HomeHero from '@/components/HomeHero';
import TrailblazerSignup from '@/components/TrailblazerSignup';
import LaunchGate from '@/components/LaunchGate';
import AddToCartButton from '@/components/AddToCartButton';
import type { Product } from '@/types';
import SaleCountdown from '@/components/SaleCountdown';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Jost', 'DM Sans', system-ui, sans-serif";

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
            Actually cute outdoors gear.
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: 1.85, color: mid, marginBottom: '32px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em', maxWidth: '680px' }}>
            We made the clothes we wish existed when our friends planned a Yosemite trip. Cute enough for brunch, functional enough for the trail.
            Patagonia is built for performance. Lululemon is built for workouts. Tualmi is built for girls who want both — fashion-forward silhouettes and trail-ready performance, designed by women who actually hike in them.
          </p>
          <Link
            href="/story"
            style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: black, borderBottom: `1px solid ${black}`, paddingBottom: '2px', textDecoration: 'none', fontFamily: sans }}
          >
            Read our story →
          </Link>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(36px, 6vw, 64px) clamp(20px, 5vw, 32px)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(24px, 4vw, 48px)',
            textAlign: 'center',
          }}>
            <div>
              <p style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: black, fontFamily: serif, marginBottom: '8px' }}>500+</p>
              <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, fontFamily: sans }}>Women following the journey</p>
            </div>
            <div>
              <p style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: black, fontFamily: serif, marginBottom: '8px' }}>80+</p>
              <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, fontFamily: sans }}>On our mailing list</p>
            </div>
            <div>
              <p style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: black, fontFamily: serif, marginBottom: '8px' }}>July</p>
              <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, fontFamily: sans }}>Official launch — pre-orders open now</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PREVIEW COLLECTION ─── */}
      <section style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 32px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, textAlign: 'center', marginBottom: '12px', fontFamily: sans }}>
            Pre-order now — ships July 2026
          </p>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: mid, textAlign: 'center', fontFamily: sans, fontWeight: 300, marginBottom: 'clamp(40px, 6vw, 72px)', letterSpacing: '0.015em' }}>
            Limited quantities. First access goes to Trailblazers.
          </p>

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

      {/* ─── FEATURED TOTE ─── */}
      {tote && (
        <section style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(36px, 6vw, 72px) clamp(20px, 5vw, 32px)' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 'clamp(24px, 5vw, 60px)',
              alignItems: 'center',
            }}>
              <div style={{ aspectRatio: '3/4', position: 'relative', overflow: 'hidden', backgroundColor: bgAlt, maxWidth: '380px' }}>
                <Image src={tote.images[0]} alt={tote.name} fill style={{ objectFit: 'contain' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: muted, marginBottom: '10px', fontFamily: sans }}>
                    {tote.category}
                  </p>
                  <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 400, color: black, marginBottom: '14px', fontFamily: serif }}>
                    {tote.name}
                  </h2>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
                    {tote.description}
                  </p>
                </div>

                <p style={{ fontSize: '18px', color: black, fontFamily: serif }}>
                  ${(tote.price / 100).toFixed(2)}
                </p>

                <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, fontFamily: sans }}>
                  Ships July 2026
                </p>

                <SaleCountdown />

                <LaunchGate
                  openContent={<AddToCartButton product={tote} />}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TRAILBLAZER'S CLUB ─── */}
      <section id="trailblazers" style={{ borderTop: `1px solid ${rule}`, padding: 'clamp(64px, 10vw, 120px) clamp(20px, 5vw, 32px)', backgroundColor: bgAlt }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '28px', fontFamily: sans }}>
            Trailblazer's Club
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: black, marginBottom: '20px', fontFamily: serif }}>
            Get first access{' '}
            <em>before we open.</em>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, marginBottom: '12px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            We&apos;re launching in late July with limited quantities — and Trailblazers get first pick. Join before we open and you&apos;ll be first through the door: exclusive launch discounts, early access to limited drops, and a chance to become a Tuomi ambassador.
          </p>
          <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.9, color: mid, marginBottom: '48px', fontFamily: sans, fontWeight: 300, letterSpacing: '0.015em' }}>
            500+ women are already following the journey. Grab your spot.
          </p>
          <TrailblazerSignup />
        </div>
      </section>

    </div>
  );
}
