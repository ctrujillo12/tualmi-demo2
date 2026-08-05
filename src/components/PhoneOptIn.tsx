'use client';

import { useState } from 'react';

const sans = 'var(--font-montserrat), system-ui, sans-serif';

/**
 * Post-email phone capture.
 *
 * This component is only ever rendered AFTER the email has already been sent to
 * Klaviyo, so email conversion is never gated on the phone ask. Skipping is a
 * first-class action, not a hidden link.
 *
 * TCPA: SMS marketing consent must be express, written, and separate from the
 * email opt-in. The checkbox below is unchecked by default and the submit button
 * stays disabled until it's ticked — do not "helpfully" pre-check it.
 */

export type PhoneOptInTheme = {
  text: string;        // primary text
  muted: string;       // subcopy + fine print
  accent: string;      // borders, checkmark fill
  fieldBg: string;     // input background
  btnBg: string;       // submit button background
  btnText: string;     // submit button label
  shadow?: string;     // optional text-shadow for photo backgrounds
};

export const PHONE_THEMES: Record<'dark' | 'blush' | 'pink', PhoneOptInTheme> = {
  // Footer — sits on a dark photo background
  dark: {
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.78)',
    accent: 'rgba(255,255,255,0.85)',
    fieldBg: 'rgba(255,255,255,0.08)',
    btnBg: '#ffffff',
    btnText: '#A9445C',
    shadow: '0 1px 4px rgba(0,0,0,0.4)',
  },
  // /invite — blush landing page
  blush: {
    text: '#A9445C',
    muted: '#C9849A',
    accent: '#A9445C',
    fieldBg: '#ffffff',
    btnBg: '#A9445C',
    btnText: '#ffffff',
  },
  // Welcome popup — pink card
  pink: {
    text: '#3B2F1E',
    muted: '#7A6A4A',
    accent: 'rgba(59,47,30,0.45)',
    fieldBg: 'rgba(255,255,255,0.6)',
    btnBg: '#3B2F1E',
    btnText: '#FAFAF7',
  },
};

/** (555) 123-4567 as they type — never blocks input, just formats. */
function formatUSPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

type Props = {
  /** The email already captured — sent again so Klaviyo merges into one profile. */
  email: string;
  /** Which form this came from, for Klaviyo attribution. */
  source?: string;
  theme: PhoneOptInTheme;
  /** Rendered once the user either adds a number or skips. */
  onDone: (result: { joinedSms: boolean }) => void;
  /** Override the default headline if a surface needs different framing. */
  headline?: string;
  subcopy?: string;
  /** Lowercase styling matches /invite + footer; popup uses sentence case. */
  lowercase?: boolean;
};

export default function PhoneOptIn({
  email,
  source,
  theme,
  onDone,
  headline = 'want it before everyone else?',
  subcopy = 'we text the drop link 24 hours before it goes out by email. that’s the only reason we’d text you.',
  lowercase = true,
}: Props) {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const digits = phone.replace(/\D/g, '');
  const validPhone = digits.length === 10;
  const canSubmit = validPhone && consent && status !== 'loading';

  const caseStyle = lowercase ? ('lowercase' as const) : ('none' as const);

  async function submit() {
    if (!canSubmit) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, smsConsent: true, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error || 'that number didn’t go through — mind checking it?');
        setStatus('error');
        return;
      }
      onDone({ joinedSms: true });
    } catch {
      setErrMsg('something went wrong — please try again.');
      setStatus('error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
      <p
        style={{
          fontFamily: sans,
          fontSize: '15px',
          fontWeight: 700,
          color: theme.text,
          margin: 0,
          textTransform: caseStyle,
          textShadow: theme.shadow,
        }}
      >
        {headline}
      </p>

      <p
        style={{
          fontFamily: sans,
          fontSize: '13px',
          fontWeight: 500,
          lineHeight: 1.6,
          color: theme.muted,
          margin: 0,
          textTransform: caseStyle,
          textShadow: theme.shadow,
        }}
      >
        {subcopy}
      </p>

      {/* Phone field */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1.5px solid ${theme.accent}`,
          borderRadius: '100px',
          overflow: 'hidden',
          backgroundColor: theme.fieldBg,
        }}
      >
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(formatUSPhone(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          aria-label="Phone number"
          style={{
            flex: 1,
            minWidth: 0,
            padding: '12px 22px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: sans,
            fontSize: '14px',
            fontWeight: 500,
            color: theme.text,
          }}
        />
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            padding: '9px 22px',
            margin: '4px',
            backgroundColor: theme.btnBg,
            color: theme.btnText,
            border: 'none',
            borderRadius: '100px',
            fontFamily: sans,
            fontSize: '13px',
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'default',
            opacity: canSubmit ? 1 : 0.45,
            textTransform: caseStyle,
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s',
          }}
        >
          {status === 'loading' ? '…' : lowercase ? 'text me' : 'Text Me'}
        </button>
      </div>

      {/* Express written consent — unchecked by default, required to submit */}
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '9px',
          cursor: 'pointer',
          fontFamily: sans,
          fontSize: '10.5px',
          fontWeight: 400,
          lineHeight: 1.55,
          color: theme.muted,
          textShadow: theme.shadow,
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{
            marginTop: '2px',
            width: '15px',
            height: '15px',
            flexShrink: 0,
            accentColor: theme.btnBg,
            cursor: 'pointer',
          }}
        />
        <span>
          Yes, text me. I agree to receive recurring marketing texts from Tualmi at
          the number provided, including messages sent by autodialer. Consent is not
          a condition of purchase. Msg &amp; data rates may apply. Reply STOP to
          cancel, HELP for help.{' '}
          <a
            href="/footer-pages/privacy"
            style={{ color: theme.muted, textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
        </span>
      </label>

      {status === 'error' && (
        <p style={{ fontFamily: sans, fontSize: '12px', color: theme.text, margin: 0, opacity: 0.9 }}>
          {errMsg}
        </p>
      )}

      {/* Skip is a real, visible option — not buried */}
      <button
        onClick={() => onDone({ joinedSms: false })}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          padding: 0,
          fontFamily: sans,
          fontSize: '11.5px',
          fontWeight: 500,
          color: theme.muted,
          cursor: 'pointer',
          textDecoration: 'underline',
          textTransform: caseStyle,
          textShadow: theme.shadow,
        }}
      >
        {lowercase ? 'no thanks, email is fine' : 'No thanks, email is fine'}
      </button>
    </div>
  );
}
