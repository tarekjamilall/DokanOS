'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  PackageCheck,
  Printer,
  Truck,
  PhoneCall,
  MapPin,
  CreditCard,
  ShoppingBag,
  Clock,
} from 'lucide-react';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // হাইড্রেশন এরর এড়াতে লোকাল স্টেট
  const [orderId, setOrderId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const customerName = searchParams.get('name') || 'মোঃ রহীম শেখ';
  const mobileNumber = searchParams.get('phone') || '01712345678';
  const address = searchParams.get('address') || 'বাসা ১২, রোড ৩, ব্লক বি, মিরপুর ১০, ঢাকা';
  const deliveryArea = searchParams.get('deliveryArea') || 'inside';
  const paymentMethod = searchParams.get('payment') || 'cod';
  const totalAmount = Number(searchParams.get('total')) || 1220;

  const deliveryCharge = deliveryArea === 'inside' ? 70 : 130;
  const subtotal = totalAmount - deliveryCharge;

  // 🔄 ক্লায়েন্ট-সাইডে অর্ডারের আইডি ও তারিখ সেট করার লজিক
  useEffect(() => {
    const paramOrderId = searchParams.get('orderId');
    if (paramOrderId) {
      setOrderId(paramOrderId);
    } else {
      setOrderId(`DKN-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    setCurrentDate(new Date().toLocaleDateString('bn-BD'));
  }, [searchParams]);

  // টাকা ফরম্যাটিং
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

  // মেমো/ইনভয়েস প্রিন্ট করার ফাংশন
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 🖨️ প্রিন্ট হেডার */}
        <div className="hidden print:block text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-black text-stone-900">ই-কমার্স শপ ডেমো</h1>
          <p className="text-xs text-stone-500">অর্ডার ইনভয়েস / কাস্টমার কপি</p>
        </div>

        {/* 🎉 সাকসেস মেসেজ ও আইকন */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 text-center space-y-3 shadow-2xs print:border-none print:shadow-none">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto print:hidden">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900">
            অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            ধন্যবাদ <span className="font-bold text-stone-900">{customerName}</span>, আপনার অর্ডারটি আমাদের সিস্টেমে সফলভাবে জমা পড়েছে। খুব শীঘ্রই আমাদের কল সেন্টার থেকে ফোন করে অর্ডারটি কনফার্ম করা হবে।
          </p>
          
          {/* ট্র্যাকিং আইডি ব্যাজ */}
          {orderId && (
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-[#8A1538] px-4 py-1.5 rounded-full text-xs font-black">
              <span>অর্ডার আইডি: #{orderId}</span>
            </div>
          )}
        </div>

        {/* 📋 অর্ডারের বিস্তারিত তথ্য ও মেমো (Printable Box) */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-2xs space-y-6 print:border-stone-300">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-[#8A1538]" />
              <span>অর্ডারের বিবরণী (Order Summary)</span>
            </h2>
            <span className="text-[11px] font-bold text-stone-400">
              তারিখ: {currentDate || '...' }
            </span>
          </div>

          {/* কাস্টমার ও ডেলিভারি মেটা ডাটা */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200/60 print:bg-stone-50">
            <div className="space-y-1.5">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block">
                গ্রাহকের তথ্য:
              </span>
              <p className="font-bold text-stone-900">{customerName}</p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
                <span>{mobileNumber}</span>
              </p>
              <p className="text-stone-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
            </div>

            <div className="space-y-1.5 sm:border-l sm:border-stone-200/80 sm:pl-4">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-[10px] block">
                ডেলিভারি ও পেমেন্ট:
              </span>
              <p className="text-stone-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-stone-400" />
                <span>এরিয়া: {deliveryArea === 'inside' ? 'ঢাকার ভেতরে (২৪-৪৮ ঘণ্টা)' : 'ঢাকার বাইরে (২-৩ দিন)'}</span>
              </p>
              <p className="text-stone-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                <span>পেমেন্ট: {paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'বিকাশ / নগদ (Send Money)'}</span>
              </p>
              <p className="text-stone-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>স্ট্যাটাস: <span className="font-extrabold text-amber-600">Pending Confirmation</span></span>
              </p>
            </div>
          </div>

          {/* আইটেম টেবিল/লিস্ট */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-stone-800">অর্ডারকৃত পণ্য:</h3>
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between bg-stone-100 px-4 py-2 text-[11px] font-extrabold text-stone-700">
                <span>পণ্য বিবরণী</span>
                <span>মোট</span>
              </div>

              <div className="p-4 flex items-center justify-between text-xs border-b border-stone-100">
                <div className="space-y-0.5">
                  <p className="font-bold text-stone-900">প্রিমিয়াম কটন ক্যাজুয়াল শার্ট ফর ম্যান</p>
                  <p className="text-[11px] text-stone-500">কালার: Navy Blue • সাইজ: L • পরিমাণ: ১টি</p>
                </div>
                <span className="font-bold text-stone-900">৳ {formatAmount(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* ফাইনাল বিল ব্রেকডাউন */}
          <div className="space-y-2 text-xs font-semibold text-stone-600 max-w-xs ml-auto pt-2">
            <div className="flex justify-between">
              <span>সাবটোটাল:</span>
              <span className="font-bold text-stone-900">৳ {formatAmount(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-stone-900">৳ {formatAmount(deliveryCharge)}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline text-sm font-extrabold text-stone-900">
              <span>সর্বমোট মূল্য:</span>
              <span className="text-lg font-black text-[#8A1538]">
                ৳ {formatAmount(totalAmount)}
              </span>
            </div>
          </div>

        </div>

        {/* 🚀 একশন বাটনসমূহ */}
        <div className="flex flex-col sm:flex-row items-center gap-3 print:hidden">
          <button
            onClick={handlePrintInvoice}
            className="w-full sm:w-auto flex-1 h-11 bg-white border border-stone-200 text-stone-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-stone-100 transition-all active:scale-98"
          >
            <Printer className="w-4 h-4 text-[#8A1538]" />
            <span>মেমো প্রিন্ট করুন</span>
          </button>

          <Link
            href={`/track-order?id=${orderId}`}
            className="w-full sm:w-auto flex-1 h-11 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Truck className="w-4 h-4" />
            <span>অর্ডার ট্র্যাক করুন</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto flex-1 h-11 bg-[#8A1538] hover:bg-[#6e102c] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-rose-900/10 transition-all active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>আরও কেনাকাটা করুন</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ThankYouView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-stone-500">মেমো জেনারেট হচ্ছে...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
