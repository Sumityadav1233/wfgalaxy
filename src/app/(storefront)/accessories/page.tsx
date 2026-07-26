import React from 'react';
import CategoryClient from '../[category]/CategoryClient';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function AccessoriesPage() {
  const supabase = await createClient();

  // Fetch Category & Subcategories
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id, name')
    .ilike('name', 'accessories')
    .single();

  let subcategories: string[] = [];
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
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('category', 'accessories')
    .order('created_at', { ascending: false });

  return (
    <CategoryClient 
      categoryName="Accessories" 
      subcategories={subcategories} 
      initialProducts={products || []}
      description="The perfect finishing touches for your everyday look. Explore wallets, belts, bags, and more."
    />
  );
}
