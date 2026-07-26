import React from 'react';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: any[];
  title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-12 text-center text-gray-500 font-sans text-sm">
        No products found.
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl md:text-3xl font-serif text-[#3B2A20] mb-6">{title}</h2>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
