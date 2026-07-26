'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

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
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Extract unique categories, sizes, and colors for filters dynamically
  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category));
    return ['All', ...Array.from(cats)];
  }, [initialProducts]);

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const colors = useMemo(() => {
    const cols = new Set<string>();
    initialProducts.forEach((p) => {
      p.colors.split(',').forEach((c) => cols.add(c.trim()));
    });
    return ['All', ...Array.from(cols)];
  }, [initialProducts]);

  // Perform filtering and sorting
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        
        const productSizes = product.sizes.split(',').map((s) => s.trim());
        const matchesSize = selectedSize === 'All' || productSizes.includes(selectedSize);

        const productColors = product.colors.split(',').map((c) => c.trim());
        const matchesColor = selectedColor === 'All' || productColors.includes(selectedColor);

        const matchesPrice = product.price <= maxPrice;

        return matchesCategory && matchesSize && matchesColor && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low-high') return a.price - b.price;
        if (sortBy === 'price-high-low') return b.price - a.price;
        // Default to newest (based on creation date or id string comparison)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [initialProducts, selectedCategory, selectedSize, selectedColor, maxPrice, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="border-b border-border pb-5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">SHOP ALL</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse the WF GALAXY catalog. Discover elevated essentials and outerwear.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
        {/* Filters Panel (Sidebar on desktop) */}
        <div className="space-y-6 bg-muted/30 p-5 rounded-md border border-border h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm font-semibold tracking-wider uppercase flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-accent stroke-[1.8]" />
              Filters
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSize('All');
                setSelectedColor('All');
                setMaxPrice(150);
                setSortBy('newest');
              }}
              className="text-xs text-accent hover:text-accent-hover font-medium underline"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Category</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center text-sm cursor-pointer select-none">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="h-4 w-4 border-border text-accent focus:ring-accent rounded-xs mr-3 accent-primary"
                  />
                  <span className={selectedCategory === cat ? 'text-primary font-semibold' : 'text-neutral-600'}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 border text-xs font-semibold tracking-wider transition-colors ${
                    selectedSize === size
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-border text-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Color</h3>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-background border border-border rounded-sm py-2 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
            >
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-primary mb-3">
              <span>Max Price</span>
              <span className="text-accent">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>$20</span>
              <span>$200</span>
            </div>
          </div>
        </div>

        {/* Product Grid & Sorting (Right Side) */}
        <div className="lg:col-span-3 mt-6 lg:mt-0">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
            <span className="text-sm font-medium text-neutral-500">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </span>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border border-border rounded-sm py-1.5 px-3 text-xs focus:outline-hidden focus:border-accent text-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-md border border-dashed border-border">
              <p className="text-base font-semibold text-muted-foreground">No products found</p>
              <p className="mt-2 text-sm text-neutral-400">Try adjusting your filter settings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {filteredProducts.map((product) => {
                const imageArray = product.images.split(',');
                return (
                  <div key={product.id} className="group relative flex flex-col justify-between border border-border/40 p-3 rounded-md hover:shadow-lg transition-all duration-300 bg-background">
                    <div className="w-full h-80 rounded-md overflow-hidden bg-muted group-hover:opacity-90 transition-opacity relative">
                      <img
                        src={imageArray[0]}
                        alt={product.name}
                        className="w-full h-full object-center object-cover"
                      />
                      {product.videoUrl && (
                        <span className="absolute top-3 left-3 bg-primary/80 text-accent text-[9px] px-2 py-0.5 rounded-xs tracking-wider uppercase font-semibold">
                          Promo Video
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-primary">
                          <Link href={`/product/${product.id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <p className="text-sm font-bold text-accent">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ShopClient;
