'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        ></div>

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          {/* Sliding panel */}
          <div className="pointer-events-auto w-screen max-w-md transform bg-background border-l border-border transition-all shadow-2xl animate-slide-in-right">
            <div className="flex h-full flex-col overflow-y-scroll bg-background">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-6 sm:px-6">
                <h2 className="text-lg font-semibold tracking-wide text-primary flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5 text-accent stroke-[1.5]" />
                  SHOPPING BAG
                </h2>
                <button
                  type="button"
                  className="rounded-md text-muted-foreground hover:text-primary p-2"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="h-6 w-6 stroke-[1.5]" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center py-20">
                    <ShoppingBag className="h-16 w-16 text-border stroke-[1] mb-4" />
                    <p className="text-base font-medium text-muted-foreground">Your bag is empty</p>
                    <p className="mt-2 text-sm text-neutral-400">Fill it with WF GALAXY pieces.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-6 py-2 border border-primary text-sm font-semibold tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      CONTINUE SHOPPING
                    </button>
                  </div>
                ) : (
                  <ul role="list" className="-my-6 divide-y divide-border">
                    {cart.map((item) => (
                      <li key={`${item.id}-${item.size}-${item.color}`} className="flex py-6">
                        <div className="h-24 w-18 shrink-0 overflow-hidden rounded-md border border-border relative bg-muted">
                          {/* Use regular img instead of next/image if image is external to avoid domain configuration hassles, or keep it standard */}
                          <img
                            src={item.image.split(',')[0]}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-sm font-medium text-primary">
                              <h3 className="line-clamp-1">{item.name}</h3>
                              <p className="ml-4 font-semibold text-accent">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Size: {item.size} | Color: {item.color}
                            </p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-border rounded-sm bg-muted/50">
                              <button
                                onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                                className="p-1.5 hover:text-accent transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3 stroke-[1.5]" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-primary">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                                className="p-1.5 hover:text-accent transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3 stroke-[1.5]" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, item.size, item.color)}
                              className="font-medium text-muted-foreground hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4 stroke-[1.5]" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t border-border px-4 py-6 sm:px-6 bg-muted/30">
                  <div className="flex justify-between text-base font-semibold text-primary">
                    <p>Subtotal</p>
                    <p className="text-accent text-lg font-bold">${cartTotal.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-400">Shipping and taxes calculated at checkout.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      className="w-full flex items-center justify-center bg-primary border border-transparent px-6 py-3 text-sm font-semibold tracking-wider text-primary-foreground hover:bg-neutral-800 transition-colors"
                    >
                      PROCEED TO CHECKOUT
                    </button>
                  </div>
                  <div className="mt-4 flex justify-center text-center text-xs text-neutral-500">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        className="font-medium text-accent hover:underline"
                        onClick={() => setIsCartOpen(false)}
                      >
                        Continue Shopping<span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
