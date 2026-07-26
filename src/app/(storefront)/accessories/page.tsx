import React from 'react';
import CategoryClient from '../[category]/CategoryClient';
import { createPublicClient } from '@/lib/supabase/server';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function AccessoriesPage() {
  let subcategories: string[] = [];
  let products: any[] = [];

  try {
    const supabase = createPublicClient();

    // Fetch Category & Subcategories
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', 'accessories')
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
      .ilike('category', 'accessories')
      .order('created_at', { ascending: false });

    if (prods) {
      products = prods;
    }
  } catch (err) {
    console.error('Error fetching accessories page data:', err);
  }

  return (
    <CategoryClient 
      categoryName="Accessories" 
      subcategories={subcategories} 
      initialProducts={products}
      description="The perfect finishing touches for your everyday look. Explore wallets, belts, bags, and more."
    />
  );
}
