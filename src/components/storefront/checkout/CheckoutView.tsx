'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CreditCard,
  Check,
  AlertCircle,
} from 'lucide-react';

export type ShippingZone = {
  id: string;
  name: string;
  charge: number;
  deliveryTime?: string;
};

const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: 'inside-dhaka',
    name: 'ঢাকার ভেতরে (Inside Dhaka)',
    charge: 60,
    deliveryTime: '২৪ - ৪৮ ঘণ্টা',
  },
  {
    id: 'suburbs',
    name: 'ঢাকার সাব-আর্বান / সাভার-গাজীপুর',
    charge: 100,
    deliveryTime: '২ - ৩ দিন',
  },
  {
    id: 'outside-dhaka',
    name: 'ঢাকার বাইরে সারা বাংলাদেশ (Outside Dhaka)',
    charge: 130,
    deliveryTime: '৩ - ৫ দিন',
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Parameters
  const productId = searchParams.get('product') || '';
  const qty = Number(searchParams.get('qty')) || 1;
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';

  // Loaded Product & Shipping Zones State
  const [productData, setProductData] = useState<any | null>(null);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(DEFAULT_SHIPPING_ZONES);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(true);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // 🚫 NO SHIPPING OPTION AUTO-SELECTED BY DEFAULT
  const [selectedShippingZone, setSelectedShippingZone] = useState<ShippingZone | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [trxId, setTrxId] = useState('');
  
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Fetch product data from API
  useEffect(() => {
    if (!productId) {
      setLoadingProduct(false);
      return;
    }

    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setProductData(data);
        }
      } catch (err) {
        console.error('Failed to load product details for checkout:', err);
      } finally {
        if (isMounted) setLoadingProduct(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Derived price & calculations
  const unitPrice = productData?.salePrice || productData?.price || 1150;
  const productTitle = productData?.title || productData?.name || 'প্রিমিয়াম প্রোডাক্ট';
  const productImage =
    Array.isArray(productData?.images) && productData.images.length > 0
      ? typeof productData.images[0] === 'string'
        ? productData.images[0]
        : productData.images[0]?.url
      : productData?.featuredImage || productData?.image || '/placeholder-product.png';

  const subtotal = unitPrice * qty;
  const shippingCharge = selectedShippingZone ? selectedShippingZone.charge : 0;
  const grandTotal = Math.max(0, subtotal + shippingCharge - discountAmount);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !mobileNumber.trim() || !address.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।');
      return;
    }

    // ⚠️ MANDATORY SHIPPING ZONE SELECTION CHECK
    if (!selectedShippingZone) {
      setErrorMessage('⚠️ অনুগ্রহ করে আপনার ডেলিভারি এলাকা (শিপিং জোন) সিলেক্ট করুন।');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !trxId.trim()) {
      setErrorMessage('অনুগ্রহ করে পেমেন্টের Transaction ID (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const host = window.location.hostname;
      const domain = host.split('.')[0] || 'store';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          productId: productId || productData?.id || 'prod-default',
          quantity: qty,
          customerName,
          customerPhone: mobileNumber,
          deliveryAddress: address,
          shippingZone: selectedShippingZone.id,
          shippingCharge: selectedShippingZone.charge,
          paymentMethod,
          transactionId: trxId,
          couponCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCompletedOrder(data);
      } else {
        setErrorMessage(data.error || 'অর্ডার করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক সমস্যা! অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Complete View
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h2 className="text-xl font-black text-stone-900">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            ধন্যবাদ <span className="font-bold text-stone-900">{customerName}</span>, খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার নম্বরে (<span className="font-bold">{mobileNumber}</span>) কল করে অর্ডার কনফার্ম করবেন।
          </p>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">অর্ডার নম্বর:</span>
              <span className="font-extrabold text-[#8A1538] font-mono">#{completedOrder.orderNumber || 'ORD-982134'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">মোট টাকা:</span>
              <span className="font-extrabold text-stone-900">৳ {formatAmount(completedOrder.grandTotal || grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ডেলিভারি এরিয়া:</span>
              <span className="font-bold text-stone-800">{selectedShippingZone?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">পেমেন্ট মেথড:</span>
              <span className="font-bold text-stone-800 uppercase">{paymentMethod}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full h-11 bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-black rounded-xl transition-all shadow-md"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#8A1538] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পেছনে যান</span>
        </button>

        <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
          <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8A1538]" />
            <span>১-ক্লিক এক্সপ্রেস চেকআউট</span>
          </h1>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>১০০% নিরাপদ চেকআউট</span>
          </span>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-rose-700 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 📋 Checkout Grid */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 📝 Left Side: Form Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Customer Details */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <User className="w-4 h-4 text-[#8A1538]" />
                <span>আপনার শিপিং তথ্য প্রদান করুন</span>
              </h2>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  আপনার নাম <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="উদাহরণ: মোঃ রফিকুল ইসলাম"
                    className="w-full h-11 pl-10 pr-3 text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] outline-none transition-all"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  মোবাইল নম্বর (COD কনফার্মেশনের জন্য) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full h-11 pl-10 pr-3 text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] outline-none transition-all"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  সম্পূর্ণ ঠিকানা (বাসা/রোড, এলাকা, জেলা) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="উদাহরণ: বাসা ১২, রোড ৪, সেক্টর ৭, উত্তরা, ঢাকা"
                    className="w-full p-3 pl-10 text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] outline-none transition-all resize-none"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* 🚚 DYNAMIC SHIPPING ZONE SELECTION (NONE AUTO-SELECTED) */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-stone-900 block">
                    ডেলিভারি এলাকা সিলেক্ট করুন <span className="text-rose-600">*</span>
                  </label>
                  {!selectedShippingZone && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      ⚠️ একটি এলাকা বেছে নিন
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {shippingZones.map((zone) => {
                    const isSelected = selectedShippingZone?.id === zone.id;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => {
                          setSelectedShippingZone(zone);
                          setErrorMessage(null);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#8A1538] bg-rose-50/70 ring-2 ring-[#8A1538]/20 shadow-xs'
                            : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#8A1538] bg-[#8A1538]' : 'border-stone-400 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">{zone.name}</span>
                            {zone.deliveryTime && (
                              <span className="text-[10px] text-stone-500">সময়: {zone.deliveryTime}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-black text-[#8A1538]">
                          ৳ {zone.charge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 💳 Payment Methods */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <CreditCard className="w-4 h-4 text-[#8A1538]" />
                <span>পেমেন্ট পদ্ধতি</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-[#8A1538] bg-rose-50/70 ring-1 ring-[#8A1538]'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold text-stone-900">ক্যাশ অন ডেলিভারি</span>
                  <span className="text-[10px] text-stone-500 mt-1">COD</span>
                </button>

                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-600 bg-pink-50/70 ring-1 ring-pink-600'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold text-pink-700">bKash (Send Money)</span>
                  <span className="text-[10px] text-pink-600 font-extrabold mt-1">বিকাশ</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-600 bg-orange-50/70 ring-1 ring-orange-600'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold text-orange-700">Nagad (Send Money)</span>
                  <span className="text-[10px] text-orange-600 font-extrabold mt-1">নগদ</span>
                </button>
              </div>

              {/* TrxID Input for bKash / Nagad */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-in fade-in">
                  <p className="text-xs text-stone-700">
                    আমাদের {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল নম্বরে (<strong>01712345678</strong>) ৳ <strong>{formatAmount(grandTotal)}</strong> সেন্ড মানি করে প্রাপ্ত TrxID দিন:
                  </p>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="TrxID (e.g. 9J87K2L)"
                    className="w-full h-10 px-3 text-xs font-bold bg-white border border-stone-300 rounded-xl outline-none focus:border-[#8A1538] font-mono"
                  />
                </div>
              )}
            </div>

          </div>

          {/* 🛍️ Right Side: Order Summary & Confirm Button (5 Cols) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
            
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-sm font-extrabold text-stone-900 border-b border-stone-100 pb-3">
                অর্ডার বিবরণী (Order Summary)
              </h2>

              {/* Product item summary card */}
              <div className="flex gap-3 pb-3 border-b border-stone-100">
                <img
                  src={productImage}
                  alt={productTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-200/80 shrink-0 bg-stone-100"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs font-bold text-stone-900 line-clamp-2">
                    {productTitle}
                  </h3>
                  {(size || color) && (
                    <div className="text-[11px] font-semibold text-stone-500 flex items-center gap-2">
                      {color && <span>কালার: {color}</span>}
                      {color && size && <span>•</span>}
                      {size && <span>সাইজ: {size}</span>}
                    </div>
                  )}
                  <div className="text-xs font-black text-[#8A1538]">
                    ৳ {formatAmount(unitPrice)} × {qty}টি
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs font-semibold text-stone-600">
                <div className="flex justify-between">
                  <span>পণ্য মূল্য (Subtotal):</span>
                  <span className="font-bold text-stone-900">৳ {formatAmount(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>ডেলিভারি চার্জ:</span>
                  {selectedShippingZone ? (
                    <span className="font-bold text-stone-900">৳ {formatAmount(shippingCharge)}</span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                      সিলেক্ট করা হয়নি
                    </span>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-2.5 flex justify-between items-baseline text-sm font-extrabold text-stone-900">
                  <span>সর্বমোট (Payable):</span>
                  <span className="text-xl font-black text-[#8A1538]">
                    ৳ {formatAmount(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-rose-900/10 transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>অর্ডার প্রসেস হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>অর্ডার কনফার্ম করুন (৳ {formatAmount(grandTotal)})</span>
                  </>
                )}
              </button>

              {!selectedShippingZone && (
                <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 text-center font-bold">
                  ⚠️ অর্ডার কনফার্ম করতে উপরে ডেলিভারি এলাকা সিলেক্ট করুন।
                </p>
              )}
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}

export default function CheckoutView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-stone-500">চেকআউট পেজ লোড হচ্ছে...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
