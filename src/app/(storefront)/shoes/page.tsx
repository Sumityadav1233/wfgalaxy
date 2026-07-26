import React from 'react';
import CategoryClient from '../[category]/CategoryClient';
import { createPublicClient } from '@/lib/supabase/server';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function ShoesPage() {
  let subcategories: string[] = [];
  let products: any[] = [];

  try {
    const supabase = createPublicClient();

    // Fetch Category & Subcategories
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', 'shoes')
      .single();

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

    // Fetch Products
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .ilike('category', 'shoes')
      .order('created_at', { ascending: false });

    if (prods) {
      products = prods;
    }
  } catch (err) {
    console.error('Error fetching shoes page data:', err);
  }

  return (
    <CategoryClient 
      categoryName="Shoes" 
      subcategories={subcategories} 
      initialProducts={products}
      description="Step into style with our exclusive range of footwear. Handcrafted with precision and designed for comfort."
    />
  );
}
