'use client';

import React from 'react';
import ProductCard, { ProductType } from '@/components/storefront/product/ProductCard';

const sampleProducts: ProductType[] = [
  {
    id: '1',
    title: 'প্রিমিয়াম কটন ক্যাজুয়াল শার্ট ফর ম্যান - লং স্লিপ',
    slug: 'premium-cotton-shirt',
    categoryName: "Men's Fashion",
    price: 990,
    regularPrice: 1250,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    inStock: true,
  },
  {
    id: '2',
    title: 'স্মার্ট ওয়াচ সিরিজ ৮ প্রিমিয়াম মেটালিক স্ট্র্যাপ',
    slug: 'smart-watch-series-8',
    categoryName: 'Gadgets',
    price: 2450,
    regularPrice: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    inStock: true,
  },
  {
    id: '3',
    title: 'অরিজিনাল লেদার ওয়ালেট ফর ম্যান - ব্ল্যাক',
    slug: 'leather-wallet-black',
    categoryName: 'Accessories',
    price: 750,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
    inStock: true,
  },
  {
    id: '4',
    title: 'ওয়ারলেস ব্লুটুথ হেডফোন ৩ডি সাউন্ড',
    slug: 'wireless-headphone',
    categoryName: 'Audio',
    price: 1800,
    regularPrice: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    inStock: false,
  },
];

export default function TestCardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-lg font-bold text-gray-800">🛍️ Product Card Preview</h1>
        
        {/* ৪ কলামের সুন্দর গ্রিড */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sampleProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onAddToCart={(p) => alert(`কার্টে যোগ হয়েছে: ${p.title}`)}
              onBuyNow={(p) => alert(`অর্ডার করা হচ্ছে: ${p.title}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
