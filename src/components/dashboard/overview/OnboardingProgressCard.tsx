'use client';

import React from 'react';

type OnboardingProgressCardProps = {
  hasLogo?: boolean;
  hasProduct?: boolean;
  hasPaymentGateway?: boolean;
  hasFirstOrder?: boolean;
  onNavigateTab?: (tab: string) => void;
};

export default function OnboardingProgressCard({
  hasLogo = true,
  hasProduct = false,
  hasPaymentGateway = true,
  hasFirstOrder = false,
  onNavigateTab,
}: OnboardingProgressCardProps) {
  // Calculate completed steps dynamically
  const steps = [
    {
      id: 'theme',
      title: 'স্টোর লোগো ও থিম কালার সেটিং',
      completed: hasLogo,
      targetTab: 'siteBuilder',
      desc: 'আপনার স্টোরের লোগো এবং ব্র্যান্ডিং কালার দিন',
    },
    {
      id: 'product',
      title: 'প্রথম প্রোডাক্ট যুক্ত করুন',
      completed: hasProduct,
      targetTab: 'products',
      desc: 'কমপক্ষে ১টি সিম্পল বা ভ্যারিয়েবল প্রোডাক্ট আপলোড করুন',
    },
    {
      id: 'payment',
      title: 'পেমেন্ট গেটওয়ে (বিকাশ/নগদ/COD) কনফিগার করুন',
      completed: hasPaymentGateway,
      targetTab: 'settings',
      desc: 'কাস্টমারদের কাছ থেকে পেমেন্ট নেওয়ার মাধ্যম চালু করুন',
    },
    {
      id: 'order',
      title: 'প্রথম টেস্ট অর্ডার দিন',
      completed: hasFirstOrder,
      targetTab: 'orders',
      desc: 'আপনার কাস্টমার সাইট থেকে ১টি টেস্ট অর্ডার দিয়ে চেক করুন',
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (progressPercent === 100) return null; // Hide card when 100% complete

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-5">
      {/* Header & Percentage Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>🚀</span>
            <span>স্টোর অনবোর্ডিং চেকলিস্ট ({completedCount}/৪ টি ধাপ সম্পন্ন)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            আপনার অনলাইন স্টোরটি কাস্টমারদের জন্য সম্পূর্ণ প্রস্তুত করতে নিচের ধাপগুলো সম্পন্ন করুন।
          </p>
        </div>

        <span className="text-xs font-extrabold text-[#8A1538] bg-rose-50 px-3 py-1 rounded-xl border border-rose-100 self-start sm:self-auto">
          {progressPercent}% সম্পন্ন
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-[#8A1538] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => onNavigateTab && onNavigateTab(step.targetTab)}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
              step.completed
                ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                : 'bg-stone-50 border-stone-200 hover:border-[#8A1538] hover:bg-rose-50/20'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                step.completed
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {step.completed ? '✓' : idx + 1}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <h4
                className={`text-xs font-bold ${
                  step.completed ? 'text-emerald-900 line-through' : 'text-slate-900'
                }`}
              >
                {step.title}
              </h4>
              <p className="text-[11px] text-slate-500">{step.desc}</p>
            </div>

            {!step.completed && (
              <span className="text-[10px] font-extrabold text-[#8A1538] bg-white px-2 py-1 rounded-lg border border-stone-200 shrink-0">
                সেটআপ করুন ➔
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}