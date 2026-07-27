'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Shoes', href: '/shoes' },
    { name: 'Accessories', href: '/accessories' },
    { name: 'Shop All', href: '/shop' },
    { name: 'About', href: '/about' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = encodeURIComponent(searchQuery.trim());
      router.push(`/search?q=${q}`);
      setIsSearchOpen(false);
      setIsMobileDrawerOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-xs py-2' : 'bg-white/90 backdrop-blur-xs py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* WF GALAXY Logo (Left) */}
            <Link href="/" className="flex items-center group py-1">
              <img 
                src="/logo.png" 
                alt="WF GALAXY Logo" 
                className="h-14 sm:h-18 md:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>

            {/* Desktop Navigation (Centered) */}
            <nav className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-[#F5820B] ${
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-[#F5820B] font-bold' : 'text-[#3B2A20]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Expandable Desktop Search */}
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-[#3B2A20] hover:text-[#F5820B] transition-colors p-1"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>

                <div
                  className={`absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden transition-all duration-300 ease-in-out ${
                    isSearchOpen ? 'w-56 opacity-100' : 'w-0 opacity-0'
                  }`}
                >
                  <form onSubmit={handleSearchSubmit} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search hoodie, shirt, shoes..."
                      className="w-full bg-white border-b-2 border-[#3B2A20] focus:border-[#F5820B] py-1 px-2 outline-hidden text-xs font-medium"
                    />
                    <button type="submit" className="hidden">Search</button>
                  </form>
                </div>
              </div>
            </div>

            {/* Mobile Header Actions (Clean Right Icons: Search, Cart, Hamburger) */}
            <div className="flex md:hidden items-center space-x-3">
              <Link 
                href="/search"
                className="text-[#3B2A20] p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="text-[#3B2A20] p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#F5820B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="text-[#3B2A20] p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Off-Canvas Mobile Side Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Side Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 animate-slide-in-left overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header: Logo + Close Button */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <Link href="/" onClick={() => setIsMobileDrawerOpen(false)}>
                  <img src="/logo.png" alt="WF GALAXY Logo" className="h-12 w-auto object-contain" />
                </Link>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 text-gray-500 hover:text-[#3B2A20] rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-hidden focus:border-[#F5820B]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </form>

              {/* Category & Menu Links */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                  Navigation
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center justify-between py-3 px-3 rounded-xl text-sm font-semibold transition-all ${
                      pathname === link.href 
                        ? 'bg-orange-50 text-[#F5820B] font-bold' 
                        : 'text-[#3B2A20] hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileDrawerOpen(false)}
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
