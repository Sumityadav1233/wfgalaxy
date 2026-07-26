'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

export const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', {
        method: 'POST',
      });
      if (res.ok) {
        window.location.href = '/admin/login';
      } else {
        alert('Failed to log out.');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
    >
      <LogOut className="h-4 w-4 mr-3" />
      LOG OUT
    </button>
  );
};
export default LogoutButton;
