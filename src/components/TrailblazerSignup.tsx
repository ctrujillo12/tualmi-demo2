'use client';

import { useState } from 'react';
import { getReferralCode } from '@/lib/referralClient';

const sans  = 'var(--font-montserrat)';
const brown = '#3B2F1E';
const rule  = '#DDD5C8';
const red   = '#C94468';

type Step = 'email' | 'source' | 'loading' | 'success' | 'error';

export default function TrailblazerSignup({ light = false }: { light?: boolean }) {
  const [step, setStep]       = useState<Step>('email');
  const [email, setEmail]     = useState('');
  const [source, setSource]   = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const validEmail = email.includes('@');
  const borderColor = light ? 'rgba(255,255,255,0.6)' : rule;
  const bg          = light ? 'rgba(255,255,255,0.12)' : 'white';
  const textColor   = light ? 'white' : brown;

  async function handleSubmit() {
    setStep('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, ref: getReferralCode() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setStep('error');
      } else {
        setStep('success');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStep('error');
    }
  }

  if (step === 'success') {
    return (
      <p style={{ fontFamily: sans, fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: light ? 'white' : brown }}>
        You're in. We'll be in touch. ✦
      </p>
    );
  }

  const pillStyle = {
    display: 'flex',
    alignItems: 'center',
    border: `1.5px solid ${borderColor}`,
    borderRadius: '100px',
    overflow: 'hidden',
    backgroundColor: bg,
    maxWidth: '480px',
    margin: '0 auto',
  };

  const submitBtnStyle = (active: boolean) => ({
    padding: '11px 24px',
    margin: '4px',
    backgroundColor: light
      ? (active ? 'white' : 'rgba(255,255,255,0.3)')
      : (active ? brown : '#D6CFC6'),
    color: light ? red : 'white',
    border: 'none',
    borderRadius: '100px',
    fontFamily: sans,
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    cursor: active ? 'pointer' : 'default',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap' as const,
  });

  // Step 1 — email
  if (step === 'email') {
    return (
      <div>
        <div style={pillStyle}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && validEmail && setStep('source')}
            style={{
              flex: 1,
              padding: '13px 22px',
              border: 'none',
              outline: 'none',
              fontFamily: sans,
              fontSize: '13px',
              fontWeight: 300,
              color: textColor,
              backgroundColor: 'transparent',
              letterSpacing: '0.02em',
            }}
          />
          <button
            onClick={() => validEmail && setStep('source')}
            disabled={!validEmail}
            style={submitBtnStyle(validEmail)}
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  // Step 2 — how did you find us
  if (step === 'source' || step === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p style={{
          fontFamily: sans,
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: light ? 'rgba(255,255,255,0.7)' : '#8C7B6B',
          margin: 0,
        }}>
          One more thing — how did you find us?
        </p>
        <div style={pillStyle}>
          <select
            value={source}
            onChange={e => setSource(e.target.value)}
            style={{
              flex: 1,
              padding: '13px 22px',
              border: 'none',
              outline: 'none',
              fontFamily: sans,
              fontSize: '13px',
              fontWeight: 300,
              color: source ? textColor : (light ? 'rgba(255,255,255,0.5)' : '#A89880'),
              backgroundColor: 'transparent',
              letterSpacing: '0.02em',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>Select one</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="friend">A friend</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => source && handleSubmit()}
            disabled={!source}
            style={submitBtnStyle(!!source)}
          >
            {step === 'error' ? 'Retry' : 'Submit'}
          </button>
        </div>
        {step === 'error' && (
          <p style={{ fontFamily: sans, fontSize: '11px', color: light ? 'rgba(255,255,255,0.7)' : '#A87060', margin: 0 }}>
            {errorMsg}
          </p>
        )}
      </div>
    );
  }

  // loading
  return (
    <p style={{ fontFamily: sans, fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: light ? 'white' : brown }}>
      Joining…
    </p>
  );
}
