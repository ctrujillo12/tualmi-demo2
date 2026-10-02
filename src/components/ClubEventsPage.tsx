'use client';

import { useState } from 'react';
import Image from 'next/image';
import PhoneOptIn, { type PhoneOptInTheme } from '@/components/PhoneOptIn';
import ImageLightbox from '@/components/ImageLightbox';
import { getAttribution } from '@/lib/attribution';
import { getReferralCode } from '@/lib/referralClient';
import { WELCOME_CODE, saveWelcomeCode } from '@/lib/discount';
import { UPCOMING_EVENTS, PAST_EVENTS, type ClubEvent } from '@/lib/events';

/**
 * /invite - the Trailblazing Club page.
 *
 * It used to be a bare newsletter signup. The ask is now "come to the next
 * event": the upcoming event leads (RSVP form), the past events prove the club
 * is real (photo galleries), and the original email signup lives at the bottom
 * (#join) for people who just want the 10% off. Content comes from
 * lib/events.ts - edit that file, not this one, to change events.
 *
 * The welcome popup stays suppressed here (see WelcomePopup SUPPRESSED): this
 * page is itself two signup forms.
 */

// Landing-page palette (see app/page.tsx). The old /invite ran on the sageDeep
// and blush set, which read as "too pink" next to the rest of the site.
const sans     = 'var(--font-montserrat), system-ui, sans-serif';
const sage     = '#7C8252';  // buttons, badges
const sageDeep = '#5F6742';  // headings, borders on light grounds
const cream    = '#F7F2E4';  // page ground
const ink      = '#5F5C46';  // body copy
const rose     = '#C97C93';  // eyebrows only
const brick    = '#A9503A';  // links, errors
const card     = '#FFFDF7';
const line     = 'rgba(95, 103, 66, 0.22)';

// Sits on the white form panels, so it follows the landing page instead of the
// blush preset in PHONE_THEMES.
const SAGE_PHONE_THEME: PhoneOptInTheme = {
  text: sageDeep, muted: ink, accent: sageDeep, fieldBg: '#ffffff', btnBg: sage, btnText: '#ffffff',
};

const gutter = 'clamp(24px, 6vw, 72px)';

// ─── Small shared pieces ──────────────────────────────────────────────────────

const eyebrow: React.CSSProperties = {
  fontFamily: sans, fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em',
  color: rose, margin: '0 0 14px', textTransform: 'lowercase',
};

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '14px 22px',
  border: `1.5px solid ${sageDeep}`, borderRadius: '100px', outline: 'none',
  background: '#fff', fontFamily: sans, fontSize: '16px', fontWeight: 500, color: sageDeep,
};

const primaryBtn = (active: boolean): React.CSSProperties => ({
  width: '100%', padding: '15px 26px', border: 'none', borderRadius: '100px',
  background: sage, color: '#fff', fontFamily: sans, fontSize: '15px', fontWeight: 700,
  textTransform: 'lowercase', cursor: active ? 'pointer' : 'default',
  opacity: active ? 1 : 0.55,
});

/** Stand-in shown until an event has photos. Deliberately quiet, not broken-looking. */
function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '16px',
        background: 'linear-gradient(135deg, #DEDDC0 0%, #F7F2E4 100%)',
        fontFamily: sans, fontWeight: 600, fontSize: '13px', letterSpacing: '0.06em',
        color: sageDeep, textTransform: 'lowercase',
      }}
    >
      {label} ✦
    </div>
  );
}

function EventMeta({ event }: { event: ClubEvent }) {
  return (
    <p style={{ ...eyebrow, margin: '0 0 8px', fontSize: '12px' }}>
      {event.dateLabel} <span aria-hidden="true">|</span> {event.location}
    </p>
  );
}

// ─── RSVP (upcoming events) ───────────────────────────────────────────────────

type RsvpStep = 'form' | 'loading' | 'done' | 'error';

