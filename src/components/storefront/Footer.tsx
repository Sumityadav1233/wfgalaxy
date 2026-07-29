'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <img 
                src="/logo.png" 
                alt="WF GALAXY Logo" 
                className="h-20 md:h-24 lg:h-28 w-auto object-contain" 
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Carry style with confidence. Premium fashion & luxury outerwear designed for the modern lifestyle. Located at Shiv Chowk, PWHH+RVJ, Janakpur 45600.
            </p>
            <div className="flex space-x-4 items-center">
              <a href="https://www.tiktok.com/@sumit__779" target="_blank" rel="noopener noreferrer" className="text-gray-400 font-bold text-sm hover:text-[#F5820B] transition-colors">TikTok</a>
              <a href="https://www.instagram.com/wfgalaxy03" target="_blank" rel="noopener noreferrer" className="text-gray-400 font-bold text-sm hover:text-[#F5820B] transition-colors">IG</a>
              <a href="https://facebook.com/wfgalaxy" target="_blank" rel="noopener noreferrer" className="text-gray-400 font-bold text-sm hover:text-[#F5820B] transition-colors">FB</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-semibold text-[#3B2A20] mb-6">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/men" className="text-sm text-gray-500 hover:text-[#F5820B] transition-colors">Men's Collection</Link></li>
              <li><Link href="/shoes" className="text-sm text-gray-500 hover:text-[#F5820B] transition-colors">Shoes</Link></li>
              <li><Link href="/accessories" className="text-sm text-gray-500 hover:text-[#F5820B] transition-colors">Accessories</Link></li>
              <li><Link href="/shop" className="text-sm text-gray-500 hover:text-[#F5820B] transition-colors">Shop All</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-[#3B2A20] mb-6">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-500 hover:text-[#F5820B] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-[#F5820B] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif font-semibold text-[#3B2A20] mb-6">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe to receive updates, access to exclusive deals, and new collections.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-[#FAF9F6] text-sm border border-gray-200 px-4 py-2 w-full focus:outline-hidden focus:border-[#F5820B]"
              />
              <button className="bg-[#3B2A20] text-white px-4 py-2 text-sm font-medium hover:bg-[#F5820B] transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <div>
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} WF GALAXY. All rights reserved. Shiv Chowk, Janakpur.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Developed by <strong className="text-[#3B2A20]">SUMIT KUMAR YADAV</strong> | Phone: <a href="tel:9823976977" className="hover:text-[#F5820B] font-semibold">9823976977</a> | TikTok: <a href="https://www.tiktok.com/@sumit__779" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5820B] font-semibold text-[#F5820B]">@sumit__779</a>
            </p>
          </div>
          <div className="flex space-x-6 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#F5820B] transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#F5820B] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
