import React from 'react';
import Link from 'next/link';
import ProductGrid from '@/components/storefront/ProductGrid';
import { Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // Revalidate every minute

async function getLatestProducts() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching latest products:', error);
    return [];
  }
  return products || [];
}

export default async function HomePage() {
  const latestProducts = await getLatestProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center bg-[#F3F1EC] pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero Fashion" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 space-y-8 glassmorphism p-8 md:p-12 rounded-3xl animate-slide-up">
            <div className="mb-2">
              <img src="/logo.png" alt="WF GALAXY Logo" className="h-24 md:h-32 w-auto object-contain" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#3B2A20] leading-tight">
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

          <div className="md:w-1/3 hidden md:flex flex-col space-y-6 animate-slide-in-right mt-12 md:mt-0">
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
