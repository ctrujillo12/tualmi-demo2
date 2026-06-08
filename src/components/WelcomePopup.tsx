'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'tualmi_welcome_shown';
const CODE  = 'TRAILBLAZING15';
const green = '#dad082';
const brown = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#7A6A4A';
const sans  = 'var(--font-montserrat)';
const serif = "'Cormorant Garamond', Georgia, serif";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg]   = useState('');
  const firedRef              = useRef(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const show = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      localStorage.setItem(STORAGE_KEY, '1'); // mark as seen immediately so it never repeats
      setVisible(true);
    };

    const isMobile = window.innerWidth < 768;

    // Always set a fallback timer (3s mobile, 1.2s desktop)
    const timer = setTimeout(show, isMobile ? 3000 : 1200);

    // On mobile also fire immediately on any scroll
    const onScroll = () => { if (window.scrollY > 80) show(); };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setStatus('success');
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(20,15,8,0.55)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: green,
          maxWidth: '460px',
          width: '100%',
          padding: 'clamp(32px, 6vw, 52px) clamp(28px, 6vw, 48px)',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: 'absolute', top: '16px', right: '18px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: sans, fontSize: '20px', color: mid, lineHeight: 1, padding: '4px',
          }}
        >
          ×
        </button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, margin: '0 0 14px' }}>
              Welcome to the club
            </p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 400, color: brown, margin: '0 0 16px', lineHeight: 1.15 }}>
              You&apos;re in. 🌿
            </h2>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid, lineHeight: 1.7, margin: '0 0 24px' }}>
              Check your email for your welcome gift. Your 15% off code is right here:
            </p>
            <div style={{
              backgroundColor: 'rgba(59,47,30,0.10)', border: '1.5px dashed rgba(59,47,30,0.35)',
              padding: '12px 20px', marginBottom: '24px', display: 'inline-block',
            }}>
              <span style={{ fontFamily: sans, fontSize: '16px', fontWeight: 700, letterSpacing: '0.18em', color: brown }}>
                {CODE}
              </span>
            </div>
            <p style={{ fontFamily: sans, fontSize: '11px', color: muted, margin: 0 }}>
              Use it at checkout. Valid on your first order.
            </p>
            <button
              onClick={dismiss}
              style={{
                marginTop: '28px', display: 'block', width: '100%',
                backgroundColor: brown, color: '#FAFAF7',
                fontFamily: sans, fontSize: '9px', fontWeight: 600,
                letterSpacing: '0.28em', textTransform: 'uppercase',
                border: 'none', padding: '13px', cursor: 'pointer',
              }}
            >
              Shop the Collection
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, margin: '0 0 14px' }}>
              Trailblazing Club
            </p>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 400, color: brown, margin: '0 0 12px', lineHeight: 1.15 }}>
              Join for 15% off your first order.
            </h2>
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid, lineHeight: 1.7, margin: '0 0 28px' }}>
              Be first to know about new drops, restocks, and trail-tested picks. Discount sent straight to your inbox.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', marginBottom: '12px' }}>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1, padding: '12px 14px',
                    fontFamily: sans, fontSize: '12px', color: brown,
                    border: '1.5px solid rgba(59,47,30,0.3)',
                    borderRight: 'none',
                    backgroundColor: 'rgba(255,255,255,0.55)',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    backgroundColor: brown, color: '#FAFAF7',
                    fontFamily: sans, fontSize: '9px', fontWeight: 600,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    border: 'none', padding: '12px 18px',
                    cursor: status === 'loading' ? 'default' : 'pointer',
                    whiteSpace: 'nowrap', opacity: status === 'loading' ? 0.7 : 1,
                    flexShrink: 0,
                  }}
                >
                  {status === 'loading' ? '…' : 'Get 15% Off'}
                </button>
              </div>
              {status === 'error' && (
                <p style={{ fontFamily: sans, fontSize: '11px', color: '#9B4040', margin: '0 0 8px' }}>{errMsg}</p>
              )}
              <p style={{ fontFamily: sans, fontSize: '10px', color: muted, margin: 0, lineHeight: 1.5 }}>
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>

            <button
              onClick={dismiss}
              style={{
                marginTop: '20px', background: 'none', border: 'none',
                fontFamily: sans, fontSize: '10px', color: muted,
                cursor: 'pointer', letterSpacing: '0.1em', padding: 0,
                textDecoration: 'underline', textDecorationColor: 'rgba(122,106,74,0.4)',
              }}
            >
              No thanks, I&apos;ll pay full price
            </button>
          </>
        )}
      </div>
    </div>
  );
}
