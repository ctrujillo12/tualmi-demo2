'use client';

import { useState } from 'react';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const rule   = '#F0D9E1';

/**
 * Collapsed prompt for sold-out sizes. Opens into a size picker (sold-out
 * sizes only) and one email field. See app/api/restock-interest/route.ts for
 * where the answer goes.
 *
 * Two modes:
 *   notify — "tell me if it comes back". Just interest.
 *   pledge — "I'll buy it if you restock it". Same fields plus a required
 *            commitment checkbox naming the size, color and price. No payment
 *            is taken: when a size is restocked, pledgers get a checkout link
 *            first. Pledge counts per size are what decide whether a size
 *            comes back, so they are recorded separately from plain interest.
 */
export default function RestockNotify({
  productId,
  productName,
  color,
  soldOutSizes,
  mode = 'notify',
  priceLabel,
}: {
  productId: string;
  productName: string;
  color: string;
  soldOutSizes: string[];
  mode?: 'notify' | 'pledge';
  /** Pledge mode only: the price they're committing to, e.g. "$68". */
  priceLabel?: string;
}) {
  const pledge = mode === 'pledge';
  const [committed, setCommitted] = useState(false);
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
    if (pledge && !committed) return setError('tick the box to confirm your pledge');
    setState('sending');
    try {
      const res = await fetch('/api/restock-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), productId, productName, size: picked, color, pledge, price: priceLabel }),
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
        {pledge
          ? <>you’re pledged for {picked.join(', ')}. if we restock, you’ll get a checkout link before anyone else. ✦</>
          : <>got it. we’ll email you if {picked.join(', ')} comes back. ✦</>}
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
        {pledge
          ? 'size sold out? pledge for a restock →'
          : 'don’t see your size? get notified if it restocks →'}
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ margin: '14px 0 0', padding: '14px', border: `1.5px solid ${rule}`, borderRadius: '12px' }}>
      <p style={{ ...text, color: maroon, margin: '0 0 10px', textTransform: 'lowercase' }}>
        which size(s) should we bring back?
      </p>
      {pledge && (
        <p style={{ ...text, fontWeight: 500, fontSize: '12px', color: soft, margin: '-4px 0 10px' }}>
          pledges decide which sizes we restock. no payment now. if your size comes back,
          you get a checkout link first.
        </p>
      )}
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
          {state === 'sending' ? 'sending…' : pledge ? 'pledge' : 'notify me'}
        </button>
      </div>
      {pledge && (
        <label style={{ ...text, fontWeight: 500, fontSize: '12px', color: maroon, display: 'flex', gap: '8px', alignItems: 'flex-start', margin: '10px 0 0', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={committed}
            onChange={(e) => setCommitted(e.target.checked)}
            style={{ marginTop: '2px', accentColor: maroon, flexShrink: 0 }}
          />
          <span>
            I&apos;ll buy {picked.length ? picked.join(' / ') : 'my size'} in {color.toLowerCase()}
            {priceLabel ? ` at ${priceLabel}` : ''} if it&apos;s restocked.
          </span>
        </label>
      )}
      {error && <p role="alert" style={{ ...text, color: '#B3341F', margin: '8px 0 0' }}>{error}</p>}
      <p style={{ ...text, fontWeight: 500, fontSize: '11.5px', color: soft, margin: '8px 0 0' }}>
        {pledge
          ? 'we’ll only email you about this restock. no signup, no spam.'
          : 'one email if it comes back. no signup, no spam.'}
      </p>
    </form>
  );
}
