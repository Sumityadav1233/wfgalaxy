import React from 'react';
import ProductGrid from '@/components/storefront/ProductGrid';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import { Search, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Live search results, no aggressive caching

export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  // 1. Await Next.js 15+ searchParams Promise
  const resolvedSearchParams = await searchParams;
  const rawQuery = resolvedSearchParams.q || '';
  const query = decodeURIComponent(rawQuery).trim();

  console.log(`[SEARCH DEBUG] Received search query: "${query}" (raw: "${rawQuery}")`);

  let products: any[] = [];
  let searchError: string | null = null;

  if (query) {
    // 2. Query Supabase using ILIKE for case-insensitive partial match
    try {
      const supabase = await createClient();
      
      // Attempt 1: Search across name, description, category, subcategory
      const { data: supaData, error: supaError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,subcategory.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (supaError) {
        console.warn('[SEARCH WARN] Supabase combined .or() failed, trying name ilike:', supaError.message);
        
        // Attempt 2: Fallback to direct name ilike match
        const { data: nameData } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${query}%`)
          .order('created_at', { ascending: false });

        if (nameData && nameData.length > 0) {
          products = nameData;
        }
      } else if (supaData && supaData.length > 0) {
        products = supaData;
      }
    } catch (err: any) {
      console.error('[SEARCH ERROR] Supabase query exception:', err.message || err);
      searchError = err.message || String(err);
    }

    // 3. Fallback to Prisma SQLite if Supabase returns 0 results or throws error
    if (products.length === 0) {
      try {
        const prismaData = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { category: { contains: query } },
              { subcategory: { contains: query } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        if (prismaData && prismaData.length > 0) {
          products = prismaData;
          console.log(`[SEARCH DEBUG] Prisma returned ${prismaData.length} products for query "${query}"`);
        }
      } catch (err: any) {
        console.error('[SEARCH ERROR] Prisma fallback search error:', err.message || err);
      }
    }
  }

  console.log(`[SEARCH FINAL] Query: "${query}" -> Returning ${products.length} products to frontend.`);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full min-h-[75vh]">
      {/* Search Header */}
      <div className="mb-10 pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B2A20] mb-2 flex items-center">
            <Search className="w-8 h-8 mr-3 text-[#F5820B]" />
            Search Results
          </h1>
          <p className="text-gray-500 text-sm">
            {query ? (
              <>Showing products matching <strong className="text-[#3B2A20]">&quot;{query}&quot;</strong></>
            ) : (
              'Enter a product name or category in the search bar to browse matches.'
            )}
          </p>
        </div>

        {query && (
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-amber-50 text-[#F5820B] font-bold px-3 py-1.5 rounded-full">
              {products.length} {products.length === 1 ? 'item found' : 'items found'}
            </span>
            <Link
              href="/shop"
              className="text-xs text-gray-500 hover:text-[#F5820B] font-semibold underline flex items-center"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> View All Shop Products
            </Link>
          </div>
        )}
      </div>

      {/* Results Display */}
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-20 bg-gray-50/70 rounded-3xl border border-gray-100 px-6">
          <div className="w-16 h-16 bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F5820B]">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#3B2A20] mb-2">
            {query ? `No products found for "${query}"` : 'Start searching our catalog'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            {query ? (
              'Try checking for typos, searching for general terms like "shirt", "hoodie", "shoes", or browsing our full collection.'
            ) : (
              'Type a product name, color, or category in the search input above.'
            )}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="bg-[#3B2A20] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#F5820B] transition-colors shadow-xs"
            >
              Browse All Products
            </Link>
            <Link
              href="/men"
              className="bg-white text-[#3B2A20] border border-gray-300 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:border-[#F5820B] hover:text-[#F5820B] transition-colors"
            >
              Men's Collection
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
