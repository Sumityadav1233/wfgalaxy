import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Package, Grid, ShoppingBag, Settings } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Basic stats fetching (if tables exist, otherwise will handle gracefully)
  const [{ count: productsCount }, { count: categoriesCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { name: 'Total Products', value: productsCount || 0, icon: Package, href: '/admin/products' },
    { name: 'Categories', value: categoriesCount || 0, icon: Grid, href: '/admin/categories' },
    { name: 'Orders Logs', value: 'View', icon: ShoppingBag, href: '/admin/orders' },
    { name: 'Settings', value: 'Manage', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-[#3B2A20] mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-lg text-[#F5820B] group-hover:bg-[#F5820B] group-hover:text-white transition-colors">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
            <p className="text-3xl font-bold text-[#3B2A20] mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
