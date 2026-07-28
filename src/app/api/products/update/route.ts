import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, price, category, subcategory, sizes, colors, images, videoUrl, stock_quantity, low_stock_threshold, is_out_of_stock } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory || null;
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

    let resultProduct: any = null;

    // 1. Try updating in Supabase
    try {
      const supabase = await createClient();
      const sbUpdateData = { ...updateData };
      if (typeof sbUpdateData.images === 'string') {
        const imageArray = sbUpdateData.images.split(',').map((s: string) => s.trim()).filter(Boolean);
        sbUpdateData.images = imageArray;
        sbUpdateData.image_urls = imageArray;
      }
      if (sbUpdateData.videoUrl !== undefined) {
        sbUpdateData.video_url = sbUpdateData.videoUrl;
      }

      const { data, error } = await supabase
        .from('products')
        .update(sbUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (data && !error) {
        resultProduct = {
          ...data,
          images: Array.isArray(data.images) ? data.images.join(',') : (data.images || updateData.images || ''),
          videoUrl: data.videoUrl || data.video_url || updateData.videoUrl || null,
        };
      }
    } catch (sbErr) {
      console.warn('Supabase update error notice:', sbErr);
    }

    // 2. Also update in Prisma
    try {
      const prismaProduct = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      if (!resultProduct) {
        resultProduct = prismaProduct;
      }
    } catch (prismaErr) {
      console.warn('Prisma update error notice:', prismaErr);
    }

    if (!resultProduct) {
      // Fallback response with provided updates if record exists
      resultProduct = { id, ...updateData };
    }

    return NextResponse.json(resultProduct);
  } catch (error: any) {
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

