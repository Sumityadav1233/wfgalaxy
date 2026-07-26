import React from 'react';
import prisma from '@/lib/db';
import ShopClient from '@/components/storefront/ShopClient';

export const revalidate = 60; // 60s ISR caching for lightning fast CDN responses

export default async function ShopPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Failed to load shop products', err);
  }

  return <ShopClient initialProducts={products} />;
}
