import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Updates product stock or other details via API or Supabase directly
 */
export async function updateProduct(productId: string, updates: Record<string, any>) {
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();
    if (!error && data) return data;
  }

  // Fallback to local API route
  const res = await fetch('/api/products/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, ...updates }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update product');
  }
  return await res.json();
}

/**
 * Uploads images to Supabase storage bucket 'products' or returns local Object URLs
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  if (supabase && files.length > 0) {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }
    }
    if (uploadedUrls.length > 0) return uploadedUrls;
  }

  // Fallback for local files / drag & drop previews
  return files.map((file) => URL.createObjectURL(file));
}

/**
 * Fetch all products
 */
export async function getProducts() {
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }

  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Failed to fetch products');
  return await res.json();
}

/**
 * Search products by query
 */
export async function searchProducts(query: string) {
  const products = await getProducts();
  if (!query.trim()) return products;
  
  const lower = query.toLowerCase();
  return products.filter((p: any) =>
    p.name?.toLowerCase().includes(lower) ||
    p.description?.toLowerCase().includes(lower) ||
    p.category?.toLowerCase().includes(lower)
  );
}

/**
 * Check if given email is an admin
 */
export async function checkIsAdmin(email?: string | null, userId?: string | null): Promise<boolean> {
  if (!email && !userId) return false;

  if (supabase) {
    if (email) {
      const { data: singular } = await supabase
        .from('admin')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      if (singular) return true;

      const { data: plural } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      if (plural) return true;
    }

    if (userId) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (data && data.role === 'admin') return true;
    }
  }

  // API verification fallback
  try {
    if (email) {
      const res = await fetch(`/api/admin/check?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        return !!data.isAdmin;
      }
    }
  } catch {}

  // Allowed admin fallback list
  const allowedAdmins = ['wfgalaxy6977@gmail.com', 'mrgf7h@gmail.com', 'admin@wfgalaxy.com', 'owner@wfgalaxy.com', 'manager@wfgalaxy.com'];
  return email ? allowedAdmins.includes(email.toLowerCase()) : false;
}
