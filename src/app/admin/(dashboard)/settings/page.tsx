import React from 'react';

export const revalidate = 0;

export default function AdminSettingsPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#3B2A20]">Settings</h1>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-lg font-bold text-[#3B2A20] mb-4">Store Configuration</h2>
        
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#3B2A20] mb-2">WhatsApp Business Number</label>
            <input 
              type="text" 
              defaultValue={whatsappNumber}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:outline-hidden focus:border-[#F5820B]"
              placeholder="+977 98XXXXXXX"
            />
            <p className="text-xs text-gray-500 mt-2">
              Note: Updating this number currently requires changing the NEXT_PUBLIC_WHATSAPP_NUMBER environment variable in Vercel.
            </p>
          </div>
          
          <button type="button" className="bg-[#3B2A20] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#F5820B] transition-colors">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
