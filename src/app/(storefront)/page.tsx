import React from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/storefront/ProductGrid';
import { Play } from 'lucide-react';
import { createPublicClient } from '@/lib/supabase/server';

import prisma from '@/lib/db';

export const revalidate = 60; // ISR static regeneration every minute

async function getLatestProducts() {
  try {
    const supabase = createPublicClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && products && products.length > 0) {
      return products;
    }
  } catch (err) {
    console.error('Exception in getLatestProducts:', err);
  }

  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return dbProducts;
  } catch (err) {
    console.error('Prisma fallback error:', err);
    return [];
  }
}

export default async function HomePage() {
  const latestProducts = await getLatestProducts();

  return (
    <div className="flex flex-col">
      {/* Redesigned Hero Section */}
      <section className="relative bg-[#FAF9F6] pt-20 pb-4 md:py-20 md:h-[90vh] md:min-h-[600px] flex items-center">
        {/* Desktop Only Background Image */}
        <div className="hidden md:block absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Fashion" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between">
          
          {/* Mobile Clean Hero Layout (Full Width Reel Video Card, No Duplicate Logo) */}
          <div className="w-full md:hidden flex flex-col items-center">
            <Link href="/men" className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-200 aspect-[4/5] relative group block bg-[#FAF9F6]">
              <video 
                src="/hero-video.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover object-center scale-105"
                style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
              />
              <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl flex justify-between items-center shadow-sm z-10">
                <span className="font-serif text-xs font-bold text-[#3B2A20]">Men's Collection 2026</span>
                <span className="text-xs font-bold text-[#F5820B]">Explore &rarr;</span>
              </div>
            </Link>
          </div>

          {/* Desktop Rich Glassmorphism Layout */}
          <div className="hidden md:flex md:w-1/2 flex-col space-y-8 glassmorphism p-12 rounded-3xl animate-slide-up">
            <div className="mb-2">
              <img src="/logo.png" alt="WF GALAXY Logo" className="h-32 w-auto object-contain" />
            </div>
            <h1 className="font-serif text-6xl lg:text-7xl font-bold text-[#3B2A20] leading-tight">
              Carry style with confidence,<br /> everyday essential
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Discover elevated essentials and luxury outerwear at WF GALAXY, Shiv Chowk, Janakpur.
            </p>
            <div className="flex items-center space-x-6 pt-4">
              <Link href="/men" className="bg-[#F5820B] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-[#e0760a] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300">
                Get Styled
              </Link>
              <Link href="/shop" className="flex items-center space-x-3 text-[#3B2A20] hover:text-[#F5820B] transition-colors group">
                <div className="bg-white p-4 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300">
                  <Play className="h-5 w-5 fill-current ml-1 text-[#F5820B]" />
                </div>
                <span className="font-bold tracking-wider uppercase text-sm">Shop All</span>
              </Link>
            </div>
          </div>

          {/* Desktop Right Card */}
          <div className="hidden md:flex md:w-1/3 flex-col space-y-6 animate-slide-in-right mt-12 md:mt-0">
            <div className="bg-white p-4 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer w-64 self-end">
              <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop" alt="New Addition" className="w-full aspect-[4/5] object-cover rounded-xl mb-4" />
              <div className="flex justify-between items-center">
                <span className="font-serif font-bold text-[#3B2A20]">New Addition</span>
                <span className="text-[#F5820B] font-bold">Explore &rarr;</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Latest Items Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif font-bold text-[#3B2A20] mb-2">Latest Items</h2>
              <p className="text-gray-500">Fresh arrivals to elevate your wardrobe.</p>
            </div>
            <Link href="/shop" className="text-[#F5820B] font-bold hover:underline mb-2">View All &rarr;</Link>
          </div>
          
          <ProductGrid products={latestProducts} />
        </div>
      </section>

      {/* About / Brand Strip */}
      <section className="py-24 bg-[#3B2A20] text-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.png" alt="WF GALAXY Logo" className="h-10 w-auto object-contain bg-white/10 p-1 rounded-lg" />
                <h3 className="font-serif text-2xl font-bold text-[#FDE68A]">About Us</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                WF GALAXY is a luxury fashion boutique located at Shiv Chowk, Janakpur. We specialize in high-quality, handcrafted minimalistic essentials and premium outerwear.
              </p>
            </div>
            <div className="space-y-4 md:border-l md:border-r border-gray-700 px-6">
              <h3 className="font-serif text-2xl font-bold text-[#FDE68A]">100% Quality Assurance</h3>
              <p className="text-gray-300 leading-relaxed">
                Our garments are crafted from the finest organic cotton and premium materials, ensuring maximum comfort, breathability, and durability for everyday style.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-[#FDE68A]">Visit Our Boutique</h3>
              <p className="text-gray-300 leading-relaxed">
                Located at Shiv Chowk, Janakpur. Open daily 9:00 AM – 8:00 PM. Hotlines: 9709141876 / 9709143347 / 9705447139.
              </p>
              <Link href="/contact" className="inline-block mt-4 px-6 py-2 border border-[#FDE68A] text-[#FDE68A] rounded-full hover:bg-[#FDE68A] hover:text-[#3B2A20] transition-colors font-bold uppercase tracking-wider text-xs">
                Contact & Directions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
