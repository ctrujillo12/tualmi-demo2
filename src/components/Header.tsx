'use client';

import Link from 'next/link';
import FreeShippingBar from '@/components/FreeShippingBar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
const maroon = '#A9445C';

const LEFT_LINKS = [
  { name: 'our story', href: '/story' },
  { name: 'shop drop one', href: '/#collection' },
];

const RIGHT_LINKS = [
  { name: 'socials', href: '/#socials' },
  { name: 'the club', href: '/invite' },
];

/**
 * Global site nav — rendered once from layout.tsx on every page.
 * Always maroon, including over the homepage hero, so the logo and every link
 * read as one consistent colour.
 */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [pastHero, setPastHero] = useState(false);

  // Cart count — mounted guard avoids hydration mismatch (cart is persisted)
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  useEffect(() => { setMounted(true); }, []);

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

  // One colour everywhere — logo, links, and cart all maroon.
  const color = maroon;

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
      className="site-nav-wrap"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        // Without a background, page content scrolled underneath and collided
        // with the nav links — photos and text bleeding through "our story" /
        // "shop drop one". Translucent blush + blur keeps the airy look while
        // making the links readable over anything.
        backgroundColor: 'rgba(251, 241, 245, 0.88)',
        backdropFilter: 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        borderBottom: '1px solid rgba(169, 68, 92, 0.10)',
      }}
    >
    <div
      className="site-nav"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px clamp(20px, 3vw, 40px)',
      }}
    >
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 3vw, 44px)' }}>
        {/* Home link — small maroon logo, only shown off the landing page */}
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
      <nav className="site-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 3vw, 44px)' }}>
        {RIGHT_LINKS.map((l) => (
          <Link key={l.name} href={l.href} style={linkStyle}>
            {l.name}
          </Link>
        ))}
        {/* Cart */}
        <Link href="/cart" aria-label="Cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8h12l-1 12H7L6 8Z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
          {mounted && itemCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-9px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                boxSizing: 'border-box',
                borderRadius: '100px',
                backgroundColor: maroon,
                color: 'white',
                fontFamily: sans,
                fontSize: '10px',
                fontWeight: 700,
                lineHeight: '16px',
                textAlign: 'center',
              }}
            >
              {itemCount}
            </span>
          )}
        </Link>
      </nav>
    </div>

    {/* Free-shipping promo — live progress once the cart has something in it. */}
    <FreeShippingBar variant="strip" />
    </header>
  );
}
