'use client';

import React from 'react';
import SingleProductView, { SingleProductType } from '@/components/storefront/product/SingleProductView';

const sampleSingleProduct: SingleProductType = {
  id: 'prod-101',
  title: 'প্রিমিয়াম কটন ক্যাজুয়াল ফুল হাতা শার্ট ফর ম্যান',
  slug: 'premium-cotton-shirt',
  categoryName: "Men's Fashion",
  price: 1150,
  regularPrice: 1450,
  inStock: true,
  images: [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', // Navy Blue
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', // Maroon
    'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800', // Olive Green
  ],
  colors: ['Navy Blue', 'Maroon', 'Olive Green'],
  sizes: ['M', 'L', 'XL'],
  
  // 🛍️ ভিন্ন ভিন্ন কালার ও সাইজের জন্য আলাদা ছবি ও দামের ভ্যারিয়েশন ডাটা
  variations: [
    {
      id: 'var-1',
      attributes: { color: 'Navy Blue' },
      price: 1150,
      regularPrice: 1450,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    },
    {
      id: 'var-2',
      attributes: { color: 'Maroon' },
      price: 1250, // মেরুন কালারের দাম ১২৫০
      regularPrice: 1550,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
    },
    {
      id: 'var-3',
      attributes: { color: 'Olive Green' },
      price: 1300, // অলিভ গ্রিনের দাম ১৩০০
      regularPrice: 1600,
      image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800',
    },
  ],

  description:
    '১০০% খাঁটি সুতি কাপড়ে তৈরি এই ক্যাজুয়াল শার্টটি সারাদিন পরার জন্য অত্যন্ত আরামদায়ক। আকর্ষণীয় কালার এবং নিখুঁত স্টিচিংয়ের কারণে এটি ডেইলি ব্যবহারের জন্য একদম উপযুক্ত।',
  features: [
    '১০০% প্রিমিয়াম সুতি ফেব্রিক',
    'রং ওঠার কোনো ঝুঁকি নেই',
    'আরামদায়ক এবং টেকসই ফেব্রিক',
    'স্টাইলিশ স্লিম ফিটিং কাট',
    'মারিয়াম',
  ],
};

export default function TestProductPage() {
  return <SingleProductView product={sampleSingleProduct} />;
}
