import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CategoryClient from './CategoryClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.category);
  const supabase = await createClient();
  
  // 1. Validate Category Exists
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id, name')
    .ilike('name', categoryName)
    .single();

  if (!categoryData) {
    notFound();
  }

  // 2. Fetch Subcategories for Checkbox Filters
  let subcategories: string[] = [];
  const { data: subs } = await supabase
    .from('subcategories')
    .select('name')
    .eq('category_id', categoryData.id)
    .order('name');
    
  if (subs) {
    subcategories = subs.map(s => s.name);
  }

  // 3. Fetch all products for this category
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .ilike('category', categoryName)
    .order('created_at', { ascending: false });

  return (
    <CategoryClient 
      categoryName={categoryData.name} 
      subcategories={subcategories} 
      initialProducts={products || []} 
    />
  );
}
