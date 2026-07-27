'use client';

import React, { useState } from 'react';
import { updateProduct } from '@/lib/supabase';
import { Plus, Minus, AlertTriangle } from 'lucide-react';

interface StockManagementProps {
  product: {
    id: string;
    stock_quantity?: number;
    low_stock_threshold?: number;
    is_out_of_stock?: boolean;
  };
  onUpdate?: (updatedProduct: any) => void;
}

export default function StockManagement({ product, onUpdate }: StockManagementProps) {
  const [stock, setStock] = useState<number>(product.stock_quantity ?? 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStockChange = async (newStock: number) => {
    const validStock = Math.max(0, newStock);
    const isOutOfStock = validStock <= 0;

    setStock(validStock);
    setIsUpdating(true);

    try {
      const updated = await updateProduct(product.id, {
        stock_quantity: validStock,
        is_out_of_stock: isOutOfStock,
      });

      if (onUpdate && updated) {
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLowStock = stock > 0 && stock <= (product.low_stock_threshold ?? 10);
  const isOutOfStock = stock <= 0 || product.is_out_of_stock;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center space-x-1.5 bg-[#1c1c1a] border border-neutral-800 rounded-md p-1 w-fit">
        <button
          type="button"
          onClick={() => handleStockChange(stock - 1)}
          disabled={isUpdating || stock <= 0}
          className="w-7 h-7 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded transition-colors"
          aria-label="Decrease stock"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="number"
          value={stock}
          onChange={(e) => handleStockChange(parseInt(e.target.value, 10) || 0)}
          className="w-12 text-center bg-transparent text-xs font-mono font-bold text-white focus:outline-hidden"
        />

        <button
          type="button"
          onClick={() => handleStockChange(stock + 1)}
          disabled={isUpdating}
          className="w-7 h-7 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded transition-colors"
          aria-label="Increase stock"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOutOfStock ? (
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center mt-0.5">
          Out of Stock
        </span>
      ) : isLowStock ? (
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center mt-0.5">
          <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock ({stock} left)
        </span>
      ) : (
        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider mt-0.5">
          In Stock ({stock})
        </span>
      )}
    </div>
  );
}
