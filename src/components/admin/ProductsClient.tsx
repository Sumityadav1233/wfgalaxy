'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Video, X, Sparkles, Image as ImageIcon, Check, Tag } from 'lucide-react';
import StockManagement from './StockManagement';
import ProductSearch from './ProductSearch';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string | null;
  sizes: string;
  colors: string;
  images: string;
  videoUrl: string | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  is_out_of_stock?: boolean;
}

interface ProductsClientProps {
  initialProducts: Product[];
}

const PRESET_CATALOG_IMAGES = [
  { name: 'Men Linen Suit', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80' },
  { name: 'Casual Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
  { name: 'Luxury Jacket', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80' },
  { name: 'Designer Sneakers', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80' },
  { name: 'Women Evening Dress', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80' },
  { name: 'Leather Accessories', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
];

export const ProductsClient: React.FC<ProductsClientProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dynamic Categories from database
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);

  // Form Field States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('men');
  const [subcategory, setSubcategory] = useState('');
  const [colors, setColors] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [images, setImages] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);

  // Interactive Upload States
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imagesProgress, setImagesProgress] = useState(0);
  const [uploadedImageNames, setUploadedImageNames] = useState<string[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const sizesOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'];

  // Fetch dynamic categories from Supabase and handle URL search parameters
  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient();
        const { data: cats } = await supabase.from('categories').select('*').order('name');
        if (cats && cats.length > 0) setDbCategories(cats);
      } catch (err) {
        console.warn('Category load notice:', err);
      }
    }
    loadCategories();

    // Check URL parameters for direct category navigation (e.g., from categories page)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const openAdd = params.get('openAdd');
      if (catParam) {
        setCategory(catParam.toLowerCase());
      }
      if (openAdd === 'true') {
        openAddForm();
        if (catParam) setCategory(catParam.toLowerCase());
      }
    }
  }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('men');
    setSubcategory('');
    setColors('Black, White');
    setVideoUrl('');
    setImages('');
    setSelectedSizes(['M', 'L', 'XL']);
    setStockQuantity(10);
    setLowStockThreshold(10);
    setUploadedImageNames([]);
    setImagesProgress(0);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCategory(prod.category || 'men');
    setSubcategory(prod.subcategory || '');
    setColors(prod.colors || 'Black, White');
    setVideoUrl(prod.videoUrl || '');
    setImages(prod.images || '');
    setSelectedSizes(prod.sizes ? prod.sizes.split(',').map((s) => s.trim()) : []);
    setStockQuantity(prod.stock_quantity ?? 0);
    setLowStockThreshold(prod.low_stock_threshold ?? 10);
    setUploadedImageNames(prod.images ? ['Catalog Image'] : []);
    setImagesProgress(0);
    setIsFormOpen(true);
  };

  // Real-time search filter
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.colors.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Image Drag-and-Drop / File Select handlers with safe URL handling
  const handleImagesFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFiles(Array.from(files));
    }
  };

  const processImageFiles = async (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      alert('Please select valid image files (JPG/PNG/WEBP).');
      return;
    }

    setIsUploadingImages(true);
    setImagesProgress(30);
    setUploadedImageNames((prev) => [...prev, ...validImages.map((f) => f.name)]);

    try {
      const readAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          if (file.size > 1024 * 1024) {
            resolve('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80');
          reader.readAsDataURL(file);
        });
      };

      const dataUrls = await Promise.all(validImages.map(readAsDataUrl));
      const validUrls = dataUrls.filter(Boolean);

      if (validUrls.length > 0) {
        const joined = validUrls.join(',');
        setImages((prevImgs) => (prevImgs ? `${prevImgs},${joined}` : joined));
      }
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setImagesProgress(100);
      setIsUploadingImages(false);
    }
  };

  const selectPresetImage = (url: string) => {
    setImages((prev) => (prev ? `${prev},${url}` : url));
  };

  const clearImages = () => {
    setImages('');
    setUploadedImageNames([]);
    setImagesProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSizeCheckboxChange = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const res = await fetch('/api/products/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Delete product error:', err);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !price) {
      alert('Please enter Product Name, Description, and Price.');
      return;
    }

    const finalSizes = selectedSizes.length > 0 ? selectedSizes.join(',') : 'S,M,L,XL';
    const finalColors = colors.trim() || 'Black, White';
    const finalImages = images.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category: category || 'men',
      subcategory: subcategory.trim() || null,
      sizes: finalSizes,
      colors: finalColors,
      images: finalImages,
      videoUrl: videoUrl.trim() || null,
      stock_quantity: stockQuantity,
      low_stock_threshold: lowStockThreshold,
      is_out_of_stock: stockQuantity <= 0,
    };

    try {
      if (editingProduct) {
        const res = await fetch('/api/products/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p)));
          setIsFormOpen(false);
        } else {
          const updated = { id: editingProduct.id, ...payload };
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
          setIsFormOpen(false);
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const created = await res.json();
          setProducts((prev) => [created, ...prev]);
          setIsFormOpen(false);
        } else {
          const tempProduct: Product = {
            id: `temp_${Date.now()}`,
            ...payload,
          };
          setProducts((prev) => [tempProduct, ...prev]);
          setIsFormOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Submit Product Error:', err);
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
      } else {
        setProducts((prev) => [{ id: `temp_${Date.now()}`, ...payload }, ...prev]);
      }
      setIsFormOpen(false);
    }
  };

  const handleStockUpdate = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p)));
  };

  return (
    <div className="space-y-6">
      {/* Header, Search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#3B2A20]">Products Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Manage your store catalog, edit items, update inventory stock, or search products.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ProductSearch onSearch={setSearchQuery} />

          <button
            onClick={openAddForm}
            className="inline-flex items-center justify-center bg-[#3B2A20] hover:bg-[#F5820B] text-white text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Product List Table (Desktop View) */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-gray-500 font-medium">
            {searchQuery ? `No products matching "${searchQuery}".` : 'No products in catalog. Click "Add Product" to populate your inventory.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-[#3B2A20]">
                  <th className="p-4">Preview</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Management</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const imageArray = product.images ? product.images.split(',') : [];
                  const previewImg = imageArray[0] && imageArray[0].startsWith('http') ? imageArray[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
                  return (
                    <tr key={product.id} className="hover:bg-orange-50/30 transition-colors">
                      {/* Image */}
                      <td className="p-4">
                        <div className="h-14 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative shrink-0 shadow-2xs">
                          <img src={previewImg} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* Details */}
                      <td className="p-4">
                        <span className="font-bold text-[#3B2A20] block">{product.name}</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5 font-medium">
                          Sizes: {product.sizes} | Colors: {product.colors}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-flex items-center text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md capitalize">
                          <Tag className="w-3 h-3 mr-1 text-[#F5820B]" />
                          {product.category}
                          {product.subcategory ? ` / ${product.subcategory}` : ''}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-mono font-bold text-[#3B2A20]">
                        Rs. {product.price.toFixed(2)}
                      </td>

                      {/* Stock Management */}
                      <td className="p-4">
                        <StockManagement product={product} onUpdate={handleStockUpdate} />
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:border-[#F5820B] text-gray-600 hover:text-[#F5820B] transition-colors shadow-2xs cursor-pointer"
                          aria-label="Edit product"
                        >
                          <Edit className="h-4 w-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:border-red-500 text-gray-600 hover:text-red-500 transition-colors shadow-2xs cursor-pointer"
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4 stroke-[1.8]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Product Cards (Mobile View) */}
      <div className="block md:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium bg-white rounded-xl border border-gray-200">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const imageArray = product.images ? product.images.split(',') : [];
            const previewImg = imageArray[0] && imageArray[0].startsWith('http') ? imageArray[0] : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
            return (
              <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center space-x-3">
                  <img src={previewImg} alt={product.name} className="h-16 w-14 rounded-lg object-cover border border-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#3B2A20] text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Category: <span className="font-semibold capitalize text-gray-700">{product.category}</span></p>
                    <p className="text-xs font-mono font-bold text-[#3B2A20] mt-1">Rs. {product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => openEditForm(product)}
                      className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:text-[#F5820B]"
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <StockManagement product={product} onUpdate={handleStockUpdate} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Slide-over Panel / Modal (White Theme) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsFormOpen(false)}></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
              <div className="pointer-events-auto w-screen max-w-xl transform bg-white border-l border-gray-200 shadow-2xl transition-all">
                <div className="flex h-full flex-col overflow-y-scroll bg-white text-[#3B2A20]">
                  
                  {/* Form Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 bg-gray-50">
                    <h2 className="text-base font-serif font-bold text-[#3B2A20] flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-[#F5820B]" />
                      {editingProduct ? 'Edit Product Details' : 'Add New Clothing Product'}
                    </h2>
                    <button type="button" className="rounded-lg text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-200 transition-colors" onClick={() => setIsFormOpen(false)}>
                      <X className="h-5 w-5 stroke-[2]" />
                    </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-5 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Linen Suit Jacket"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-hidden focus:border-[#F5820B] focus:bg-white text-[#3B2A20] font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Primary Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-hidden focus:border-[#F5820B] focus:bg-white text-[#3B2A20] font-semibold capitalize"
                        >
                          <option value="men">Men's Collection</option>
                          <option value="women">Women's Collection</option>
                          <option value="shoes">Shoes & Footwear</option>
                          <option value="accessories">Accessories</option>
                          {dbCategories.map((c) => (
                            <option key={c.id} value={c.name.toLowerCase()}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Subcategory (Optional)
                        </label>
                        <input
                          type="text"
                          value={subcategory}
                          onChange={(e) => setSubcategory(e.target.value)}
                          placeholder="e.g. Hoodies, Shirts, Jeans"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-hidden focus:border-[#F5820B] focus:bg-white text-[#3B2A20]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Price (Rs.) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 2499.00"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-hidden focus:border-[#F5820B] focus:bg-white text-[#3B2A20] font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Colors (Comma-separated) *
                      </label>
                      <input
                        type="text"
                        required
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                        placeholder="e.g. Camel, Black, Ivory"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-hidden focus:border-[#F5820B] focus:bg-white text-[#3B2A20]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Product Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail materials, tailoring shape, fit instructions..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-hidden focus:border-[#F5820B] focus:bg-white text-[#3B2A20] resize-none"
                      ></textarea>
                    </div>

                    {/* Available Sizes Selection */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Available Sizes *
                      </label>
                      <div className="flex gap-3 flex-wrap p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        {sizesOptions.map((sz) => (
                          <label key={sz} className="flex items-center text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(sz)}
                              onChange={() => handleSizeCheckboxChange(sz)}
                              className="h-4 w-4 text-[#F5820B] border-gray-300 focus:ring-[#F5820B] rounded-xs mr-1.5 accent-[#F5820B]"
                            />
                            <span className="font-semibold text-gray-700">{sz}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Image Selection & Preset Picker */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Upload Product Images *
                      </label>

                      {/* Quick 1-Click Catalog Image Presets */}
                      <div className="mb-3">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                          Or Select Catalog Image Preset:
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {PRESET_CATALOG_IMAGES.map((preset, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => selectPresetImage(preset.url)}
                              className="h-16 rounded-lg border border-gray-200 overflow-hidden relative group hover:border-[#F5820B] transition-colors focus:ring-2 focus:ring-[#F5820B]"
                              title={preset.name}
                            >
                              <img src={preset.url} alt={preset.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-end p-1">
                                <span className="text-[9px] font-bold text-white leading-tight truncate">{preset.name.split(' ')[1] || preset.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* File Upload Zone */}
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-[#F5820B] rounded-xl p-5 text-center cursor-pointer transition-colors bg-gray-50 flex flex-col items-center justify-center space-y-1 group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files) {
                            processImageFiles(Array.from(e.dataTransfer.files));
                          }
                        }}
                      >
                        <input
                          type="file"
                          ref={imageInputRef}
                          multiple
                          accept="image/*"
                          onChange={handleImagesFileSelect}
                          className="hidden"
                        />
                        <ImageIcon className="h-7 w-7 text-gray-400 group-hover:text-[#F5820B] transition-colors stroke-[1.5]" />
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-[#3B2A20]">
                          Drag & drop photos or <span className="text-[#F5820B] underline">browse files</span>
                        </span>
                        <span className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP</span>
                      </div>

                      {/* Display Selected Images List */}
                      {images && (
                        <div className="mt-3 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-200">
                            <span className="text-[11px] font-bold text-[#F5820B] uppercase tracking-wider">Active Image URLs</span>
                            <button type="button" onClick={clearImages} className="text-[10px] text-red-600 hover:underline font-bold">
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {images.split(',').map((imgUrl, index) => (
                              <div key={index} className="h-14 w-12 border border-gray-200 rounded-lg relative overflow-hidden bg-gray-100 shrink-0 shadow-2xs">
                                <img src={imgUrl.startsWith('http') ? imgUrl : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'} className="h-full w-full object-cover" alt="preview" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Submit Buttons */}
                    <div className="border-t border-gray-200 pt-5 flex gap-3 bg-white">
                      <button
                        type="submit"
                        className="flex-1 bg-[#3B2A20] hover:bg-[#F5820B] text-white py-3 text-xs font-bold tracking-wider uppercase transition-colors rounded-lg shadow-sm cursor-pointer"
                      >
                        {editingProduct ? 'Save Changes' : 'Create Product'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-xs font-bold tracking-wider uppercase transition-colors rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsClient;
