'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { productLabel, type CommunityItem } from '@/lib/community';

function caption(item: CommunityItem) {
  return [item.credit, item.height, item.size && `wearing ${item.size}`, item.place]
    .filter(Boolean)
    .join(' · ');
}

function productLine(item: CommunityItem) {
  return [productLabel(item.handle), item.color?.toLowerCase()].filter(Boolean).join(' · ');
}

function shopHref(item: CommunityItem) {
  if (!item.handle) return '/collections';
  return `/products/${item.handle}${item.color ? `?color=${encodeURIComponent(item.color)}` : ''}`;
}

/** Plays only while on screen, so a row of clips doesn't eat a phone's data. */
function AutoVideo({ item }: { item: CommunityItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} src={item.src} poster={item.poster} muted loop playsInline preload="none" className="cm-media" />;
}

export default function CommunityRow({
  items,
  layout = 'row',
  filters = false,
}: {
  items: CommunityItem[];
  layout?: 'row' | 'grid';
  filters?: boolean;
}) {
  const [filter, setFilter] = useState<'all' | 'juniper-pant' | 'sierra-shorts'>('all');
  const [open, setOpen] = useState<number | null>(null);
  const shown = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.handle === filter)),
    [items, filter],
  );

  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)),
    [shown.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, step]);

  const active = open === null ? null : shown[open];

  return (
    <>
      {filters && (
        <div className="cm-filters" role="group" aria-label="Filter by product">
          {([['all', 'all'], ['juniper-pant', 'juniper pant'], ['sierra-shorts', 'sierra shorts']] as const).map(([v, label]) => (
            <button key={v} data-active={filter === v} onClick={() => setFilter(v)}>
              {label}
            </button>
          ))}
        </div>
      )}
      <div className={layout === 'row' ? 'cm-row' : 'cm-grid'}>
        {shown.map((item, i) => (
          <button key={item.id} className="cm-tile" onClick={() => setOpen(i)} aria-label={`Open: ${item.alt}`}>
            <span className="cm-frame">
              {item.type === 'video' ? (
                <AutoVideo item={item} />
              ) : (
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 62vw, 320px" className="cm-media" />
              )}
            </span>
            {(productLine(item) || caption(item)) && (
              <span className="cm-cap">{productLine(item) || caption(item)}</span>
            )}
          </button>
        ))}
      </div>

      {active && (
        <div className="cm-viewer" role="dialog" aria-modal="true" aria-label={active.alt} onClick={() => setOpen(null)}>
          <button className="cm-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
          {shown.length > 1 && (
            <>
              <button className="cm-nav cm-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous">‹</button>
              <button className="cm-nav cm-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next">›</button>
            </>
          )}
          <div className="cm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cm-sheet-media">
              {active.type === 'video' ? (
                <video key={active.id} src={active.src} poster={active.poster} controls autoPlay playsInline />
              ) : (
                <Image key={active.id} src={active.src} alt={active.alt} fill sizes="(max-width: 768px) 100vw, 60vw" style={{ objectFit: 'contain' }} />
              )}
            </div>
            <div className="cm-sheet-info">
              <div>
                {productLine(active) && <p className="cm-sheet-product">{productLine(active)}</p>}
                {caption(active) && <p className="cm-sheet-cap">{caption(active)}</p>}
                {active.gifted && <p className="cm-sheet-cap">gifted by Tualmi</p>}
                {active.externalUrl && (
                  <a className="cm-sheet-cap" href={active.externalUrl} target="_blank" rel="noopener noreferrer">watch on instagram</a>
                )}
              </div>
              <Link href={shopHref(active)} className="tl-btn tl-btn-solid">
                {active.handle ? 'shop this' : 'shop all'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
