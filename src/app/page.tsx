import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import TrailblazerSignup from '@/components/TrailblazerSignup';
import type { Product } from '@/types';

const serif  = 'var(--font-playfair)';
const script = 'var(--font-script)';
const sans   = 'var(--font-montserrat)';

const PRODUCT_ORDER = ['trailblazing-fleece', 'summit-pant', 'horizon-shorts', 'alpine-baby-tee'];

export default async function Home() {
  const products = await getProducts();
  const tote = products.find((p) => p.handle === 'trailblazing-tote');
  const heroImage = '/images-2/hero_anna.JPG';

  const collectionProducts = PRODUCT_ORDER
    .map((h) => products.find((p) => p.handle === h))
    .filter((p): p is Product => !!p);

  const marqueeText = 'Pre-order now !! • Ships July 2026 • Limited Quantities • ';

  return (
    <div style={{ backgroundColor: '#FAFAF7' }}>

      {/* ── FIXED HERO BACKGROUND ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Image
          src={heroImage}
          alt="Tualmi"
          fill
          priority
          quality={90}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,5,0.30)' }} />
      </div>

      {/* ── HERO VIEWPORT ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 clamp(16px, 4vw, 40px)',
      }}>
        <div className="hero-text-block" style={{
          width: '50%',
          paddingRight: 'clamp(40px, 7vw, 100px)',
          paddingLeft: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)' }}>
            <Image
              src="/images-2/logo2-brown.png"
              alt="Tualmi"
              width={80}
              height={80}
              style={{
                objectFit: 'contain',
                height: 'clamp(40px, 7vw, 84px)',
                width: 'auto',
                filter: 'brightness(0) invert(1)',
              }}
            />
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(48px, 8vw, 100px)',
              fontWeight: 400,
              color: 'white',
              margin: 0,
              lineHeight: 1,
              textShadow: '0 2px 48px rgba(0,0,0,0.22)',
            }}>
              Tualmi
            </h1>
          </div>
          <p style={{
            fontFamily: 'var(--font-cedarville), "Cedarville Cursive", cursive',
            fontSize: 'clamp(13px, 3.5vw, 40px)',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.92)',
            margin: 0,
            whiteSpace: 'nowrap',
          }}>
            Actually cute outdoors gear.
          </p>
          <a
            href="#collection"
            style={{
              marginTop: '6px',
              display: 'inline-block',
              padding: '13px 36px',
              backgroundColor: 'white',
              color: '#3B2F1E',
              fontFamily: sans,
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            Pre-order Now
          </a>
        </div>
      </section>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ── ABOUT ── */}
        <section style={{
          backgroundColor: '#FAFAF7',
          padding: 'clamp(48px, 7vw, 80px) clamp(24px, 6vw, 80px)',
          borderBottom: '1px solid #E8E2D8',
        }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#A89080', marginBottom: '20px', marginTop: 0 }}>
              Why we exist
            </p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 400, lineHeight: 1.15, color: '#3B2F1E', marginBottom: '20px', marginTop: 0 }}>
              Cute enough for brunch & <br />functional enough for the summit.
            </h2>
            <p style={{ fontFamily: sans, fontSize: 'clamp(13px, 1.5vw, 15px)', lineHeight: 1.9, color: '#6B5C4C', fontWeight: 300, maxWidth: '540px', margin: 0 }}>
              We made the clothes we wish existed. Patagonia is built for performance. Lululemon is built for workouts. Tualmi is built for girls who want both fashion-forward silhouettes and trail-ready performance, designed by women who actually hike.
            </p>
          </div>
        </section>

        {/* ── MARQUEE BANNER ── */}
        <div style={{ backgroundColor: '#C94468', overflow: 'hidden', padding: '9px 0' }}>
          <div className="marquee-track">
            <span style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'white', whiteSpace: 'nowrap' }}>
              {marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}
            </span>
          </div>
        </div>

        {/* ── COLLECTION ── */}
        <section id="collection" style={{
          padding: 'clamp(48px, 7vw, 80px) clamp(20px, 3vw, 40px)',
          backgroundColor: '#7a8c3f',
          backgroundImage: 'radial-gradient(circle, #f2d4cc 14%, transparent 14%), radial-gradient(circle, #f2d4cc 14%, transparent 14%)',
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0, 40px 40px',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              {/* 4 cards in one row */}
            <div className="product-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 280px))',
              gap: 'clamp(10px, 2vw, 20px)',
              justifyContent: 'center',
            }}>
              {collectionProducts.map((product) => (
                <div key={product.id} style={{
                  backgroundColor: '#FAFAF7',
                  border: '3.5px solid #B84A5E',
                  padding: '16px 16px 20px',
                }}>
                  <ProductCard product={product} showPrice={true} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SIGNUP ── */}
        <section style={{
          backgroundColor: '#FAFAF7',
          padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 48px)',
          borderTop: '1px solid #E8E2D8',
        }}>
          <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'left' }}>
            <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#A89080', marginBottom: '20px', marginTop: 0 }}>
              {"Trailblazing Club"}
            </p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 400, color: '#3B2F1E', marginBottom: '16px', marginTop: 0, lineHeight: 1.2 }}>
              Join our early community!
            </h2>
            <p style={{ fontFamily: sans, fontSize: 'clamp(13px, 1.5vw, 14px)', lineHeight: 1.85, color: '#6B5C4C', fontWeight: 300, marginBottom: '40px', marginTop: 0 }}>
              You'll get founding member pricing, first pick of every drop, and we'll ask for your input on what we make next.
            </p>
            <TrailblazerSignup />
          </div>
        </section>

      </div>
    </div>
  );
}
