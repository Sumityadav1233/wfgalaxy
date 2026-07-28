import React from 'react';
import { createPublicClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import ShopClient from '@/components/storefront/ShopClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
  let products: any[] = [];

  try {
    const supabase = createPublicClient();
    const { data: supaProds } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (supaProds && supaProds.length > 0) {
      products = supaProds;
    } else {
      const dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      products = dbProducts;
    }
  } catch (err) {
    console.error('Failed to load shop products', err);
    try {
      products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (pErr) {
      console.error('Prisma shop fallback error:', pErr);
    }
  }

  return <ShopClient initialProducts={products} />;
}
