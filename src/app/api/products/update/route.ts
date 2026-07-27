import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, price, category, sizes, colors, images, videoUrl, stock_quantity, low_stock_threshold, is_out_of_stock } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (sizes !== undefined) updateData.sizes = Array.isArray(sizes) ? sizes.join(',') : String(sizes);
    if (colors !== undefined) updateData.colors = Array.isArray(colors) ? colors.join(',') : String(colors);
    if (images !== undefined) updateData.images = Array.isArray(images) ? images.join(',') : String(images);
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null;
    
    if (stock_quantity !== undefined) {
      const qty = parseInt(stock_quantity, 10) || 0;
      updateData.stock_quantity = qty;
      updateData.is_out_of_stock = is_out_of_stock !== undefined ? Boolean(is_out_of_stock) : qty <= 0;
    } else if (is_out_of_stock !== undefined) {
      updateData.is_out_of_stock = Boolean(is_out_of_stock);
    }

    if (low_stock_threshold !== undefined) {
      updateData.low_stock_threshold = parseInt(low_stock_threshold, 10) || 10;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
