'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export interface ProductType {
  id: string;
  title: string;
  slug: string;
  categoryName?: string;
  price: number;
  regularPrice?: number;
  imageUrl: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: ProductType;
  onAddToCart?: (product: ProductType) => void;
  onBuyNow?: (product: ProductType) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
}: ProductCardProps) {
  const {
    id,
    title,
    slug,
    categoryName,
    price,
    regularPrice,
    imageUrl,
    inStock = true,
  } = product;

  // ডিসকাউন্ট পার্সেন্টেজ হিসাব
  const hasDiscount = regularPrice && regularPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : 0;

  // টাকা ফরম্যাট
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden">
      
      {/* 🖼️ ১. ইমেজ সেকশন */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {hasDiscount && inStock && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md">
            -{discountPercentage}%
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-xs font-black px-3 py-1 rounded-full uppercase">
              স্টক আউট
            </span>
          </div>
        )}

        {/* 🔗 সঠিক স্লাগ লিংক */}
        <Link href={`/${slug}`} className="block w-full h-full">
          <img
            src={imageUrl || '/placeholder-product.png'}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* 📝 ২. কন্টেন্ট সেকশন */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {categoryName && (
            <span className="text-[10px] font-bold text-gray-400 uppercase block">
              {categoryName}
            </span>
          )}
          {/* 🔗 সঠিক স্লাগ লিংক */}
          <Link href={`/${slug}`}>
            <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug hover:text-red-700">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price Block */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm font-black text-red-700">
            ৳ {formatAmount(price)}
          </span>
          {hasDiscount && (
            <s className="text-xs font-semibold text-gray-400 line-through">
              ৳ {formatAmount(regularPrice)}
            </s>
          )}
        </div>
      </div>

      {/* 🛒 ৩. বাটন সেকশন */}
      <div className="p-3 pt-0 grid grid-cols-5 gap-2 items-center">
        <button
          type="button"
          disabled={!inStock}
          onClick={() => onAddToCart && onAddToCart(product)}
          className="col-span-1 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={!inStock}
          onClick={() => onBuyNow && onBuyNow(product)}
          className="col-span-4 h-9 bg-[#8A1538] hover:bg-rose-900 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <span>এখনই কিনুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
