import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0c] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#161614] border border-neutral-800 p-8 md:p-12 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 text-red-500">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 uppercase font-serif">
          Access Restricted
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
          Your account is not authorized to access the WF GALAXY Admin Portal. Admin permissions are restricted to authorized personnel only.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/admin/login"
            className="flex-1 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors"
          >
            <Lock className="w-4 h-4 mr-2" /> Admin Login
          </Link>

          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
