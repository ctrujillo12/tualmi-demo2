'use client';

import Link from 'next/link';
import { useState } from 'react';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const serif  = "'Cormorant Garamond', Georgia, serif";
const maroon = '#A9445C';
const blushBg = '#FBF1F5';
const soft   = '#C9849A'; // lighter maroon for body text

const LINK_COL_1 = [
  { name: 'shipping',     href: '/footer-pages/shipping' },
  { name: 'returns',      href: '/footer-pages/returns' },
  { name: 'size & fit',   href: '/footer-pages/size-fit' },
  { name: 'garment care', href: '/footer-pages/garment-care' },
];

const LINK_COL_2 = [
  { name: 'contact us',           href: 'mailto:hello@tualmi.com' },
  { name: 'privacy policy',       href: '/footer-pages/privacy' },
  { name: 'terms and conditions', href: '/footer-pages/legal' },
];

export default function Footer() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const validEmail = email.includes('@');

  async function handleSubmit() {
    if (!validEmail || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <footer style={{ backgroundColor: blushBg, position: 'relative', zIndex: 3, padding: 'clamp(48px, 7vw, 88px) clamp(24px, 6vw, 72px) clamp(28px, 4vw, 44px)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Top row: links left, signup right ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'clamp(32px, 5vw, 64px)',
            flexWrap: 'wrap',
            marginBottom: 'clamp(40px, 6vw, 72px)',
          }}
        >
          {/* Link columns */}
          <div style={{ display: 'flex', gap: 'clamp(40px, 6vw, 88px)' }}>
            {[LINK_COL_1, LINK_COL_2].map((col, i) => (
              <ul key={i} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      style={{ fontFamily: sans, fontSize: '14px', fontWeight: 500, color: '#8A6B54', textDecoration: 'none', textTransform: 'lowercase' }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>

          {/* Join the club */}
          <div style={{ maxWidth: '420px', flex: '1 1 320px' }}>
            <h3
              style={{
                fontFamily: sans,
                fontWeight: 700,
                fontSize: 'clamp(24px, 3vw, 32px)',
                letterSpacing: '-0.02em',
                color: maroon,
                margin: '0 0 14px',
                textTransform: 'lowercase',
              }}
            >
              join the trailblazing club!
            </h3>
            <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 500, lineHeight: 1.9, color: soft, margin: '0 0 20px' }}>
              First looks, early access when the shop opens, and the occasional trail
              recommendation. No spam — just the good stuff.
            </p>

            {status === 'success' ? (
              <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: maroon, margin: 0, textTransform: 'lowercase' }}>
                you&apos;re in — we&apos;ll be in touch ✦
              </p>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1.5px solid ${maroon}`,
                    borderRadius: '100px',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                  }}
                >
                  <input
                    type="email"
                    placeholder="your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    style={{
                      flex: 1,
                      padding: '12px 22px',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: sans,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: maroon,
                    }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!validEmail}
                    style={{
                      padding: '12px 26px',
                      background: 'none',
                      border: 'none',
                      fontFamily: sans,
                      fontSize: '14px',
                      fontWeight: 700,
                      color: maroon,
                      cursor: validEmail ? 'pointer' : 'default',
                      opacity: validEmail ? 1 : 0.5,
                      textTransform: 'lowercase',
                    }}
                  >
                    {status === 'loading' ? '…' : 'submit'}
                  </button>
                </div>
                {status === 'error' && (
                  <p style={{ fontFamily: sans, fontSize: '12px', color: '#B85C49', margin: '10px 0 0' }}>
                    something went wrong — please try again.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Big centered logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(10px, 1.5vw, 20px)', marginBottom: '14px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images-2/logo2-maroon.png"
            alt=""
            style={{ height: 'clamp(64px, 9vw, 120px)', width: 'auto', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: serif,
              fontSize: 'clamp(56px, 9vw, 110px)',
              fontWeight: 400,
              color: maroon,
              lineHeight: 1,
            }}
          >
            Tualmi
          </span>
        </div>

        {/* ── Bottom line ── */}
        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: soft, textAlign: 'center', margin: 0, textTransform: 'lowercase' }}>
          @ 2026, tualmi
        </p>
      </div>
    </footer>
  );
}
