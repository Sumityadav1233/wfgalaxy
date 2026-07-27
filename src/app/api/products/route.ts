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
    const {
      name,
      description,
      price,
      category,
      sizes,
      colors,
      images,
      videoUrl,
      stock_quantity = 0,
      low_stock_threshold = 10,
      is_out_of_stock,
    } = await req.json();

    if (!name || !description || !price || !category || !sizes || !colors || !images) {
      return NextResponse.json({ error: 'Missing required product details' }, { status: 400 });
    }

    const qty = parseInt(stock_quantity, 10) || 0;
    const computedOutOfStock = is_out_of_stock !== undefined ? Boolean(is_out_of_stock) : qty <= 0;

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
        stock_quantity: qty,
        low_stock_threshold: parseInt(low_stock_threshold, 10) || 10,
        is_out_of_stock: computedOutOfStock,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