/** (555) 123-4567 as they type. Same formatting as PhoneOptIn. */
function formatUSPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** The event's Google Form link with the person's name and email pre-filled. */
function detailsFormUrl(event: ClubEvent, name: string, email: string): string | null {
  const f = event.detailsForm;
  if (!f || !f.url) return null;
  try {
    const u = new URL(f.url);
    u.searchParams.set('usp', 'pp_url');
    if (f.nameEntry && name)   u.searchParams.set(`entry.${f.nameEntry}`, name);
    if (f.emailEntry && email) u.searchParams.set(`entry.${f.emailEntry}`, email);
    return u.toString();
  } catch {
    return null; // A malformed link should hide the button, not break the page.
  }
}

// Ids are stored with the signup and checked again server-side
// (api/subscribe/route.ts), so change them in both places or not at all.
const RIDE_OPTIONS = [
  { id: 'need_ride', label: 'yes, I need a ride' },
  { id: 'own_ride',  label: 'no, I’ve got a way' },
];

const CAMERA_OPTIONS = [
  { id: 'has_camera',      label: 'yes, I’ve got one' },
  { id: 'need_disposable', label: 'no, I need a disposable' },
];

/** A question with tappable pill answers (pick one). */
function ChoiceQuestion({
  legend, hint, options, selected, onPick,
}: {
  legend: string;
  hint?: string;
  options: { id: string; label: string }[];
  selected: string;
  onPick: (id: string) => void;
}) {
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ fontFamily: sans, fontWeight: 700, fontSize: '13px', color: sageDeep, padding: 0, marginBottom: '6px', lineHeight: 1.45, textTransform: 'lowercase' }}>
        {legend}
        {hint && <span style={{ fontWeight: 500, color: ink, textTransform: 'none' }}> {hint}</span>}
      </legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {options.map((o) => {
          const on = selected === o.id;
          return (
            <label
              key={o.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                padding: '6px 12px', borderRadius: '100px', fontFamily: sans, fontSize: '12.5px',
                fontWeight: 600, color: sageDeep, lineHeight: 1.3,
                border: `1.5px solid ${sageDeep}`,
                background: on ? 'rgba(124, 130, 82, 0.18)' : '#fff',
              }}
            >
              <input
                type="radio" name={legend} checked={on}
                onChange={() => onPick(o.id)}
                style={{ width: '13px', height: '13px', margin: 0, accentColor: sage, cursor: 'pointer' }}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function RsvpForm({ event }: { event: ClubEvent }) {
  const [step, setStep]         = useState<RsvpStep>('form');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [consent, setConsent]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [texting, setTexting]   = useState(false);
  const [instagram, setInstagram] = useState('');
  const [ride, setRide]         = useState('');
  const [camera, setCamera]     = useState('');

  // Which extra questions this event asks (see rsvpQuestions in lib/events.ts).
  const q = event.rsvpQuestions ?? {};

  const phoneDigits = phone.replace(/\D/g, '');
  // Ticking the box without a full number would silently drop the texts, so
  // that combination is the only one that blocks the button.
  // The consent box only appears once they start typing a number, so a ticked
  // box with an emptied field must not count (it would block the button invisibly).
  const showConsent = phoneDigits.length > 0;
  const consentOn = showConsent && consent;
  const phoneOk = !consentOn || phoneDigits.length === 10;
  const valid =
    name.trim().length > 0 && email.includes('@') && phoneOk &&
    (!q.ride || ride !== '') &&
    (!q.camera || camera !== '');

  async function submit() {
    if (!valid) return;
    setStep('loading');
    setErrorMsg('');
    const sendSms = consentOn && phoneDigits.length === 10;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name.trim(),
          event: event.id,
          source: 'event-rsvp',
          // The server ignores the number unless smsConsent is true.
          ...(sendSms ? { phone, smsConsent: true } : {}),
          // Extra interest-form answers. Only what this event asks for.
          rsvp: {
            ...(q.ride ? { ride } : {}),
            ...(q.camera ? { camera } : {}),
            ...(q.instagram && instagram.trim() ? { instagram: instagram.trim() } : {}),
          },
          attribution: getAttribution(),
          ref: getReferralCode(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'something went wrong.');
        setStep('error');
        return;
      }
      // An RSVP is also a club signup, so the welcome offer is theirs too.
      saveWelcomeCode();
      setTexting(sendSms);
      setStep('done');
    } catch {
      setErrorMsg('something went wrong, please try again.');
      setStep('error');
    }
  }

  if (event.rsvpOpen === false) {
    return (
      <a
        href="#join"
        style={{ ...primaryBtn(true), display: 'block', boxSizing: 'border-box', textAlign: 'center', textDecoration: 'none' }}
      >
        details coming soon. join the club to hear first
      </a>
    );
  }

  if (step === 'done') {
    const formUrl = detailsFormUrl(event, name.trim(), email);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: sageDeep, margin: 0, lineHeight: 1.8, textTransform: 'lowercase' }}>
          you&apos;re on the interest list ✦ we&apos;ll email {email} with the details and a few quick follow-up questions
          {texting ? ' and text you the day before' : ''}. and here&apos;s 10% off your first order:{' '}
          <span style={{ letterSpacing: '0.1em' }}>{WELCOME_CODE}</span>
        </p>
        {formUrl && (
          <div>
            <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: ink, margin: '0 0 10px', lineHeight: 1.7 }}>
              One more step: age, an emergency contact, food and anything else we should plan for.
            </p>
            <a
              href={formUrl} target="_blank" rel="noopener noreferrer"
              style={{ ...primaryBtn(true), display: 'block', boxSizing: 'border-box', textAlign: 'center', textDecoration: 'none' }}
            >
              finish your rsvp
            </a>
          </div>
        )}
      </div>
    );
  }

  const busy = step === 'loading';
  const small: React.CSSProperties = { fontFamily: sans, fontSize: '12px', fontWeight: 500, color: brick, margin: 0 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div className="event-form-grid">
        <input
          type="text" placeholder="first name" autoComplete="given-name"
          value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle}
          aria-label="first name"
        />
        <input
          type="email" placeholder="your email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle}
          aria-label="your email"
        />
        {q.instagram && (
          <input
            type="text" placeholder="instagram @ (optional)" autoComplete="off" autoCapitalize="none"
            value={instagram} onChange={(e) => setInstagram(e.target.value)} style={fieldStyle}
            aria-label="instagram handle, optional"
          />
        )}
        <input
          type="tel" inputMode="numeric" placeholder="phone (optional, for event texts)" autoComplete="tel-national"
          value={phone} onChange={(e) => setPhone(formatUSPhone(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && submit()} style={fieldStyle}
          aria-label="phone number, optional"
        />
        {q.ride && (
          <ChoiceQuestion
            legend="do you need transportation?"
            hint="we can help with rides from LA."
            options={RIDE_OPTIONS} selected={ride} onPick={setRide}
          />
        )}
        {q.camera && (
          <ChoiceQuestion
            legend="do you have a camera to bring? 📸"
            hint="let us know if you need a disposable!"
            options={CAMERA_OPTIONS} selected={camera} onPick={setCamera}
          />
        )}
      </div>

      {/* Express written consent for texts: unchecked by default, and the
          number is only sent to the server when it is ticked. Do not pre-check.
          Shown as soon as a number is being typed, which is before they can submit. */}
      {showConsent && (
        <label
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: 'pointer',
            fontFamily: sans, fontSize: '11px', fontWeight: 400, lineHeight: 1.6, color: ink,
          }}
        >
          <input
            type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
            style={{ marginTop: '2px', width: '15px', height: '15px', flexShrink: 0, accentColor: sage, cursor: 'pointer' }}
          />
          <span>
            Yes, text me. I agree to receive recurring texts from Tualmi at the number provided, including
            event reminders and marketing messages sent by autodialer. Consent is not a condition of
            RSVPing or of any purchase. Msg &amp; data rates may apply. Reply STOP to cancel, HELP for help.{' '}
            <a href="/footer-pages/privacy" style={{ color: ink, textDecoration: 'underline' }}>Privacy Policy</a>
          </span>
        </label>
      )}

      <button onClick={submit} disabled={!valid || busy} style={{ ...primaryBtn(valid && !busy), padding: '13px 26px' }}>
        {busy ? 'saving your spot…' : step === 'error' ? 'try again' : q.ride || q.camera ? 'i’m interested' : 'save my spot'}
      </button>
      {consentOn && !phoneOk && (
        <p style={small}>add a full 10-digit number, or untick the box to RSVP without texts.</p>
      )}
      {step === 'error' && <p style={small}>{errorMsg}</p>}
      <p style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: ink, margin: 0, lineHeight: 1.6 }}>
        free. also joins the club emails, so you get 10% off your first order. unsubscribe any time.
      </p>
    </div>
  );
}

