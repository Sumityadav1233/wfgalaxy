import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createPublicClient, createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch from Supabase first
    try {
      const supabase = createPublicClient();
      const { data: sbProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && sbProducts && sbProducts.length > 0) {
        // Normalize fields for components (e.g. image_url -> images)
        const normalized = sbProducts.map((p: any) => ({
          ...p,
          images: p.images || p.image_url || p.image_urls || '',
        }));
        return NextResponse.json(normalized);
      }
    } catch (sbErr) {
      console.warn('Supabase GET products notice:', sbErr);
    }

    // 2. Fallback to Prisma
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(dbProducts);
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
      image_url,
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
    const rawImagesStr = images || image_url || '';
    const imagesStr = Array.isArray(rawImagesStr) ? rawImagesStr.join(',') : String(rawImagesStr || '');
    const finalCategory = (category || 'men').toLowerCase();

    const finalImages = imagesStr.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';
    const qty = parseInt(stock_quantity, 10) || 0;
    const computedOutOfStock = is_out_of_stock !== undefined ? Boolean(is_out_of_stock) : qty <= 0;

    let createdProduct: any = null;
    let insertErrorMsg = '';

    // 1. Try creating in Supabase
    try {
      const supabase = createPublicClient();
      
      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: finalCategory,
        subcategory: subcategory ? subcategory.trim().toLowerCase() : null,
        sizes: sizesStr,
        colors: colorsStr,
        image_url: finalImages,
        images: finalImages,
        stock_quantity: qty,
        low_stock_threshold: parseInt(low_stock_threshold, 10) || 10,
        is_out_of_stock: computedOutOfStock,
        video_url: videoUrl || null,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase product insert error:', error.message);
        insertErrorMsg = error.message;
      } else if (data) {
        createdProduct = data;
      }
    } catch (sbErr: any) {
      console.error('Supabase product creation exception:', sbErr);
      insertErrorMsg = sbErr.message || 'Supabase exception';
    }

    // 2. Also save in Prisma if available
    try {
      const prismaProduct = await prisma.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category: finalCategory,
          subcategory: subcategory ? subcategory.trim().toLowerCase() : null,
          sizes: sizesStr,
          colors: colorsStr,
          images: finalImages,
          videoUrl: videoUrl || null,
          stock_quantity: qty,
          low_stock_threshold: parseInt(low_stock_threshold, 10) || 10,
          is_out_of_stock: computedOutOfStock,
        },
      });

      if (!createdProduct) {
        createdProduct = prismaProduct;
      }
    } catch (prismaErr) {
      console.warn('Prisma product creation notice:', prismaErr);
    }

    if (!createdProduct) {
      return NextResponse.json({ error: `Failed to insert product into database: ${insertErrorMsg || 'Unknown error'}` }, { status: 500 });
    }

    // Normalize images field before returning
    if (createdProduct && !createdProduct.images && createdProduct.image_url) {
      createdProduct.images = createdProduct.image_url;
    }

    // Revalidate storefront pages
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/', 'layout');

    return NextResponse.json(createdProduct);
  } catch (error: any) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
