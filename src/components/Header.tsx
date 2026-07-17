'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';

const LEFT_LINKS = [
  { name: 'our story', href: '/story' },
  { name: 'preview drop one', href: '/#collection' },
];

const RIGHT_LINKS = [
  { name: 'socials', href: '/#socials' },
  { name: 'the club', href: '/invite' },
];

/**
 * Global site nav — rendered once from layout.tsx on every page.
 * White while over the homepage hero, maroon everywhere else
 * (and after scrolling past the hero on the homepage).
 */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      // Hero is 100vh — switch color once its bottom clears the nav.
      setPastHero(window.scrollY > window.innerHeight - 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const color = isHome && !pastHero ? 'white' : maroon;

  const linkStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 'clamp(12px, 1.3vw, 15px)',
    fontWeight: 500,
    color,
    textDecoration: 'none',
    textTransform: 'lowercase',
    letterSpacing: '0.01em',
    lineHeight: 1,
    transition: 'color 0.3s ease',
  };

  return (
    <header
      className="site-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px clamp(20px, 3vw, 40px)',
        zIndex: 50,
      }}
    >
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 3vw, 44px)' }}>
        {/* Home link — small logo, only shown off the landing page */}
        {!isHome && (
          <Link href="/" aria-label="Home" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images-2/logo2-maroon.png"
              alt=""
              style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
        )}
        {LEFT_LINKS.map((l) => (
          <Link key={l.name} href={l.href} style={linkStyle}>
            {l.name}
          </Link>
        ))}
      </nav>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 3vw, 44px)' }}>
        {RIGHT_LINKS.map((l) => (
          <Link key={l.name} href={l.href} style={linkStyle}>
            {l.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
