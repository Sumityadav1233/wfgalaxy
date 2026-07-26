import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { VideoProcessor } from '@/lib/videoProcessor';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.videoUrl) {
      return NextResponse.json({ error: 'Product does not have a raw video URL' }, { status: 400 });
    }

    // Call simulated video processing crop generator
    const crops = await VideoProcessor.generateCrops(product.videoUrl);

    // Save or update ProductVideo record in database
    const existingVideo = await prisma.productVideo.findFirst({
      where: { productId },
    });

    let videoRecord;

    if (existingVideo) {
      videoRecord = await prisma.productVideo.update({
        where: { id: existingVideo.id },
        data: {
          rawUrl: product.videoUrl,
          verticalUrl: crops.verticalUrl,
          squareUrl: crops.squareUrl,
          horizontalUrl: crops.horizontalUrl,
        },
      });
    } else {
      videoRecord = await prisma.productVideo.create({
        data: {
          productId,
          rawUrl: product.videoUrl,
          verticalUrl: crops.verticalUrl,
          squareUrl: crops.squareUrl,
          horizontalUrl: crops.horizontalUrl,
        },
      });
    }

    return NextResponse.json(videoRecord);
  } catch (error: any) {
    console.error('Video Cropping API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
