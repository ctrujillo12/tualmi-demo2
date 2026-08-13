'use client';

import { useState } from 'react';

/**
 * Share a product.
 *
 * Uses the Web Share API where it exists — on iOS and Android that opens the
 * native sheet, so iMessage, Instagram DMs and WhatsApp all come for free and
 * render the page's Open Graph card. Desktop browsers mostly don't support it,
 * so those fall back to copying the link.
 *
 * The URL carries the selected colourway, so whoever opens it lands on the
 * same photo the sender was looking at.
 */
export default function ShareButton({
  productName,
  color,
  price,
}: {
  productName: string;
  color: string;
  price: number;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const share = async () => {
    const url =
      typeof window === 'undefined'
        ? ''
        : `${window.location.origin}${window.location.pathname}?color=${encodeURIComponent(color)}`;

    const shareData = {
      title: `${productName} — Tualmi`,
      // Kept short: iMessage and WhatsApp show the OG card, so this text is
      // the sender's own message, not a description of the page.
      text: `${productName} from Tualmi — $${(price / 100).toFixed(2)}`,
      url,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setState('copied');
      window.setTimeout(() => setState('idle'), 2200);
    } catch (err) {
      // A user dismissing the native sheet throws AbortError — not a failure.
      if (err instanceof Error && err.name === 'AbortError') return;
      setState('error');
      window.setTimeout(() => setState('idle'), 2600);
    }
  };

  return (
    <button onClick={share} className="pdp-share" aria-label={`Share ${productName}`}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 15V3" />
        <path d="m8 7 4-4 4 4" />
        <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      </svg>
      <span>{state === 'copied' ? 'link copied ✦' : state === 'error' ? 'try again' : 'share'}</span>
    </button>
  );
}
