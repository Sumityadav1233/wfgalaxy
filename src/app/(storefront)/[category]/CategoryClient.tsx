'use client';

import React, { useState, useMemo } from 'react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { Filter, SlidersHorizontal, X, ArrowUpDown, Search, RotateCcw } from 'lucide-react';

interface CategoryClientProps {
  categoryName: string;
  subcategories?: string[];
  initialProducts: any[];
  description?: string;
  hideSubcategoriesFilter?: boolean;
}

function parseArrayField(field: any): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field.map(s => String(s).trim());
  if (typeof field === 'string') {
    return field.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function CategoryClient({ 
  categoryName, 
  subcategories = [], 
  initialProducts,
  description,
  hideSubcategoriesFilter = false
}: CategoryClientProps) {
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Compute maximum price from initial products
  const maxProductPrice = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) return 5000;
    const max = Math.max(...initialProducts.map(p => Number(p.price) || 0));
    return Math.ceil(max) || 5000;
  }, [initialProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(() => maxProductPrice * 2);

  // Keep maxPrice aligned if products change
  const currentMaxPrice = maxPrice > maxProductPrice ? maxProductPrice : maxPrice;

  // Extract unique subcategories dynamically if not passed or empty
  const availableSubcategories = useMemo(() => {
    if (subcategories && subcategories.length > 0) return subcategories;
    const set = new Set<string>();
    initialProducts.forEach(p => {
      if (p.subcategory) set.add(p.subcategory);
    });
    return Array.from(set).sort();
  }, [subcategories, initialProducts]);

  // Extract unique colors from products
  const availableColors = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => {
      const colors = parseArrayField(p.colors);
      colors.forEach(c => set.add(c));
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Subcategory match
        if (selectedSubs.length > 0 && product.subcategory) {
          if (!selectedSubs.includes(product.subcategory)) return false;
        }

        // Size match
        if (selectedSizes.length > 0) {
          const productSizes = parseArrayField(product.sizes);
          const hasSize = selectedSizes.some(s => productSizes.includes(s));
          if (!hasSize) return false;
        }

        // Color match
        if (selectedColors.length > 0) {
          const productColors = parseArrayField(product.colors);
          const hasColor = selectedColors.some(c => productColors.includes(c));
          if (!hasColor) return false;
        }

        // Price match
        const productPrice = Number(product.price) || 0;
        if (productPrice > currentMaxPrice) return false;

        // Search Query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = product.name?.toLowerCase().includes(q);
          const descMatch = product.description?.toLowerCase().includes(q);
          const subMatch = product.subcategory?.toLowerCase().includes(q);
          if (!nameMatch && !descMatch && !subMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        if (sortBy === 'price-low-high') return priceA - priceB;
        if (sortBy === 'price-high-low') return priceB - priceA;
        if (sortBy === 'name-a-z') return String(a.name).localeCompare(String(b.name));
        // Default newest
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [initialProducts, selectedSubs, selectedSizes, selectedColors, currentMaxPrice, searchQuery, sortBy]);

  const toggleSubcategory = (sub: string) => {
    setSelectedSubs(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedSubs([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearchQuery('');
    setMaxPrice(maxProductPrice);
    setSortBy('newest');
  };

  const activeFilterCount = selectedSubs.length + selectedSizes.length + selectedColors.length + (searchQuery ? 1 : 0) + (currentMaxPrice < maxProductPrice ? 1 : 0);

  const displayTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3B2A20] mb-4">
          {displayTitle} {categoryName.toLowerCase().includes('collection') ? '' : 'Collection'}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {description || `Explore our premium range of ${displayTitle.toLowerCase()} products, crafted with uncompromising quality.`}
        </p>
      </div>

      {/* Horizontal Scrollable Category Pill Tab Bar */}
      {availableSubcategories.length > 0 && (
        <div className="mb-8 overflow-x-auto no-scrollbar flex items-center gap-2 py-2 px-1 -mx-2 sm:mx-0">
          <button
            onClick={() => setSelectedSubs([])}
            className={`px-5 py-2.5 rounded-full text-xs font-bold font-sans transition-all flex-shrink-0 border ${
              selectedSubs.length === 0
                ? 'bg-[#3B2A20] text-white border-[#3B2A20] shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
            }`}
          >
            Everything
          </button>
          {availableSubcategories.map((sub) => {
            const isSelected = selectedSubs.includes(sub);
            return (
              <button
                key={sub}
                onClick={() => toggleSubcategory(sub)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold font-sans transition-all flex-shrink-0 border ${
                  isSelected
                    ? 'bg-[#3B2A20] text-white border-[#3B2A20] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden w-full flex items-center justify-between gap-4 mb-4">
          <button 
            className="flex-1 flex items-center justify-center py-3 bg-[#3B2A20] text-white rounded-xl font-medium text-sm shadow-sm hover:bg-[#F5820B] transition-colors"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <Filter className="w-4 h-4 mr-2" /> 
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-[#3B2A20] focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="name-a-z">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside className={`
          fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 lg:static lg:bg-transparent lg:z-auto lg:w-64 lg:flex-shrink-0 lg:block
          ${isMobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}
        `}>
          <div className={`
            bg-white w-full max-w-xs h-full lg:h-auto overflow-y-auto lg:overflow-visible p-6 lg:p-6 lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-xs lg:sticky lg:top-32 transition-transform duration-300
            ${isMobileFiltersOpen ? 'translate-x-0 ml-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Sidebar Title & Reset */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center space-x-2 text-[#3B2A20] font-bold text-base uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-[#F5820B]" />
                <span>Filters</span>
              </div>
              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#F5820B] hover:underline font-semibold flex items-center"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset
                  </button>
                )}
                <button 
                  className="lg:hidden text-gray-400 hover:text-gray-700"
                  onClick={() => setIsMobileFiltersOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Search filter within category */}
              <div>
                <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-hidden focus:border-[#F5820B]"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories Filter */}
              {!hideSubcategoriesFilter && availableSubcategories.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-3">Subcategories</h3>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {availableSubcategories.map(sub => (
                      <label key={sub} className="flex items-center space-x-3 cursor-pointer group select-none">
                        <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          selectedSubs.includes(sub) 
                            ? 'bg-[#3B2A20] border-[#3B2A20]' 
                            : 'border-gray-300 group-hover:border-[#F5820B]'
                        }`}>
                          {selectedSubs.includes(sub) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm transition-colors ${selectedSubs.includes(sub) ? 'font-bold text-[#3B2A20]' : 'text-gray-600 group-hover:text-[#F5820B]'}`}>
                          {sub}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-2">
                  <span>Max Price</span>
                  <span className="text-[#F5820B] font-extrabold">Rs. {currentMaxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="50"
                  value={currentMaxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F5820B]"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-medium">
                  <span>Rs. 0</span>
                  <span>Rs. {maxProductPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-3">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map(size => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#3B2A20] text-white border-[#3B2A20] shadow-xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#F5820B] hover:text-[#F5820B]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Filter */}
              {availableColors.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-3">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => {
                      const isSelected = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-[#3B2A20] text-white border-[#3B2A20]'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#F5820B]'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Apply Button */}
            <div className="lg:hidden mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-[#3B2A20] text-white py-3 rounded-xl font-bold text-sm"
              >
                Apply Filters ({filteredProducts.length} items)
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area (Desktop Toolbar & Product Grid) */}
        <div className="flex-1 w-full">
          {/* Top Bar for Desktop */}
          <div className="hidden lg:flex items-center justify-between pb-4 mb-8 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">
              Showing <strong className="text-[#3B2A20] font-bold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'product' : 'products'}
            </span>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400 font-medium">Sort by:</span>
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                <ArrowUpDown className="w-4 h-4 text-[#F5820B]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[#3B2A20] font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 bg-amber-50/50 border border-amber-100 p-3 rounded-xl">
              <span className="text-xs font-bold text-[#3B2A20] uppercase mr-1">Active Filters:</span>
              
              {selectedSubs.map(sub => (
                <span key={sub} className="inline-flex items-center bg-white border border-gray-200 text-[#3B2A20] text-xs font-medium px-2.5 py-1 rounded-full shadow-2xs">
                  {sub}
                  <button onClick={() => toggleSubcategory(sub)} className="ml-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedSizes.map(size => (
                <span key={size} className="inline-flex items-center bg-white border border-gray-200 text-[#3B2A20] text-xs font-medium px-2.5 py-1 rounded-full shadow-2xs">
                  Size: {size}
                  <button onClick={() => toggleSize(size)} className="ml-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {selectedColors.map(color => (
                <span key={color} className="inline-flex items-center bg-white border border-gray-200 text-[#3B2A20] text-xs font-medium px-2.5 py-1 rounded-full shadow-2xs">
                  Color: {color}
                  <button onClick={() => toggleColor(color)} className="ml-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {searchQuery && (
                <span className="inline-flex items-center bg-white border border-gray-200 text-[#3B2A20] text-xs font-medium px-2.5 py-1 rounded-full shadow-2xs">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery('')} className="ml-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {currentMaxPrice < maxProductPrice && (
                <span className="inline-flex items-center bg-white border border-gray-200 text-[#3B2A20] text-xs font-medium px-2.5 py-1 rounded-full shadow-2xs">
                  Under Rs. {currentMaxPrice.toLocaleString()}
                  <button onClick={() => setMaxPrice(maxProductPrice)} className="ml-1.5 text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button 
                onClick={resetFilters}
                className="text-xs text-[#F5820B] hover:underline font-bold ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 px-4">
              <p className="text-gray-700 font-semibold text-lg mb-2">No products match your current filters.</p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
                Try resetting some of your filters or broadening your search criteria.
              </p>
              <button 
                onClick={resetFilters}
                className="bg-[#3B2A20] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#F5820B] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
