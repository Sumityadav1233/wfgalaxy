import React from 'react';
import SearchClient from '@/components/storefront/SearchClient';
import { createPublicClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';

export const revalidate = 0;

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q || '';
  const query = decodeURIComponent(rawQuery).trim();

  let products: any[] = [];

  try {
    const supabase = createPublicClient();
    const { data: supaProducts } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (supaProducts && supaProducts.length > 0) {
      products = supaProducts;
    }
  } catch (err) {
    console.error('Supabase fetch notice:', err);
  }

  if (products.length === 0) {
    try {
      products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.error('Prisma search fetch error:', err);
    }
  }

  return <SearchClient initialProducts={products} initialQuery={query} />;
}
