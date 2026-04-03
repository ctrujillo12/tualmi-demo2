'use client';

import { useState } from 'react';

export default function CollectionsFilters() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
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
    </>
  );
}