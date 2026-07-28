import React from 'react';
import { createPublicClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import CategoryClient from './CategoryClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.category);
  
  let subcategories: string[] = [];
  let products: any[] = [];
  let categoryData: any = null;

  try {
    const supabase = createPublicClient();
    
    // 1. Validate Category Exists
    const { data: cat } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', categoryName)
      .maybeSingle();

    if (cat) {
      categoryData = cat;
      
      // 2. Fetch Subcategories for Checkbox Filters
      const { data: subs } = await supabase
        .from('subcategories')
        .select('name')
        .eq('category_id', cat.id)
        .order('name');
        
      if (subs) {
        subcategories = subs.map(s => s.name);
      }
    }

    // 3. Fetch all products for this category (always execute)
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .ilike('category', categoryName)
      .order('created_at', { ascending: false });

    if (prods && prods.length > 0) {
      products = prods;
    } else {
      // Prisma fallback
      const prismaProds = await prisma.product.findMany({
        where: { category: { contains: categoryName.toLowerCase() } },
        orderBy: { createdAt: 'desc' },
      });
      if (prismaProds && prismaProds.length > 0) {
        products = prismaProds;
      }
    }

    console.log("Products fetched for category:", categoryName, "Count:", products.length);
  } catch (err) {
    console.error('Error fetching category page:', err);
  }

  const displayName = categoryData?.name || categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return (
    <CategoryClient 
      categoryName={displayName} 
      subcategories={subcategories} 
      initialProducts={products} 
    />
  );
}
