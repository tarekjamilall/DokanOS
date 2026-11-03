'use client';

import React, { useState, useEffect } from 'react';

type QuickActionToolbarProps = {
  domain?: string;
  onNavigateTab?: (tab: string, sub?: string, subsub?: string) => void;
};

export default function QuickActionToolbar({
  domain = 'test-4',
  onNavigateTab,
}: QuickActionToolbarProps) {
  const [isStoreLive, setIsStoreLive] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  // Live BST Time Clock Generator (Step 67)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = now.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setCurrentTime(`ঢাকা সময়: ${dateStr} • ${timeStr}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 📥 Step 66: CSV Quick Export Handler for Today's Orders
  const handleExportTodayOrdersCSV = () => {
    const csvHeader = 'Order Number,Customer Name,Phone,Grand Total (BDT),Status,Date\n';
    const sampleRows = [
      '#ORD-8821,আরিফুল ইসলাম,01712345678,2450,pending,2026-10-21',
      '#ORD-8820,সুমাইয়া আক্তার,01898765432,1800,processing,2026-10-21',
      '#ORD-8819,কামরুল হাসান,01911223344,3200,delivered,2026-10-21',
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders-manifest-${domain}-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* Left: BST Clock Widget & Store Mode Toggle (Step 63, 67) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="text-xs font-bold text-slate-600 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200 font-mono flex items-center gap-2 w-fit">
          <span>🕒</span>
          <span>{currentTime || 'ঢাকা সময় লোড হচ্ছে...'}</span>
        </div>

        {/* Maintenance Mode Toggle Button (Step 63 & 65) */}
        <button
          type="button"
          onClick={() => {
            setIsStoreLive(!isStoreLive);
            alert(
              !isStoreLive
                ? '🟢 আপনার অনলাইন স্টোরটি এখন লাইভ আছে!'
                : '🔴 আপনার স্টোরটি মেইনটেন্যান্স মোডে নেওয়া হয়েছে।'
            );
          }}
          className={`text-xs font-extrabold px-3.5 py-2 rounded-xl border transition flex items-center gap-2 w-fit ${
            isStoreLive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isStoreLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isStoreLive ? 'স্টোর স্ট্যাটাস: লাইভ' : 'মেইনটেন্যান্স মোড'}</span>
        </button>
      </div>

      {/* Right: Quick Action Buttons & CSV Export (Step 62, 66) */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleExportTodayOrdersCSV}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-2 rounded-xl transition border border-indigo-200 flex items-center gap-1.5"
          title="আজকের সকল অর্ডারের ম্যানিফেস্ট CSV ডাউনলোড করুন"
        >
          <span>📥</span>
          <span>অর্ডার CSV ডাউনলোড</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'products', 'add')}
          className="bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1.5"
        >
          <span>➕</span>
          <span>নতুন প্রোডাক্ট</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'products', 'coupon')}
          className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition border border-stone-300 flex items-center gap-1.5"
        >
          <span>🏷️</span>
          <span>কুপন তৈরি</span>
        </button>

        <a
          href={`https://${domain}.fastecom.app`}
          target="_blank"
          rel="noreferrer"
          className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition border border-stone-300 flex items-center gap-1.5"
        >
          <span>🛍️</span>
          <span>স্টোর প্রিভিউ</span>
        </a>
      </div>

    </div>
  );
}