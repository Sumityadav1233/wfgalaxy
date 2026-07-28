import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let deletedProduct: any = null;

    // 1. Try deleting in Supabase
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

      if (data && data.length > 0 && !error) {
        deletedProduct = data[0];
      }
    } catch (sbErr) {
      console.warn('Supabase delete error notice:', sbErr);
    }

    // 2. Also delete in Prisma
    try {
      const prismaDeleted = await prisma.product.delete({
        where: { id },
      });
      if (!deletedProduct) {
        deletedProduct = prismaDeleted;
      }
    } catch (prismaErr) {
      console.warn('Prisma delete error notice:', prismaErr);
    }

    // Revalidate all storefront ISR pages
    revalidatePath('/', 'layout');

    // Return success response if deleted from at least one store or acknowledged
    return NextResponse.json(deletedProduct || { id, success: true });
  } catch (error: any) {
    console.error('Product Deletion Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

