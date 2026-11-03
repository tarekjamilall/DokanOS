'use client';

import React from 'react';

type HealthKpiGridProps = {
  todaySales?: number;
  yesterdaySales?: number;
  pendingOrdersCount?: number;
  totalCustomersCount?: number;
  totalProductsCount?: number;
  onNavigateTab?: (tab: string, sub?: string) => void;
};

export default function HealthKpiGrid({
  todaySales = 12450,
  yesterdaySales = 9800,
  pendingOrdersCount = 3,
  totalCustomersCount = 142,
  totalProductsCount = 18,
  onNavigateTab,
}: HealthKpiGridProps) {
  // Calculate percentage sales change vs yesterday
  const salesDiff = todaySales - yesterdaySales;
  const salesPercentChange =
    yesterdaySales > 0 ? Math.round((salesDiff / yesterdaySales) * 100) : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Today's Sales Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8A1538] transition">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">আজকের মোট বিক্রি</span>
          <div className="w-9 h-9 bg-rose-50 text-[#8A1538] rounded-xl flex items-center justify-center text-base font-black">
            ৳
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            ৳ {todaySales.toLocaleString('en-BD')}
          </h3>
          
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span
              className={`px-1.5 py-0.5 rounded-md ${
                salesPercentChange >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {salesPercentChange >= 0 ? `▲ +${salesPercentChange}%` : `▼ ${salesPercentChange}%`}
            </span>
            <span className="text-slate-400 font-medium">গতকাল: ৳{yesterdaySales.toLocaleString('en-BD')}</span>
          </div>
        </div>
      </div>

      {/* 2. Pending Orders Card */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'orders')}
        className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8A1538] transition cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">নতুন/পেন্ডিং অর্ডার</span>
          <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center text-base font-black">
            📦
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {pendingOrdersCount} টি
            </h3>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                প্রসেসিং বাকি
              </span>
            )}
          </div>
          
          <p className="text-[11px] font-bold text-[#8A1538] hover:underline flex items-center gap-1">
            <span>অর্ডার তালিকা দেখুন</span>
            <span>➔</span>
          </p>
        </div>
      </div>

      {/* 3. Total Customers Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8A1538] transition">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">মোট কাস্টমার</span>
          <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center text-base font-black">
            👥
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {totalCustomersCount} জন
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">ইউনিক ফোন নম্বর ডাটাবেস</p>
        </div>
      </div>

      {/* 4. Total Products Card */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'products')}
        className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative overflow-hidden group hover:border-[#8A1538] transition cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">স্টোরের মোট প্রোডাক্ট</span>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center text-base font-black">
            🏷️
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {totalProductsCount} টি
          </h3>
          <p className="text-[11px] font-bold text-[#8A1538] hover:underline flex items-center gap-1">
            <span>প্রোডাক্ট ম্যানেজ করুন</span>
            <span>➔</span>
          </p>
        </div>
      </div>

    </div>
  );
}