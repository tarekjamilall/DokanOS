'use client';

import React from 'react';

type MerchantHeaderWidgetProps = {
  storeName?: string;
  domain?: string;
  planName?: string;
  storeStatus?: 'live' | 'maintenance';
};

export default function MerchantHeaderWidget({
  storeName = 'আমার অনলাইন স্টোর',
  domain = 'test-4',
  planName = 'Starter Plan',
  storeStatus = 'live',
}: MerchantHeaderWidgetProps) {
  const storeUrl = `https://${domain}.fastecom.app`;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-[#8A1538] rounded-2xl p-6 text-white shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Store Title & Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{storeName}</h1>
            
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
              👑 {planName}
            </span>

            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border backdrop-blur-md flex items-center gap-1 ${
                storeStatus === 'live'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  storeStatus === 'live' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {storeStatus === 'live' ? 'স্টোর লাইভ' : 'মেইনটেন্যান্স মোড'}
            </span>
          </div>

          <p className="text-xs text-stone-300 flex items-center gap-1.5 font-mono">
            <span>🌐</span>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:underline hover:text-white transition flex items-center gap-1"
            >
              <span>{domain}.fastecom.app</span>
              <span className="text-[10px]">↗</span>
            </a>
          </p>
        </div>

        {/* Quick External Store Visit Button */}
        <div className="shrink-0">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl border border-white/15 backdrop-blur-md transition shadow-2xs"
          >
            <span>🛍️</span>
            <span>লাইভ স্টোর ভিজিট করুন</span>
          </a>
        </div>
      </div>
    </div>
  );
}