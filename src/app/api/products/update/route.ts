import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createClient, createPublicClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('wf_galaxy_admin_session')?.value;
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      name,
      description,
      price,
      category,
      subcategory,
      sizes,
      colors,
      images,
      image_url,
      videoUrl,
      video_url,
      stock_quantity,
      low_stock_threshold,
      is_out_of_stock,
    } = body;

    if (!id || typeof id === 'object') {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const cleanIdStr = String(id).trim();
    if (cleanIdStr.includes('..') || cleanIdStr.includes('/') || cleanIdStr.includes('\\')) {
      return NextResponse.json({ error: 'Invalid product ID parameter' }, { status: 400 });
    }

    const numId = Number(id);
    const targetId = !isNaN(numId) ? numId : id;

    // Prepare Supabase Postgres payload matching exact column names
    const sbPayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) sbPayload.name = String(name).trim();
    if (description !== undefined) sbPayload.description = String(description).trim();
    if (price !== undefined) sbPayload.price = parseFloat(price);
    if (category !== undefined) sbPayload.category = String(category).trim().toLowerCase();
    if (subcategory !== undefined) sbPayload.subcategory = subcategory ? String(subcategory).trim().toLowerCase() : null;
    if (sizes !== undefined) sbPayload.sizes = Array.isArray(sizes) ? sizes.join(',') : String(sizes);
    if (colors !== undefined) sbPayload.colors = Array.isArray(colors) ? colors.join(',') : String(colors);

    const rawImages = images || image_url;
    if (rawImages !== undefined) {
      const imgStr = Array.isArray(rawImages) ? rawImages.join(',') : String(rawImages);
      sbPayload.image_url = imgStr;
      sbPayload.images = imgStr;
    }

    const rawVideo = videoUrl || video_url;
    if (rawVideo !== undefined) {
      sbPayload.video_url = rawVideo ? String(rawVideo).trim() : null;
    }

    if (stock_quantity !== undefined) {
      const qty = parseInt(stock_quantity, 10) || 0;
      sbPayload.stock_quantity = qty;
      sbPayload.is_out_of_stock = is_out_of_stock !== undefined ? Boolean(is_out_of_stock) : qty <= 0;
    } else if (is_out_of_stock !== undefined) {
      sbPayload.is_out_of_stock = Boolean(is_out_of_stock);
    }

    if (low_stock_threshold !== undefined) {
      sbPayload.low_stock_threshold = parseInt(low_stock_threshold, 10) || 10;
    }

    let resultProduct: any = null;
    let sbErrorMsg = '';

    // 1. Update in Supabase Postgres
    try {
      const supabase = createPublicClient();
      
      // Try with targetId (number or string)
      let { data, error } = await supabase
        .from('products')
        .update(sbPayload)
        .eq('id', targetId)
        .select()
        .maybeSingle();

      // If no match and targetId was a number, try matching string id or vice-versa
      if (!data && !error && typeof targetId === 'number') {
        const { data: strData, error: strError } = await supabase
          .from('products')
          .update(sbPayload)
          .eq('id', String(id))
          .select()
          .maybeSingle();
        if (strData) data = strData;
        if (strError) error = strError;
      }

      if (error) {
        console.error('Supabase product update error:', error.message);
        sbErrorMsg = error.message;
      } else if (data) {
        resultProduct = data;
      }
    } catch (sbErr: any) {
      console.error('Supabase product update exception:', sbErr);
      sbErrorMsg = sbErr.message || 'Supabase exception';
    }

    // 2. Also update in Prisma if available
    try {
      const prismaPayload: Record<string, any> = { ...sbPayload };
      delete prismaPayload.image_url;
      delete prismaPayload.video_url;
      if (rawVideo !== undefined) {
        prismaPayload.videoUrl = rawVideo ? String(rawVideo).trim() : null;
      }

      const prismaProduct = await prisma.product.update({
        where: { id: String(id) },
        data: prismaPayload,
      });

      if (!resultProduct) {
        resultProduct = prismaProduct;
      }
    } catch (prismaErr: any) {
      console.warn('Prisma update fallback notice:', prismaErr.message || prismaErr);
    }

    if (!resultProduct) {
      return NextResponse.json({
        error: 'Failed to update product in database',
        details: sbErrorMsg || 'No record was modified in Supabase or Prisma'
      }, { status: 500 });
    }

    if (resultProduct && !resultProduct.images && resultProduct.image_url) {
      resultProduct.images = resultProduct.image_url;
    }

    return NextResponse.json(resultProduct);
  } catch (error: any) {
    console.error('Product Update Route Exception:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
