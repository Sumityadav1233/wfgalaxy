'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      isActive: pathname === '/search',
    },
    {
      name: 'Cart',
      onClick: () => setIsCartOpen(true),
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
      isActive: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 py-2 px-6 md:hidden shadow-lg flex justify-around items-center">
      {navItems.map((item) => {
        const Icon = item.icon;
        const activeClass = item.isActive
          ? 'text-[#F5820B] font-bold'
          : 'text-gray-500 hover:text-[#3B2A20]';

        if (item.onClick) {
          return (
            <button
              key={item.name}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center py-1 px-4 relative transition-all ${activeClass}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-[#F5820B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wide mt-1 font-sans">{item.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href || '/'}
            className={`flex flex-col items-center justify-center py-1 px-4 transition-all ${activeClass}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-wide mt-1 font-sans">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
