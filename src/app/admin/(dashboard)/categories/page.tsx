'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addSubcategory, deleteSubcategory } from '@/app/actions/admin';
import { Plus, Loader2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const CORE_CATEGORIES = ['Men', 'Women', 'Shoes', 'Accessories'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [inputError, setInputError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // 1. Fetch categories from Supabase
      let { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (catErr) console.warn('Supabase categories fetch notice:', catErr.message);

      // 2. Ensure core categories exist in database
      if (!cats || cats.length === 0) {
        const toInsert = CORE_CATEGORIES.map(name => ({ name }));
        const { data: newCats } = await supabase.from('categories').insert(toInsert).select();
        if (newCats && newCats.length > 0) {
          cats = newCats;
        }
      } else {
        const existingNames = cats.map(c => c.name.toLowerCase());
        const missing = CORE_CATEGORIES.filter(core => !existingNames.includes(core.toLowerCase()));
        
        if (missing.length > 0) {
          const toInsert = missing.map(name => ({ name }));
          const { data: newCats } = await supabase.from('categories').insert(toInsert).select();
          if (newCats) {
            cats = [...cats, ...newCats].sort((a, b) => a.name.localeCompare(b.name));
          }
        }
      }

      if (cats && cats.length > 0) {
        setCategories(cats);
        setSelectedCategoryId(prev => {
          const valid = cats!.some(c => c.id === prev);
          return valid ? prev : cats![0].id;
        });
      }

      // 3. Fetch subcategories
      const { data: subs, error: subErr } = await supabase
        .from('subcategories')
        .select('*, categories(name)')
        .order('name');

      if (subErr) console.warn('Supabase subcategories fetch notice:', subErr.message);
      if (subs) setSubcategories(subs);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSubcategoryName.trim();
    
    if (!name) {
      setInputError(true);
      if (inputRef.current) inputRef.current.focus();
      setStatusMessage({ type: 'error', text: 'Please type a subcategory name first.' });
      return;
    }

    if (!selectedCategoryId) {
      setStatusMessage({ type: 'error', text: 'Please select a main category.' });
      return;
    }

    setInputError(false);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const supabase = createClient();
      const { data: inserted, error: insertErr } = await supabase
        .from('subcategories')
        .insert([{ name, category_id: selectedCategoryId }])
        .select('*, categories(name)')
        .single();
        
      if (insertErr) {
        console.warn('Client insert notice:', insertErr.message);
        try {
          await addSubcategory(name, selectedCategoryId);
        } catch (srvErr: any) {
          console.warn('Server action fallback notice:', srvErr.message);
        }
      }

      if (inserted) {
        setSubcategories(prev => [...prev, inserted]);
      }

      setNewSubcategoryName('');
      setStatusMessage({ type: 'success', text: `Subcategory "${name}" added successfully!` });
      await fetchData();
    } catch (error: any) {
      console.error('Add subcategory error:', error);
      setStatusMessage({ type: 'error', text: 'Failed to add subcategory. Please try again.' });
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async (id: string, name: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    setStatusMessage(null);

    try {
      const supabase = createClient();

      // 1. Unassign subcategory from any assigned products in DB
      await supabase
        .from('products')
        .update({ subcategory: '' })
        .ilike('subcategory', name);

      // 2. Delete subcategory from DB
      const { error: deleteErr } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (deleteErr) {
        console.warn('Client delete notice:', deleteErr.message);
        try {
          await deleteSubcategory(id, name);
        } catch (srvErr: any) {
          console.warn('Server action delete notice:', srvErr.message);
        }
      }

      setSubcategories(prev => prev.filter(s => s.id !== id));
      setStatusMessage({ type: 'success', text: `Subcategory "${name}" deleted successfully!` });
      await fetchData();
    } catch (error: any) {
      console.error('Delete subcategory error:', error);
      setStatusMessage({ type: 'error', text: 'Failed to delete subcategory. Please try again.' });
      await fetchData();
    } finally {
      setDeletingId(null);
    }
  };

  const filteredSubcategories = subcategories.filter(sub => {
    if (filterCategory === 'all') return true;
    return sub.category_id === filterCategory || sub.categories?.name?.toLowerCase() === filterCategory.toLowerCase();
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#3B2A20] w-8 h-8" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#3B2A20]">Categories Management</h1>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Categories Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-[#3B2A20] mb-2">Main Categories</h2>
          <p className="text-sm text-gray-500 mb-6">These are the fixed pillars of your store.</p>
          
          <ul className="space-y-3">
            {categories.map(cat => (
              <li key={cat.id} className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 flex justify-between items-center font-medium text-[#3B2A20]">
                <span className="font-semibold">{cat.name}</span>
                <Link
                  href={`/admin/products?category=${encodeURIComponent(cat.name.toLowerCase())}&openAdd=true`}
                  className="inline-flex items-center text-xs bg-white border border-gray-200 hover:border-[#F5820B] hover:text-[#F5820B] px-3 py-1.5 rounded-md transition-colors shadow-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Subcategories Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-[#3B2A20] mb-4">Subcategories</h2>
          <p className="text-sm text-gray-500 mb-6">Add and manage specific product subcategories under main categories.</p>
          
          <form onSubmit={handleAddSubcategory} className="flex flex-col gap-3 mb-6 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <label className="text-xs font-bold text-[#3B2A20] uppercase tracking-wider">Add New Subcategory</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select 
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-hidden focus:border-[#F5820B]"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <input 
                ref={inputRef}
                type="text" 
                value={newSubcategoryName}
                onChange={(e) => {
                  setNewSubcategoryName(e.target.value);
                  if (inputError) setInputError(false);
                }}
                placeholder="E.g., T-Shirt, Bags, Boots" 
                className={`bg-white border rounded-lg px-3 py-2 text-sm focus:outline-hidden ${
                  inputError ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-300 focus:border-[#F5820B]'
                }`}
              />

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#3B2A20] text-white px-4 py-2 rounded-lg hover:bg-[#F5820B] transition-colors disabled:opacity-50 flex items-center justify-center font-medium text-sm gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Subcategory
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Filter Subcategories */}
          <div className="flex justify-between items-center mb-4 pt-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {filteredSubcategories.length} {filteredSubcategories.length === 1 ? 'Subcategory' : 'Subcategories'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filter:</span>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-md px-2 py-1 focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredSubcategories.map(sub => (
              <li key={sub.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center hover:bg-gray-100/80 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#3B2A20] text-sm">{sub.name}</span>
                  <span className="text-[11px] font-medium text-[#F5820B] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    {sub.categories?.name || 'Category'}
                  </span>
                </div>
                
                {confirmDeleteId === sub.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleExecuteDelete(sub.id, sub.name)}
                      disabled={deletingId === sub.id}
                      className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md hover:bg-red-700 transition-colors shadow-xs"
                    >
                      {deletingId === sub.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setConfirmDeleteId(sub.id)}
                    disabled={deletingId === sub.id}
                    title={`Delete ${sub.name}`}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 cursor-pointer"
                  >
                    {deletingId === sub.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </li>
            ))}
            {filteredSubcategories.length === 0 && (
              <li className="p-6 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                No subcategories found.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

