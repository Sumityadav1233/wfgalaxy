'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ProductSearchProps {
  onSearch: (query: string) => void;
}

export default function ProductSearch({ onSearch }: ProductSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder="Search products by name, category, SKU..."
          className="w-full bg-[#1c1c1a] border border-neutral-800 rounded-md py-2.5 pl-10 pr-10 text-xs font-medium text-white placeholder-neutral-500 focus:outline-hidden focus:border-accent transition-colors"
        />
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-neutral-400 hover:text-white p-0.5"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
