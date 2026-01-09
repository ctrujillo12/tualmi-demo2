'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  // State for mobile expand/collapse
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="bg-sand-50 text-black border-t border-sand-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Newsletter + Links Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

          {/* Newsletter */}
          <div className="max-w-md">
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Newsletter
            </h4>

            <form className="flex items-center border-b border-black pb-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder-black/60"
              />
              <button
                type="submit"
                className="ml-4 text-xs uppercase tracking-widest hover:opacity-60 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="lg:grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Section Template */}
            {[
              {
                title: 'Assistance',
                links: [
                  { name: 'Shipping', href: '#' },
                  { name: 'Returns', href: '#' },
                  { name: 'Size + Fit', href: '#' },
                  { name: 'Garment Care', href: '#' },
                  { name: 'FAQ', href: '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { name: 'About', href: '#' },
                  { name: 'My Account', href: '#' },
                  { name: 'Gift Cards', href: '#' },
                ],
              },
              {
                title: 'Social',
                links: [
                  { name: 'Instagram', href: '#' },
                  { name: 'TikTok', href: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { name: 'Privacy Policy', href: '#' },
                  { name: 'Terms & Conditions', href: '#' },
                ],
              },
            ].map(section => (
              <div key={section.title}>
                {/* Heading clickable on mobile */}
                <button
                  className="w-full flex justify-between items-center font-semibold mb-2 text-sm uppercase tracking-wider lg:cursor-auto"
                  onClick={() => toggleSection(section.title)}
                >
                  {section.title}
                  <span className="lg:hidden">
                    {openSection === section.title ? '−' : '+'}
                  </span>
                </button>

                {/* Links: visible on desktop, toggle on mobile */}
                <ul
                  className={`space-y-2 text-sm overflow-hidden transition-all duration-300
                    ${openSection === section.title ? 'max-h-96' : 'max-h-0'}
                    lg:max-h-full lg:block`}
                >
                  {section.links.map(link => (
                    <li key={link.name}>
                      <Link href={link.href} className="hover:opacity-60 block">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sand-200 pt-8 text-center text-sm opacity-70">
          © 2025 TUALMI
        </div>
      </div>
    </footer>
  );
}
