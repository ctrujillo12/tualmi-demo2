import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'returns & exchanges form',
  description: 'Start a Tualmi return or exchange: enter your order details and we will email you next steps.',
  alternates: { canonical: '/footer-pages/exchanges' },
};

export default function ExchangesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
