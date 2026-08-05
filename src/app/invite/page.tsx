'use client';

import { useState } from 'react';
import PhoneOptIn, { PHONE_THEMES } from '@/components/PhoneOptIn';
import { getAttribution } from '@/lib/attribution';

// ─── Landing-page design tokens ───────────────────────────────────────────────
const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';

// 'phone' comes after the email is already saved — it can never block the signup.
// There's deliberately no "how did you find us?" step: that's captured
// automatically from UTM params / referrer (see lib/attribution.ts).
type Step = 'email' | 'loading' | 'phone' | 'success' | 'error';

export default function InvitePage() {
  const [step, setStep]         = useState<Step>('email');
  const [email, setEmail]       = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [joinedSms, setJoinedSms] = useState(false);

  const validEmail = email.includes('@');

  async function handleSubmit() {
    if (!validEmail) return;
    setStep('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'invite', attribution: getAttribution() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'something went wrong.');
        setStep('error');
      } else {
        // Email is banked at this point — now the optional phone ask.
        setStep('phone');
      }
    } catch {
      setErrorMsg('something went wrong — please try again.');
      setStep('error');
    }
  }

  const pillStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    border: `1.5px solid ${maroon}`,
    borderRadius: '100px',
    overflow: 'hidden',
    backgroundColor: 'white',
    maxWidth: '460px',
    margin: '0 auto',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '13px 22px',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: sans,
    fontSize: '14px',
    fontWeight: 500,
    color: maroon,
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '13px 26px',
    background: 'none',
    border: 'none',
    fontFamily: sans,
    fontSize: '14px',
    fontWeight: 700,
    color: maroon,
    cursor: active ? 'pointer' : 'default',
    opacity: active ? 1 : 0.5,
    textTransform: 'lowercase',
    whiteSpace: 'nowrap',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: blushBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(96px, 14vw, 160px) clamp(24px, 6vw, 72px) clamp(64px, 9vw, 120px)',
        boxSizing: 'border-box',
      }}
    >
      <main style={{ maxWidth: '680px', width: '100%', textAlign: 'center' }}>
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.14em',
            color: soft,
            margin: '0 0 18px',
            textTransform: 'lowercase',
          }}
        >
          the trailblazing club
        </p>

        {/* Heading — centered, like the landing page */}
        <h1
          style={{
            fontFamily: sans,
            fontWeight: 700,
            fontSize: 'clamp(30px, 5vw, 54px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: maroon,
            margin: '0 0 clamp(24px, 4vw, 36px)',
            textTransform: 'lowercase',
          }}
        >
          you found us before everyone else.
        </h1>

        {/* Body copy — left-aligned */}
        <p
          style={{
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 'clamp(14px, 1.6vw, 16px)',
            lineHeight: 2,
            color: soft,
            margin: '0 0 20px',
            textAlign: 'left',
          }}
        >
          Get first access to gear built for women who actually spend time outside.
        </p>

        {/* Perks — left-aligned */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 clamp(32px, 5vw, 44px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'left',
          }}
        >
          {[
            'vote on what we make for our next collection',
            '24-hour early access to our launch before anyone else',
          ].map((item) => (
            <li
              key={item}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontFamily: sans,
                fontSize: 'clamp(14px, 1.6vw, 16px)',
                fontWeight: 500,
                color: soft,
                lineHeight: 1.8,
              }}
            >
              <span style={{ color: maroon, flexShrink: 0 }}>✦</span>
              {item}
            </li>
          ))}
        </ul>

        {/* Signup — same pill style as the footer */}
        {step === 'phone' && (
          <div style={{ maxWidth: '460px', margin: '0 auto' }}>
            <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: maroon, margin: '0 0 22px', textTransform: 'lowercase' }}>
              you&apos;re in ✦
            </p>
            <PhoneOptIn
              email={email}
              source="invite"
              theme={PHONE_THEMES.blush}
              onDone={({ joinedSms: j }) => { setJoinedSms(j); setStep('success'); }}
            />
          </div>
        )}

        {step === 'success' && (
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: maroon, margin: 0, textTransform: 'lowercase' }}>
            {joinedSms
              ? 'done — you’ll get the drop link by text first ✦'
              : 'you’re in — we’ll be in touch ✦'}
          </p>
        )}

        {step === 'loading' && (
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: soft, margin: 0, textTransform: 'lowercase' }}>
            joining…
          </p>
        )}

        {(step === 'email' || step === 'error') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={pillStyle}>
              <input
                type="email"
                placeholder="your email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={inputStyle}
              />
              <button onClick={handleSubmit} disabled={!validEmail} style={buttonStyle(validEmail)}>
                {step === 'error' ? 'retry' : 'join'}
              </button>
            </div>
            {step === 'error' && (
              <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: '#B85C49', margin: 0 }}>
                {errorMsg}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
