import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#3B2A20]">Products Management</h1>
        <Link 
          href="/admin/products/new"
          className="bg-[#3B2A20] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#F5820B] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!products || products.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products found. Add a product to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden">
                        {product.image_urls?.[0] && (
                          <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-[#3B2A20]">{product.name}</span>
                    </td>
                    <td className="px-6 py-4">{product.category} {product.subcategory ? `/ ${product.subcategory}` : ''}</td>
                    <td className="px-6 py-4">Rs. {product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {product.is_latest && (
                        <span className="bg-orange-100 text-[#F5820B] text-xs font-bold px-2 py-1 rounded-full uppercase">Latest</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/products/${product.id}/edit`} className="text-blue-500 hover:underline">Edit</Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