// ─── Upcoming event: a full feature card, questions in a pop-up ───────────────

const labelStyle: React.CSSProperties = {
  fontFamily: sans, fontWeight: 700, fontSize: '12px', letterSpacing: '0.12em',
  color: rose, margin: '0 0 10px', textTransform: 'lowercase',
};

/** Label/value rows (when, the hike...) plus the trail link, for the upcoming event. */
function DetailRows({ event }: { event: ClubEvent }) {
  const details = event.details ?? [];
  if (details.length === 0 && !event.trail) return null;
  const size = '14px';
  const dt: React.CSSProperties = { fontFamily: sans, fontWeight: 700, fontSize: size, color: sageDeep, textTransform: 'lowercase' };
  const dd: React.CSSProperties = { fontFamily: sans, fontWeight: 500, fontSize: size, lineHeight: 1.6, color: ink, margin: 0 };
  return (
    <dl className="event-details" style={{ margin: 0 }}>
      {details.map((d) => (
        <div key={d.label} style={{ display: 'contents' }}>
          <dt style={dt}>{d.label}</dt>
          <dd style={dd}>{d.text}</dd>
        </div>
      ))}
      {event.trail && (
        <div style={{ display: 'contents' }}>
          <dt style={dt}>{details.length > 0 ? 'link' : 'the trail'}</dt>
          <dd style={dd}>
            <a href={event.trail.url} target="_blank" rel="noopener noreferrer" style={{ color: brick, fontWeight: 700, textUnderlineOffset: '3px' }}>
              {event.trail.label} →
            </a>
          </dd>
        </div>
      )}
    </dl>
  );
}

