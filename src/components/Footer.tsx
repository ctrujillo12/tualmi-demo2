'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const sans = "var(--font-montserrat), 'Jost', system-ui, sans-serif";

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

  const toggle = (title: string) => {
    setOpenSection(prev => prev === title ? null : title);
  };

  return (
    <footer style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background image */}
      <Image
        src="/images-2/hero_anna.JPG"
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        aria-hidden="true"
      />
      {/* Dark overlay — lighter on mobile via CSS */}
      <div className="footer-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,8,5,0.72)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: 'clamp(40px, 5vw, 64px) clamp(24px, 5vw, 64px) clamp(24px, 3vw, 36px)' }}>

          {/* ── DESKTOP: 4-column grid ── */}
          <div className="footer-links-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)',
            marginBottom: 'clamp(32px, 4vw, 48px)',
          }}>
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <p style={{
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '14px',
                  marginTop: 0,
                }}>
                  {section.title}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {section.links.map((link) => {
                    const isExternal = link.href.startsWith('http');
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          style={{ fontFamily: sans, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
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

          {/* ── MOBILE: accordion ── */}
          <div className="footer-accordion" style={{ display: 'none', marginBottom: '24px' }}>
            {SECTIONS.map((section) => {
              const isOpen = openSection === section.title;
              return (
                <div key={section.title} style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                  <button
                    onClick={() => toggle(section.title)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: '10px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.9)',
                    }}>
                      {section.title}
                    </span>
                    <span style={{
                      fontFamily: sans,
                      fontSize: '16px',
                      fontWeight: 300,
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1,
                      transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <ul style={{ listStyle: 'none', padding: '0 0 14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {section.links.map((link) => {
                        const isExternal = link.href.startsWith('http');
                        return (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              style={{ fontFamily: sans, fontSize: '12px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
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

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: sans, fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              © 2026 TUALMI OUTDOORS
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
