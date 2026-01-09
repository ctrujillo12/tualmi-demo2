'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function HeaderStaticBlack() {
  const itemCount = useCartStore(state => state.getItemCount());

  const textColor = 'text-black';
  const hoverColor = 'hover:text-gray-600';
  const borderColor = 'border-gray-200';

  return (
    <header
      className={`bg-transparent border-b ${borderColor} fixed top-0 left-0 right-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Nav */}
          <nav className="hidden md:flex space-x-6 text-xs">
            <Link
              href="/products"
              className={`${textColor} ${hoverColor} uppercase tracking-widest transition-colors`}
            >
              New
            </Link>
            {/* <Link
              href="/products?category=Bikini"
              className={`${textColor} ${hoverColor} uppercase tracking-widest transition-colors`}
            >
              Collections
            </Link> */}
            <Link href="/story" className={`${textColor} ${hoverColor} transition-colors uppercase tracking-widest`}>
              Our Story
            </Link>
          </nav>

          {/* Center Logo */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 text-sm font-normal ${textColor} tracking-[0.3em] uppercase`}
          >
            TUALMI
          </Link>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
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

              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
