'use client';

import React from 'react';

type TopProduct = {
  id: string;
  title: string;
  price: number;
  salesCount: number;
  imageUrl: string;
};

const SAMPLE_TOP_PRODUCTS: TopProduct[] = [
  {
    id: 'p-1',
    title: 'প্রিমিয়াম কটন ক্যাটালগ পাঞ্জাবি',
    price: 1850,
    salesCount: 42,
    imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf03b0?w=150',
  },
  {
    id: 'p-2',
    title: 'হাফ সিল্ক জর্জেট শাড়ি',
    price: 2400,
    salesCount: 35,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150',
  },
  {
    id: 'p-3',
    title: 'ক্যাজুয়াল ড্রাই-ফিট টি-শার্ট',
    price: 650,
    salesCount: 28,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150',
  },
];

export default function TopSellingProductsWidget() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>🔥</span>
            <span>টপ সেলিং প্রোডাক্টস (Top Items)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">সবচেয়ে বেশি বিক্রি হওয়া ৩টি প্রোডাক্ট</p>
        </div>
      </div>

      <div className="space-y-3">
        {SAMPLE_TOP_PRODUCTS.map((prod, idx) => (
          <div
            key={prod.id}
            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 hover:bg-stone-100/80 transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-black text-stone-400 w-4 text-center">#{idx + 1}</span>
              <img src={prod.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{prod.title}</h4>
                <p className="text-[10px] font-bold text-[#8A1538]">৳ {prod.price}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                {prod.salesCount} টি বিক্রি
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}