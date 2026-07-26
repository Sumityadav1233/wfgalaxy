import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, price, category, sizes, colors, images, videoUrl } = await req.json();

    if (!name || !description || !price || !category || !sizes || !colors || !images) {
      return NextResponse.json({ error: 'Missing required product details' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        sizes,
        colors,
        images,
        videoUrl: videoUrl || null,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
