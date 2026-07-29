'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@wfgalaxy.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMsg('Failed to log in. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
      <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-[#F5820B] mb-4 border border-amber-100 shadow-xs">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <h1 className="text-2xl font-serif text-[#3B2A20] font-bold">WF GALAXY</h1>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1 mb-6">Direct Admin Login</p>

      {errorMsg && (
        <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
        <div>
          <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-1">
            Admin Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@wfgalaxy.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#3B2A20] focus:outline-hidden focus:border-[#F5820B]"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#3B2A20] uppercase tracking-wider mb-1">
            Admin Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-[#3B2A20] focus:outline-hidden focus:border-[#F5820B]"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#3B2A20] hover:bg-[#F5820B] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
        >
          <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
