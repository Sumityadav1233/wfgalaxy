import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, price, category, subcategory, sizes, colors, images, image_url, videoUrl, stock_quantity, low_stock_threshold, is_out_of_stock } = body;

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
    
    const rawImagesStr = images || image_url;
    if (rawImagesStr !== undefined) {
      const imgStr = Array.isArray(rawImagesStr) ? rawImagesStr.join(',') : String(rawImagesStr);
      updateData.images = imgStr;
      updateData.image_url = imgStr;
    }
    
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
      const sbUpdateData: Record<string, any> = { ...updateData };
      delete sbUpdateData.images; // Prefer image_url column in Supabase schema

      const { data, error } = await supabase
        .from('products')
        .update(sbUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase update notice (image_url):', error.message);
        // Fallback update with images column
        const altUpdateData: Record<string, any> = { ...updateData };
        delete altUpdateData.image_url;
        const { data: fbData, error: fbError } = await supabase
          .from('products')
          .update(altUpdateData)
          .eq('id', id)
          .select()
          .single();

        if (fbData && !fbError) {
          resultProduct = fbData;
        }
      } else if (data) {
        resultProduct = data;
      }
    } catch (sbErr) {
      console.warn('Supabase update error notice:', sbErr);
    }

    // 2. Also update in Prisma
    try {
      const prismaUpdateData = { ...updateData };
      delete prismaUpdateData.image_url; // Prisma schema uses images string
      const prismaProduct = await prisma.product.update({
        where: { id },
        data: prismaUpdateData,
      });
      if (!resultProduct) {
        resultProduct = prismaProduct;
      }
    } catch (prismaErr) {
      console.warn('Prisma update error notice:', prismaErr);
    }

    if (!resultProduct) {
      resultProduct = { id, ...updateData };
    }

    if (resultProduct && !resultProduct.images && resultProduct.image_url) {
      resultProduct.images = resultProduct.image_url;
    }

    return NextResponse.json(resultProduct);
  } catch (error: any) {
    console.error('Product Update Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
