'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PhoneOptIn, { PHONE_THEMES } from './PhoneOptIn';
import { getAttribution } from '@/lib/attribution';

const STORAGE_KEY = 'tualmi_welcome_shown';

// Landing-page design tokens — the same set PolicyPage and /invite use.
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';
const rule    = '#F0D9E1';

/**
 * Newsletter prompt, shown once per browser.
 *
 * Timing: 3s after load on mobile (or on first real scroll, whichever comes
 * first), 1.2s on desktop. Marked as seen the moment it appears, so it never
 * nags. Skipped on pages where it would be counterproductive.
 */
export default function WelcomePopup() {
  const [visible, setVisible]   = useState(false);
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg]     = useState('');
  // Phone ask lives on the success screen — the email is already captured by
  // then, so it can never cost us the email conversion.
  const [smsStage, setSmsStage] = useState<'ask' | 'done'>('ask');
  const firedRef                = useRef(false);
  const pathname                = usePathname();

  /** /invite is already a signup page; interrupting checkout costs more than an email. */
  const SUPPRESSED = ['/invite', '/cart', '/discount'];

  useEffect(() => {
    if (SUPPRESSED.some((p) => pathname?.startsWith(p))) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const show = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      localStorage.setItem(STORAGE_KEY, '1');
      setVisible(true);
    };

    const isMobile = window.innerWidth < 768;
    const timer = setTimeout(show, isMobile ? 3000 : 1200);
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

  const validEmail = email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'welcome-popup',
          attribution: getAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'something went wrong');
      setStatus('success');
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'something went wrong');
      setStatus('error');
    }
  };

  if (!visible) return null;

  const eyebrow: React.CSSProperties = {
    fontFamily: sans, fontWeight: 700, fontSize: '12px',
    letterSpacing: '0.14em', color: soft, margin: '0 0 14px',
    textTransform: 'lowercase',
  };

  const heading: React.CSSProperties = {
    fontFamily: sans, fontWeight: 700,
    fontSize: 'clamp(24px, 4.4vw, 32px)',
    letterSpacing: '-0.03em', lineHeight: 1.15,
    color: maroon, margin: '0 0 20px', textTransform: 'lowercase',
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(60,26,38,0.45)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: blushBg,
          maxWidth: '440px', width: '100%',
          borderRadius: '18px',
          padding: 'clamp(30px, 6vw, 44px) clamp(24px, 5vw, 40px)',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(90,30,50,0.24)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: 'absolute', top: '12px', right: '14px',
            width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: sans, fontSize: '20px', color: soft, lineHeight: 1,
          }}
        >
          ×
        </button>

        {status === 'success' ? (
          <div>
            <p style={eyebrow}>welcome to the club</p>
            <h2 style={{ ...heading, margin: '0 0 14px' }}>you&apos;re in ✦</h2>
            <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 500, color: soft, lineHeight: 1.8, margin: 0 }}>
              we&apos;ll let you know the moment the next piece drops.
            </p>

            {smsStage === 'ask' ? (
              <div style={{ marginTop: '24px', paddingTop: '22px', borderTop: `1px solid ${rule}` }}>
                <PhoneOptIn
                  email={email}
                  source="welcome-popup"
                  theme={PHONE_THEMES.blush}
                  onDone={() => setSmsStage('done')}
                />
              </div>
            ) : null}

            <button
              onClick={dismiss}
              style={{
                marginTop: '26px', display: 'block', width: '100%',
                backgroundColor: maroon, color: 'white',
                fontFamily: sans, fontSize: '14px', fontWeight: 700,
                textTransform: 'lowercase',
                border: 'none', borderRadius: '100px',
                padding: '14px', cursor: 'pointer',
              }}
            >
              keep shopping
            </button>
          </div>
        ) : (
          <>
            <p style={eyebrow}>the trailblazing club</p>
            <h2 style={heading}>get notified when our next pieces drop.</h2>

            <ul
              style={{
                listStyle: 'none', padding: 0, margin: '0 0 24px',
                display: 'flex', flexDirection: 'column', gap: '9px',
              }}
            >
              {[
                'first look, 24 hours early',
                'a vote on what we make next',
                'restock alerts',
              ].map((perk) => (
                <li
                  key={perk}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    fontFamily: sans, fontSize: '14px', fontWeight: 500,
                    color: soft, lineHeight: 1.7,
                  }}
                >
                  <span style={{ color: maroon, flexShrink: 0 }}>✦</span>
                  {perk}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'flex', alignItems: 'center',
                  border: `1.5px solid ${maroon}`, borderRadius: '100px',
                  overflow: 'hidden', backgroundColor: 'white',
                }}
              >
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1, minWidth: 0,
                    padding: '13px 20px',
                    border: 'none', outline: 'none', background: 'transparent',
                    fontFamily: sans, fontSize: '14px', fontWeight: 500, color: maroon,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading' || !validEmail}
                  style={{
                    padding: '10px 20px', margin: '4px',
                    backgroundColor: maroon, color: 'white',
                    border: 'none', borderRadius: '100px',
                    fontFamily: sans, fontSize: '13px', fontWeight: 700,
                    textTransform: 'lowercase', whiteSpace: 'nowrap',
                    cursor: validEmail ? 'pointer' : 'default',
                    opacity: validEmail && status !== 'loading' ? 1 : 0.45,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {status === 'loading' ? '…' : 'join'}
                </button>
              </div>

              {status === 'error' && (
                <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: '#B85C49', margin: '10px 0 0' }}>
                  {errMsg}
                </p>
              )}

              <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: soft, margin: '12px 0 0', lineHeight: 1.5 }}>
                no spam, ever. unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
