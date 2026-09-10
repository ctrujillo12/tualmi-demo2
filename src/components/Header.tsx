'use client';

import Link from 'next/link';
import FreeShippingBar from '@/components/FreeShippingBar';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';

const sans   = 'var(--font-montserrat), system-ui, sans-serif';
/* Brick rather than the old #A9445C maroon: it sits in the palette beside
   the sage without clashing, and stays in the same red family as
   logo2-maroon.png, which is a fixed image asset. */
const maroon = '#A9503A';
/** Nav ink while the header floats on the hero photo. */
const cream  = '#FEFFF9';

/**
 * Nav labels and order come from the approved hero comp: home / socials / shop
 * on the left, join the club on the right, then the bag.
 *
 * NOTE: this drops "our story" from the nav — the comp has no slot for it. The
 * story page is still linked from the about section on the landing page and
 * from the footer, and /story still resolves. If you want it back in the nav,
 * add it here; it is the one destination this list no longer reaches.
 */
const LEFT_LINKS = [
  { name: 'home', href: '/' },
  { name: 'socials', href: '/#socials' },
  { name: 'shop', href: '/#collection' },
];

const RIGHT_LINKS = [
  { name: 'join the club', href: '/invite' },
];

/**
 * Global site nav — rendered once from layout.tsx on every page.
 *
 * Two states, which is what the approved hero comp shows:
 *
 *   over the hero  — no background at all, cream links sitting directly on the
 *                    photo, exactly as drawn in the comp
 *   everywhere else — the translucent cream bar with brick links
 *
 * The bar exists for a real reason (see the note on backgroundColor below):
 * without it, links collided with whatever scrolled underneath them. That is
 * why the transparent state is scoped to the hero — the one screen where what
 * sits under the nav is a photo we control, chosen to be dark enough behind
 * the links. `pastHero` was already being tracked for this and simply wasn't
 * being used.
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

  // Floating on the photo only at the top of the landing page.
  const overHero = isHome && !pastHero;
  const color = overHero ? cream : maroon;

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
    // Keeps the links readable across the brighter parts of the hero photo.
    textShadow: overHero ? '0 1px 10px rgba(24, 14, 10, 0.45)' : 'none',
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
        // Cream rather than blush, and a sage hairline instead of a maroon
        // one. The background itself stays — see the note above; without it
        // the links collided with whatever scrolled under them.
        backgroundColor: overHero ? 'transparent' : 'rgba(247, 242, 228, 0.88)',
        backdropFilter: overHero ? 'none' : 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: overHero ? 'none' : 'saturate(140%) blur(10px)',
        borderBottom: overHero ? '1px solid transparent' : '1px solid rgba(124, 130, 82, 0.16)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
    {/* Free-shipping promo — live progress once the cart has something in it.
        Above the nav, per the comp: it is the first thing on the page. */}
    <FreeShippingBar variant="strip" />

    <div
      className="site-nav"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Comp puts the first nav link at ~5.4% of the viewport width.
        padding: '18px clamp(20px, 5.4vw, 100px)',
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
          {/* An actual trolley. The previous glyph was a tote — a tapered box
              with a half-circle handle — which reads as a bag or, at 20px, as
              a box with a line over it. Handle, basket, two wheels is the
              shape people actually recognise as a cart. */}
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2.5 3.5h2.1l2.4 10.6a1.7 1.7 0 0 0 1.66 1.32h7.94a1.7 1.7 0 0 0 1.66-1.3L21 8.2H5.6" />
            <circle cx="10" cy="19.6" r="1.45" />
            <circle cx="17.4" cy="19.6" r="1.45" />
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
    </header>
  );
}
