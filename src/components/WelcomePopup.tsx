'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PhoneOptIn, { PHONE_THEMES } from './PhoneOptIn';
import { getAttribution } from '@/lib/attribution';

const STORAGE_KEY = 'tualmi_welcome_shown';
const green = '#f9d6dd';
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
  // Phone ask lives on the success screen — the email is already captured by
  // then, so this can never cost us the email conversion.
  const [smsStage, setSmsStage] = useState<'ask' | 'done'>('ask');
  const firedRef              = useRef(false);
  const pathname              = usePathname();

  /**
   * Pages where the popup would be counterproductive: /invite is already a
   * signup page, and interrupting someone mid-checkout costs more than an
   * email is worth.
   */
  const SUPPRESSED = ['/invite', '/cart', '/discount'];

  useEffect(() => {
    if (SUPPRESSED.some((p) => pathname?.startsWith(p))) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
        // source + attribution so popup signups are traceable in Klaviyo the
        // same way footer and /invite signups are.
        body: JSON.stringify({
          email,
          source: 'welcome-popup',
          attribution: getAttribution(),
        }),
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
            <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: mid, lineHeight: 1.7, margin: '0 0 8px' }}>
              We&apos;ll let you know the moment the next piece drops.
            </p>

            {smsStage === 'ask' ? (
              <div style={{
                marginTop: '26px',
                paddingTop: '22px',
                borderTop: '1px solid rgba(59,47,30,0.18)',
              }}>
                <PhoneOptIn
                  email={email}
                  source="welcome-popup"
                  theme={PHONE_THEMES.pink}
                  lowercase={false}
                  headline="One more thing — want the drop early?"
                  subcopy="We text the link 24 hours before it hits email. That’s the only reason we’d text you."
                  onDone={() => setSmsStage('done')}
                />
              </div>
            ) : null}

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
              Get notified when our next pieces drop.
            </h2>
            <ul
              style={{
                listStyle: 'none', padding: 0,
                margin: '0 0 22px',
                display: 'flex', flexDirection: 'column', gap: '7px',
                textAlign: 'left',
              }}
            >
              {[
                'First look, 24 hours early',
                'A vote on what we make next',
                'Restock alerts',
              ].map((perk) => (
                <li
                  key={perk}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    fontFamily: sans, fontSize: '12.5px', fontWeight: 400,
                    color: mid, lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: brown, flexShrink: 0 }}>✦</span>
                  {perk}
                </li>
              ))}
            </ul>

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
                  {status === 'loading' ? '…' : 'Join the Club'}
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
