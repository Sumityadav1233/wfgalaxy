'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight, FileText, Phone, MapPin, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderType {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: string; // JSON String
  totalAmount: number;
  status: string;
  createdAt: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Fire Confetti Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#c2a278', '#121212', '#ffffff'],
    });

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Error loading order success info', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex-grow flex items-center justify-center bg-background">
        <div className="space-y-4 text-primary">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto"></div>
          <p className="text-sm text-neutral-400 font-light">Retrieving order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center flex-grow flex flex-col items-center justify-center bg-background text-primary">
        <h1 className="text-xl font-bold tracking-tight uppercase">ORDER NOT FOUND</h1>
        <p className="mt-2 text-sm text-neutral-400">
          The requested transaction details could not be found.
        </p>
        <Link href="/" className="mt-6 px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold tracking-wider hover:bg-neutral-800 transition-colors">
          RETURN HOME
        </Link>
      </div>
    );
  }

  const items = JSON.parse(order.items) as any[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 flex-grow">
      <div className="bg-background border border-border rounded-lg shadow-xl p-6 sm:p-10 space-y-8 animate-slide-up text-primary">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent mb-2">
            <CheckCircle2 className="h-10 w-10 stroke-[1.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest uppercase">
            ORDER CONFIRMED
          </h1>
          <p className="text-sm text-neutral-500 font-light">
            Thank you for shopping with WF GALAXY. Your order has been registered and is being prepared.
          </p>
        </div>

        {/* Order Reference Card */}
        <div className="border border-border rounded-md bg-muted/20 p-5 space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-3 text-neutral-600">
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-accent" />
              Order ID: <strong className="text-primary font-mono ml-1">{order.id}</strong>
            </span>
            <span className="flex items-center mt-2 sm:mt-0">
              <Calendar className="h-4 w-4 mr-2 text-accent" />
              Date: <span className="text-primary ml-1">{new Date(order.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Ship To</span>
              <p className="font-semibold text-primary">{order.customerName}</p>
              <span className="flex items-center text-xs text-neutral-600 mt-1">
                <MapPin className="h-3 w-3 mr-1 text-accent animate-pulse" />
                {order.customerAddress}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Contact Phone</span>
              <p className="font-semibold text-primary">{order.customerPhone}</p>
              <span className="flex items-center text-xs text-neutral-600 mt-1">
                <Phone className="h-3 w-3 mr-1 text-accent" />
                Representative Hotline: 9709141876
              </span>
            </div>
          </div>
        </div>

        {/* Items Listing */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border pb-2">
            Items Ordered
          </h3>
          <ul role="list" className="divide-y divide-border -my-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex py-3 justify-between text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-accent">${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Billing Total */}
        <div className="border-t border-border pt-4 flex justify-between items-center text-sm font-semibold">
          <span className="font-bold">Total Paid</span>
          <span className="text-accent text-lg font-bold">${order.totalAmount.toFixed(2)}</span>
        </div>

        {/* Next Steps / CTA */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/shop"
            className="flex-1 inline-flex items-center justify-center bg-primary hover:bg-neutral-800 text-primary-foreground font-bold tracking-widest text-xs py-4 transition-colors uppercase rounded-sm shadow-md"
          >
            CONTINUE SHOPPING <ShoppingBag className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center bg-background border border-primary hover:bg-muted text-primary font-bold tracking-widest text-xs py-4 transition-colors uppercase rounded-sm"
          >
            RETURN HOME <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 text-center flex-grow flex items-center justify-center">
          <div className="space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto"></div>
            <p className="text-sm text-neutral-400 font-light">Loading transaction status...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
