import React from 'react';
import prisma from '@/lib/db';
import SocialClient from '@/components/admin/SocialClient';

export const revalidate = 0; // Disable Next.js caching to pull live channels and crops

export default async function AdminSocialPage() {
  let products: any[] = [];
  let accounts: any[] = [];
  let videoRecords: any[] = [];
  let postsHistory: any[] = [];

  try {
    // 1. Fetch products with all fields (including price and description)
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch social accounts
    accounts = await prisma.socialAccount.findMany({
      orderBy: { platform: 'asc' },
    });

    // 3. Fetch product video records
    videoRecords = await prisma.productVideo.findMany({});

    // 4. Fetch posts history
    postsHistory = await prisma.socialPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            images: true,
          },
        },
      },
    });
  } catch (err) {
    console.error('Failed to load social page database entries', err);
  }

  return (
    <SocialClient
      products={products}
      accounts={accounts}
      videoRecords={videoRecords}
      postsHistory={postsHistory}
    />
  );
}
