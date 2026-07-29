'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper to check admin access for authenticated admin users
async function checkAdminAccess() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('wf_galaxy_admin_session')?.value;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user && !adminSession) {
    throw new Error('Unauthorized: Please log in to Admin');
  }
  
  return supabase;
}

export async function addCategory(name: string) {
  const supabase = await checkAdminAccess();
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw new Error(`Category creation failed: ${error.message}`);
  revalidatePath('/', 'layout');
  return data;
}

export async function addSubcategory(name: string, category_id: string) {
  const supabase = await checkAdminAccess();
  const { data, error } = await supabase
    .from('subcategories')
    .insert([{ name, category_id }])
    .select()
    .single();

  if (error) throw new Error(`Subcategory creation failed: ${error.message}`);
  revalidatePath('/', 'layout');
  return data;
}

export async function addProduct(productData: any) {
  const supabase = await checkAdminAccess();

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) {
    console.error('Add product error:', error.message);
    throw new Error(`Product creation failed: ${error.message}`);
  }
  
  revalidatePath('/', 'layout'); // Revalidate storefront
  return data;
}

export async function deleteSubcategory(id: string, subcategoryName: string) {
  const supabase = await checkAdminAccess();
  
  // 1. Clear subcategory reference from any products in backend database
  if (subcategoryName && subcategoryName.trim()) {
    await supabase
      .from('products')
      .update({ subcategory: '' })
      .ilike('subcategory', subcategoryName.trim());
  }

  // 2. Delete the subcategory from backend database
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Subcategory deletion failed: ${error.message}`);
  revalidatePath('/', 'layout');
  return true;
}

export async function deleteCategory(id: string, categoryName: string) {
  const supabase = await checkAdminAccess();

  // 1. Check if products exist for this category
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id')
    .ilike('category', categoryName)
    .limit(1);

  if (existingProducts && existingProducts.length > 0) {
    throw new Error(`Cannot delete category "${categoryName}" because products are still assigned to it. Please move or delete those products first.`);
  }

  // 2. Delete the category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Category deletion failed: ${error.message}`);
  revalidatePath('/', 'layout');
  return true;
}

export async function deleteProduct(id: string) {
  console.log('Attempting to delete product with ID:', id);
  try {
    const supabase = await createClient();
    const numId = Number(id);
    
    let { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select();

    if ((!data || data.length === 0) && !isNaN(numId)) {
      const { data: numData, error: numError } = await supabase
        .from('products')
        .delete()
        .eq('id', numId)
        .select();
      if (numError) console.warn('Delete product notice (numeric):', numError.message);
    } else if (error) {
      console.warn('Delete product notice:', error.message);
    }
  } catch (err) {
    console.warn('Delete product catch notice:', err);
  }

  revalidatePath('/', 'layout');
  return true;
}
