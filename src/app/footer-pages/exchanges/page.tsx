'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';
const blush  = '#FBF1F5';
const rule   = '#F0D9E1';

type RequestType = 'size' | 'color' | 'refund' | 'issue';

const OPTIONS: { value: RequestType; label: string; hint?: string }[] = [
  { value: 'size',   label: 'swap for a different size', hint: 'fastest way to get the right fit' },
  { value: 'color',  label: 'swap for a different color or style' },
  { value: 'refund', label: 'return for a refund' },
  { value: 'issue',  label: 'my order arrived wrong or damaged' },
];

const REQUEST_LABEL: Record<RequestType, string> = {
  size:   'Size exchange',
  color:  'Color/style exchange',
  refund: 'Return for refund',
  issue:  'Wrong or damaged item',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontFamily: sans,
  fontSize: '13px',
  fontWeight: 600,
  color: maroon,
  textTransform: 'lowercase',
  letterSpacing: '0.01em',
  marginBottom: '7px',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 18px',
  borderRadius: '14px',
  border: `1.5px solid ${rule}`,
  outline: 'none',
  background: '#fff',
  fontFamily: sans,
  fontSize: '15px',
  fontWeight: 500,
  color: '#5c3a45',
};

export default function ExchangesPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    orderNumber: '',
    requestType: 'size' as RequestType,
    item: '',
    sizeHave: '',
    sizeWant: '',
    reason: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const set = (k: keyof typeof form) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSubmit =
    form.name.trim() && validEmail && form.orderNumber.trim() && form.reason.trim();

  async function handleSubmit() {
    if (!canSubmit || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          requestType: REQUEST_LABEL[form.requestType],
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main style={{ backgroundColor: blush, minHeight: '100vh', padding: 'clamp(96px, 13vw, 140px) clamp(20px, 6vw, 48px) clamp(64px, 9vw, 110px)' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: 'clamp(20px, 6vw, 48px) 0' }}>
            <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(28px, 5vw, 40px)', color: maroon, margin: '0 0 16px', textTransform: 'lowercase', letterSpacing: '-0.02em' }}>
              got it — thank you!
            </h1>
            <p style={{ fontFamily: sans, fontSize: '16px', fontWeight: 500, lineHeight: 1.8, color: soft, margin: '0 auto', maxWidth: '440px' }}>
              your request is in, and a real human on our team will get back to you at{' '}
              <span style={{ color: maroon, fontWeight: 600 }}>{form.email}</span> within 1–2 business
              days to sort everything out. hang tight, trailblazer ✦
            </p>
            <Link href="/" style={{ display: 'inline-block', marginTop: '28px', fontFamily: sans, fontSize: '14px', fontWeight: 600, color: maroon, textTransform: 'lowercase', textUnderlineOffset: '4px' }}>
              back home →
            </Link>
          </div>
        ) : (
          <>
            {/* Intro */}
            <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(30px, 6vw, 46px)', color: maroon, margin: '0 0 14px', textTransform: 'lowercase', letterSpacing: '-0.03em' }}>
              let&apos;s make it right
            </h1>
            <p style={{ fontFamily: sans, fontSize: '16px', fontWeight: 500, lineHeight: 1.85, color: soft, margin: '0 0 14px' }}>
              stuff happens, and we want you in a pair you love. tell us a little about what&apos;s
              up and we&apos;ll take care of the rest, usually within 1–2 business days.
            </p>

            {/* Exchange nudge */}
            <div style={{ background: '#fff', border: `1.5px solid ${rule}`, borderRadius: '16px', padding: '16px 18px', margin: '0 0 32px' }}>
              <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 500, lineHeight: 1.7, color: '#7a5560', margin: 0 }}>
                psst, if it&apos;s just the fit, an <strong style={{ color: maroon }}>exchange</strong> is
                the quickest way to get you into the right size, and you won&apos;t have to reorder or
                wait on a refund. peek at the{' '}
                <Link href="/footer-pages/size-fit" style={{ color: maroon, fontWeight: 600 }}>size guide</Link>{' '}
                if you&apos;re between sizes.
              </p>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>your name</label>
                <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="first + last" />
              </div>

              <div>
                <label style={labelStyle}>email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="so we can reach you" />
              </div>

              <div>
                <label style={labelStyle}>order number</label>
                <input style={inputStyle} value={form.orderNumber} onChange={set('orderNumber')} placeholder="e.g. #1024 — it's in your confirmation email" />
              </div>

              <div>
                <label style={labelStyle}>what can we do for you?</label>
                <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={form.requestType} onChange={set('requestType')}>
                  {OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}{o.hint ? ` (${o.hint})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>which piece is it?</label>
                <input style={inputStyle} value={form.item} onChange={set('item')} placeholder="e.g. sierra shorts in jam" />
              </div>

              {form.requestType === 'size' && (
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>size you have</label>
                    <input style={inputStyle} value={form.sizeHave} onChange={set('sizeHave')} placeholder="e.g. M" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>size you&apos;d like</label>
                    <input style={inputStyle} value={form.sizeWant} onChange={set('sizeWant')} placeholder="e.g. S" />
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>tell us a little more</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '110px', resize: 'vertical', lineHeight: 1.6 }}
                  value={form.reason}
                  onChange={set('reason')}
                  placeholder="what felt off? (runs a bit big, wanted a different color, arrived with a flaw...) the more we know, the faster we can help."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || status === 'loading'}
                style={{
                  marginTop: '4px',
                  padding: '15px 22px',
                  borderRadius: '100px',
                  border: 'none',
                  background: maroon,
                  color: '#fff',
                  fontFamily: sans,
                  fontSize: '15px',
                  fontWeight: 700,
                  textTransform: 'lowercase',
                  cursor: canSubmit && status !== 'loading' ? 'pointer' : 'default',
                  opacity: canSubmit && status !== 'loading' ? 1 : 0.5,
                  transition: 'opacity 0.15s',
                }}
              >
                {status === 'loading' ? 'sending…' : 'send request'}
              </button>

              {status === 'error' && (
                <p style={{ fontFamily: sans, fontSize: '13px', color: '#B85C49', margin: 0 }}>
                  hmm, that didn&apos;t go through. please try again, or email us at{' '}
                  <a href="mailto:hello@tualmi.com" style={{ color: maroon, fontWeight: 600 }}>hello@tualmi.com</a>.
                </p>
              )}

              <p style={{ fontFamily: sans, fontSize: '12px', color: soft, margin: '4px 0 0', lineHeight: 1.6 }}>
                the full details are in our{' '}
                <Link href="/footer-pages/returns" style={{ color: maroon, fontWeight: 600 }}>return &amp; exchange policy</Link>.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
