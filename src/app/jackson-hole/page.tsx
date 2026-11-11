import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JACKSON_HOLE, jh, type JhShot } from '@/lib/community';

export const metadata: Metadata = {
  title: 'jackson hole lookbook: the juniper pant',
  description:
    'The Tualmi Juniper Pant in Birch and Olive, photographed in Jackson Hole, Wyoming. Flare cargo hiking pants built for the trail, cute everywhere else.',
  alternates: { canonical: '/jackson-hole' },
};

type Color = 'Birch' | 'Olive';
const shop = (c: Color) => `/products/juniper-pant?color=${c}`;

/**
 * Two-person shots carry one colorway each, so a single link can't land on
 * "the color in the photo". These split at the gap between the two people:
 * the left side links to `left`, the right side to the other color. `at` is
 * the split as a % of the frame's width, eyeballed from the photo.
 */
const SPLIT: Record<number, { left: Color; at: number }> = {
  26:  { left: 'Birch', at: 50 },
  189: { left: 'Olive', at: 63 },
  207: { left: 'Olive', at: 42 },
  73:  { left: 'Birch', at: 45 },
  142: { left: 'Olive', at: 50 },
};

const other = (c: Color): Color => (c === 'Birch' ? 'Olive' : 'Birch');

// Already the hero photos on the homepage, collections and community pages —
// the lookbook skips them so it isn't a rerun of what the shopper just scrolled past.
// Filtered here rather than removed from JACKSON_HOLE, which also feeds the
// community grid.
const USED_AS_HERO = new Set([138, 146, 113, 129]);

function Shot({ s, sizes }: { s: JhShot; sizes: string }) {
  const frame = s.wide ? 'lb-img lb-img-wide' : 'lb-img';
  const img = <Image src={jh(s.n)} alt={s.alt} fill sizes={sizes} style={{ objectFit: 'cover' }} />;
  const split = s.color === 'both' ? SPLIT[s.n] : undefined;

  if (split) {
    const right = other(split.left);
    return (
      <figure className="lb-shot">
        <div className={frame}>
          {img}
          <Link href={shop(split.left)} className="lb-hit" style={{ left: 0, width: `${split.at}%` }} aria-label={`Shop the ${split.left} Juniper Pant`} />
          <Link href={shop(right)} className="lb-hit" style={{ right: 0, width: `${100 - split.at}%` }} aria-label={`Shop the ${right} Juniper Pant`} />
        </div>
      </figure>
    );
  }

  return (
    <figure className="lb-shot">
      <Link href={s.color === 'both' ? '/products/juniper-pant' : shop(s.color)} className={frame}>
        {img}
      </Link>
    </figure>
  );
}

export default function JacksonHolePage() {
  const blocks: JhShot[][] = [];
  let pair: JhShot[] = [];
  for (const s of JACKSON_HOLE.filter((s) => !USED_AS_HERO.has(s.n))) {
    if (s.wide) {
      if (pair.length) blocks.push(pair);
      pair = [];
      blocks.push([s]);
    } else {
      pair.push(s);
      if (pair.length === 2) {
        blocks.push(pair);
        pair = [];
      }
    }
  }
  if (pair.length) blocks.push(pair);

  return (
    <div className="lb-wrap header-clear">
      <header className="lb-head">
        <p className="tl-eyebrow">the lookbook</p>
        <h1 className="tl-display">jackson hole</h1>
        <p className="lb-sub">the juniper pant, in birch and olive. built for the trail, cute everywhere else.</p>
        {/* One product, two colorways — the shop links live here once rather
            than under every photo. Photos still click through to their color. */}
        <div className="lb-shop">
          <Link href="/products/juniper-pant?color=Birch" className="tl-btn tl-btn-solid">shop birch</Link>
          <Link href="/products/juniper-pant?color=Olive" className="tl-btn tl-btn-solid">shop olive</Link>
        </div>
      </header>
      {blocks.map((b) => (
        <div key={b[0].n} className={b.length === 2 ? 'lb-pair' : 'lb-single'}>
          {b.map((s) => (
            <Shot key={s.n} s={s} sizes={b.length === 2 ? '(max-width: 768px) 50vw, 45vw' : '100vw'} />
          ))}
        </div>
      ))}
      <div className="lb-foot">
        <Link href="/products/juniper-pant" className="tl-btn tl-btn-solid">shop the juniper</Link>
      </div>
    </div>
  );
}
