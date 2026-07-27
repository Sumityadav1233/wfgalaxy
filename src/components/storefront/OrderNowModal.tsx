'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface OrderNowModalProps {
  product: any;
  selectedSize: string;
  onClose: () => void;
}

export default function OrderNowModal({ product, selectedSize, onClose }: OrderNowModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    quantity: 1,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
    
    // Calculate total price
    const totalPrice = product.price * formData.quantity;
    const imageUrl = Array.isArray(product.image_urls)
      ? product.image_urls[0]
      : (product.images ? product.images.split(',')[0] : '');

    // Construct enhanced WhatsApp message with product image URL
    const message = `*NEW ORDER: ${product.name}*

*Product Image:* ${imageUrl || 'N/A'}

*Customer Details:*
• Name: ${formData.name}
• Phone: ${formData.phone}
• Delivery Address: ${formData.address}

*Order Details:*
• Item: ${product.name}
• Product ID: ${product.id}
• Size: ${selectedSize || 'Standard'}
• Unit Price: Rs. ${Number(product.price).toLocaleString()}
• Quantity: ${formData.quantity}
• Total Price: Rs. ${totalPrice.toLocaleString()}

*Special Notes:*
${formData.notes || 'None'}

Please confirm my order details and dispatch timeline. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAF9F6]">
          <h2 className="font-serif text-2xl font-bold text-[#3B2A20]">Order Information</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#3B2A20] transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="flex gap-4 items-center mb-6 p-4 bg-orange-50 rounded-xl">
            <img 
              src={product.image_urls?.[0] || ''} 
              alt={product.name} 
              className="w-16 h-16 object-cover rounded-md"
            />
            <div>
              <h4 className="font-bold text-[#3B2A20]">{product.name}</h4>
              <p className="text-sm text-gray-600">Size: {selectedSize} | Rs. {product.price}</p>
            </div>
          </div>

          <form id="order-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#3B2A20] mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-hidden focus:border-[#F5820B] focus:ring-1 focus:ring-[#F5820B]"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#3B2A20] mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-hidden focus:border-[#F5820B] focus:ring-1 focus:ring-[#F5820B]"
                placeholder="+977 98XXXXXXX"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#3B2A20] mb-1">Delivery Address</label>
              <textarea 
                name="address" 
                required 
                rows={2}
                value={formData.address} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-hidden focus:border-[#F5820B] focus:ring-1 focus:ring-[#F5820B] resize-none"
                placeholder="Full address details"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#3B2A20] mb-1">Quantity</label>
              <div className="flex items-center space-x-4">
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="font-bold text-lg">{formData.quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#3B2A20] mb-1">Order Notes (Optional)</label>
              <textarea 
                name="notes" 
                rows={2}
                value={formData.notes} 
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-hidden focus:border-[#F5820B] focus:ring-1 focus:ring-[#F5820B] resize-none"
                placeholder="Any special requests?"
              />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-2xl font-bold text-[#3B2A20]">Rs. {(product.price * formData.quantity).toLocaleString()}</p>
          </div>
          <button 
            type="submit" 
            form="order-form"
            className="bg-[#25D366] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[#128C7E] hover:shadow-lg transition-all"
          >
            Order via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
