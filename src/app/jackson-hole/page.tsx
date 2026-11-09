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

const href = (s: JhShot) =>
  `/products/juniper-pant${s.color === 'both' ? '' : `?color=${s.color}`}`;
const label = (s: JhShot) => (s.color === 'both' ? 'birch + olive' : s.color.toLowerCase());

function Shot({ s, sizes }: { s: JhShot; sizes: string }) {
  return (
    <figure className="lb-shot">
      <Link href={href(s)} className={s.wide ? 'lb-img lb-img-wide' : 'lb-img'}>
        <Image src={jh(s.n)} alt={s.alt} fill sizes={sizes} style={{ objectFit: 'cover' }} />
      </Link>
      <figcaption>
        <span>{label(s)}</span>
        <Link href={href(s)}>shop the juniper</Link>
      </figcaption>
    </figure>
  );
}

export default function JacksonHolePage() {
  const blocks: JhShot[][] = [];
  let pair: JhShot[] = [];
  for (const s of JACKSON_HOLE) {
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
        <Link href="/products/juniper-pant" className="tl-btn tl-btn-solid">shop the juniper</Link>
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
