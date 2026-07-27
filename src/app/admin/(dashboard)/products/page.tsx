import React from 'react';
import dynamic from 'next/dynamic';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

const ProductsClient = dynamic(() => import('@/components/admin/ProductsClient'), {
  loading: () => (
    <div className="p-12 text-center text-neutral-400 animate-pulse">
      Loading Admin Catalog & Stock Management...
    </div>
  ),
});

export const revalidate = 0;

export default async function AdminProductsPage() {
  let products: any[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      products = data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: Number(p.price) || 0,
        category: p.category || 'General',
        sizes: p.sizes || 'S,M,L',
        colors: p.colors || 'Default',
        images: Array.isArray(p.images) ? p.images.join(',') : (p.images || p.image_urls?.[0] || ''),
        videoUrl: p.videoUrl || p.video_url || null,
        stock_quantity: p.stock_quantity ?? 0,
        low_stock_threshold: p.low_stock_threshold ?? 10,
        is_out_of_stock: p.is_out_of_stock ?? false,
      }));
    }
  } catch (err) {
    console.log('Supabase fetch fallback to Prisma:', err);
  }

  if (products.length === 0) {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    products = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      sizes: p.sizes,
      colors: p.colors,
      images: p.images,
      videoUrl: p.videoUrl,
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      is_out_of_stock: p.is_out_of_stock,
    }));
  }

  return (
    <div className="p-2 sm:p-4">
      <ProductsClient initialProducts={products} />
    </div>
  );
}
