import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CategoryClient from '../[category]/CategoryClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function MenCategoryPage() {
  const supabase = await createClient();
  
  // 1. Find the "men" category ID
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'men')
    .single();

  let subcategories: string[] = [];

  // 2. Fetch its subcategories
  if (categoryData) {
    const { data: subs } = await supabase
      .from('subcategories')
      .select('name')
      .eq('category_id', categoryData.id)
      .order('name');
      
    if (subs) {
      subcategories = subs.map(s => s.name);
    }
  }

  // Fallback subcategories if DB is empty
  if (subcategories.length === 0) {
    subcategories = [
      'T-Shirt', 'Pant', 'Hoodies', 'Jacket', 'Formal', 
      'Vest', 'Shirts', 'Sweaters', 'Jeans', 'Trackpants', 'Kurta'
    ];
  }

  // 3. Fetch products for Men
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('category', 'men')
    .order('created_at', { ascending: false });

  return (
    <div className="w-full">
      {/* Subcategory Grid Banner */}
      <div className="pt-32 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3B2A20] mb-4">Men's Collection</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore our premium range of men's clothing. Handpicked styles for the modern gentleman, crafted with uncompromising quality.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            Browse by Subcategory
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subcategories.map((sub) => (
              <Link 
                key={sub} 
                href={`/men/${sub.toLowerCase()}`}
                className="group relative py-4 px-3 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 hover:border-[#F5820B] hover:shadow-xs transition-all text-center"
              >
                <span className="font-serif text-sm font-bold text-[#3B2A20] group-hover:text-[#F5820B] transition-colors">
                  {sub}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Filter & Product Catalog Section */}
      <CategoryClient
        categoryName="Men"
        subcategories={subcategories}
        initialProducts={products || []}
        description="Filter and discover items from our complete men's collection below."
      />
    </div>
  );
}
