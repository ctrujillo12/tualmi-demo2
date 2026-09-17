'use client';

/**
 * /share?ref=CODE — the page a subscriber lands on from the "share your link"
 * button in email.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────
 * The referral CTA in Klaviyo used to be a mailto: link. On a phone that
 * opens the mail app and works fine; in a desktop browser with no default
 * mail client — which is most people, since most people use webmail — the
 * click does nothing at all, with no error. A silent no-op on the one button
 * the whole referral programme depends on.
 *
 * So the button now points at an ordinary https link to this page, which
 * works in every email client. The page's only job is to hand the visitor
 * their own link in whatever form they'll actually use: copy, native share
 * sheet, text, or email.
 *
 * ── THE CODE COMES FROM THE URL ───────────────────────────────────────────
 * Klaviyo fills ?ref= in with {{ person.referral_code }} at send time, so the
 * code belongs to whoever opened the email. Nothing here mints or looks up a
 * code — this page is a presentation layer over a value that already exists
 * on the profile. If ?ref= is missing (someone shared this page's own URL, or
 * a profile somehow has no code), we show the plain /invite link instead of a
 * broken one: a friend arriving that way still gets their 10%, nobody gets
 * credited, and no one sees an error.
 */

import { useEffect, useState } from 'react';

const sans    = 'var(--font-montserrat), system-ui, sans-serif';
const maroon  = '#A9445C';
const blushBg = '#FBF1F5';
const soft    = '#C9849A';
const olive   = '#ADAE6C';

/** Same shape the signup route issues — see lib/referrals.ts. */
const CODE_RE = /^[A-Z0-9]{4,12}$/;

const SHARE_TEXT =
  "I've been wearing Tualmi — women's outdoor gear from a two-person company. " +
  'Join their list with my link and you get 10% off:';

export default function SharePage() {
  const [link, setLink]         = useState('https://tualmi.com/invite');
  const [personal, setPersonal] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Read the code client-side rather than with useSearchParams, which would
  // force this page into a Suspense boundary for no benefit.
  useEffect(() => {
    try {
      const raw = new URLSearchParams(window.location.search).get('ref');
      const code = raw?.trim().toUpperCase();
      if (code && CODE_RE.test(code)) {
        setLink(`https://tualmi.com/invite?ref=${code}`);
        setPersonal(true);
      }
    } catch {
      /* leave the fallback link in place */
    }
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Older browsers, and any context where the clipboard API is blocked.
      const el = document.createElement('textarea');
      el.value = link;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch { /* nothing else to try */ }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: 'Tualmi Outdoors', text: SHARE_TEXT, url: link });
    } catch {
      /* the visitor dismissed the sheet — not an error */
    }
  }

  const body = `${SHARE_TEXT} ${link}`;
  const mailto = `mailto:?subject=${encodeURIComponent("thought you'd like these")}&body=${encodeURIComponent(body)}`;
  // `?&body=` is the spelling both iOS and Android accept.
  const sms = `sms:?&body=${encodeURIComponent(body)}`;

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
      <main style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: sans, fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em',
            color: soft, margin: '0 0 18px', textTransform: 'lowercase',
          }}
        >
          give 10% off, get 10% off
        </p>

        <h1
          style={{
            fontFamily: sans, fontWeight: 700, fontSize: 'clamp(28px, 5vw, 46px)',
            letterSpacing: '-0.03em', lineHeight: 1.15, color: maroon,
            margin: '0 0 20px', textTransform: 'lowercase',
          }}
        >
          your link, ready to send.
        </h1>

        <p
          style={{
            fontFamily: sans, fontWeight: 500, fontSize: 'clamp(14px, 1.6vw, 16px)',
            lineHeight: 1.9, color: soft, margin: '0 0 28px',
          }}
        >
          {personal
            ? 'Send this to a friend. They get 10% off when they join the list, and your 10% code lands in your inbox right after.'
            : 'Share this with a friend and they get 10% off when they join the list. For your own link (the one that earns you 10% too), open the referral email we sent you.'}
        </p>

        {/* The link itself — selectable, so it works even if copy is blocked. */}
        <div
          style={{
            backgroundColor: '#ffffff', border: `1.5px solid ${maroon}`, borderRadius: '16px',
            padding: '18px 20px', margin: '0 0 16px', fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
            fontSize: '15px', color: '#3B2F1E', wordBreak: 'break-all', userSelect: 'all',
          }}
        >
          {link}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={copy}
            style={{
              fontFamily: sans, fontSize: '14px', fontWeight: 700, textTransform: 'lowercase',
              color: '#FFFCE9', backgroundColor: copied ? olive : maroon, border: 'none',
              borderRadius: '100px', padding: '13px 30px', cursor: 'pointer',
            }}
          >
            {copied ? 'copied ✦' : 'copy link'}
          </button>

          {canShare && (
            <button
              onClick={nativeShare}
              style={{
                fontFamily: sans, fontSize: '14px', fontWeight: 700, textTransform: 'lowercase',
                color: maroon, backgroundColor: 'transparent', border: `1.5px solid ${maroon}`,
                borderRadius: '100px', padding: '13px 30px', cursor: 'pointer',
              }}
            >
              share
            </button>
          )}

          <a
            href={sms}
            style={{
              fontFamily: sans, fontSize: '14px', fontWeight: 700, textTransform: 'lowercase',
              color: maroon, border: `1.5px solid ${maroon}`, borderRadius: '100px',
              padding: '13px 30px', textDecoration: 'none',
            }}
          >
            text it
          </a>

          <a
            href={mailto}
            style={{
              fontFamily: sans, fontSize: '14px', fontWeight: 700, textTransform: 'lowercase',
              color: maroon, border: `1.5px solid ${maroon}`, borderRadius: '100px',
              padding: '13px 30px', textDecoration: 'none',
            }}
          >
            email it
          </a>
        </div>

        <p
          style={{
            fontFamily: sans, fontSize: '12px', fontWeight: 500, lineHeight: 1.9,
            color: soft, margin: '28px 0 0',
          }}
        >
          You can earn a code for up to 5 friends. One code per order, so it&apos;s 10% off each
          time rather than a bigger discount on one.
        </p>
      </main>
    </div>
  );
}
