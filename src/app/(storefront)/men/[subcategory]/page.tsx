import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CategoryClient from '../../[category]/CategoryClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function MenSubcategoryPage({ params }: { params: Promise<{ subcategory: string }> }) {
  const resolvedParams = await params;
  const decodedSubcategory = decodeURIComponent(resolvedParams.subcategory);
  
  const supabase = await createClient();
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('category', 'men')
    .ilike('subcategory', decodedSubcategory)
    .order('created_at', { ascending: false });

  const displayTitle = decodedSubcategory.charAt(0).toUpperCase() + decodedSubcategory.slice(1);

  return (
    <div className="w-full">
      <div className="pt-32 max-w-7xl mx-auto px-6 lg:px-8 w-full pb-4">
        <Link href="/men" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#F5820B] transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Men's Collection
        </Link>
      </div>

      <CategoryClient
        categoryName={`Men's ${displayTitle}`}
        initialProducts={products || []}
        description={`Showing all products in Men's ${displayTitle}. Filter by price, size, color, or sort to find your style.`}
        hideSubcategoriesFilter={true}
      />
    </div>
  );
}
