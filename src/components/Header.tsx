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

  const textColor = isScrolled ? 'text-black' : 'text-white';
  const hoverColor = isScrolled ? 'hover:text-gray-600' : 'hover:text-gray-300';
  const borderColor = isScrolled ? 'border-gray-200' : 'border-white/20';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent border-b ${borderColor} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT NAV */}
          <nav className="hidden md:flex space-x-6 text-xs">
            {/* NEW → COLLECTIONS */}
            <div className="relative group">
              <Link
                href="/collections"
                className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}
              >
                New
              </Link>

              {/* Dropdown
              <div className="absolute left-0 top-full mt-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
                <div className="bg-white px-6 py-4 shadow-sm">
                  <Link
                    href="/collections"
                    className="block text-xs uppercase tracking-widest text-black hover:opacity-60 transition"
                  >
                    Collections
                  </Link>
                </div>
              </div> */}
            </div>

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


          {/* RIGHT ICONS */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <button className={`${textColor} ${hoverColor} transition-colors`}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Cart */}
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
                    isScrolled
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
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