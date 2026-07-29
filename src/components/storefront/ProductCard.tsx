'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Maximize2, X, ArrowLeft } from 'lucide-react';

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
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const images = parseProductImages(product);
  const mainImage = images[0];
  const secondImage = images[1] || mainImage;

  useEffect(() => {
    if (isZoomOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsZoomOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isZoomOpen]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(prev => !prev);
  };

  const openBigImage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsZoomOpen(true);
  };

  const closeBigImage = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsZoomOpen(false);
  };

  return (
    <>
      <div className="group block w-full relative">
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

          {/* Controls: Quick Zoom & Wishlist Buttons */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            <button
              type="button"
              onClick={openBigImage}
              onTouchEnd={openBigImage}
              className="p-2 rounded-full bg-white/80 backdrop-blur-xs text-gray-700 hover:text-[#F5820B] hover:bg-white shadow-xs transition-all transform active:scale-90 cursor-pointer"
              title="View actual size photo"
              aria-label="View actual size photo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleWishlist}
              className="p-2 rounded-full bg-white/80 backdrop-blur-xs text-gray-700 hover:text-red-500 hover:bg-white shadow-xs transition-all transform active:scale-90 cursor-pointer"
              aria-label="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>

          <Link href={`/product/${product.id}`} className="block w-full h-full">
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
          </Link>
        </div>

        {/* Card Info */}
        <Link href={`/product/${product.id}`} className="flex flex-col space-y-1 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {product.category || 'WF GALAXY'}
          </span>
          <h3 className="font-sans text-sm md:text-base text-[#3B2A20] font-semibold line-clamp-2 group-hover:text-[#F5820B] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-[#3B2A20] pt-0.5">
            Rs. {Number(product.price || 0).toLocaleString()}
          </p>
        </Link>
      </div>

      {/* Full-Screen Big Size Photo Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none"
          onClick={closeBigImage}
          onTouchEnd={closeBigImage}
        >
          {/* Top Header Bar with Back to Showcase & X Cross Button */}
          <div
            className="w-full flex items-center justify-between pt-8 sm:pt-6 px-3 sm:px-6 z-[100000]"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeBigImage}
              onTouchEnd={closeBigImage}
              className="flex items-center gap-1.5 text-white/90 bg-white/10 hover:bg-white/20 active:scale-95 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Showcase</span>
            </button>

            <button
              type="button"
              onClick={closeBigImage}
              onTouchEnd={closeBigImage}
              className="w-12 h-12 flex items-center justify-center text-white bg-white/20 hover:bg-white/30 active:scale-90 rounded-full backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xl"
              aria-label="Close big photo view"
            >
              <X className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Big Size Image View */}
          <div
            className="relative max-w-5xl max-h-[78vh] w-full h-full flex items-center justify-center my-auto p-2"
            onClick={closeBigImage}
          >
            <img
              src={mainImage}
              alt={`${product.name} actual size view`}
              className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Bottom Bar: Title, Price & Details Link */}
          <div
            className="w-full flex items-center justify-between pb-6 px-4 z-[100000]"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-white font-serif font-bold text-sm sm:text-base">{product.name}</h4>
              <p className="text-[#F5820B] text-xs font-bold">Rs. {Number(product.price || 0).toLocaleString()}</p>
            </div>

            <Link
              href={`/product/${product.id}`}
              onClick={closeBigImage}
              className="bg-[#F5820B] hover:bg-[#e0760a] text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg transition-transform active:scale-95"
            >
              View Details &rarr;
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
