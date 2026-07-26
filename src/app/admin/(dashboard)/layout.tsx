import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Server-side authentication guard
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#3B2A20] flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Brand header */}
          <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3">
              <img src="/logo.png" alt="WF GALAXY Logo" className="h-10 w-auto object-contain" />
              <span className="font-serif text-lg font-bold tracking-wider text-[#3B2A20]">WF GALAXY</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className="flex items-center px-4 py-3 rounded-md text-sm font-semibold text-gray-600 hover:text-[#F5820B] hover:bg-orange-50 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center px-4 py-3 rounded-md text-sm font-semibold text-gray-600 hover:text-[#F5820B] hover:bg-orange-50 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center px-4 py-3 rounded-md text-sm font-semibold text-gray-600 hover:text-[#F5820B] hover:bg-orange-50 transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center px-4 py-3 rounded-md text-sm font-semibold text-gray-600 hover:text-[#F5820B] hover:bg-orange-50 transition-colors"
            >
              Orders
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center px-4 py-3 rounded-md text-sm font-semibold text-gray-600 hover:text-[#F5820B] hover:bg-orange-50 transition-colors"
            >
              Settings
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#3B2A20] transition-colors"
          >
            <span>Storefront ↗</span>
          </Link>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full text-left px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
