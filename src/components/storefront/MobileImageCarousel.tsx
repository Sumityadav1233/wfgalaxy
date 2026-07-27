'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, MessageCircle, X } from 'lucide-react';
import Image from 'next/image';

interface MobileImageCarouselProps {
  images: string[];
  productName?: string;
  productPrice?: number;
  productSize?: string;
  isOutOfStock?: boolean;
}

export default function MobileImageCarousel({
  images = [],
  productName = 'Product',
  productPrice = 0,
  productSize = '',
  isOutOfStock = false,
}: MobileImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    images = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'];
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 40) {
      nextImage(); // Swiped left
    } else if (diff < -40) {
      prevImage(); // Swiped right
    }
    touchStartX.current = null;
  };

  const handleWhatsAppRedirect = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
    const currentImageUrl = images[currentIndex] || images[0];
    
    const message = `*Inquiry / Order: ${productName}*
Price: Rs. ${productPrice.toLocaleString()}
${productSize ? `Size: ${productSize}\n` : ''}Product Image: ${currentImageUrl}

Hello WF GALAXY, I would like to order this item!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div
        className="relative w-full h-80 sm:h-96 md:h-[450px] bg-gray-100 rounded-2xl overflow-hidden shadow-xs group border border-gray-100 cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[currentIndex]}
          alt={`${productName} view ${currentIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          priority={currentIndex === 0}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Fullsize Zoom trigger badge */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-full shadow-md transition-colors z-10"
          aria-label="View full size image"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Out of Stock overlay if applicable */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
            <span className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-full uppercase tracking-widest shadow-xl border border-red-400">
              Out of Stock
            </span>
          </div>
        )}

        {/* Left / Right Arrow buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#3B2A20] rounded-full p-2 shadow-md transition-transform hover:scale-110 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#3B2A20] rounded-full p-2 shadow-md transition-transform hover:scale-110 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* WhatsApp Direct Order floating button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWhatsAppRedirect();
          }}
          className="absolute bottom-3 right-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-transform hover:scale-105 z-10"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask on WhatsApp</span>
        </button>

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Full Size Image Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10"
            aria-label="Close image lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`${productName} full view`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
