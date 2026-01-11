'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeaderStaticBlack from '@/components/HeaderStaticBlack'
import { products } from '@/lib/products'

export default function CollectionsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <>
      <HeaderStaticBlack />

      <main className="px-6 pt-28 pb-15 max-w-[1200px] mx-auto">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-sans text-s tracking-tight">
            New
          </h1>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-end mb-10">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="font-sans text-xs uppercase tracking-widest flex items-center gap-1"
          >
            Filter
            <span className="text-sm leading-none">
              {filtersOpen ? '−' : '+'}
            </span>
          </button>
        </div>

        {/* Expandable Filters */}
        {filtersOpen && (
          <div className="mb-14 border-t border-b py-6">
            <div className="flex flex-col sm:flex-row gap-10">
              <div>
                <p className="mb-4 font-sans text-xs uppercase tracking-widest">
                  Sort By
                </p>
                <ul className="space-y-3 font-sans text-sm text-sand-700">
                  <li className="cursor-pointer">Newest</li>
                  <li className="cursor-pointer">Best Selling</li>
                  <li className="cursor-pointer">Price: Low → High</li>
                  <li className="cursor-pointer">Price: High → Low</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-sand-200 flex items-center justify-center">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>

              {/* Meta */}
              <div className="mt-4 text-center">
                <p className="font-sans text-base tracking-tight">
                  {product.name}
                </p>
                <p className="font-sans text-xs text-sand-600 mt-1 tracking-wide">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
