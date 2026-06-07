'use client';

import Link from 'next/link';
import { useState } from 'react';

const sans  = "var(--font-montserrat), system-ui, sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

const SECTIONS = [
  {
    title: 'Assistance',
    links: [
      { name: 'Shipping',     href: '/footer-pages/shipping' },
      { name: 'Returns',      href: '/footer-pages/returns' },
      { name: 'Size + Fit',   href: '/footer-pages/size-fit' },
      { name: 'Garment Care', href: '/footer-pages/garment-care' },
      { name: 'FAQ',          href: '/footer-pages/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About',             href: '/story' },
      { name: 'Trailblazing Club', href: '/invite' },
    ],
  },
  {
    title: 'Social',
    links: [
      { name: 'Instagram', href: 'https://www.instagram.com/tualmioutdoors' },
      { name: 'TikTok',    href: 'https://www.tiktok.com/@tualmi.outdoors' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy',     href: '/footer-pages/privacy' },
      { name: 'Terms & Conditions', href: '/footer-pages/legal' },
    ],
  },
];

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (title: string) =>
    setOpenSection(prev => (prev === title ? null : title));

  return (
    <footer style={{ backgroundColor: '#dad082', position: 'relative', zIndex: 3, paddingTop: 'clamp(20px, 3vw, 36px)' }}>
      {/* Ribbon trim — tiled at half scale so it's thinner */}
      <div style={{
        width: '100%',
        height: '26px',
        backgroundImage: 'url(/images-2/green-ribbon.png)',
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        backgroundPosition: 'left center',
      }} />
      <div style={{ padding: 'clamp(16px, 2.5vw, 28px) clamp(24px, 5vw, 64px) clamp(24px, 3vw, 36px)' }}>

        {/* ── DESKTOP link grid ── */}
        <div
          className="footer-links-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)',
            marginBottom: 'clamp(40px, 6vw, 64px)',
          }}
        >
          {SECTIONS.map(section => (
            <div key={section.title}>
              <p style={{ fontFamily: sans, fontWeight: 600, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3B2F1E', marginBottom: '14px', marginTop: 0 }}>
                {section.title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {section.links.map(link => {
                  const ext = link.href.startsWith('http');
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={ext ? '_blank' : undefined}
                        rel={ext ? 'noopener noreferrer' : undefined}
                        style={{ fontFamily: sans, fontSize: '12px', color: '#5C4A2A', textDecoration: 'none' }}
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

        {/* ── MOBILE accordion ── */}
        <div className="footer-accordion" style={{ display: 'none', marginBottom: '32px' }}>
          {SECTIONS.map(section => {
            const isOpen = openSection === section.title;
            return (
              <div key={section.title} style={{ borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
                <button
                  onClick={() => toggle(section.title)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: sans, fontWeight: 600, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#3B2F1E' }}>
                    {section.title}
                  </span>
                  <span style={{ fontSize: '16px', color: '#5C4A2A', transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <ul style={{ listStyle: 'none', padding: '0 0 14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {section.links.map(link => {
                      const ext = link.href.startsWith('http');
                      return (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            target={ext ? '_blank' : undefined}
                            rel={ext ? 'noopener noreferrer' : undefined}
                            style={{ fontFamily: sans, fontSize: '12px', color: '#5C4A2A', textDecoration: 'none' }}
                          >
                            {link.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: sans, fontSize: '10px', letterSpacing: '0.15em', color: '#5C4A2A', margin: 0 }}>
            © 2026
          </p>

          {/* Hiker + logo + wordmark stacked, right-aligned */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images-2/hiker.png"
              alt=""
              style={{ height: 'clamp(90px, 13vw, 170px)', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images-2/logo2-brown.png"
                alt=""
                className="footer-logo-img"
                style={{ height: '38px', width: 'auto', objectFit: 'contain', marginBottom: '3px', filter: 'brightness(0) saturate(100%) invert(15%) sepia(25%) saturate(600%) hue-rotate(330deg) brightness(80%)' }}
              />
              <span className="footer-wordmark" style={{ fontFamily: serif, fontSize: '44px', fontWeight: 400, color: '#3B2F1E', lineHeight: 1 }}>
                Tualmi
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
