'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const itemCount = useCartStore(state => state.getItemCount());
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  // On non-home pages, always show in "scrolled" state
  const isScrolled = !isHome || hasScrolled;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      setHasScrolled(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const textColor   = isScrolled ? 'text-[#3B2F1E]' : 'text-white';
  const hoverColor  = isScrolled ? 'hover:text-[#8C7B6B]' : 'hover:text-white/60';
  const borderColor = isScrolled ? 'border-[#DDD5C8]/40' : 'border-white/20';
  const bg          = 'bg-transparent';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b ${borderColor} ${bg} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT — LOGO + NAV */}
          <div className="flex items-center space-x-6">
            <Link href="/">
              <Image
                src="/images-2/logo2-brown.png"
                alt="Tualmi"
                width={70}
                height={20}
                style={{
                  objectFit: 'contain',
                  height: '20px',
                  width: 'auto',
                  filter: isScrolled
                    ? 'brightness(0) saturate(100%) invert(15%) sepia(25%) saturate(600%) hue-rotate(330deg) brightness(80%)'
                    : 'brightness(0) invert(1)',
                  transition: 'filter 0.3s',
                }}
              />
            </Link>
            <nav className="hidden md:flex text-xs">
              <Link
                href="/story"
                className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}
              >
                Our Story
              </Link>
            </nav>
          </div>

          {/* RIGHT — JOIN CTA */}
          <div className="flex items-center space-x-6">
            <Link
              href="/invite"
              className={`${textColor} ${hoverColor} transition-colors`}
              style={{ fontFamily: 'var(--font-montserrat)', fontSize: '9px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              Join the Club
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
