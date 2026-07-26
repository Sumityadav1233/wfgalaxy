'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { addProduct } from '@/app/actions/admin';
import { Loader2, Upload, X } from 'lucide-react';

export default function AdminNewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    subcategory: '',
    stock: '10',
    is_latest: false
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [colorsStr, setColorsStr] = useState(''); // Comma separated colors

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    async function fetchCats() {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: subs } = await supabase.from('subcategories').select('*, categories(name)').order('name');
      
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);

      if (cats && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0].name }));
      }
    }
    fetchCats();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];

      // 1. Upload Image to Storage if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrls = [publicUrlData.publicUrl];
      }

      // 2. Prepare payload
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        stock: parseInt(formData.stock),
        is_latest: formData.is_latest,
        sizes: selectedSizes,
        colors: colorsStr.split(',').map(c => c.trim()).filter(c => c.length > 0),
        image_urls: imageUrls,
      };

      // 3. Insert Database
      await addProduct(payload);
      
      alert('Product created successfully!');
      router.push('/admin/products');
      
    } catch (error: any) {
      alert(error.message || 'An error occurred while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#3B2A20]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#3B2A20] border-b border-gray-100 pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (Rs.) *</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B] resize-none"
            />
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#3B2A20] border-b border-gray-100 pb-2">Organization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
              <select 
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Subcategory</label>
              <select 
                value={formData.subcategory}
                onChange={e => setFormData({...formData, subcategory: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
              >
                <option value="">Select a subcategory</option>
                {/* Filter subcategories by selected category if we matched by ID, but since schema uses string, we'll just list them. Ideally, match by name. */}
                {subcategories.filter(s => s.categories?.name === formData.category).map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#3B2A20] border-b border-gray-100 pb-2">Variants & Inventory</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`w-12 h-12 rounded-lg border font-medium transition-colors ${
                    selectedSizes.includes(size) 
                      ? 'bg-[#3B2A20] text-white border-[#3B2A20]' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#3B2A20]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Colors (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. Red, Blue, Black"
              value={colorsStr}
              onChange={e => setColorsStr(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
              <input 
                type="number" 
                min="0"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
              />
            </div>
            
            <div className="flex items-center space-x-3 pt-6">
              <input 
                type="checkbox" 
                id="is_latest"
                checked={formData.is_latest}
                onChange={e => setFormData({...formData, is_latest: e.target.checked})}
                className="w-5 h-5 text-[#F5820B] rounded focus:ring-[#F5820B]"
              />
              <label htmlFor="is_latest" className="text-sm font-bold text-gray-700 cursor-pointer">
                Mark as "Latest Item" (Shows on homepage)
              </label>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#3B2A20] border-b border-gray-100 pb-2">Product Image</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg object-contain" />
                <button 
                  type="button" 
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 font-medium">Click to upload an image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => router.push('/admin/products')}
            className="px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#3B2A20] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#F5820B] transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</> : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
