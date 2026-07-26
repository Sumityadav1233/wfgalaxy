'use client';

import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Video, X, Sparkles, Upload, FileVideo, Image as ImageIcon, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string;
  colors: string;
  images: string;
  videoUrl: string | null;
}

interface ProductsClientProps {
  initialProducts: Product[];
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Outerwear');
  const [colors, setColors] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [images, setImages] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Interactive Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [uploadedVideoName, setUploadedVideoName] = useState('');

  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imagesProgress, setImagesProgress] = useState(0);
  const [uploadedImageNames, setUploadedImageNames] = useState<string[]>([]);
  const [showAdvancedUrls, setShowAdvancedUrls] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sizesOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const openAddForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Outerwear');
    setColors('');
    setVideoUrl('');
    setImages('');
    setSelectedSizes(['M', 'L']);
    setUploadedVideoName('');
    setUploadedImageNames([]);
    setVideoProgress(0);
    setImagesProgress(0);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setColors(prod.colors);
    setVideoUrl(prod.videoUrl || '');
    setImages(prod.images);
    setSelectedSizes(prod.sizes.split(',').map((s) => s.trim()));
    setUploadedVideoName(prod.videoUrl ? 'Existing promo video' : '');
    setUploadedImageNames(prod.images ? ['Existing catalog images'] : []);
    setVideoProgress(0);
    setImagesProgress(0);
    setIsFormOpen(true);
  };

  // Video Drag-and-Drop / File Select handlers
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processVideoFile(files[0]);
    }
  };

  const processVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4/WebM/QuickTime).');
      return;
    }

    setIsUploadingVideo(true);
    setVideoProgress(0);
    setUploadedVideoName(file.name);

    // Simulate upload progress
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingVideo(false);
          // Set videoUrl to local object URL so it plays directly in previews!
          const localUrl = URL.createObjectURL(file);
          setVideoUrl(localUrl);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Images Drag-and-Drop / File Select handlers
  const handleImagesFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFiles(Array.from(files));
    }
  };

  const processImageFiles = (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      alert('Please select valid image files (JPG/PNG/WEBP).');
      return;
    }

    setIsUploadingImages(true);
    setImagesProgress(0);
    setUploadedImageNames((prev) => [...prev, ...validImages.map((f) => f.name)]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setImagesProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingImages(false);
          // Read files and generate object URLs
          const localUrls = validImages.map((f) => URL.createObjectURL(f)).join(',');
          setImages((prevImgs) => (prevImgs ? `${prevImgs},${localUrls}` : localUrls));
          return 100;
        }
        return prev + 20;
      });
    }, 100);
  };

  const clearVideo = () => {
    setVideoUrl('');
    setUploadedVideoName('');
    setVideoProgress(0);
    if (videoInputRef.current) videoInputRef.current.value = '';
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
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !price || !category || !colors.trim() || !images.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (selectedSizes.length === 0) {
      alert('Please select at least one size.');
      return;
    }

    const payload = {
      name,
      description,
      price: parseFloat(price),
      category,
      sizes: selectedSizes.join(','),
      colors,
      images,
      videoUrl: videoUrl.trim() || null,
    };

    try {
      if (editingProduct) {
        // Edit flow
        const res = await fetch('/api/products/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });

        if (res.ok) {
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setIsFormOpen(false);
        } else {
          alert('Failed to update product');
        }
      } else {
        // Add flow
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = await res.json();
          setProducts((prev) => [created, ...prev]);
          setIsFormOpen(false);
        } else {
          alert('Failed to create product');
        }
      }
    } catch (err) {
      console.error('Form submit error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Product Management</h1>
          <p className="text-xs text-neutral-400 font-light mt-1 uppercase tracking-wider">
            Add, update, or remove clothing items in your storefront catalog
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center bg-accent hover:bg-accent-hover text-neutral-950 text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-sm shadow-md transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="p-20 text-center text-neutral-500">
            No products in catalog. Click "Add Product" to populate your inventory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#161614] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="p-4">Item Preview</th>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Promo Video</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {products.map((product) => {
                  const imageArray = product.images.split(',');
                  return (
                    <tr key={product.id} className="hover:bg-neutral-900/30 transition-colors">
                      {/* Image */}
                      <td className="p-4">
                        <div className="h-16 w-12 rounded-md overflow-hidden bg-neutral-900 border border-neutral-800 relative">
                          <img src={imageArray[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </td>

                      {/* Details */}
                      <td className="p-4">
                        <span className="font-semibold text-neutral-200 block">{product.name}</span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          Sizes: {product.sizes} | Colors: {product.colors}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-neutral-300 font-light">{product.category}</td>

                      {/* Price */}
                      <td className="p-4 font-mono font-semibold text-accent">${product.price.toFixed(2)}</td>

                      {/* Video status */}
                      <td className="p-4">
                        {product.videoUrl ? (
                          <span className="inline-flex items-center text-xs text-green-400 font-medium">
                            <Video className="h-4 w-4 mr-1 text-accent" /> Yes (Active)
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-500">No clip</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="p-2 bg-[#1c1c1a] border border-neutral-800 rounded-sm hover:border-accent text-neutral-300 hover:text-accent transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit className="h-4 w-4 stroke-[1.8]" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-[#1c1c1a] border border-neutral-800 rounded-sm hover:border-red-900 text-neutral-300 hover:text-red-400 transition-colors"
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

      {/* Form Slide-over Panel (Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop overlay */}
            <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity" onClick={() => setIsFormOpen(false)}></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-[#121211] border-l border-neutral-800 transition-all shadow-2xl animate-slide-in-right">
                <div className="flex h-full flex-col overflow-y-scroll bg-[#121211] text-white">
                  {/* Form Header */}
                  <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-5 bg-neutral-950">
                    <h2 className="text-sm font-bold tracking-wider text-white uppercase flex items-center">
                      <Sparkles className="mr-2 h-4 w-4 text-accent" />
                      {editingProduct ? 'EDIT PRODUCT DETAILS' : 'ADD NEW CLOTHING PRODUCT'}
                    </h2>
                    <button type="button" className="rounded-md text-neutral-400 hover:text-white p-1" onClick={() => setIsFormOpen(false)}>
                      <X className="h-6 w-6 stroke-[1.5]" />
                    </button>
                  </div>

                  {/* Form Body */}
                  <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-5 bg-[#121211]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Linen Suit Jacket"
                          className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                          Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-white font-semibold"
                        >
                          <option value="Outerwear">Outerwear</option>
                          <option value="Shirts">Shirts</option>
                          <option value="Pants">Pants</option>
                          <option value="Dresses">Dresses</option>
                          <option value="Activewear">Activewear</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                          Price ($ USD) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="e.g. 79.99"
                          className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                          Colors (Comma-separated) *
                        </label>
                        <input
                          type="text"
                          required
                          value={colors}
                          onChange={(e) => setColors(e.target.value)}
                          placeholder="e.g. Camel, Black, Ivory"
                          className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Product Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail materials, tailoring shape, fit instructions..."
                        className="w-full bg-[#1c1c1a] border border-neutral-750 rounded-sm py-2.5 px-3 text-sm focus:outline-hidden focus:border-accent text-white resize-none"
                      ></textarea>
                    </div>

                    {/* Multi-select Sizes Checkboxes */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Available Sizes *
                      </label>
                      <div className="flex gap-4 flex-wrap p-3 bg-[#1c1c1a] border border-neutral-750 rounded-sm">
                        {sizesOptions.map((sz) => (
                          <label key={sz} className="flex items-center text-sm cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(sz)}
                              onChange={() => handleSizeCheckboxChange(sz)}
                              className="h-4 w-4 text-accent border-neutral-600 focus:ring-accent rounded-sm mr-2 accent-accent"
                            />
                            <span className="font-semibold text-neutral-300">{sz}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 🚀 Drag & Drop IMAGE Upload Zone */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Upload Product Images *
                      </label>
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-700 hover:border-accent rounded-md p-6 text-center cursor-pointer transition-colors bg-[#1c1c1a]/50 flex flex-col items-center justify-center space-y-2 group"
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
                        <ImageIcon className="h-8 w-8 text-neutral-500 group-hover:text-accent transition-colors stroke-[1.5]" />
                        <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">
                          Drag & drop product photos or <span className="text-accent underline">browse</span>
                        </span>
                        <span className="text-[10px] text-neutral-500">Supports JPG, PNG, WEBP files</span>
                      </div>

                      {/* Image Upload Progress bar */}
                      {isUploadingImages && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                            <span>Uploading images...</span>
                            <span>{imagesProgress}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-accent h-full transition-all duration-150" style={{ width: `${imagesProgress}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Display Uploaded Images List */}
                      {images && (
                        <div className="mt-3 bg-[#1c1c1a] border border-neutral-800 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-2 pb-1 border-b border-neutral-850">
                            <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Uploaded Files</span>
                            <button type="button" onClick={clearImages} className="text-[9px] text-red-400 hover:underline">
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {images.split(',').map((imgUrl, index) => (
                              <div key={index} className="h-12 w-10 border border-neutral-700 rounded-sm relative overflow-hidden bg-black shrink-0">
                                <img src={imgUrl} className="h-full w-full object-cover" alt="preview" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 🚀 Drag & Drop VIDEO Upload Zone */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Upload Promotional Video (For Social Auto-Post)
                      </label>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-neutral-700 hover:border-accent rounded-md p-6 text-center cursor-pointer transition-colors bg-[#1c1c1a]/50 flex flex-col items-center justify-center space-y-2 group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processVideoFile(e.dataTransfer.files[0]);
                          }
                        }}
                      >
                        <input
                          type="file"
                          ref={videoInputRef}
                          accept="video/*"
                          onChange={handleVideoFileSelect}
                          className="hidden"
                        />
                        <FileVideo className="h-8 w-8 text-neutral-500 group-hover:text-accent transition-colors stroke-[1.5]" />
                        <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">
                          Drag & drop raw MP4 video or <span className="text-accent underline">browse</span>
                        </span>
                        <span className="text-[10px] text-neutral-500">Supports MP4, MOV files (Max 50MB)</span>
                      </div>

                      {/* Video Upload Progress bar */}
                      {isUploadingVideo && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                            <span>Uploading video file...</span>
                            <span>{videoProgress}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-accent h-full transition-all duration-150" style={{ width: `${videoProgress}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Display Uploaded Video info */}
                      {videoUrl && (
                        <div className="mt-3 bg-[#1c1c1a] border border-neutral-800 p-3 rounded-md flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-black rounded-sm overflow-hidden flex items-center justify-center shrink-0 border border-neutral-800">
                              <video src={videoUrl} className="h-full w-full object-cover" muted />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-neutral-200 block truncate max-w-[200px]">
                                {uploadedVideoName || 'Uploaded promo video'}
                              </span>
                              <span className="text-[9px] text-green-400 flex items-center mt-0.5">
                                <Check className="h-3 w-3 mr-0.5 stroke-[2.5]" /> Ready for cropping
                              </span>
                            </div>
                          </div>
                          <button type="button" onClick={clearVideo} className="p-1.5 hover:bg-neutral-800 rounded-sm text-neutral-400 hover:text-red-400 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Advanced Url Config Toggle */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedUrls(!showAdvancedUrls)}
                        className="text-[10px] font-bold text-neutral-500 hover:text-neutral-300 uppercase tracking-widest"
                      >
                        {showAdvancedUrls ? 'Hide Advanced URL overrides' : 'Show Advanced URL overrides'}
                      </button>
                      
                      {showAdvancedUrls && (
                        <div className="mt-3 space-y-3 p-4 border border-neutral-850 rounded-md bg-[#161614] animate-fade-in">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                              Image URLs String (CSV Override)
                            </label>
                            <input
                              type="text"
                              value={images}
                              onChange={(e) => setImages(e.target.value)}
                              className="w-full bg-[#1c1c1a] border border-neutral-850 rounded-sm py-1.5 px-3 text-xs text-neutral-400 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-neutral-400 mb-1">
                              Video URL String (Override)
                            </label>
                            <input
                              type="text"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              className="w-full bg-[#1c1c1a] border border-neutral-850 rounded-sm py-1.5 px-3 text-xs text-neutral-400 font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Submit Buttons */}
                    <div className="border-t border-neutral-800/80 pt-6 flex gap-4 bg-[#121211]">
                      <button
                        type="submit"
                        className="flex-1 bg-accent hover:bg-accent-hover text-neutral-950 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm shadow-md"
                      >
                        {editingProduct ? 'SAVE CHANGES' : 'CREATE GARMENT'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="flex-1 bg-[#1c1c1a] border border-neutral-800 hover:bg-neutral-850 text-neutral-400 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-sm"
                      >
                        CANCEL
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
