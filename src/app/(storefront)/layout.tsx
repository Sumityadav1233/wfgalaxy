import React from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import ChatAssistant from '@/components/storefront/ChatAssistant';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/storefront/CartDrawer';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <ChatAssistant />
      </div>
    </CartProvider>
  );
}
