'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, MessageCircle, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MobileImageCarouselProps {
  images: string[];
  productName?: string;
  productPrice?: number;
  productSize?: string;
  isOutOfStock?: boolean;
  selectedImage?: string;
  onSelectImage?: (img: string, index: number) => void;
}

export default function MobileImageCarousel({
  images = [],
  productName = 'Product',
  productPrice = 0,
  productSize = '',
  isOutOfStock = false,
  selectedImage = '',
  onSelectImage,
}: MobileImageCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    images = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'];
  }

  // Sync currentIndex when selectedImage prop changes from parent
  useEffect(() => {
    if (selectedImage) {
      const idx = images.indexOf(selectedImage);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
    }
  }, [selectedImage, images]);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsLightboxOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isLightboxOpen]);

  const changeImage = (newIdx: number) => {
    const validIdx = (newIdx + images.length) % images.length;
    setCurrentIndex(validIdx);
    if (onSelectImage && images[validIdx]) {
      onSelectImage(images[validIdx], validIdx);
    }
  };

  const nextImage = () => changeImage(currentIndex + 1);
  const prevImage = () => changeImage(currentIndex - 1);

  const closeLightbox = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsLightboxOpen(false);
  };

  const handleBackToStore = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsLightboxOpen(false);
    try {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/shop');
      }
    } catch {
      router.push('/shop');
    }
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
    
    const message = `${currentImageUrl}

*Inquiry / Order: ${productName}*
Price: Rs. ${productPrice.toLocaleString()}
${productSize ? `Size: ${productSize}\n` : ''}
Hello WF GALAXY, I would like to order this selected item photo!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative w-full space-y-3">
      {/* Carousel Container */}
      <div
        onClick={() => setIsLightboxOpen(true)}
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

        {/* Photo Order Badge (Top Left) */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase z-10 shadow-md border border-white/20">
            Photo {currentIndex + 1} of {images.length}
          </div>
        )}

        {/* Fullsize Zoom trigger badge */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setIsLightboxOpen(true);
          }}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-full shadow-md transition-colors z-10 cursor-pointer"
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#3B2A20] rounded-full p-2 shadow-md transition-transform hover:scale-110 z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#3B2A20] rounded-full p-2 shadow-md transition-transform hover:scale-110 z-10 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* WhatsApp Direct Order floating button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleWhatsAppRedirect();
          }}
          className="absolute bottom-3 right-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-transform hover:scale-105 z-10 cursor-pointer"
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
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  changeImage(idx);
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

      {/* Selected Photo Thumbnails Strip Selector */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 no-scrollbar">
          {images.map((img: string, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => changeImage(idx)}
              className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? 'border-[#F5820B] ring-2 ring-[#F5820B]/40 shadow-md scale-105 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1 rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Full Size Image Modal with Slide Controls */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Header Bar with Navigation Back & Large Close Cross Button */}
          <div 
            className="w-full flex items-center justify-between pt-8 sm:pt-6 px-3 sm:px-6 z-[100000]"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleBackToStore}
              onTouchEnd={handleBackToStore}
              className="flex items-center gap-1.5 text-white/90 bg-white/10 hover:bg-white/20 active:scale-95 px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Showcase</span>
            </button>

            <button
              type="button"
              onClick={closeLightbox}
              onTouchEnd={closeLightbox}
              className="w-12 h-12 flex items-center justify-center text-white bg-white/20 hover:bg-white/30 active:scale-90 rounded-full backdrop-blur-md border border-white/30 transition-all cursor-pointer shadow-xl"
              aria-label="Close image lightbox"
            >
              <X className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>

          {/* Center Image Display & Left/Right Fullscreen Slide Arrows */}
          <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center my-auto px-4">
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 shadow-xl backdrop-blur-md z-[100001] transition-transform active:scale-90 cursor-pointer"
                aria-label="Previous photo in full screen"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>
            )}

            <img
              src={images[currentIndex]}
              alt={`${productName} full view ${currentIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 shadow-xl backdrop-blur-md z-[100001] transition-transform active:scale-90 cursor-pointer"
                aria-label="Next photo in full screen"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Image Slide Dots & WhatsApp Button */}
          <div 
            className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 px-4 z-[100000]"
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
                {currentIndex + 1} / {images.length}
              </span>

              {/* Fullscreen Slide Dots */}
              {images.length > 1 && (
                <div className="flex space-x-1.5 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        currentIndex === idx ? 'bg-[#F5820B] w-5' : 'bg-white/50 w-2'
                      }`}
                      aria-label={`Jump to photo ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleWhatsAppRedirect}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

