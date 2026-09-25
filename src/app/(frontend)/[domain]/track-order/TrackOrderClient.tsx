'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Props = {
  domain: string;
  storeName: string;
  brandLogo?: string;
  primaryColor?: string;
  whatsappNumber?: string;
};

export default function TrackOrderClient({
  domain,
  storeName,
  brandLogo,
  primaryColor = '#4f46e5',
  whatsappNumber = '',
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setOrders(null);

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, searchQuery }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders);
      } else {
        setErrorMessage(data.error || 'অর্ডার পাওয়া যায়নি');
      }
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক এরর! অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
      case 'on-hold':
        return 2;
      case 'completed':
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {brandLogo ? (
              <img src={brandLogo} alt={storeName} className="h-9 w-auto object-contain" />
            ) : (
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg shadow"
              >
                {storeName.charAt(0)}
              </div>
            )}
            <span className="font-extrabold text-slate-900 text-base">{storeName}</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            ← কেনাকাটায় ফিরুন
          </Link>
        </div>
      </header>

      {/* Main Track Section */}
      <main className="max-w-3xl mx-auto px-4 pt-10 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-full inline-block mb-3 border border-indigo-100">
            📦 লাইভ অর্ডার ট্র্যাকিং
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            আপনার অর্ডারের বর্তমান স্ট্যাটাস জানুন
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            অর্ডার করার সময় ব্যবহৃত মোবাইল নম্বর অথবা অর্ডার নম্বর (যেমন: ORD-123456) ইনপুট দিন।
          </p>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মোবাইল নম্বর বা অর্ডার নাম্বার (e.g. 01712345678)"
              className="flex-1 px-4 py-3 text-xs border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
              className="px-6 py-3 text-white text-xs font-extrabold rounded-2xl shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              {loading ? 'খোঁজা হচ্ছে...' : 'অর্ডার ট্র্যাক করুন'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-center text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Search Results */}
        {orders && orders.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 px-1">
              খুঁজে পাওয়া অর্ডার ({orders.length}টি):
            </h3>

            {orders.map((ord, index) => {
              const currentStep = getStatusStep(ord.orderStatus);

              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <span className="font-mono font-black text-indigo-600 text-base">
                        #{ord.orderNumber}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        অর্ডারের তারিখ: {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-500 block">সর্বমোট প্রদেয়:</span>
                      <span className="text-lg font-black text-slate-900">৳{ord.grandTotal}</span>
                    </div>
                  </div>

                  {/* Visual Status Progress Steps */}
                  <div className="py-2">
                    <div className="relative flex items-center justify-between max-w-md mx-auto">
                      {/* Progress Line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0"></div>
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 z-0"
                        style={{
                          width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                        }}
                      ></div>

                      {/* Step 1 */}
                      <div className="relative z-10 text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1 ${
                            currentStep >= 1
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          1
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 block">অর্ডার গৃহীিহ</span>
                      </div>

                      {/* Step 2 */}
                      <div className="relative z-10 text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1 ${
                            currentStep >= 2
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          2
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 block">প্রসেসিং / কুরিয়ার</span>
                      </div>

                      {/* Step 3 */}
                      <div className="relative z-10 text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1 ${
                            currentStep >= 3
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          3
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 block">ডেলিভারি সম্পন্ন</span>
                      </div>
                    </div>
                  </div>

                  {/* Courier CID Tracking Box */}
                  {ord.trackingCode && (
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-indigo-900">কুরিয়ার ট্র্যাকিং কোড (CID):</p>
                        <p className="font-mono font-black text-indigo-700 text-sm">{ord.trackingCode}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-xl text-[11px]">
                        {ord.courierName ? ord.courierName.toUpperCase() : 'COURIER'}
                      </span>
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <p><strong>প্রাপক:</strong> {ord.customerName} ({ord.customerPhone})</p>
                    <p><strong>ডেলিভারি ঠিকানা:</strong> {ord.deliveryAddress}</p>
                    <p><strong>পেমেন্ট মেথড:</strong> {ord.paymentMethod.toUpperCase()} (ক্যাশ অন ডেলিভারি)</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
