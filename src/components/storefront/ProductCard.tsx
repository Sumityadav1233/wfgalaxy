import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: any;
}

function parseProductImages(product: any): string[] {
  const defaultFallback = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';

  let list: string[] = [];

  if (Array.isArray(product.image_urls)) {
    list = product.image_urls.filter((url: any) => typeof url === 'string' && url.trim().length > 0);
  } else if (typeof product.image_urls === 'string' && product.image_urls.trim().length > 0) {
    list = product.image_urls.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  if (list.length === 0) {
    if (Array.isArray(product.images)) {
      list = product.images.filter((url: any) => typeof url === 'string' && url.trim().length > 0);
    } else if (typeof product.images === 'string' && product.images.trim().length > 0) {
      list = product.images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  return list.length > 0 ? list : [defaultFallback];
}

export default function ProductCard({ product }: ProductCardProps) {
  const images = parseProductImages(product);
  const mainImage = images[0];
  const secondImage = images[1] || mainImage;

  return (
    <Link href={`/product/${product.id}`} className="group block w-full">
      <div className="relative aspect-3/4 overflow-hidden bg-gray-100 rounded-sm mb-4">
        {product.is_latest && (
          <div className="absolute top-3 left-3 z-10 bg-white text-[#3B2A20] text-xs font-bold px-2 py-1 uppercase tracking-wider">
            New
          </div>
        )}
        <img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';
          }}
        />
        <img
          src={secondImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = mainImage;
          }}
        />
      </div>
      <div className="flex flex-col space-y-1">
        <h3 className="font-serif text-lg text-[#3B2A20] font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">Rs. {Number(product.price || 0).toLocaleString()}</p>
      </div>
    </Link>
  );
}