function UpcomingCard({ event }: { event: ClubEvent }) {
  const cover = event.photos[0];
  const open = event.rsvpOpen !== false;
  // Same card, same photo: "register" swaps the right-hand side to the form.
  const [registering, setRegistering] = useState(false);
  const details = event.details ?? [];
  return (
    <article className="event-feature" style={{ background: card, border: `1px solid ${line}`, boxShadow: '0 18px 50px rgba(95,103,66,0.10)' }}>
      <div className="event-feature-photo" style={{ background: cream }}>
        {cover ? (
          <Image src={cover} alt={event.title} fill priority sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
        ) : (
          <PhotoPlaceholder label="see you outside" />
        )}
      </div>

      {registering ? (
        <div style={{ padding: 'clamp(24px, 4.5vw, 52px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 2.2vw, 22px)', justifyContent: 'center' }}>
          <button
            type="button" onClick={() => setRegistering(false)}
            style={{
              alignSelf: 'flex-start', border: 'none', background: 'none', padding: '4px 0', cursor: 'pointer',
              fontFamily: sans, fontWeight: 700, fontSize: '14px', color: brick, textTransform: 'lowercase',
            }}
          >
            ← back to details
          </button>
          <div>
            <p style={{ ...eyebrow, margin: '0 0 10px', fontSize: '13px' }}>
              {event.dateLabel} <span aria-hidden="true">|</span> {event.location}
            </p>
            <h2
              style={{
                fontFamily: sans, fontWeight: 700, fontSize: 'clamp(26px, 3.4vw, 36px)',
                letterSpacing: '-0.025em', lineHeight: 1.1, color: sageDeep, margin: '0 0 10px', textTransform: 'lowercase',
              }}
            >
              {event.title}
            </h2>
            <p style={{ fontFamily: sans, fontWeight: 500, fontSize: '15px', lineHeight: 1.8, color: ink, margin: 0 }}>
              Tell us you&apos;re interested and we&apos;ll follow up with the details.
            </p>
          </div>
          <RsvpForm event={event} />
        </div>
      ) : (
      <div style={{ padding: 'clamp(24px, 4.5vw, 52px)', display: 'flex', flexDirection: 'column', gap: 'clamp(18px, 2.4vw, 26px)' }}>
        <div>
          <p style={{ ...eyebrow, margin: '0 0 10px', fontSize: '13px' }}>
            <span style={{ color: brick }}>next up</span> <span aria-hidden="true">|</span> {event.dateLabel}{' '}
            <span aria-hidden="true">|</span> {event.location}
          </p>
          <h2
            style={{
              fontFamily: sans, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)',
              letterSpacing: '-0.025em', lineHeight: 1.1, color: sageDeep, margin: 0, textTransform: 'lowercase',
            }}
          >
            {event.title}
          </h2>
        </div>

        <p style={{ fontFamily: sans, fontWeight: 500, fontSize: 'clamp(15px, 1.5vw, 17px)', lineHeight: 1.85, color: ink, margin: 0 }}>
          {event.blurb}
        </p>

        {event.callout && (
          <p
            style={{
              fontFamily: sans, fontWeight: 600, fontSize: '15px', lineHeight: 1.7, color: sageDeep,
              margin: 0, padding: '14px 18px', background: 'rgba(124, 130, 82, 0.14)', border: `1.5px solid ${sageDeep}`,
            }}
          >
            📸 {event.callout}
          </p>
        )}

        {(details.length > 0 || event.trail) && (
          <div>
            <p style={labelStyle}>the details</p>
            <DetailRows event={event} />
          </div>
        )}

        <div>
          {open ? (
            <button type="button" onClick={() => setRegistering(true)} style={{ ...primaryBtn(true), padding: '16px 28px', fontSize: '16px' }}>
              register →
            </button>
          ) : (
            <a
              href="#join"
              style={{ ...primaryBtn(true), display: 'block', boxSizing: 'border-box', textAlign: 'center', textDecoration: 'none', padding: '16px 28px', fontSize: '16px' }}
            >
              details soon. join the club to hear first →
            </a>
          )}
        </div>
      </div>
      )}
    </article>
  );
}

