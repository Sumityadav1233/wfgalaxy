'use client';

import React, { useState, useMemo } from 'react';
import OrderNowModal from './OrderNowModal';
import MobileImageCarousel from './MobileImageCarousel';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check, Play, Truck, ShieldCheck, RefreshCw, AlertCircle, X } from 'lucide-react';

interface ProductDetailClientProps {
  product: any;
}

function parseImages(product: any): string[] {
  const defaultFallback = ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'];

  if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    return product.image_urls;
  }
  if (typeof product.image_urls === 'string' && product.image_urls.trim().length > 0) {
    return product.image_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  if (typeof product.images === 'string' && product.images.trim().length > 0) {
    return product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return defaultFallback;
}

function parseArrayField(field: any, defaults: string[] = []): string[] {
  if (!field) return defaults;
  if (Array.isArray(field)) return field.map(s => String(s).trim()).filter(Boolean);
  if (typeof field === 'string' && field.trim().length > 0) {
    return field.split(',').map(s => s.trim()).filter(Boolean);
  }
  return defaults;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const images = useMemo(() => parseImages(product), [product]);
  const sizes = useMemo(() => parseArrayField(product.sizes, ['S', 'M', 'L', 'XL']), [product]);
  const colors = useMemo(() => parseArrayField(product.colors, []), [product]);

  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');

  const selectedPhotoIndex = useMemo(() => {
    const idx = images.indexOf(selectedImage);
    return idx !== -1 ? idx : 0;
  }, [images, selectedImage]);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);
  
  // Accordion open states
  const [activeTab, setActiveTab] = useState<string | null>('details');

  const { addToCart } = useCart();

  const isOutOfStock = Boolean(
    product.is_out_of_stock ||
    (product.stock_quantity !== undefined && Number(product.stock_quantity) <= 0)
  );

  const handleAddToCart = () => {
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size first.');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: selectedImage || images[0],
      size: selectedSize || 'Free',
      color: selectedColor || (colors[0] || 'Default'),
    });

    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 2500);
  };

  const handleOrderClick = () => {
    if (isOutOfStock) {
      setShowOutOfStockModal(true);
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size before placing an order.');
      return;
    }
    setIsOrderModalOpen(true);
  };

  const toggleAccordion = (tab: string) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const videoUrl = product.videoUrl || product.video_url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* Mobile Swipeable Image Carousel (Visible on Small / Touch Screens) */}
      <div className="lg:hidden col-span-1 border-b border-gray-100 pb-6">
        <MobileImageCarousel
          images={images}
          productName={product.name}
          productPrice={Number(product.price) || 0}
          productSize={selectedSize}
          isOutOfStock={isOutOfStock}
          selectedImage={selectedImage}
          onSelectImage={(img) => setSelectedImage(img)}
        />
      </div>

      {/* Left Column: Image & Video Gallery (7 cols - Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails list */}
        {images.length > 1 && (
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] no-scrollbar py-1">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`flex-shrink-0 w-20 h-24 md:w-22 md:h-28 bg-gray-100 rounded-xl overflow-hidden transition-all border-2 ${
                  selectedImage === img ? 'border-[#3B2A20] shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Main Image View with Slider Controls */}
        <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden aspect-3/4 relative group shadow-sm border border-gray-100">
          <img 
            src={selectedImage || images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />

          {/* Desktop Image Slider Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  const currentIdx = images.indexOf(selectedImage);
                  const prevIdx = currentIdx <= 0 ? images.length - 1 : currentIdx - 1;
                  setSelectedImage(images[prevIdx]);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#3B2A20] rounded-full p-2.5 shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentIdx = images.indexOf(selectedImage);
                  const nextIdx = (currentIdx + 1) % images.length;
                  setSelectedImage(images[nextIdx]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#3B2A20] rounded-full p-2.5 shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
              <span className="bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-full uppercase tracking-widest shadow-xl border border-red-400">
                Out of Stock
              </span>
            </div>
          )}

          {product.is_latest && !isOutOfStock && (
            <span className="absolute top-4 left-4 bg-[#3B2A20] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              New Arrival
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Details & Purchasing Actions (5 cols) */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        <div>
          <span className="text-xs font-bold text-[#F5820B] uppercase tracking-widest block mb-2">
            {product.category || 'WF GALAXY Collection'}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2A20] mb-3 leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl font-bold text-[#3B2A20]">
              Rs. {Number(product.price || 0).toLocaleString()}
            </span>
            {isOutOfStock ? (
              <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-bold">
                Out of Stock
              </span>
            ) : (
              <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-bold">
                In Stock {product.stock_quantity ? `(${product.stock_quantity} left)` : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description || "A premium everyday essential. Handcrafted with precision and the finest materials for maximum comfort and style."}
          </p>
        </div>

        {/* Colors Selector */}
        {colors.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-3">
              Color: <span className="font-semibold text-gray-600">{selectedColor}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    selectedColor === color
                      ? 'border-[#3B2A20] bg-[#3B2A20] text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#F5820B]'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sizes Selector */}
        {sizes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider">
                Select Size: <span className="font-semibold text-[#F5820B]">{selectedSize}</span>
              </h3>
              <button className="text-xs text-gray-500 underline hover:text-[#F5820B]">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                    selectedSize === size 
                      ? 'border-[#3B2A20] bg-[#3B2A20] text-white shadow-sm scale-105' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-[#3B2A20]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Promo Video Player Section */}
        {videoUrl && (
          <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl">
            <div className="flex items-center space-x-2 text-[#3B2A20] font-bold text-xs uppercase tracking-wider mb-2">
              <Play className="w-4 h-4 text-[#F5820B] fill-[#F5820B]" />
              <span>Product Showcase Video</span>
            </div>
            <video 
              src={videoUrl} 
              controls 
              className="w-full rounded-xl max-h-56 object-cover bg-black"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 flex items-center justify-center py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 border-2 ${
              isOutOfStock
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : addedToCartSuccess
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-[#3B2A20] text-[#3B2A20] hover:bg-[#3B2A20] hover:text-white'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : addedToCartSuccess ? (
              <span className="flex items-center"><Check className="w-4 h-4 mr-2" /> Added to Cart</span>
            ) : (
              <span className="flex items-center"><ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart</span>
            )}
          </button>

          <button
            onClick={handleOrderClick}
            disabled={isOutOfStock}
            className={`flex-1 py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-[#3B2A20] text-white hover:bg-[#F5820B] hover:shadow-lg transform hover:-translate-y-0.5 duration-200'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Order Now'}
          </button>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
          <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center">
            <Truck className="w-5 h-5 text-[#F5820B] mb-1" />
            <span className="text-[11px] font-bold text-gray-700">Fast Shipping</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-[#F5820B] mb-1" />
            <span className="text-[11px] font-bold text-gray-700">100% Authentic</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl flex flex-col items-center">
            <RefreshCw className="w-5 h-5 text-[#F5820B] mb-1" />
            <span className="text-[11px] font-bold text-gray-700">Easy Returns</span>
          </div>
        </div>

        {/* Interactive Accordion Sections */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          {/* Details */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleAccordion('details')}
              className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 text-left font-bold text-[#3B2A20] text-sm"
            >
              <span>Product Specifications</span>
              {activeTab === 'details' ? <ChevronUp className="w-4 h-4 text-[#F5820B]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {activeTab === 'details' && (
              <div className="p-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 space-y-2 bg-white">
                <p><strong>Category:</strong> {product.category || 'General'}</p>
                {product.subcategory && <p><strong>Subcategory:</strong> {product.subcategory}</p>}
                <p><strong>Materials:</strong> Premium Cotton Blend & Handcrafted Finish</p>
                <p><strong>Care:</strong> Machine wash cold inside out, hang dry.</p>
              </div>
            )}
          </div>

          {/* Shipping & Delivery */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleAccordion('shipping')}
              className="w-full flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 text-left font-bold text-[#3B2A20] text-sm"
            >
              <span>Shipping & Delivery</span>
              {activeTab === 'shipping' ? <ChevronUp className="w-4 h-4 text-[#F5820B]" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {activeTab === 'shipping' && (
              <div className="p-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-white">
                <p>We deliver directly to your doorstep across Nepal. Same-day delivery available within Janakpur city limits. Standard delivery takes 2-4 business days.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOrderModalOpen && (
        <OrderNowModal 
          product={{
            ...product,
            image_urls: images,
          }} 
          selectedSize={selectedSize}
          selectedImage={selectedImage}
          selectedPhotoIndex={selectedPhotoIndex}
          totalPhotos={images.length}
          onClose={() => setIsOrderModalOpen(false)} 
        />
      )}

      {/* Out of stock alert modal */}
      {showOutOfStockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center animate-scale-in">
            <button
              onClick={() => setShowOutOfStockModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#3B2A20] mb-2">Item Out of Stock</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              We're sorry! "{product.name}" is currently sold out. Please check back later or contact us on WhatsApp to inquire about restocks.
            </p>
            <button
              onClick={() => setShowOutOfStockModal(false)}
              className="w-full bg-[#3B2A20] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-[#F5820B] transition-colors"
            >
              Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
