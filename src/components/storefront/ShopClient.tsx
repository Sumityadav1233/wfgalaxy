'use client';

import React, { useState, useMemo } from 'react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { SlidersHorizontal, ArrowUpDown, X, RotateCcw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string;
  colors: string;
  images: string;
  videoUrl: string | null;
  createdAt: any;
}

interface ShopClientProps {
  initialProducts: Product[];
}

export const ShopClient: React.FC<ShopClientProps> = ({ initialProducts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Compute maximum price dynamically
  const maxProductPrice = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) return 5000;
    const max = Math.max(...initialProducts.map(p => Number(p.price) || 0));
    return Math.ceil(max) || 5000;
  }, [initialProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(() => maxProductPrice * 2);
  const currentMaxPrice = maxPrice > maxProductPrice ? maxProductPrice : maxPrice;

  // Extract categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [initialProducts]);

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const colors = useMemo(() => {
    const cols = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.colors) {
        p.colors.split(',').forEach((c) => {
          const trimmed = c.trim();
          if (trimmed) cols.add(trimmed);
        });
      }
    });
    return ['All', ...Array.from(cols)];
  }, [initialProducts]);

  // Perform filtering and sorting
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category?.toLowerCase() === selectedCategory.toLowerCase();
        
        const productSizes = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : [];
        const matchesSize = selectedSize === 'All' || productSizes.includes(selectedSize);

        const productColors = product.colors ? product.colors.split(',').map((c) => c.trim()) : [];
        const matchesColor = selectedColor === 'All' || productColors.includes(selectedColor);

        const matchesPrice = (Number(product.price) || 0) <= currentMaxPrice;

        return matchesCategory && matchesSize && matchesColor && matchesPrice;
      })
      .sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        if (sortBy === 'price-low-high') return priceA - priceB;
        if (sortBy === 'price-high-low') return priceB - priceA;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [initialProducts, selectedCategory, selectedSize, selectedColor, currentMaxPrice, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setSelectedColor('All');
    setMaxPrice(maxProductPrice);
    setSortBy('newest');
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3B2A20] mb-3">
          All Products
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm">
          Browse the complete WF GALAXY catalog. Elevated essentials, outerwear, and accessories.
        </p>
      </div>

      {/* Horizontal Scrollable Category Pill Tab Bar */}
      {categories.length > 1 && (
        <div className="mb-8 overflow-x-auto no-scrollbar flex items-center gap-2 py-2 px-1 -mx-2 sm:mx-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold font-sans transition-all flex-shrink-0 border ${
                  isSelected
                    ? 'bg-[#3B2A20] text-white border-[#3B2A20] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {cat === 'All' ? 'Everything' : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-500">
          Showing <strong className="text-[#3B2A20] font-bold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
        </span>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400 font-medium hidden sm:inline">Sort:</span>
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#F5820B]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[#3B2A20] font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={filteredProducts} />
    </div>
  );
};

export default ShopClient;
