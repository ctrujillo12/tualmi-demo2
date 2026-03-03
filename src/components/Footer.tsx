'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Footer() {
  // State for mobile expand/collapse
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-sand-50 text-black border-t border-sand-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter + Links Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Newsletter */}
          <div className="max-w-md">
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Get Updates + Promos
            </h4>

            <form
              onSubmit={handleSubmit}
              className="flex items-center border-b border-black pb-2"
            >
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder-black/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="ml-4 text-xs uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Subscribe
              </button>
            </form>

            {status === 'success' && (
              <p className="text-green-600 mt-2 text-sm">Subscribed successfully!</p>
            )}
            {status === 'error' && (
              <p className="text-red-600 mt-2 text-sm">Error: {errorMsg}</p>
            )}
          </div>

          {/* Footer Links */}
          <div className="lg:grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                title: 'Assistance',
                links: [
                  { name: 'Shipping', href: '/footer-pages/shipping'  },
                  { name: 'Returns', href: '/footer-pages/returns' },
                  { name: 'Size + Fit', href: '/footer-pages/size-fit' },
                  { name: 'Garment Care', href: '/footer-pages/garment-care'   },
                  { name: 'FAQ', href: '/footer-pages/faq' },
                ],
              },
              {
                title: 'Company',
                links: [
                { name: 'About', href: '/story' },
                // { name: 'Gift Cards', href: '/footer-pages/gift-cards' },
                ],
              },
              {
                title: 'Social',
                links: [
                  { name: 'Instagram', href: 'https://www.instagram.com/tualmioutdoors' },
                  { name: 'TikTok', href: 'https://www.tiktok.com/@tualmi.outdoors' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { name: 'Privacy Policy', href: '/footer-pages/privacy' },
                  { name: 'Terms & Conditions', href: '/footer-pages/legal' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <button
                  className="w-full flex justify-between items-center font-semibold mb-2 text-sm uppercase tracking-wider lg:cursor-auto"
                  onClick={() => toggleSection(section.title)}
                >
                  {section.title}
                  <span className="lg:hidden">
                    {openSection === section.title ? '−' : '+'}
                  </span>
                </button>

                <ul
                  className={`space-y-2 text-sm overflow-hidden transition-all duration-300
                    ${openSection === section.title ? 'max-h-96' : 'max-h-0'}
                    lg:max-h-full lg:block`}
                >
                  {section.links.map((link: any) => {
  const isExternal = link.href?.startsWith('http');

  return (
    <li key={link.name || link}>
      <Link
        href={link.href || '#'}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="hover:opacity-60 block"
      >
        {link.name || link}
      </Link>
    </li>
  );
})}

                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sand-200 pt-8 text-center text-sm opacity-70">
          © 2026 TUALMI
        </div>
      </div>
    </footer>
  );
}
