'use client';

import React from 'react';

type ActionRequiredBannerProps = {
  pendingOrdersCount?: number;
  lowStockProductsCount?: number;
  onNavigateTab?: (tab: string, sub?: string) => void;
};

export default function ActionRequiredBanner({
  pendingOrdersCount = 3,
  lowStockProductsCount = 1,
  onNavigateTab,
}: ActionRequiredBannerProps) {
  if (pendingOrdersCount === 0 && lowStockProductsCount === 0) return null;

  return (
    <div className="space-y-3">
      {/* Urgent Pending Orders Notification */}
      {pendingOrdersCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950">
                জরুরি অ্যাকশন: {pendingOrdersCount}টি নতুন অর্ডার ডেলিভারির জন্য প্রসেসিং বাকি আছে!
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                দ্রুত ডেলিভারি নিশ্চিত করতে কাস্টমারের অর্ডারের তথ্য ও কুরিয়ার নোট আপডেট করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'orders')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shrink-0 shadow-2xs"
          >
            অর্ডার প্রসেস করুন ➔
          </button>
        </div>
      )}

      {/* Low Stock Warning Notification */}
      {lowStockProductsCount > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              ⚠️
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-rose-950">
                স্টক সতর্কতা: {lowStockProductsCount}টি প্রোডাক্টের স্টক প্রায় শেষ (Out of Stock)!
              </h4>
              <p className="text-[11px] text-rose-800 mt-0.5">
                স্টোর সেলস চালু রাখতে প্রোডাক্টের ইনভেন্টরি স্টক বৃদ্ধি করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'products')}
            className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shrink-0 shadow-2xs"
          >
            স্টক আপডেট করুন ➔
          </button>
        </div>
      )}
    </div>
  );
}