'use client';

import React, { useState } from 'react';

type TimeRange = 'today' | '7days' | 'thisMonth' | 'allTime';

export default function SalesRevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  // Sample data points for different time ranges
  const chartDataMap: Record<TimeRange, { label: string; amount: number }[]> = {
    today: [
      { label: '06 AM', amount: 1200 },
      { label: '09 AM', amount: 2500 },
      { label: '12 PM', amount: 4800 },
      { label: '03 PM', amount: 3100 },
      { label: '06 PM', amount: 6400 },
      { label: '09 PM', amount: 5200 },
    ],
    '7days': [
      { label: 'শনিবার', amount: 12500 },
      { label: 'রবিবার', amount: 18400 },
      { label: 'সোমবার', amount: 14200 },
      { label: 'মঙ্গলবার', amount: 22100 },
      { label: 'বুধবার', amount: 19800 },
      { label: 'বৃহস্পতিবার', amount: 28500 },
      { label: 'শুক্রবার', amount: 32000 },
    ],
    thisMonth: [
      { label: 'সপ্তাহ ১', amount: 85000 },
      { label: 'সপ্তাহ ২', amount: 112000 },
      { label: 'সপ্তাহ ৩', amount: 145000 },
      { label: 'সপ্তাহ ৪', amount: 168000 },
    ],
    allTime: [
      { label: 'মে', amount: 240000 },
      { label: 'জুন', amount: 310000 },
      { label: 'জুলাই', amount: 420000 },
      { label: 'আগস্ট', amount: 380000 },
      { label: 'সেপ্টেম্বর', amount: 510000 },
      { label: 'অক্টোবর', amount: 620000 },
    ],
  };

  const currentData = chartDataMap[timeRange];
  const maxAmount = Math.max(...currentData.map((d) => d.amount)) || 1;
  const totalRevenue = currentData.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
      {/* Header & Filter Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>📈</span>
            <span>বিক্রি ও রেভিনিউ এনালিটিক্স (Sales Trend)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট রেভিনিউ: <span className="font-bold text-[#8A1538]">৳ {totalRevenue.toLocaleString('en-BD')}</span>
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl w-fit">
          {[
            { id: 'today', label: 'আজ' },
            { id: '7days', label: 'গত ৭ দিন' },
            { id: 'thisMonth', label: 'এই মাস' },
            { id: 'allTime', label: 'সর্বমোট' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeRange(item.id as TimeRange)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === item.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Bar / Trend Chart */}
      <div className="pt-2">
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-stone-200 pb-2">
          {currentData.map((item, idx) => {
            const heightPercent = Math.round((item.amount / maxAmount) * 100);
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-md">
                  ৳ {item.amount.toLocaleString('en-BD')}
                </div>

                {/* Animated Bar */}
                <div
                  className="w-full max-w-[40px] bg-gradient-to-t from-[#8A1538] to-rose-600 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-2xs"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between gap-2 sm:gap-4 px-2 pt-3">
          {currentData.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 text-center text-[10px] sm:text-xs font-bold text-slate-500 truncate"
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}