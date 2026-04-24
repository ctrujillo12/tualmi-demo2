'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';

export default function Header() {
  const itemCount = useCartStore(state => state.getItemCount());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrolled: dark brown on warm white. Hero: white on transparent.
  const textColor   = isScrolled ? 'text-[#3B2F1E]' : 'text-white';
  const hoverColor  = isScrolled ? 'hover:text-[#8C7B6B]' : 'hover:text-white/60';
  const borderColor = isScrolled ? 'border-[#DDD5C8]' : 'border-white/20';
  const bgColor     = isScrolled ? 'bg-[#FAFAF7]' : 'bg-transparent';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b ${borderColor} ${bgColor} transition-colors duration-300 cursor-[url('/strawberry_cursor.png'),_auto]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT NAV */}
          <nav className="hidden md:flex space-x-6 text-xs">
            <Link
              href="/collections"
              className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}
            >
              Drop 1
            </Link>
            <Link
              href="/story"
              className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}
            >
              Our Story
            </Link>
          </nav>

          {/* LOGO */}
          <Link
            href="/"
            className={`absolute left-1/2 transform -translate-x-1/2 text-sm font-black tracking-[0.25em] uppercase ${textColor} transition-colors duration-300`}
          >
            TUALMI
          </Link>

          {/* RIGHT — CART */}
          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative group">
              <svg
                className={`w-5 h-5 ${textColor} ${hoverColor} transition-colors`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {isMounted && itemCount > 0 && (
                <span
                  className={`absolute -top-2 -right-2 h-4 w-4 rounded-full text-xs flex items-center justify-center transition-colors duration-300 ${
                    isScrolled ? 'bg-[#3B2F1E] text-[#FAFAF7]' : 'bg-white text-[#3B2F1E]'
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}