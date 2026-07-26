import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_urls: string[];
    is_latest?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
  const secondImage = product.image_urls && product.image_urls.length > 1 ? product.image_urls[1] : mainImage;

  return (
    <Link href={`/product/${product.id}`} className="group block w-full">
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100 rounded-sm mb-4">
        {product.is_latest && (
          <div className="absolute top-3 left-3 z-10 bg-white text-[#3B2A20] text-xs font-bold px-2 py-1 uppercase tracking-wider">
            New
          </div>
        )}
        <img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        <img
          src={secondImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>
      <div className="flex flex-col space-y-1">
        <h3 className="font-serif text-lg text-[#3B2A20] font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">Rs. {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
