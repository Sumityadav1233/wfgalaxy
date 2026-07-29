'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: any;
}

function parseProductImages(product: any): string[] {
  const defaultFallback = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';

  let list: string[] = [];

  if (Array.isArray(product.image_urls)) {
    list = product.image_urls.filter((url: any) => typeof url === 'string' && url.trim().length > 0);
  } else if (typeof product.image_urls === 'string' && product.image_urls.trim().length > 0) {
    list = product.image_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (list.length === 0) {
    if (Array.isArray(product.images)) {
      list = product.images.filter((url: any) => typeof url === 'string' && url.trim().length > 0);
    } else if (typeof product.images === 'string' && product.images.trim().length > 0) {
      list = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return list.length > 0 ? list : [defaultFallback];
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const images = parseProductImages(product);
  const mainImage = images[0];
  const secondImage = images[1] || mainImage;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(prev => !prev);
  };

  return (
    <Link href={`/product/${product.id}`} className="group block w-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F4F0] rounded-2xl mb-3 shadow-xs transition-all duration-300 group-hover:shadow-md">
        {/* Out of Stock / New Badge */}
        {product.is_out_of_stock || (product.stock_quantity !== undefined && Number(product.stock_quantity) <= 0) ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            Sold Out
          </div>
        ) : product.is_latest ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-[#3B2A20] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            New
          </div>
        ) : null}

        {/* Wishlist Heart Icon Button (Top Right of Card) */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/80 backdrop-blur-xs text-gray-700 hover:text-red-500 hover:bg-white shadow-xs transition-all transform active:scale-90"
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Main Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Second Hover Image */}
        <img
          src={secondImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = mainImage;
          }}
        />
      </div>

      {/* Card Info */}
      <div className="flex flex-col space-y-1 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {product.category || 'WF GALAXY'}
        </span>
        <h3 className="font-sans text-sm md:text-base text-[#3B2A20] font-semibold line-clamp-2 group-hover:text-[#F5820B] transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-[#3B2A20] pt-0.5">
          Rs. {Number(product.price || 0).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
