'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * Full-screen photo viewer for the product gallery.
 *
 * Mobile shoppers want to see fabric and fit up close before spending $68, and
 * a 2:3 tile on a phone doesn't allow that. Tapping any gallery photo opens
 * this; double-tap (or the zoom button) scales to 2x and the image can then be
 * dragged/scrolled around. Native pinch-zoom also works — the scroll container
 * sets `touch-action: pinch-zoom` rather than trapping gestures.
 *
 * Deliberately not a carousel library: arrows + a counter cover it, and the
 * page already ships enough JavaScript.
 */
export default function ImageLightbox({
  images,
  index,
  alt,
  onClose,
  onIndexChange,
}: {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);

  // Escape to close, arrows to move between photos.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndexChange((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onIndexChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, onIndexChange]);

  // Stop the page behind from scrolling while this is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Reset zoom whenever the photo changes.
  useEffect(() => {
    setZoomed(false);
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, left: 0 });
  }, [index]);

  /** Double-tap toggles zoom, centred on wherever the finger landed. */
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const isDouble = now - lastTapRef.current < 300;
    lastTapRef.current = now;
    if (!isDouble) return;

    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const next = !zoomed;
    setZoomed(next);

    // After the width changes, scroll so the tapped point stays put.
    requestAnimationFrame(() => {
      if (!next) return;
      el.scrollTo({
        left: px * (el.scrollWidth - el.clientWidth),
        top: py * (el.scrollHeight - el.clientHeight),
      });
    });
  };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <div
        ref={scrollRef}
        className={`lightbox-scroll${zoomed ? ' is-zoomed' : ''}`}
        onClick={handleTap}
      >
        <div className={`lightbox-figure${zoomed ? ' is-zoomed' : ''}`}>
          <Image
            src={images[index]}
            alt={alt}
            fill
            sizes={zoomed ? '200vw' : '100vw'}
            quality={90}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            className="lightbox-nav lightbox-nav--prev"
            onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            className="lightbox-nav lightbox-nav--next"
            onClick={() => onIndexChange((index + 1) % images.length)}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}

      <div className="lightbox-bar">
        <button
          className="lightbox-zoom"
          onClick={() => setZoomed((z) => !z)}
          aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
        >
          {zoomed ? 'zoom out −' : 'zoom in +'}
        </button>
        {images.length > 1 && (
          <span className="lightbox-count">
            {index + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
