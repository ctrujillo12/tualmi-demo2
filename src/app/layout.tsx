import type { Metadata } from 'next';
import { Inter, Playfair_Display, Montserrat, Great_Vibes, Ballet, Codystar, Cedarville_Cursive } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccessBanner from '@/components/AccessBanner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' });
const ballet = Ballet({ subsets: ['latin'], variable: '--font-ballet', display: 'swap' });
const codystar = Codystar({ subsets: ['latin'], weight: '400', variable: '--font-codystar', display: 'swap' });
const cedarvilleCursive = Cedarville_Cursive({ subsets: ['latin'], weight: '400', variable: '--font-cedarville', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://tualmi.com'),
  title: {
    default: 'Tualmi — actually cute hiking apparel',
    template: '%s | Tualmi',
  },
  description:
    'Hiking apparel made by women, for women — the fits, prints, and colorways the legacy brands never made. Built for the trail, cute everywhere else.',
  openGraph: {
    siteName: 'Tualmi',
    type: 'website',
    title: 'Tualmi — actually cute hiking apparel',
    description:
      'Hiking apparel made by women, for women — the fits, prints, and colorways the legacy brands never made.',
    images: ['/images-2/funky-rock0.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tualmi — actually cute hiking apparel',
    description:
      'Hiking apparel made by women, for women — the fits, prints, and colorways the legacy brands never made.',
    images: ['/images-2/funky-rock0.jpg'],
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tualmi',
  url: 'https://tualmi.com',
  logo: 'https://tualmi.com/images-2/logo2-maroon.png',
  foundingDate: '2026',
  foundingLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressRegion: 'CA', addressCountry: 'US' },
  },
  description:
    'Tualmi is a women-owned outdoor apparel brand making fashion-forward, trail-ready hiking gear for women. Every piece features women-specific, flattering fits — not adapted from men’s patterns — and is made from sustainable, recycled materials in a WRAP-certified facility. Based in California.',
  knowsAbout: [
    'women’s hiking apparel',
    'sustainable outdoor clothing',
    'fashion-forward trail gear',
    'recycled outdoor apparel',
  ],
  sameAs: [
    'https://www.tiktok.com/@tualmi.outdoors',
    'https://www.instagram.com/tualmioutdoors',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${greatVibes.variable} ${ballet.variable} ${codystar.variable} ${cedarvilleCursive.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <AccessBanner />
      </body>
    </html>
  );
}
