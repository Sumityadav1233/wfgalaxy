'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to check admin access for authenticated admin users
async function checkAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized: Please log in to Admin');
  
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
  
  // 1. Unlink any products tied to this subcategory (set subcategory to null)
  await supabase
    .from('products')
    .update({ subcategory: null })
    .ilike('subcategory', subcategoryName);

  // 2. Delete the subcategory
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Subcategory deletion failed: ${error.message}`);
  revalidatePath('/', 'layout');
  return true;
}

export async function deleteProduct(id: string) {
  console.log('Attempting to delete product with ID:', id);
  const supabase = await checkAdminAccess();
  
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Delete product error:', error.message);
    throw new Error(`Product deletion failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.error('Delete product blocked by RLS or not found');
    throw new Error('Database blocked product deletion. Please verify RLS policies in Supabase.');
  }
  
  revalidatePath('/', 'layout');
  return true;
}
