'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

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
    { name: 'About', href: '/about' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = encodeURIComponent(searchQuery.trim());
      router.push(`/search?q=${q}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white/80 backdrop-blur-xs py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* WF GALAXY Logo */}
          <Link href="/" className="flex items-center group py-1">
            <img 
              src="/logo.png" 
              alt="WF GALAXY Logo" 
              className="h-20 md:h-24 lg:h-28 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#F5820B] ${
                  pathname === link.href || pathname.startsWith(link.href + '/') ? 'text-[#F5820B]' : 'text-[#3B2A20]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
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

            <Link href="/admin/login" className="text-[#3B2A20] hover:text-[#F5820B] transition-colors" aria-label="Admin Login">
              <User className="h-5 w-5" />
            </Link>
            
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
              <Link href="/admin/login" className="text-sm font-medium text-[#3B2A20] hover:text-[#F5820B] transition-colors">
                Login
              </Link>
              <Link href="/admin/login" className="bg-[#3B2A20] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#F5820B] transition-colors">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#3B2A20]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl py-6 px-6 flex flex-col space-y-5 animate-slide-down">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hoodie, shirt, shoes..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-hidden focus:border-[#F5820B]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-lg font-medium hover:text-[#F5820B] ${
                  pathname === link.href ? 'text-[#F5820B] font-bold' : 'text-[#3B2A20]'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
            <Link href="/admin/login" className="text-[#3B2A20] font-medium text-base hover:text-[#F5820B]">Login</Link>
            <Link href="/admin/login" className="bg-[#3B2A20] text-white text-center font-bold text-sm py-2.5 rounded-full">Sign Up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
