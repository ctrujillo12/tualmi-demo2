'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tualmi_welcome_shown';
const CODE = 'TRAILBLAZING15';
const green  = '#dad082';
const brown  = '#3B2F1E';
const mid    = '#6B5C4C';
const muted  = '#7A6A4A';
const sans   = 'var(--font-montserrat)';
const serif  = "'Cormorant Garamond', Georgia, serif";

export default function WelcomePopup() {
  const [visible, setVisible]   = useState(false);
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg]     = useState('');

  useEffect(() => {
    // Small delay so it doesn't flash before the page renders
    const timer = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
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
      const res = await fetch('/api/subscribe', {
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
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(20,15,8,0.55)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Modal — stop click propagation so clicking inside doesn't close */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: green,
            maxWidth: '460px',
            width: '100%',
            padding: 'clamp(32px, 6vw, 52px) clamp(28px, 6vw, 48px)',
            position: 'relative',
            boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
          }}
        >
          {/* Close */}
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
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, margin: '0 0 14px' }}>
                Welcome to the club
              </p>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 400, color: brown, margin: '0 0 16px', lineHeight: 1.15 }}>
                You&apos;re in. 🌿
              </h2>
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid, lineHeight: 1.7, margin: '0 0 24px' }}>
                Check your email for your welcome gift. Your 15% off code is also right here:
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
            /* ── Sign-up state ── */
            <>
              <p style={{ fontFamily: sans, fontSize: '9px', fontWeight: 600, letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, margin: '0 0 14px' }}>
                Trailblazing Club
              </p>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 400, color: brown, margin: '0 0 12px', lineHeight: 1.15 }}>
                Join for 15% off your first order.
              </h2>
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid, lineHeight: 1.7, margin: '0 0 28px' }}>
                Be first to know about new drops, restocks, and trail-tested picks. Plus, get 15% off sent straight to your inbox.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '0', marginBottom: '12px' }}>
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
    </>
  );
}
