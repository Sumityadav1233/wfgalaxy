'use client';

import React, { useState, useMemo } from 'react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { Search, X, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface SearchClientProps {
  initialProducts: any[];
  initialQuery: string;
}

export default function SearchClient({ initialProducts = [], initialQuery = '' }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return initialProducts;
    const q = query.toLowerCase().trim();
    return initialProducts.filter((product) => {
      const nameMatch = product.name?.toLowerCase().includes(q);
      const descMatch = product.description?.toLowerCase().includes(q);
      const catMatch = product.category?.toLowerCase().includes(q);
      const subcatMatch = product.subcategory?.toLowerCase().includes(q);
      const colorMatch = product.colors?.toLowerCase().includes(q);
      const sizeMatch = product.sizes?.toLowerCase().includes(q);
      return nameMatch || descMatch || catMatch || subcatMatch || colorMatch || sizeMatch;
    });
  }, [initialProducts, query]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-h-[75vh]">
      {/* Search Header and Input */}
      <div className="mb-10 pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2A20] mb-2 flex items-center">
            <Search className="w-8 h-8 mr-3 text-[#F5820B]" />
            Search Products
          </h1>
          <p className="text-gray-500 text-sm">
            {query ? (
              <>Showing products matching <strong className="text-[#3B2A20]">&quot;{query}&quot;</strong></>
            ) : (
              'Search across our entire fashion catalog by name, category, or style.'
            )}
          </p>
        </div>

        {/* Live Search Bar Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hoodie, shirt, shoes, pants..."
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-10 pr-10 text-xs font-medium focus:outline-hidden focus:border-[#F5820B] shadow-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Found {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
        </span>
        {query && (
          <Link href="/shop" className="text-xs text-[#F5820B] hover:underline font-bold flex items-center">
            <RotateCcw className="w-3 h-3 mr-1" /> View All Shop Items
          </Link>
        )}
      </div>

      {/* Results Grid */}
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-20 bg-gray-50/70 rounded-3xl border border-gray-100 px-6">
          <div className="w-16 h-16 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F5820B]">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#3B2A20] mb-2">
            {query ? `No products found for "${query}"` : 'Start typing to search catalog'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Try searching for terms like "Outerwear", "Shirts", "Pants", or "Dresses".
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="bg-[#3B2A20] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#F5820B] transition-colors shadow-xs"
            >
              Browse Shop All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