// ─── Past events ──────────────────────────────────────────────────────────────

function PastCard({ event, onOpen }: { event: ClubEvent; onOpen: (index: number) => void }) {
  const cover = event.photos[0];
  const hasPhotos = event.photos.length > 0;
  return (
    <article
      style={{ background: card, borderRadius: 0, overflow: 'hidden', border: `1px solid ${line}`, display: 'flex', flexDirection: 'column' }}
    >
      <button
        type="button"
        onClick={() => hasPhotos && onOpen(0)}
        disabled={!hasPhotos}
        aria-label={hasPhotos ? `open photos from ${event.title}` : undefined}
        style={{
          position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 5',
          border: 'none', padding: 0, background: cream, cursor: hasPhotos ? 'pointer' : 'default',
        }}
      >
        {cover ? (
          <Image src={cover} alt={event.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
        ) : (
          <PhotoPlaceholder label="photos coming soon" />
        )}
        <span
          style={{
            position: 'absolute', top: '14px', left: '14px', fontFamily: sans, fontWeight: 700,
            fontSize: '11px', letterSpacing: '0.08em', textTransform: 'lowercase',
            color: sageDeep, background: 'rgba(255,253,247,0.94)', borderRadius: 0, padding: '5px 12px',
          }}
        >
          past event
        </span>
        {event.photos.length > 1 && (
          <span
            style={{
              position: 'absolute', bottom: '14px', right: '14px', fontFamily: sans, fontWeight: 600,
              fontSize: '11px', color: '#fff', background: 'rgba(59,47,30,0.62)', borderRadius: 0, padding: '5px 12px',
            }}
          >
            {event.photos.length} photos
          </span>
        )}
      </button>

      <div style={{ padding: '20px 22px 24px' }}>
        <EventMeta event={event} />
        <h3
          style={{
            fontFamily: sans, fontWeight: 700, fontSize: '20px', letterSpacing: '-0.01em',
            lineHeight: 1.25, color: sageDeep, margin: '0 0 8px', textTransform: 'lowercase',
          }}
        >
          {event.title}
        </h3>
        <p style={{ fontFamily: sans, fontWeight: 500, fontSize: '14px', lineHeight: 1.8, color: ink, margin: 0 }}>
          {event.recap || event.blurb}
        </p>
      </div>
    </article>
  );
}

// ─── The original email signup, kept for people who just want the perk ──────

type JoinStep = 'email' | 'loading' | 'phone' | 'success' | 'error';

function JoinForm() {
  const [step, setStep]         = useState<JoinStep>('email');
  const [email, setEmail]       = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [joinedSms, setJoinedSms] = useState(false);
  const validEmail = email.includes('@');

  async function submit() {
    if (!validEmail) return;
    setStep('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'invite', attribution: getAttribution(), ref: getReferralCode() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'something went wrong.');
        setStep('error');
      } else {
        saveWelcomeCode();
        setStep('phone');
      }
    } catch {
      setErrorMsg('something went wrong, please try again.');
      setStep('error');
    }
  }

  if (step === 'phone') {
    return (
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 700, color: sageDeep, margin: '0 0 22px', textTransform: 'lowercase' }}>
          you&apos;re in ✦
        </p>
        <PhoneOptIn
          email={email}
          source="invite"
          theme={SAGE_PHONE_THEME}
          onDone={({ joinedSms: j }) => { setJoinedSms(j); setStep('success'); }}
        />
      </div>
    );
  }
  if (step === 'success') {
    return (
      <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: sageDeep, margin: 0, textTransform: 'lowercase' }}>
        you’re in ✦ 10% off your first order with code{' '}
        <span style={{ letterSpacing: '0.1em' }}>{WELCOME_CODE}</span>
        {joinedSms ? '. you’ll get the drop link by text first.' : '. it’s in your inbox too.'}
      </p>
    );
  }
  if (step === 'loading') {
    return <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: ink, margin: 0, textTransform: 'lowercase' }}>joining…</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', width: '100%', maxWidth: '460px',
          border: `1.5px solid ${sageDeep}`, borderRadius: '100px', overflow: 'hidden', background: '#fff',
        }}
      >
        <input
          type="email" placeholder="your email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
          aria-label="your email"
          style={{ flex: 1, minWidth: 0, padding: '13px 22px', border: 'none', outline: 'none', background: 'transparent', fontFamily: sans, fontSize: '14px', fontWeight: 500, color: sageDeep }}
        />
        <button
          onClick={submit} disabled={!validEmail}
          style={{ padding: '13px 26px', background: 'none', border: 'none', fontFamily: sans, fontSize: '14px', fontWeight: 700, color: sageDeep, cursor: validEmail ? 'pointer' : 'default', opacity: validEmail ? 1 : 0.5, textTransform: 'lowercase', whiteSpace: 'nowrap' }}
        >
          {step === 'error' ? 'retry' : 'join'}
        </button>
      </div>
      {step === 'error' && (
        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: brick, margin: 0 }}>{errorMsg}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClubEventsPage() {
  const [lightbox, setLightbox] = useState<{ event: ClubEvent; index: number } | null>(null);

  const sectionGap = 'clamp(56px, 8vw, 96px)';
  const sectionHeading = (eyebrowText: string, title: string, id: string) => (
    <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
      <h2 id={id} style={{ ...eyebrow, margin: '0 0 10px' }}>{eyebrowText}</h2>
      <p
        style={{
          fontFamily: sans, fontWeight: 700, fontSize: 'clamp(24px, 3.4vw, 36px)',
          letterSpacing: '-0.02em', lineHeight: 1.15, color: sageDeep, margin: 0, textTransform: 'lowercase',
        }}
      >
        {title}
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: cream }}>
      <main
        style={{
          maxWidth: '1240px', margin: '0 auto',
          padding: `clamp(96px, 11vw, 132px) ${gutter} clamp(64px, 9vw, 110px)`,
        }}
      >
        {/* Intro */}
        <header style={{ maxWidth: '720px', margin: '0 auto clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
          <p style={eyebrow}>the trailblazing club</p>
          <h1
            style={{
              fontFamily: sans, fontWeight: 700, fontSize: 'clamp(32px, 5vw, 52px)',
              letterSpacing: '-0.03em', lineHeight: 1.1, color: sageDeep,
              margin: '0 0 clamp(14px, 2vw, 20px)', textTransform: 'lowercase',
            }}
          >
            upcoming events.
          </h1>
          <p style={{ fontFamily: sans, fontWeight: 500, fontSize: 'clamp(14px, 1.7vw, 17px)', lineHeight: 1.95, color: ink, margin: 0 }}>
            In-person hikes + events for girls who love being outside. Come solo or bring a friend, everyone&apos;s welcome!
          </p>
        </header>

        {/* Upcoming */}
        {UPCOMING_EVENTS.length > 0 && (
          <section aria-label="upcoming events">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 4vw, 40px)' }}>
              {UPCOMING_EVENTS.map((e) => <UpcomingCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* Past events */}
        {PAST_EVENTS.length > 0 && (
          <section aria-labelledby="past-heading" style={{ marginTop: sectionGap }}>
            {sectionHeading('where we’ve been', 'past events.', 'past-heading')}
            <div className="event-grid">
              {PAST_EVENTS.map((e) => (
                <PastCard key={e.id} event={e} onOpen={(index) => setLightbox({ event: e, index })} />
              ))}
            </div>
          </section>
        )}

        {/* Just here for the perk */}
        <section
          id="join"
          style={{ marginTop: sectionGap, maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', scrollMarginTop: '96px' }}
        >
          <p style={eyebrow}>can&apos;t make it?</p>
          <h2
            style={{
              fontFamily: sans, fontWeight: 700, fontSize: 'clamp(24px, 3.6vw, 38px)',
              letterSpacing: '-0.02em', lineHeight: 1.15, color: sageDeep, margin: '0 0 22px', textTransform: 'lowercase',
            }}
          >
            join the club anyway.
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 auto clamp(26px, 4vw, 36px)', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', maxWidth: '520px' }}>
            {[
              '10% off your first order, the second you join',
              'special perks, discounts + early access to new drops',
              'insider info and behind-the-scenes sneak peeks',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: sans, fontSize: 'clamp(14px, 1.6vw, 16px)', fontWeight: 500, color: ink, lineHeight: 1.8 }}>
                <span style={{ color: sageDeep, flexShrink: 0 }}>✦</span>{item}
              </li>
            ))}
          </ul>
          <JoinForm />
        </section>
      </main>

      {lightbox && (
        <ImageLightbox
          images={lightbox.event.photos}
          index={lightbox.index}
          alt={lightbox.event.title}
          onClose={() => setLightbox(null)}
          onIndexChange={(i) => setLightbox({ event: lightbox.event, index: i })}
        />
      )}
    </div>
  );
}
