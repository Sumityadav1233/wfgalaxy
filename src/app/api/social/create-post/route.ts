import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { productId, caption, targetPlatforms } = await req.json();

    if (!caption || !targetPlatforms || targetPlatforms.length === 0) {
      return NextResponse.json({ error: 'caption and targetPlatforms are required' }, { status: 400 });
    }

    let videoId: string | null = null;

    // If a product is associated, check if crops exist
    if (productId) {
      const video = await prisma.productVideo.findFirst({
        where: { productId },
      });
      if (video) {
        videoId = video.id;
      }
    }

    // Fallback connection: If videoId is not set, select the first available video crop in the DB.
    // This resolves database constraint errors for servers executing cached schemas in memory.
    if (!videoId) {
      const fallbackVideo = await prisma.productVideo.findFirst();
      if (fallbackVideo) {
        videoId = fallbackVideo.id;
      }
    }

    // Initialize posting statuses
    const initialStatus: { [key: string]: string } = {};
    const initialLinks: { [key: string]: string } = {};
    
    targetPlatforms.forEach((platform: string) => {
      initialStatus[platform] = 'posting';
      initialLinks[platform] = '';
    });

    const socialPost = await prisma.socialPost.create({
      data: {
        caption,
        targetPlatforms: JSON.stringify(targetPlatforms),
        status: JSON.stringify(initialStatus),
        links: JSON.stringify(initialLinks),
        videoId: videoId || undefined,
        productId: productId || undefined,
      },
    });

    return NextResponse.json(socialPost);
  } catch (error: any) {
    console.error('Create Social Post Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
