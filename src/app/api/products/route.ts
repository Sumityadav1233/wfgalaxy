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
    const body = await req.json();
    const {
      name,
      description,
      price,
      category,
      subcategory,
      sizes,
      colors,
      images,
      videoUrl,
      stock_quantity = 0,
      low_stock_threshold = 10,
      is_out_of_stock,
    } = body;

    if (!name || !description || price === undefined || price === null) {
      return NextResponse.json({ error: 'Missing required product details (name, description, or price)' }, { status: 400 });
    }

    const sizesStr = Array.isArray(sizes) ? sizes.join(',') : String(sizes || 'S,M,L');
    const colorsStr = Array.isArray(colors) ? colors.join(',') : String(colors || 'Default');
    const imagesStr = Array.isArray(images) ? images.join(',') : String(images || '');
    const finalCategory = category || 'men';

    const finalImages = imagesStr.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

    const qty = parseInt(stock_quantity, 10) || 0;
    const computedOutOfStock = is_out_of_stock !== undefined ? Boolean(is_out_of_stock) : qty <= 0;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category: finalCategory,
        subcategory: subcategory || null,
        sizes: sizesStr,
        colors: colorsStr,
        images: finalImages,
        videoUrl: videoUrl || null,
        stock_quantity: qty,
        low_stock_threshold: parseInt(low_stock_threshold, 10) || 10,
        is_out_of_stock: computedOutOfStock,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error: any) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
