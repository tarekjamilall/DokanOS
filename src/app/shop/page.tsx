'use client';

import React from 'react';
import ShopView from '@/components/storefront/shop/ShopView';
import { ProductType } from '@/components/storefront/product/ProductCard';

// ডামি প্রোডাক্ট লিস্ট
const sampleProductsList: ProductType[] = [
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
    categoryName: 'Gadgets',
    price: 1800,
    regularPrice: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    inStock: false,
  },
  {
    id: '5',
    title: 'ক্যাজুয়াল স্নিকার্স সুজ ফর ম্যান - হোয়াইট',
    slug: 'casual-sneakers-white',
    categoryName: "Men's Fashion",
    price: 1650,
    regularPrice: 2100,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    inStock: true,
  },
  {
    id: '6',
    title: 'অরিজিনাল সানগ্লাস ইউভি ৪০০ প্রটেকশন',
    slug: 'original-sunglass-uv400',
    categoryName: 'Accessories',
    price: 850,
    regularPrice: 1100,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
    inStock: true,
  },
];

export default function ShopPage() {
  return <ShopView initialProducts={sampleProductsList} />;
}
