'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addSubcategory, deleteSubcategory } from '@/app/actions/admin';
import { Plus, Loader2, Trash2 } from 'lucide-react';

import Link from 'next/link';

const CORE_CATEGORIES = ['Men', 'Women', 'Shoes', 'Accessories'];
const DEFAULT_CATS = [
  { id: 'cat_men', name: 'Men' },
  { id: 'cat_women', name: 'Women' },
  { id: 'cat_shoes', name: 'Shoes' },
  { id: 'cat_acc', name: 'Accessories' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATS);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('cat_men');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Fetch categories
      let { data: cats, error: catErr } = await supabase.from('categories').select('*').order('name');
      
      if (catErr) console.warn('Supabase categories fetch notice:', catErr.message);

      // 2. Ensure core categories exist
      if (cats && cats.length > 0) {
        const existingNames = cats.map(c => c.name.toLowerCase());
        const missing = CORE_CATEGORIES.filter(core => !existingNames.includes(core.toLowerCase()));
        
        if (missing.length > 0) {
          const toInsert = missing.map(name => ({ name }));
          const { data: newCats } = await supabase.from('categories').insert(toInsert).select();
          if (newCats) {
            cats = [...cats, ...newCats].sort((a, b) => a.name.localeCompare(b.name));
          }
        }
        setCategories(cats);
        if (!selectedCategoryId) setSelectedCategoryId(cats[0].id);
      } else {
        setCategories(DEFAULT_CATS);
      }

      // 3. Fetch subcategories
      const { data: subs } = await supabase.from('subcategories').select('*, categories(name)').order('name');
      if (subs) setSubcategories(subs);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(DEFAULT_CATS);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;
    
    setIsSubmitting(true);
    try {
      await addSubcategory(newSubcategoryName, selectedCategoryId);
      setNewSubcategoryName('');
      await fetchData();
      alert('Subcategory added successfully');
    } catch (error: any) {
      alert(error.message || 'Error adding subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubcategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the subcategory "${name}"?`)) return;

    setIsSubmitting(true);
    try {
      await deleteSubcategory(id, name);
      await fetchData();
      alert('Subcategory deleted successfully');
    } catch (error: any) {
      alert(error.message || 'Error deleting subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#3B2A20]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#3B2A20]">Categories Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Section (Fixed) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#3B2A20] mb-2">Main Categories</h2>
          <p className="text-sm text-gray-500 mb-6">These are the 4 fixed pillars of your store.</p>
          
          <ul className="space-y-2">
            {categories.filter(c => CORE_CATEGORIES.map(core => core.toLowerCase()).includes(c.name.toLowerCase())).map(cat => (
              <li key={cat.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center font-medium text-[#3B2A20]">
                <span>{cat.name}</span>
                <Link
                  href={`/admin/products?category=${encodeURIComponent(cat.name.toLowerCase())}&openAdd=true`}
                  className="inline-flex items-center text-xs bg-white border border-gray-200 hover:border-[#F5820B] hover:text-[#F5820B] px-2.5 py-1 rounded-md transition-colors shadow-2xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Subcategories Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#3B2A20] mb-6">Subcategories</h2>
          
          <form onSubmit={handleAddSubcategory} className="flex flex-col gap-3 mb-6">
            <select 
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
              required
            >
              {categories.filter(c => CORE_CATEGORIES.map(core => core.toLowerCase()).includes(c.name.toLowerCase())).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="E.g., T-Shirt, Jeans" 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-hidden focus:border-[#F5820B]"
                required
              />
              <button 
                type="submit" 
                disabled={isSubmitting || categories.length === 0}
                className="bg-[#3B2A20] text-white px-4 py-2 rounded-lg hover:bg-[#F5820B] transition-colors disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </form>

          <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {subcategories.map(sub => (
              <li key={sub.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center group">
                <div>
                  <span className="font-medium text-[#3B2A20]">{sub.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full ml-3">{sub.categories?.name}</span>
                </div>
                <button 
                  onClick={() => handleDeleteSubcategory(sub.id, sub.name)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
            {subcategories.length === 0 && <p className="text-sm text-gray-500">No subcategories found.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
