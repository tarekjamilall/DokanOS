'use client';

import React, { useState } from 'react';

type WhatsAppSupportWidgetProps = {
  domain?: string;
  supportNumber?: string; // e.g. "8801700000000"
};

export default function WhatsAppSupportWidget({
  domain = 'test-4',
  supportNumber = '8801711223344',
}: WhatsAppSupportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage = `হ্যালো প্ল্যাটফর্ম সাপোর্ট টিম, আমার স্টোর ডোমেইন: ${domain}.fastecom.app। আমার একটি সহায়তা প্রয়োজন।`;
  const whatsappUrl = `https://wa.me/${supportNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
      {/* Floating Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white transition group hover:scale-105"
        >
          <span className="text-base">💬</span>
          <span>হোয়াটসঅ্যাপ সাপোর্ট</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>
      ) : (
        /* Support Popup Box */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-80 overflow-hidden space-y-0">
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💬</span>
              <div>
                <h4 className="text-xs font-extrabold">প্লাটফর্ম হেল্পডেস্ক (WhatsApp)</h4>
                <p className="text-[10px] text-emerald-100">ইনস্ট্যান্ট সাপোর্ট টিম</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-emerald-200 font-black text-sm"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3 bg-stone-50/50">
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              আপনার স্টোর সেটআপ, পেমেন্ট বা যেকোনো টেকনিক্যাল সমস্যায় আমাদের সাথে সরাসরি কথা বলুন।
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>💬</span>
              <span>হোয়াটসঅ্যাপে মেসেজ পাঠান</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}