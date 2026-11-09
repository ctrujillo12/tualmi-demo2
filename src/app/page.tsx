import type { Metadata } from 'next';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import CommunityRow from '@/components/CommunityRow';
import ShopCard from '@/components/ShopCard';
import { HOME_ROW, jh } from '@/lib/community';
import { getProduct } from '@/lib/products';
import { DROP_PRODUCTS } from '@/lib/dropProducts';
import { DEFAULT_OG } from '@/lib/og';

// Per-page, NOT in layout.tsx: a canonical set in the root layout is inherited
// by every page that doesn't override it (cart, share...) and would point them
// all at the homepage.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  // Spread, not just { url }: a page's openGraph REPLACES the layout's, so
  // setting only the url dropped the image and the link previewed bare.
  openGraph: { ...DEFAULT_OG, url: '/' },
};

// Structured data for the homepage: a list of what's for sale, by URL.
//
// This used to be a hand-typed Product block per item, with its own price and
// availability. That was a second, static source for numbers the product pages
// already derive live from Shopify, and it drifted (both bottoms sat at
// PreOrder here long after they shipped; Sierra in Picnic is on preorder now
// and this block still said InStock). Merchant Center suspends accounts for
// exactly that mismatch, and the account has already had one Misrepresentation
// rejection. Product markup also belongs on the product's own page, not on a
// page that lists several. So the homepage now points at the product pages
// and lets their ProductGroup markup be the single source of truth.
const SITE = 'https://www.tualmi.com';
const productsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Tualmi women’s hiking clothes',
  itemListElement: [
    { '@type': 'ListItem', position: 1, url: `${SITE}/products/juniper-pant`, name: 'Juniper Pant: women’s flare cargo hiking pants' },
    { '@type': 'ListItem', position: 2, url: `${SITE}/products/sierra-shorts`, name: 'Sierra Shorts: women’s recycled nylon hiking shorts' },
  ],
};

const INSTAGRAM_URL = 'https://www.instagram.com/tualmioutdoors';

// Real reviews from the product pages, quoted exactly.
const QUOTES = [
  { text: 'I wore these backpacking for the first time in the Inyo national forest and I felt so cute and confident the whole time!!', who: 'Emily F.', what: 'juniper pant' },
  { text: 'I feel equal parts stylish, feminine, and badass wearing them on my favorite trail.', who: 'Alex', what: 'juniper pant' },
  { text: 'Every time I wear them I have gotten at least 3 compliments from random strangers!', who: 'Katie D', what: 'sierra shorts' },
];

export default async function Home() {
  const [shortsProduct, pantProduct] = await Promise.all([
    getProduct('sierra-shorts').catch(() => null),
    getProduct('juniper-pant').catch(() => null),
  ]);
  const productFor = (handle: string) =>
    handle === 'sierra-shorts' ? shortsProduct : handle === 'juniper-pant' ? pantProduct : null;

  // Art-directed hero: a tall frame with open sky on phones, a wide one on desktop.
  const common = { alt: 'Two friends in Tualmi Juniper Pants under clouded peaks in Jackson Hole', fill: true, priority: true, sizes: '100vw', quality: 80 };
  const { props: { srcSet: wideSet } } = getImageProps({ ...common, src: jh(140) });
  const { props: { srcSet: tallSet, ...rest } } = getImageProps({ ...common, src: jh(138) });

  const lineup = DROP_PRODUCTS.flatMap((d) =>
    d.colorways.filter((c) => c.color !== 'Jam').map((c) => ({ d, c })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }}
      />

      <section className="tl-hero">
        <picture>
          <source media="(min-width: 768px)" srcSet={wideSet} sizes="100vw" />
          <source srcSet={tallSet} sizes="100vw" />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...rest} className="tl-hero-img" />
        </picture>
        <div className="tl-hero-copy">
          <h1 className="tl-display">gear for a new kind of outdoorsy.</h1>
          <div className="tl-hero-cta">
            <Link href="/products/juniper-pant" className="tl-btn tl-btn-light">shop the juniper pant</Link>
            <Link href="/collections" className="tl-link-light">shop all</Link>
          </div>
        </div>
      </section>

      <section id="collection" className="tl-section">
        <div className="tl-section-head">
          <h2 className="tl-h2">the lineup</h2>
          <Link href="/collections" className="tl-link">shop all colorways</Link>
        </div>
        <div className="tl-lineup">
          {lineup.map(({ d, c }) => (
            <ShopCard key={`${d.handle}-${c.color}`} drop={d} colorway={c} product={productFor(d.handle)} />
          ))}
        </div>
      </section>

      <Link href="/jackson-hole" className="tl-bleed" aria-label="See the Jackson Hole lookbook">
        <Image src={jh(189)} alt="Two friends at a ranch fence beside a horse, mountains behind" fill sizes="100vw" style={{ objectFit: 'cover' }} />
        <span className="tl-bleed-copy">
          <span className="tl-display">jackson hole</span>
          <span className="tl-bleed-link">see the lookbook</span>
        </span>
      </Link>

      <section className="tl-mission">
        <div className="tl-mission-photo">
          <Image src={jh(201)} alt="Legs up on a ranch fence in the Birch Juniper Pant and turquoise boots" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="tl-mission-copy">
          <h2 className="tl-display">you don&apos;t have to look, dress, or act a certain way to belong outside.</h2>
          <p>
            Tualmi makes technical outdoor gear designed for women from the start. Flattering fits,
            playful prints, and the performance to keep up with wherever you&apos;re headed.
          </p>
          <p>
            We make everything with a WRAP Gold Standard certified manufacturer, sustainably,
            ethically, and designed to last because we&apos;re not interested in adding to the pile.
          </p>
          <Link href="/story" className="tl-link">read our full story</Link>
        </div>
      </section>

      <section className="tl-quotes" aria-label="Customer reviews">
        {QUOTES.map((q) => (
          <figure key={q.who}>
            <blockquote className="tl-quote">&ldquo;{q.text}&rdquo;</blockquote>
            <figcaption>{q.who} · {q.what}</figcaption>
          </figure>
        ))}
      </section>

      <section id="socials" className="tl-section tl-section-row">
        <div className="tl-section-head">
          <h2 className="tl-h2">out there</h2>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="tl-link">@tualmioutdoors</a>
        </div>
        <CommunityRow items={HOME_ROW} />
        <Link href="/in-the-wild" className="tl-link tl-row-more">see everyone in the wild</Link>
      </section>

      <Link href="/trail-club" className="tl-bleed tl-bleed-club" aria-label="Join the trail club">
        <Image src="/images-2/events/web/trail-club-1.jpg" alt="Trail club members with arms around each other at a waterfall" fill sizes="100vw" style={{ objectFit: 'cover' }} />
        <span className="tl-bleed-copy">
          <span className="tl-display">the trail club</span>
          <span className="tl-bleed-link">join the club</span>
        </span>
      </Link>
    </>
  );
}
