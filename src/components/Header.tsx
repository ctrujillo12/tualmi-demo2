'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';

export default function Header() {
  const itemCount = useCartStore(state => state.getItemCount());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past the viewport height (hero section)
      setIsScrolled(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isScrolled ? 'text-black' : 'text-white';
  const hoverColor = isScrolled ? 'hover:text-gray-600' : 'hover:text-gray-300';
  const borderColor = isScrolled ? 'border-gray-200' : 'border-white/20';

  return (
    <header className={`bg-transparent border-b ${borderColor} fixed top-0 left-0 right-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <nav className="hidden md:flex space-x-6 text-xs">
            <Link href="/products" className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}>
              New
            </Link>
            {/* <Link href="/products?category=Bikini" className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}>
              Collections
            </Link> */}
            <Link href="/story" className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}>
              Our Story
            </Link>
          </nav>

          <Link href="/" className={`absolute left-1/2 transform -translate-x-1/2 text-sm font-bold ${textColor} tracking-[0.3em] uppercase transition-colors duration-300`}>
            TUALMI
          </Link>

          <div className="flex items-center space-x-6">
            <button className={`${textColor} ${hoverColor} transition-colors`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link href="/cart" className="relative group">
              <svg className={`w-5 h-5 ${textColor} ${hoverColor} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className={`absolute -top-2 -right-2 ${isScrolled ? 'bg-black text-white' : 'bg-white text-black'} text-xs font-normal rounded-full h-4 w-4 flex items-center justify-center transition-colors duration-300`}>
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