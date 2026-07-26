'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-80 mb-4 overflow-hidden animate-slide-up">
          <div className="bg-[#3B2A20] text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium font-serif">Nextlife. Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto bg-[#FAF9F6] flex flex-col space-y-4">
            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%]">
              Hello! How can we help you style your day?
            </div>
            {/* Add chat messages here */}
          </div>
          <div className="p-4 bg-white border-t border-gray-100">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 px-4 text-sm focus:outline-hidden focus:border-[#F5820B]"
            />
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110 ${
          isOpen ? 'bg-gray-200 text-gray-700' : 'bg-[#F5820B] text-white'
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
