'use client';

import { useState } from 'react';

const sans  = "'Jost', 'DM Sans', system-ui, sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const black = '#3B2F1E';
const mid   = '#6B5C4C';
const muted = '#8C7B6B';
const rule  = '#DDD5C8';
const bgAlt = '#F2EDE4';

const SOURCE_OPTIONS = [
  'Instagram',
  'A friend referred me',
  'Claremont Earth Day',
  'HMC Spring Fest',
  'Other',
  // ← swap in your actual events
];

export default function TrailblazerSignup() {
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const valid = name.trim().length > 0 && email.includes('@');

  async function handleSubmit() {
    if (!valid) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email,
          source: source || '',
        }),
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
      <p style={{
        fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase',
        color: black, fontFamily: sans,
      }}>
        You're in. We'll be in touch. ✦
      </p>
    );
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    backgroundColor: 'transparent',
    border: `1px solid ${rule}`,
    borderRadius: 0,
    fontSize: '13px',
    fontFamily: sans,
    color: black,
    outline: 'none',
    letterSpacing: '0.02em',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>

      {/* Name + Email side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input
          type="text"
          placeholder="First name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputBase}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={inputBase}
        />
      </div>

      {/* Source dropdown */}
      <select
        value={source}
        onChange={e => setSource(e.target.value)}
        style={{
          ...inputBase,
          color: source === '' ? muted : black,
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238C7B6B' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '38px',
        }}
      >
        <option value="">How did you find us? (optional)</option>
        {SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={status === 'loading' || !valid}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: black,
          color: bgAlt,
          border: 'none',
          fontSize: '10px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          fontFamily: sans,
          cursor: !valid || status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: !valid ? 0.4 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {status === 'loading' ? 'Joining…' : 'Join the Club'}
      </button>

      {status === 'error' && (
        <p style={{ fontSize: '12px', color: '#A87060', fontFamily: sans, textAlign: 'center', marginTop: '4px' }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}