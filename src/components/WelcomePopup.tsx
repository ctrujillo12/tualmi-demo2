'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import PhoneOptIn, { PHONE_THEMES } from './PhoneOptIn';
import { getAttribution } from '@/lib/attribution';
import { klaviyoIdentify } from '@/lib/klaviyo';
import { getReferralCode } from '@/lib/referralClient';
import { WELCOME_CODE, saveWelcomeCode } from '@/lib/discount';

// New key for the Black Friday early-access push, so visitors who already saw
// (and dismissed) the old 10% welcome popup still get this one once.
const STORAGE_KEY = 'tualmi_bf_early_access_shown';

/** Public Black Friday launch: Fri 27 Nov 2026, 4:00 pm PT (PST = UTC-8). */
const BF_LAUNCH = new Date('2026-11-27T16:00:00-08:00').getTime();

/**
 * Days / hours / mins / secs to launch, ticking once a second. Stops at zero.
 * Only ever mounted inside the popup, which renders client-side after load,
 * so Date.now() can't cause a hydration mismatch.
 */
function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, BF_LAUNCH - now);
  const units: [number, string][] = [
    [Math.floor(left / 86_400_000), 'days'],
    [Math.floor(left / 3_600_000) % 24, 'hours'],
    [Math.floor(left / 60_000) % 60, 'mins'],
    [Math.floor(left / 1000) % 60, 'secs'],
  ];
  return (
    <div
      role="timer"
      aria-label="time until black friday"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '0 0 22px' }}
    >
      {units.map(([n, label]) => (
        <div
          key={label}
          style={{
            backgroundColor: 'white', border: `1px solid ${rule}`, borderRadius: '12px',
            padding: '12px 4px 10px', textAlign: 'center',
          }}
        >
          <div style={{
            fontFamily: sans, fontWeight: 700, fontSize: 'clamp(24px, 6vw, 30px)',
            lineHeight: 1, color: maroon, fontVariantNumeric: 'tabular-nums',
          }}>
            {String(n).padStart(2, '0')}
          </div>
          <div style={{
            fontFamily: sans, fontWeight: 600, fontSize: '10px', letterSpacing: '0.14em',
            color: soft, marginTop: '7px', textTransform: 'lowercase',
          }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Fired by the header strip's "sign up →" link to open this popup on demand. */
export const OPEN_EARLY_ACCESS_EVENT = 'tualmi:open-early-access';

// Landing-page design tokens — the same set PolicyPage and /invite use.
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#34402B';
const blushBg = '#FAF6EC';
const soft    = '#6F6B54';
const rule    = '#E6DFCC';

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
  const SUPPRESSED = ['/trail-club', '/invite', '/cart', '/discount'];

  // The header strip links here. Opening on request ignores the once-per-browser
  // flag and the suppressed pages: she asked for it.
  useEffect(() => {
    const open = () => { firedRef.current = true; setStatus('idle'); setVisible(true); };
    window.addEventListener(OPEN_EARLY_ACCESS_EVENT, open);
    return () => window.removeEventListener(OPEN_EARLY_ACCESS_EVENT, open);
  }, []);

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
          source: 'bf-early-access',
          attribution: getAttribution(), ref: getReferralCode() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'something went wrong');
      setStatus('success');
      // Pre-apply the 10% so the offer is real the moment they keep shopping,
      // instead of a code they have to go dig out of an email. Skipped if a
      // creator code is already live this session — see saveWelcomeCode().
      saveWelcomeCode();
      // Bind this browser to the profile so Klaviyo can attribute onsite
      // browse events to a real inbox. Without it, every Viewed Product after
      // a signup still lands on an anonymous cookie and can't trigger a
      // browse-abandon email.
      klaviyoIdentify(email);
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

  const bodyText: React.CSSProperties = {
    fontFamily: sans, fontSize: '14px', fontWeight: 500,
    color: soft, lineHeight: 1.8, margin: 0,
  };

  /** The code, big enough to read and copy off the screen. */
  const codeChip: React.CSSProperties = {
    fontFamily: sans, fontWeight: 700, fontSize: '17px',
    letterSpacing: '0.12em', color: maroon,
    backgroundColor: 'white', border: `1.5px dashed ${maroon}`,
    borderRadius: '12px', padding: '12px 16px', textAlign: 'center',
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
            <p style={eyebrow}>black friday early access</p>
            <h2 style={{ ...heading, margin: '0 0 14px' }}>you&apos;re on the list ✦</h2>
            <p style={{ ...bodyText, margin: '0 0 14px' }}>
              we&apos;ll email you 24 hours before everyone else gets in — shop right away,
              sizes won&apos;t last. in the meantime,
              here&apos;s 10% off your first order — already applied at checkout.
            </p>
            <div style={codeChip}>{WELCOME_CODE}</div>
            <p style={{ ...bodyText, fontSize: '12px', margin: '12px 0 0' }}>
              it&apos;s in your inbox too, for whenever you&apos;re ready.
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
            <p style={{ ...eyebrow, textAlign: 'center' }}>up to 30% off everything</p>
            <h2 style={{ ...heading, textAlign: 'center', margin: '0 0 6px' }}>black friday: 27 november</h2>
            <p style={{ ...bodyText, textAlign: 'center', margin: '0 0 18px' }}>
              friday, 4:00 pm pt
            </p>

            <Countdown />

            <p style={{ ...bodyText, color: maroon, fontWeight: 700, textAlign: 'center', margin: '0 0 6px' }}>
              get in 24 hours before everyone else ✦
            </p>
            <p style={{ ...bodyText, textAlign: 'center', margin: '0 0 20px' }}>
              stock is already low and sizes are going fast. the early access list
              shops thursday at 4:00 pm pt — while your size is still here.
            </p>

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
                  {status === 'loading' ? '…' : 'get early access'}
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
