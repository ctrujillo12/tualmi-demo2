'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Footer() {
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
    <footer style={{ backgroundColor: '#F2EDE4', color: '#3B2F1E', borderTop: '1px solid #DDD5C8', fontSize: '12px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Newsletter + Links Row */}
        <div className="grid grid-cols-1 gap-12 mb-12">

          {/* Newsletter
          <div className="max-w-md">
            <h4 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B2F1E' }}>
              Get Updates + Promos
            </h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #3B2F1E', paddingBottom: '8px' }}>
              <input
                type="email"
                placeholder="Email"
                style={{ flex: 1, backgroundColor: 'transparent', border: 'none', fontSize: '13px', outline: 'none', color: '#3B2F1E' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                style={{ marginLeft: '16px', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: '#3B2F1E', opacity: 0.7 }}
              >
                Subscribe
              </button>
            </form>
            {status === 'success' && (
              <p style={{ color: '#6B8C52', marginTop: '8px', fontSize: '12px' }}>Subscribed successfully!</p>
            )}
            {status === 'error' && (
              <p style={{ color: '#A87060', marginTop: '8px', fontSize: '12px' }}>Error: {errorMsg}</p>
            )}
          </div> */}

          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:col-span-2 w-full gap-8">
            {[
              {
                title: 'Assistance',
                links: [
                  { name: 'Shipping', href: '/footer-pages/shipping' },
                  { name: 'Returns', href: '/footer-pages/returns' },
                  { name: 'Size + Fit', href: '/footer-pages/size-fit' },
                  { name: 'Garment Care', href: '/footer-pages/garment-care' },
                  { name: 'FAQ', href: '/footer-pages/faq' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { name: 'About', href: '/story' },
                  { name: 'Trailblazing Club', href: '/invite' },
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
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, marginBottom: '8px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: '#3B2F1E' }}
                  onClick={() => toggleSection(section.title)}
                >
                  {section.title}
                  <span className="lg:hidden">{openSection === section.title ? '−' : '+'}</span>
                </button>
                <ul
                  className={`space-y-2 overflow-hidden transition-all duration-300
                    ${openSection === section.title ? 'max-h-96' : 'max-h-0'}
                    lg:max-h-full lg:block`}
                >
                  {section.links.map((link) => {
                    const isExternal = link.href?.startsWith('http');
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href || '#'}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          style={{ fontSize: '12px', color: '#6B5C4C', display: 'block', textDecoration: 'none' }}
                          className="hover:opacity-60 transition-opacity"
                        >
                          {link.name}
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
        <div style={{ borderTop: '1px solid #DDD5C8', paddingTop: '32px', textAlign: 'center', fontSize: '11px', color: '#8C7B6B', letterSpacing: '0.1em' }}>
          © 2026 TUALMI
        </div>

      </div>
    </footer>
  );
}