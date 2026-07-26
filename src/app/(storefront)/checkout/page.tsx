'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ChevronRight, CreditCard, ShieldCheck, ShoppingBag, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  const [step, setStep] = useState<1 | 2>(1); // 1 = Shipping, 2 = Payment Simulation
  
  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    name: '',
    phone: '',
    address: '',
  });

  // Credit Card Form State (Stripe Simulation)
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    nameOnCard: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center flex-grow flex flex-col items-center justify-center">
        <ShoppingBag className="h-16 w-16 text-border stroke-[1] mb-4" />
        <h1 className="text-xl font-bold tracking-tight text-primary uppercase">YOUR BAG IS EMPTY</h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-sm">
          You must add items to your shopping bag before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center bg-primary hover:bg-neutral-800 text-primary-foreground font-semibold tracking-wider text-sm px-6 py-3 transition-colors"
        >
          GO TO SHOP
        </Link>
      </div>
    );
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name.trim() || !shippingForm.phone.trim() || !shippingForm.address.trim()) {
      alert('Please fill out all shipping details.');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc) {
      alert('Please complete all card details.');
      return;
    }

    setIsProcessing(true);

    // Simulate Stripe payment processing API latency
    setTimeout(async () => {
      try {
        const orderData = {
          customerName: shippingForm.name,
          customerPhone: shippingForm.phone,
          customerAddress: shippingForm.address,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          totalAmount: cartTotal,
          status: 'PAID', // Payment succeeded
        };

        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (res.ok) {
          const order = await res.json();
          clearCart(); // Clear local shopping cart
          router.push(`/checkout/success?orderId=${order.id}`);
        } else {
          alert('Failed to process your order. Please try again.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Checkout error:', err);
        alert('An error occurred during payment. Please try again.');
        setIsProcessing(false);
      }
    }, 2000);
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardForm({ ...cardForm, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardForm({ ...cardForm, expiry: value });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardForm({ ...cardForm, cvc: value });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 stroke-[1.5]" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3 stroke-[1.5]" />
        <span className="text-primary font-bold">Checkout</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Forms (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {step === 1 ? (
            <div className="bg-background border border-border p-6 sm:p-8 rounded-lg">
              <h2 className="text-xl font-bold tracking-wider text-primary uppercase mb-6 flex items-center justify-between">
                <span>1. Shipping Details</span>
                <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-sm">GUEST CHECKOUT</span>
              </h2>

              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold uppercase text-primary mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      placeholder="e.g. Abhishek Mishra"
                      className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-bold uppercase text-primary mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      required
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      placeholder="e.g. 9709141876"
                      className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryAddress" className="block text-xs font-bold uppercase text-primary mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    id="deliveryAddress"
                    required
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                    placeholder="e.g. Shiv Chowk, Janakpur, Dhanusha"
                    className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary"
                  />
                  <p className="mt-1.5 text-xs text-neutral-400 font-light">
                    We deliver directly to your door anywhere in Janakpur and surrounding areas.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-neutral-800 text-primary-foreground py-3.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm shadow-xs mt-6"
                >
                  PROCEED TO PAYMENT
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-background border border-border p-6 sm:p-8 rounded-lg space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                  className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shipping
                </button>
                <h2 className="text-sm font-bold tracking-wider text-primary uppercase">
                  2. Stripe Payment Simulation
                </h2>
              </div>

              {/* Graphic Virtual Card */}
              <div className="relative mx-auto h-48 w-80 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 p-6 text-white shadow-xl border border-neutral-800 overflow-hidden">
                {/* Subtle shine overlay */}
                <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl"></div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold tracking-widest text-accent font-mono">WF GALAXY</span>
                  <Lock className="h-4 w-4 text-neutral-500" />
                </div>
                
                <div className="mt-8">
                  <p className="text-xl font-medium font-mono tracking-widest text-neutral-200">
                    {cardForm.number || '•••• •••• •••• ••••'}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-neutral-500 block uppercase tracking-wider">Cardholder</span>
                    <p className="text-xs font-semibold tracking-wider font-mono text-neutral-300 truncate w-40">
                      {cardForm.nameOnCard.toUpperCase() || 'YOUR NAME'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] text-neutral-500 block uppercase tracking-wider">Expires</span>
                    <p className="text-xs font-semibold font-mono text-neutral-300">
                      {cardForm.expiry || 'MM/YY'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card input form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cardholderName" className="block text-xs font-bold uppercase text-primary mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    required
                    disabled={isProcessing}
                    value={cardForm.nameOnCard}
                    onChange={(e) => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                    placeholder="e.g. Abhishek Mishra"
                    className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary disabled:opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-xs font-bold uppercase text-primary mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      required
                      disabled={isProcessing}
                      value={cardForm.number}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-muted/30 border border-border rounded-sm py-2.5 pl-10 pr-3 text-sm focus:outline-hidden focus:border-accent text-primary disabled:opacity-50 font-mono"
                    />
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-xs font-bold uppercase text-primary mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      id="expiry"
                      required
                      disabled={isProcessing}
                      value={cardForm.expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary disabled:opacity-50 font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-xs font-bold uppercase text-primary mb-1">
                      CVC Code
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      required
                      disabled={isProcessing}
                      value={cardForm.cvc}
                      onChange={handleCvcChange}
                      placeholder="•••"
                      className="w-full bg-muted/30 border border-border rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-primary disabled:opacity-50 font-mono"
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md flex items-center space-x-2 text-xs text-neutral-600 font-light border border-border">
                  <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                  <span>
                    Stripe Sandboxed Simulation. No real money will be charged. This demonstrates full end-to-end webhook-ready processing.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-neutral-800 disabled:bg-neutral-600 text-primary-foreground py-3.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm shadow-xs mt-6 flex items-center justify-center"
                >
                  {isProcessing ? 'PROCESSING PAYMENT...' : `PAY $${cartTotal.toFixed(2)} NOW`}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-muted/30 border border-border p-6 rounded-lg h-fit space-y-6">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase border-b border-border pb-3 flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4 text-accent stroke-[1.5]" />
            Order Summary
          </h2>

          <ul role="list" className="divide-y divide-border/60 -my-3">
            {cart.map((item) => (
              <li key={`${item.id}-${item.size}-${item.color}`} className="flex py-3 justify-between text-sm">
                <div className="flex items-start">
                  <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted relative">
                    <img src={item.image.split(',')[0]} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-primary line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                      {item.size} / {item.color} (x{item.quantity})
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-accent">${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-xs text-neutral-500 font-light">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 font-light">
              <span>Shipping</span>
              <span className="text-green-600 font-semibold uppercase">Free</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 font-light">
              <span>Taxes</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-border/40">
              <span>Total</span>
              <span className="text-accent">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
