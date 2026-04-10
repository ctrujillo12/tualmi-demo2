'use client';

import { useState } from 'react';

const sans = "'Jost', 'DM Sans', system-ui, sans-serif";
const black = '#111110';
const muted = '#A8A8A3';
const rule  = '#E2E0DA';

export default function TrailblazerSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/invite', {
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
        setEmail('');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p style={{ fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: black, fontFamily: sans }}>
        You're in. We'll be in touch. ✦
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', maxWidth: '420px', margin: '0 auto' }}>
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${rule}`,
            color: black,
            fontSize: '13px',
            padding: '10px 0',
            letterSpacing: '0.04em',
            outline: 'none',
            fontFamily: sans,
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${rule}`,
            borderLeft: 'none',
            color: black,
            fontSize: '10px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            padding: '10px 24px',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            fontFamily: sans,
            whiteSpace: 'nowrap',
            opacity: status === 'loading' ? 0.4 : 1,
            transition: 'all 0.2s',
          }}
        >
          {status === 'loading' ? '...' : 'Join'}
        </button>
      </div>
      {status === 'error' && (
        <p style={{ marginTop: '16px', fontSize: '12px', color: '#A87060', fontFamily: sans }}>
          {errorMsg}
        </p>
      )}
    </form>
  );
}