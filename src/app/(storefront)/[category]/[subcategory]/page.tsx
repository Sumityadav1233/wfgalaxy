import React from 'react';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CategoryClient from '../CategoryClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function SubcategoryPage({ params }: { params: Promise<{ category: string, subcategory: string }> }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.category);
  const subcategoryName = decodeURIComponent(resolvedParams.subcategory);
  
  const supabase = await createClient();
  
  let products: any[] = [];

  try {
    const { data: supaProds } = await supabase
      .from('products')
      .select('*')
      .ilike('category', categoryName)
      .ilike('subcategory', subcategoryName)
      .order('created_at', { ascending: false });

    if (supaProds && supaProds.length > 0) {
      products = supaProds;
    } else {
      const prismaProds = await prisma.product.findMany({
        where: {
          category: { contains: categoryName.toLowerCase() },
          subcategory: { contains: subcategoryName.toLowerCase() },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (prismaProds && prismaProds.length > 0) {
        products = prismaProds;
      }
    }
  } catch (err) {
    console.error('Subcategory fetch error:', err);
  }

  console.log("Products fetched for subcategory:", categoryName, subcategoryName, "Count:", products.length);

  const displayCat = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  const displaySub = subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1);

  return (
    <div className="w-full">
      <div className="pt-32 max-w-7xl mx-auto px-6 lg:px-8 w-full pb-4">
        <Link href={`/${categoryName.toLowerCase()}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#F5820B] transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {displayCat}
        </Link>
      </div>

      <CategoryClient
        categoryName={`${displayCat} - ${displaySub}`}
        initialProducts={products || []}
        description={`Showing all products in ${displayCat} > ${displaySub}. Filter by price, size, color, or sort to find your exact match.`}
        hideSubcategoriesFilter={true}
      />
    </div>
  );
}
