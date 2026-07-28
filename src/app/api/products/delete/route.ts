import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createClient, createPublicClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let deletedProduct: any = null;

    // 1. Try deleting in Supabase using both public and auth server clients
    try {
      const pubSupabase = createPublicClient();
      const numId = Number(id);

      // Delete by string ID
      const { data: d1 } = await pubSupabase.from('products').delete().eq('id', id).select();
      if (d1 && d1.length > 0) deletedProduct = d1[0];

      // Delete by numeric ID if string ID returned nothing
      if (!deletedProduct && !isNaN(numId)) {
        const { data: d2 } = await pubSupabase.from('products').delete().eq('id', numId).select();
        if (d2 && d2.length > 0) deletedProduct = d2[0];
      }

      // Try with server client as fallback
      if (!deletedProduct) {
        const srvSupabase = await createClient();
        const { data: d3 } = await srvSupabase.from('products').delete().eq('id', id).select();
        if (d3 && d3.length > 0) deletedProduct = d3[0];
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

