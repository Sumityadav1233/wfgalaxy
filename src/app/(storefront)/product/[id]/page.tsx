import React from 'react';
import { createPublicClient } from '@/lib/supabase/server';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeProductId(id: string): string | null {
  if (!id || typeof id !== 'string') return null;

  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    return null;
  }

  const lower = decoded.toLowerCase();
  // Block directory/path traversal patterns
  if (
    lower.includes('..') ||
    lower.includes('/') ||
    lower.includes('\\') ||
    lower.includes('\0') ||
    lower.includes('%2e') ||
    lower.includes('%2f') ||
    lower.includes('%5c')
  ) {
    return null;
  }

  const cleanId = decoded.trim();
  // Allow only valid alphanumeric IDs, UUIDs, or hyphens/underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
    return null;
  }

  return cleanId;
}

async function fetchProductData(rawProductId: string) {
  const productId = sanitizeProductId(rawProductId);
  if (!productId) return null;

  let product: any = null;

  try {
    const supabase = createPublicClient();
    const numId = Number(productId);

    let { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (!data && !isNaN(numId)) {
      const { data: numData } = await supabase
        .from('products')
        .select('*')
        .eq('id', numId)
        .maybeSingle();
      if (numData) data = numData;
    }

    if (data) product = data;
  } catch (err) {
    console.error('Supabase product fetch failed:', err);
  }

  if (!product) {
    try {
      const prismaProduct = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (prismaProduct) product = prismaProduct;
    } catch (err) {
      console.error('Prisma product fetch error:', err);
    }
  }

  return product;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ img?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const product = await fetchProductData(resolvedParams.id);

  if (!product) {
    return {
      title: 'Product Not Found | WF GALAXY',
    };
  }

  const fallbackImg = Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls[0]
    : (typeof product.image_urls === 'string' ? product.image_urls.split(',')[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop');

  const selectedImg = resolvedSearchParams?.img || fallbackImg;

  return {
    title: `${product.name} | WF GALAXY`,
    description: `Rs. ${Number(product.price || 0).toLocaleString()} - ${product.description || 'WF GALAXY Luxury Boutique Janakpur'}`,
    openGraph: {
      title: product.name,
      description: `Rs. ${Number(product.price || 0).toLocaleString()} | WF GALAXY Janakpur`,
      images: [
        {
          url: selectedImg,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      images: [selectedImg],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await fetchProductData(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full">
      <ProductDetailClient product={product} />
    </div>
  );
}
