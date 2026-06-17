'use client';

import { useState } from 'react';

const sans  = 'var(--font-montserrat)';
const brown = '#3B2F1E';
const rule  = '#DDD5C8';

export default function TrailblazerSignup({ light = false }: { light?: boolean }) {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const valid = email.includes('@');

  async function handleSubmit() {
    if (!valid || status === 'loading') return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p style={{ fontFamily: sans, fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: light ? 'white' : brown }}>
        You're in. We'll be in touch. ✦
      </p>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: `1.5px solid ${light ? 'rgba(255,255,255,0.6)' : rule}`,
        borderRadius: '100px',
        overflow: 'hidden',
        backgroundColor: light ? 'rgba(255,255,255,0.12)' : 'white',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1,
            padding: '13px 22px',
            border: 'none',
            outline: 'none',
            fontFamily: sans,
            fontSize: '13px',
            fontWeight: 300,
            color: light ? 'white' : brown,
            backgroundColor: 'transparent',
            letterSpacing: '0.02em',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!valid || status === 'loading'}
          style={{
            padding: '11px 24px',
            margin: '4px',
            backgroundColor: light
              ? (valid ? 'white' : 'rgba(255,255,255,0.3)')
              : (valid ? brown : '#D6CFC6'),
            color: light ? '#C94468' : 'white',
            border: 'none',
            borderRadius: '100px',
            fontFamily: sans,
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            cursor: valid ? 'pointer' : 'default',
            transition: 'background-color 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? 'Joining…' : 'Join'}
        </button>
      </div>

      {status === 'error' && (
        <p style={{ fontFamily: sans, fontSize: '11px', color: light ? 'rgba(255,255,255,0.7)' : '#A87060', marginTop: '10px' }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
