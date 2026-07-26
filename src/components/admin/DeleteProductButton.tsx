'use client';

import React, { useState } from 'react';
import { deleteProduct } from '@/app/actions/admin';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeleteProductButton({ id, name }: { id: string, name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the product "${name}"?`)) return;

    setIsDeleting(true);
    try {
      await deleteProduct(id);
      window.location.reload(); // Hard reload page state
    } catch (error: any) {
      alert(error.message || 'Error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:underline disabled:opacity-50 inline-flex items-center"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
      Delete
    </button>
  );
}
