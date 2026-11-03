'use client';

import React, { useState, useEffect } from 'react';

type AnalyticsTabProps = {
  domain?: string;
  orders?: any[];
  products?: any[];
};

export default function AnalyticsTab({ domain = '', orders = [], products = [] }: AnalyticsTabProps) {
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'year'>('30d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch Analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/merchant/analytics?domain=${domain}&range=${range}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Analytics Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (domain) {
      fetchAnalytics();
    }
  }, [domain, range]);

  // Local fallback calculations if API isn't loaded yet
  const totalSales = orders.reduce(
    (sum, ord) => sum + (Number(ord.total) || Number(ord.amount) || Number(ord.grandTotal) || 0),
    0
  );
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const successRate = totalOrdersCount > 0 ? Math.round((completedOrders / totalOrdersCount) * 100) : 0;

  const metrics = analyticsData?.metrics || {
    totalGMV: totalSales,
    totalOrdersCount,
    aov: avgOrderValue,
    completedOrders,
    deliverySuccessRate: successRate,
  };

  const topProducts = analyticsData?.topProducts || [];

  return (
    <div className="space-y-6 font-sans text-[#3B3433]">
      {/* Header Bar & Range Filter */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">📈 Sales & Store Conversion Analytics</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              DEEP REPORTING
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Real-time Gross Merchandise Value (GMV), AOV, and Conversion Insights
          </p>
        </div>

        {/* Date Filter Buttons (Step 162) */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold self-start sm:self-auto">
          {[
            { id: 'today', label: 'আজ' },
            { id: '7d', label: 'গত ৭ দিন' },
            { id: '30d', label: 'এই মাস (30d)' },
            { id: 'year', label: 'এই বছর' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id as any)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                range === item.id ? 'bg-[#8A1538] text-white shadow-xs font-black' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Cards (Step 163) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2 relative overflow-hidden">
          <span className="text-stone-400 text-xs font-bold block">💰 মোট বিক্রি (Gross Sales)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#8A1538]">৳{metrics.totalGMV.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold">▲ Live</span>
          </div>
          <p className="text-[10px] text-stone-400 font-mono">নির্বাচিত মেয়াদের মোট অর্ডারের সেলস মূল্য</p>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
          <span className="text-stone-400 text-xs font-bold block">📦 মোট অর্ডার (Total Orders)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">{metrics.totalOrdersCount} টি</span>
            <span className="text-[10px] text-stone-500 font-bold">অর্ডার</span>
          </div>
          <p className="text-[10px] text-stone-400 font-mono">সম্পূর্ণ ও প্রক্রিয়াধীন অর্ডারের সমষ্টি</p>
        </div>

        {/* Card 3: AOV */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
          <span className="text-stone-400 text-xs font-bold block">🎯 গড় অর্ডার মূল্য (AOV)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">৳{metrics.aov.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-stone-400 font-mono">প্রতি অর্ডারে কাস্টমারের গড় খরচ</p>
        </div>

        {/* Card 4: Success Rate */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
          <span className="text-stone-400 text-xs font-bold block">🚚 ডেলিভারি সাফল্য (Success Rate)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{metrics.deliverySuccessRate}%</span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.deliverySuccessRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 5 Best Selling Products (Step 166) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-xs text-stone-900 flex items-center gap-2">
              <span>🏆 সেরা বিক্রি হওয়া প্রোডাক্ট (Top Selling Products)</span>
            </h3>
            <span className="text-[10px] text-stone-400 font-mono">TOP 5 BY REVENUE</span>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs font-bold">
                এখনো কোনো প্রোডাক্টের বিক্রয় ডাটা পাওয়া যায়নি।
              </div>
            ) : (
              topProducts.map((prod: any, idx: number) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                  <div className="flex justify-between items-center text-xs font-extrabold">
                    <span className="text-stone-900 truncate max-w-xs">{idx + 1}. {prod.name}</span>
                    <span className="text-[#8A1538]">৳{prod.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                    <span>বিক্রি হয়েছে: {prod.qty} টি</span>
                    <span>রেভিনিউ শেয়ার</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown (Step 165) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-extrabold text-xs text-stone-900">💳 পেমেন্ট পদ্ধতি ডিস্ট্রিবিউশন</h3>
            <p className="text-[10px] text-stone-400 font-mono">Payment Channel Breakdown</p>
          </div>

          <div className="space-y-3 text-xs font-bold">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
              <span className="flex items-center gap-2">💵 ক্যাশ অন ডেলিভারি (COD)</span>
              <span className="text-stone-900 font-black">৳{(analyticsData?.paymentBreakdown?.COD || totalSales).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
              <span className="flex items-center gap-2">📱 বিকাশ (bKash MFS)</span>
              <span className="text-stone-900 font-black">৳{(analyticsData?.paymentBreakdown?.bKash || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
              <span className="flex items-center gap-2">💳 কার্ড ও অনলাইন পেমেন্ট</span>
              <span className="text-stone-900 font-black">৳{(analyticsData?.paymentBreakdown?.Card || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}