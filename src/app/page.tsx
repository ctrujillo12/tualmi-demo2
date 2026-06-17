import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import HikerOverlay from '@/components/HikerOverlay';
import WelcomePopup from '@/components/WelcomePopup';
import type { Product } from '@/types';
import { PRODUCT_COLORS } from '@/lib/productColors';

const sans   = 'var(--font-montserrat)';

const PRODUCT_ORDER = ['trailblazing-fleece', 'summit-pant', 'horizon-shorts', 'alpine-baby-tee', 'trailblazing-tote'];

export default async function Home() {
  const products = await getProducts();
  const heroImage = '/images-2/hero_anna.JPG';

  const collectionProducts = PRODUCT_ORDER
    .map((h) => products.find((p) => p.handle === h))
    .filter((p): p is Product => !!p);

  // Expand each product into one card per colorway
  type ColorwayCard = { product: Product; colorLabel: string };
  const colorwayCards: ColorwayCard[] = collectionProducts.flatMap((product) => {
    const colors = PRODUCT_COLORS[product.handle ?? ''] ?? [];
    if (colors.length === 0) return [{ product, colorLabel: '' }];
    const imgsPerColor = Math.max(1, Math.floor(product.images.length / colors.length));
    return colors.map((color, idx) => {
      const start = idx * imgsPerColor;
      const end = idx === colors.length - 1 ? product.images.length : start + imgsPerColor;
      const sliced = product.images.slice(start, end);
      return {
        product: { ...product, images: sliced.length > 0 ? sliced : [product.images[0]] },
        colorLabel: color.name,
      };
    });
  });

  const marqueeText = 'Free Tote with $150 Purchase • Fleece, Pants & Shorts Ship Late July 2026 • Baby Tee Ships August 2026 • Limited Quantities • ';

  const tiktokVideos = [
    { id: '7625759601576660238' },
    { id: '7611273720295984398' },
    { id: '7638058106563349774' },
    { id: '7651370811806272782' },
  ].map((v) => ({ ...v, url: `https://www.tiktok.com/@tualmi.outdoors/video/${v.id}` }));

  const tiktokThumbnails = await Promise.all(
    tiktokVideos.map(async ({ url }) => {
      try {
        const res = await fetch(`https://www.tiktok.com/oembed?url=${url}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
          next: { revalidate: 86400 },
        });
        if (res.ok) {
          const data = await res.json();
          return (data.thumbnail_url as string) ?? '';
        }
      } catch {}
      return '';
    })
  );

  return (
    <div style={{ backgroundColor: '#FAFAF7' }}>

      {/* WELCOME POPUP */}
      <WelcomePopup />

      {/* HIKER OVERLAY */}
      <HikerOverlay />

      {/* FIXED HERO BACKGROUND */}
      <div className="hero-bg" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Image
          src={heroImage}
          alt="Tualmi"
          fill
          priority
          quality={90}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,5,0.38)' }} />
      </div>

      {/* HERO VIEWPORT */}
      <section className="hero-section" style={{
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
          <div className="hero-inner-wrap" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)' }}>
              <Image
                src="/images-2/logo2-brown.png"
                alt="Tualmi"
                width={80}
                height={80}
                className="hero-logo"
                style={{
                  objectFit: 'contain',
                  height: 'clamp(32px, 5.6vw, 67px)',
                  width: 'auto',
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <h1 className="hero-title" style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(38px, 6.4vw, 80px)',
                fontWeight: 400,
                color: 'white',
                margin: 0,
                lineHeight: 1,
                textShadow: '0 2px 48px rgba(0,0,0,0.15)',
              }}>
                Tualmi
              </h1>
            </div>
            <a
              href="#collection"
              className="hero-cta"
              style={{
                display: 'block',
                position: 'relative',
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images-2/hero-button.png?v=2"
                alt=""
                style={{ display: 'block', height: 'clamp(26px, 3.2vw, 35px)', width: '100%', objectFit: 'fill' }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: sans,
                fontSize: '8px',
                fontWeight: 600,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'white',
                textShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}>
                Pre-order Now
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* SCROLLABLE CONTENT */}
      <div style={{ position: 'relative', zIndex: 2 }}>

        {/* ABOUT */}
        <section style={{
          backgroundColor: '#dad082',
          padding: 'clamp(48px, 7vw, 80px) clamp(24px, 6vw, 80px)',
          borderBottom: '1px solid #E8E2D8',
        }}>
          <h2 style={{ fontFamily: 'var(--font-cedarville), "Cedarville Cursive", cursive', fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.2, color: '#3B2F1E', marginBottom: '20px', marginTop: 0 }}>
            Actually cute outdoors gear.
          </h2>
          <p style={{ fontFamily: sans, fontSize: 'clamp(13px, 1.5vw, 15px)', lineHeight: 1.9, color: '#6B5C4C', fontWeight: 300, maxWidth: '680px', margin: 0 }}>
            We made the clothes we wish existed. Patagonia is built for performance. Lululemon is built for workouts. Tualmi is built for girls who want both fashion-forward silhouettes and trail-ready performance, designed by women who actually hike. And every piece is produced from 100% recycled materials by a WRAP-certified manufacturer. 
          </p>
          <p style={{ fontFamily: sans, fontSize: 'clamp(10px, 1.2vw, 12px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A89880', marginTop: '16px', marginBottom: '28px' }}>
            We ship July 2026!
          </p>
          <a
            href="https://tualmi.com/invite"
            style={{ display: 'inline-block', position: 'relative', textDecoration: 'none', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 240 52" width="210" height="45" style={{ display: 'block' }}>
              <path
                d="M 230,26 L 220,30 L 215,37 L 193,37 L 175,45 L 147,41 L 120,48 L 93,41 L 65,45 L 47,37 L 25,37 L 20,30 L 10,26 L 20,22 L 25,15 L 47,15 L 65,7 L 93,11 L 120,4 L 147,11 L 175,7 L 193,15 L 215,15 L 220,22 Z"
                fill="transparent"
                stroke="#C94468"
                strokeWidth="1.5"
              />
            </svg>
            <span style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#C94468',
              fontFamily: sans,
              fontSize: '8.5px',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              Join the Trailblazing Club
            </span>
          </a>
        </section>

        {/* MARQUEE BANNER */}
        <div style={{ backgroundColor: '#C94468', overflow: 'hidden', padding: '9px 0' }}>
          <div className="marquee-track">
            <span style={{ fontFamily: sans, fontSize: '9px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'white', whiteSpace: 'nowrap' }}>
              {marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}{marqueeText}
            </span>
          </div>
        </div>

        {/* COLLECTION */}
        <section id="collection" style={{
          padding: 'clamp(48px, 7vw, 80px) clamp(20px, 3vw, 40px)',
          backgroundImage: 'url(/images-2/yellow-pattern.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{ maxWidth: '1060px', margin: '0 auto' }}>
            <div className="product-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'clamp(12px, 2.5vw, 28px)',
            }}>
              {colorwayCards.map(({ product, colorLabel }) => (
                <div key={`${product.id}-${colorLabel}`} style={{
                  backgroundColor: '#FAFAF7',
                  border: '3.5px solid #B84A5E',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  <ProductCard
                    product={product}
                    showPrice={true}
                    imageAspectRatio="2/3"
                    imageFit="contain"
                    hideSwatches
                    colorLabel={colorLabel}
                    colorQuery={colorLabel}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL */}
        <section style={{
          backgroundColor: '#C94468',
          padding: 'clamp(56px, 8vw, 96px) clamp(24px, 5vw, 60px)',
        }}>
          <div style={{ marginBottom: 'clamp(32px, 5vw, 52px)' }}>
            <p style={{
              fontFamily: sans,
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 6px',
            }}>
              get to know
            </p>
            <h2 style={{
              fontFamily: "var(--font-cedarville), 'Cedarville Cursive', cursive",
              fontSize: 'clamp(32px, 5vw, 58px)',
              fontWeight: 400,
              color: 'white',
              margin: 0,
              lineHeight: 1.1,
            }}>
              @tualmioutdoors
            </h2>
          </div>

          <div className="social-reel-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(10px, 2vw, 16px)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}>
            {tiktokVideos.map(({ id, url }, i) => (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="reel-card"
                style={{
                  aspectRatio: '9/16',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'block',
                  position: 'relative',
                  backgroundImage: tiktokThumbnails[i] ? `url(${tiktokThumbnails[i]})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.18)',
                }}>
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="22" r="21" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.3)"/>
                    <polygon points="18,14 34,22 18,30" fill="white"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>

          <div style={{
            marginTop: 'clamp(28px, 4vw, 44px)',
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <a
              href="https://www.instagram.com/tualmioutdoors"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: sans,
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'white',
                textDecoration: 'none',
                padding: '11px 28px',
                border: '1.5px solid rgba(255,255,255,0.6)',
                borderRadius: '100px',
              }}
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@tualmi.outdoors"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: sans,
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'white',
                textDecoration: 'none',
                padding: '11px 28px',
                border: '1.5px solid rgba(255,255,255,0.6)',
                borderRadius: '100px',
              }}
            >
              TikTok
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
