'use client';

import { useState } from 'react';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';

/**
 * Collapsed "tell me if it comes back" prompt for sold-out sizes. Opens into a
 * size picker (sold-out sizes only) and one email field. See
 * app/api/restock-interest/route.ts for where the answer goes.
 */
export default function RestockNotify({
  productId,
  productName,
  color,
  soldOutSizes,
}: {
  productId: string;
  productName: string;
  color: string;
  soldOutSizes: string[];
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  if (soldOutSizes.length === 0) return null;

  const toggle = (s: string) =>
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (picked.length === 0) return setError('pick the size you want');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('enter a valid email');
    setState('sending');
    try {
      const res = await fetch('/api/restock-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), productId, productName, size: picked, color }),
      });
      if (!res.ok) throw new Error();
      setState('done');
    } catch {
      setState('idle');
      setError('something went wrong. try again?');
    }
  }

  const text: React.CSSProperties = { fontFamily: sans, fontSize: '12.5px', fontWeight: 600, lineHeight: 1.5 };

  if (state === 'done') {
    return (
      <p role="status" style={{ ...text, color: maroon, margin: '14px 0 0', textTransform: 'lowercase' }}>
        got it. we’ll email you if {picked.join(', ')} comes back. ✦
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ ...text, background: 'none', border: 0, padding: 0, margin: '14px 0 0', color: maroon, textDecoration: 'underline', textUnderlineOffset: '3px', cursor: 'pointer', textAlign: 'left', textTransform: 'lowercase' }}
      >
        don’t see your size? get notified if it restocks →
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ margin: '14px 0 0', padding: '14px', border: `1.5px solid ${rule}`, borderRadius: '12px' }}>
      <p style={{ ...text, color: maroon, margin: '0 0 10px', textTransform: 'lowercase' }}>
        which size(s) should we bring back?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {soldOutSizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            aria-pressed={picked.includes(s)}
            style={{
              padding: '8px 16px', minHeight: '40px', fontFamily: sans, fontSize: '12px', fontWeight: 600,
              borderRadius: '100px', border: `1.5px solid ${maroon}`, cursor: 'pointer',
              backgroundColor: picked.includes(s) ? maroon : 'transparent',
              color: picked.includes(s) ? 'white' : maroon,
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="your email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: '1 1 160px', minWidth: 0, boxSizing: 'border-box', padding: '11px 14px', minHeight: '42px', fontFamily: sans, fontSize: '16px', border: `1.5px solid ${soft}`, borderRadius: '100px', outline: 'none' }}
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          style={{ padding: '11px 22px', minHeight: '42px', fontFamily: sans, fontSize: '13px', fontWeight: 700, color: 'white', backgroundColor: maroon, border: 0, borderRadius: '100px', cursor: 'pointer', textTransform: 'lowercase' }}
        >
          {state === 'sending' ? 'sending…' : 'notify me'}
        </button>
      </div>
      {error && <p role="alert" style={{ ...text, color: '#B3341F', margin: '8px 0 0' }}>{error}</p>}
      <p style={{ ...text, fontWeight: 500, fontSize: '11.5px', color: soft, margin: '8px 0 0' }}>
        one email if it comes back. no signup, no spam.
      </p>
    </form>
  );
}
