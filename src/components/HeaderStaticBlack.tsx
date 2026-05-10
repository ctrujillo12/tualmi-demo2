'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';

export default function HeaderStaticBlack() {
  const itemCount = useCartStore(state => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const textColor   = 'text-[#3B2F1E]';
  const hoverColor  = 'hover:text-[#8C7B6B]';
  const borderColor = 'border-[#DDD5C8]';

  return (
    <header className={`bg-[#FAFAF7] border-b ${borderColor} fixed top-0 left-0 right-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <nav className="hidden md:flex space-x-6 text-xs">
            <Link href="/story" className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}>
              Our Story
            </Link>
          </nav>

          <Link
            href="/"
            className={`absolute left-1/2 transform -translate-x-1/2 text-sm font-black tracking-[0.25em] uppercase ${textColor} transition-colors duration-300`}
          >
            TUALMI
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative">
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

              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#3B2F1E] text-[#FAFAF7] text-xs rounded-full h-4 w-4 flex items-center justify-center">
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