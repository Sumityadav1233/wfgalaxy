import React from 'react';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  let product: any = null;

  // 1. Attempt lookup in Supabase
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (data) {
      product = data;
    }
  } catch (err) {
    console.error('Supabase product fetch failed, falling back to Prisma:', err);
  }

  // 2. Fallback to Prisma SQLite if not found in Supabase
  if (!product) {
    try {
      const prismaProduct = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (prismaProduct) {
        product = prismaProduct;
      }
    } catch (err) {
      console.error('Prisma product fetch error:', err);
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full">
      <ProductDetailClient product={product} />
    </div>
  );
}
