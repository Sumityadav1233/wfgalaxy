import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { id, name, description, price, category, sizes, colors, images, videoUrl } = await req.json();

    if (!id || !name || !description || !price || !category || !sizes || !colors || !images) {
      return NextResponse.json({ error: 'Missing required update fields' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
