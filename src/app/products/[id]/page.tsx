import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductDetailClient from '@/components/ProductDetailClient';
import { DataTable } from '@/components/PolicyPage';
import { getProduct } from '@/lib/products';

// Sierra Shorts garment measurements, in inches (converted from the cm spec,
// rounded to the nearest ¼")
const SHORTS_SIZE_GUIDE = {
  headers: ['point of measure', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'],
  rows: [
    ['Waist (relaxed)', '24.5"', '26.5"', '28.25"', '30.25"', '32.25"', '34.25"', '36.25"'],
    ['Hip', '39.5"', '41.5"', '43.5"', '45.5"', '47.5"', '49.5"', '51.5"'],
    ['Thigh', '26"', '27.25"', '28.25"', '29.5"', '30.75"', '32"', '33"'],
    ['Length', '10.25"', '10.75"', '11"', '11.5"', '11.75"', '12.25"', '12.5"'],
    ['Front rise (excl. waistband)', '8.5"', '9"', '9.5"', '10"', '10.5"', '10.75"', '11.25"'],
    ['Back rise (excl. waistband)', '12"', '12.5"', '13"', '13.5"', '14"', '14.5"', '15"'],
    ['Leg opening', '26"', '27.25"', '28.25"', '29.5"', '30.75"', '32"', '33"'],
    ['Waistband height', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"', '1.5"'],
    ['Drawcord (exposed, per side)', '9"', '9"', '9"', '9"', '9"', '9"', '9"'],
  ] as (string | number)[][],
};

// Only the tote is purchasable. Sierra Shorts and Juniper Pant get real,
// indexable "coming soon" pages so Google can list them; everything else
// redirects to the landing-page preview.
const LIVE_HANDLES = ['trailblazing-tote', '11'];

const COMING_SOON: Record<string, { title: string; description: string; availability: string; image: string }> = {
  'sierra-shorts': {
    title: 'sierra shorts — mid-rise hiking shorts',
    description:
      'Mid-rise, relaxed-fit hiking shorts with deep pockets big enough for your whole phone, in prints people will ask about at the trailhead. Dropping July 31st.',
    availability: 'dropping july 31st',
    image: '/images-2/shortsandshoes.jpg',
  },
  'juniper-pant': {
    title: 'juniper pant — flare cargo hiking pants',
    description:
      'Flare cargo pants that are actually good for hiking — fold-over waist, cargo pockets that fit your stuff, and a flared leg that goes with everything. Dropping July 31st.',
    availability: 'dropping july 31st',
    image: '/images-2/running-shorts1.jpg',
  },
};

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';
const soft   = '#C9849A';

export function generateStaticParams() {
  return [
    { id: 'trailblazing-tote' },
    { id: 'sierra-shorts' },
    { id: 'juniper-pant' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (COMING_SOON[id]) {
    return {
      title: COMING_SOON[id].title,
      description: COMING_SOON[id].description,
      alternates: { canonical: `/products/${id}` },
    };
  }
  return {
    title: 'trailblazing club tote — organic cotton canvas',
    description:
      'The tote that goes everywhere you do — 100% organic cotton canvas, sturdy enough for the trail, cute enough for the farmers market.',
    alternates: { canonical: '/products/trailblazing-tote' },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { id } = await params;
  const { color } = await searchParams;

  // ── Coming-soon pages (indexable, not purchasable) ──
  if (COMING_SOON[id]) {
    const info = COMING_SOON[id];
    const product = await getProduct(id);

    const productJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product?.name ?? info.title,
      description: product?.description ?? info.description,
      brand: { '@type': 'Brand', name: 'Tualmi' },
      image: `https://tualmi.com${info.image}`,
      // No Offer block until the product is actually orderable
    };

    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#FBF1F5' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(110px, 15vw, 160px) clamp(24px, 5vw, 48px) clamp(64px, 10vw, 120px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(32px, 6vw, 80px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 'clamp(260px, 36vw, 400px)', aspectRatio: '4 / 5', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
              <Image src={info.image} alt={product?.name ?? ''} fill sizes="(max-width: 768px) 80vw, 400px" style={{ objectFit: 'cover' }} priority />
            </div>
            <div style={{ maxWidth: '420px', textAlign: 'left' }}>
              <p style={{ fontFamily: sans, fontWeight: 700, fontSize: '13px', letterSpacing: '0.14em', color: soft, margin: '0 0 12px', textTransform: 'lowercase' }}>
                {info.availability}
              </p>
              <h1 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(30px, 4.5vw, 48px)', letterSpacing: '-0.03em', color: maroon, margin: '0 0 20px', lineHeight: 1.1, textTransform: 'lowercase' }}>
                {(product?.name ?? '').toLowerCase()}
              </h1>
              <p style={{ fontFamily: sans, fontWeight: 500, fontSize: '15px', lineHeight: 2, color: soft, margin: '0 0 28px' }}>
                {product?.description}
              </p>
              <Link
                href="/invite"
                style={{
                  display: 'inline-block',
                  backgroundColor: maroon,
                  color: 'white',
                  padding: '14px 32px',
                  fontFamily: sans,
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '100px',
                  textDecoration: 'none',
                  textTransform: 'lowercase',
                }}
              >
                join the club for early access
              </Link>
              <p style={{ fontFamily: sans, fontWeight: 500, fontSize: '13px', color: soft, margin: '16px 0 0' }}>
                <Link href="/#collection" style={{ color: maroon, fontWeight: 600, textUnderlineOffset: '4px' }}>
                  see the full collection →
                </Link>
              </p>
            </div>
          </div>

          {/* Size guide — shorts only */}
          {id === 'sierra-shorts' && (
            <div style={{ marginTop: 'clamp(56px, 8vw, 96px)' }}>
              <h2 style={{ fontFamily: sans, fontWeight: 700, fontSize: 'clamp(20px, 2.5vw, 28px)', letterSpacing: '-0.02em', color: maroon, margin: '0 0 10px', textTransform: 'lowercase' }}>
                size guide
              </h2>
              <p style={{ fontFamily: sans, fontWeight: 500, fontSize: '14px', lineHeight: 2, color: soft, margin: '0 0 20px' }}>
                All measurements taken flat on the garment, in inches.
              </p>
              <DataTable headers={SHORTS_SIZE_GUIDE.headers} rows={SHORTS_SIZE_GUIDE.rows} />
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── Everything else that isn't live redirects to the landing preview ──
  if (!LIVE_HANDLES.includes(id)) {
    redirect('/#collection');
  }

  // ── Tote: full purchasable product page ──
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product!.name,
    description: product!.description,
    brand: { '@type': 'Brand', name: 'Tualmi' },
    material: '100% organic cotton canvas',
    image: `https://tualmi.com${product!.images[0]}`,
    offers: {
      '@type': 'Offer',
      price: (product!.price / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://tualmi.com/products/trailblazing-tote',
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product!} initialColor={color} />
    </main>
  );
}
