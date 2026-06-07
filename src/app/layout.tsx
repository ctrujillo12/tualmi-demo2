import type { Metadata } from 'next';
import { Inter, Playfair_Display, Montserrat, Great_Vibes, Ballet, Codystar, Cedarville_Cursive } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', display: 'swap' });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400', variable: '--font-script', display: 'swap' });
const ballet = Ballet({ subsets: ['latin'], variable: '--font-ballet', display: 'swap' });
const codystar = Codystar({ subsets: ['latin'], weight: '400', variable: '--font-codystar', display: 'swap' });
const cedarvilleCursive = Cedarville_Cursive({ subsets: ['latin'], weight: '400', variable: '--font-cedarville', display: 'swap' });

export const metadata: Metadata = {
  title: 'Tualmi Outdoors',
  description: 'Actually cute outdoors gear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${greatVibes.variable} ${ballet.variable} ${codystar.variable} ${cedarvilleCursive.variable}`}>
      <body className="font-sans">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
