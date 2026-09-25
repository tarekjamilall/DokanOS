'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type TenantSettings = {
  brandLogo?: string;
  primaryColor?: string;
  announcementText?: string;
  whatsappNumber?: string;
  metaPixelId?: string;
};

type Props = {
  domain: string;
  storeName: string;
  tenantSettings?: TenantSettings;
  products: any[];
  categories?: any[];
  activeCategory?: string;
};

export default function StorefrontClient({
  domain,
  storeName,
  tenantSettings = {},
  products = [],
  categories = [],
  activeCategory = 'all',
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [shippingZone, setShippingZone] = useState('inside-dhaka');
  const [customerNote, setCustomerNote] = useState('');

  // Coupon & Payment State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [transactionId, setTransactionId] = useState('');

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const primaryColor = tenantSettings.primaryColor || '#4f46e5';

  // Inject Meta Pixel dynamically if configured by Merchant
  useEffect(() => {
    if (tenantSettings.metaPixelId) {
      const pixelId = tenantSettings.metaPixelId;
      if (!window.document.getElementById(`fb-pixel-${pixelId}`)) {
        const script = document.createElement('script');
        script.id = `fb-pixel-${pixelId}`;
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e);
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }
    }
  }, [tenantSettings.metaPixelId]);

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponMessage(null);
    setPaymentMethod('cod');
    setTransactionId('');
    setOrderSuccess(null);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setOrderSuccess(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
      alert('অনুগ্রহ করে পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID) ইনপুট দিন।');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          productId: selectedProduct.id,
          quantity,
          customerName,
          customerPhone,
          deliveryAddress,
          shippingZone,
          customerNote,
          couponCode: appliedCoupon || couponCode,
          paymentMethod,
          transactionId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrderSuccess(data);
      } else {
        alert(data.error || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে');
      }
    } catch (err) {
      alert('নেটওয়ার্ক এরর! অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const shippingCharge = shippingZone === 'inside-dhaka' ? 60 : 120;
  const unitPrice = selectedProduct?.salePrice || selectedProduct?.price || 0;
  const subtotal = unitPrice * quantity;
  const grandTotal = Math.max(0, subtotal + shippingCharge - discountAmount);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium">
        {tenantSettings.announcementText ||
          '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | ঢাকার ভেতরে শিপিং ৳৬০, বাইরে ৳১২০'}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {tenantSettings.brandLogo ? (
              <img
                src={tenantSettings.brandLogo}
                alt={storeName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md"
              >
                {storeName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{storeName}</h1>
              <p className="text-xs text-slate-500 font-mono">{domain}.yourdomain.com</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/track-order"
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition"
            >
              📦 অর্ডার ট্র্যাকিং
            </Link>

            <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {products.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-3 inline-block">
            WooCommerce Powered Storefront
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">{storeName}-এর কালেকশন</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            পছন্দের প্রডাক্ট বেছে নিয়ে দ্রুততম সময়ের মধ্যে ডেলিভারি পেতে সরাসরি অর্ডার করুন।
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-slate-200">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            সব প্রোডাক্ট ({products.length})
          </Link>

          {categories.map((cat: any) => (
            <Link
              key={cat.id || cat.slug}
              href={`/?category=${cat.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.slug
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 my-8">
            <h3 className="text-lg font-bold text-slate-800 mb-1">কোনো প্রোডাক্ট পাওয়া যায়নি!</h3>
            <p className="text-xs text-slate-500">এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যুক্ত করা হয়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod: any) => {
              const isSale = prod.salePrice && prod.salePrice < prod.price;
              const priceDisplay = prod.salePrice ? prod.salePrice : prod.price;
              const originalPrice = prod.salePrice ? prod.price : null;
              const productSlug = prod.slug || `product-${prod.id}`;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <Link href={`/product/${productSlug}`} className="relative aspect-square bg-slate-100 overflow-hidden block">
                    <img
                      src={prod.image || 'https://via.placeholder.com/400x400?text=Product'}
                      alt={prod.title || prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSale && (
                      <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
                        SALE!
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${productSlug}`}>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 hover:text-indigo-600 transition-colors">
                          {prod.title || prod.name}
                        </h4>
                      </Link>
                      <p className="text-[11px] font-medium text-emerald-600 mb-3 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {prod.stockStatus === 'outofstock' ? 'Out of Stock' : 'In Stock'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {originalPrice && (
                          <span className="text-xs text-slate-400 line-through block leading-none">
                            ৳{originalPrice}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-slate-900">
                          ৳{priceDisplay}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenModal(prod)}
                        style={{ backgroundColor: primaryColor }}
                        className="px-4 py-2 hover:opacity-90 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Live Chat Button */}
      {tenantSettings.whatsappNumber && (
        <a
          href={`https://wa.me/${tenantSettings.whatsappNumber}?text=Hello%20${encodeURIComponent(
            storeName
          )},%20I%20have%20a%20query.`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl z-40 flex items-center gap-2 hover:scale-105 transition-all"
          title="WhatsApp-এ মেসেজ দিন"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 2c-5.517 0-9.993 4.476-9.993 9.993 0 1.763.459 3.479 1.332 4.992l-1.417 5.176 5.297-1.389c1.458.796 3.102 1.214 4.781 1.214 5.517 0 9.993-4.476 9.993-9.993s-4.476-9.993-9.993-9.993zm5.836 14.185c-.244.688-1.229 1.325-1.996 1.492-.524.114-1.209.206-3.513-.746-2.946-1.217-4.846-4.22-4.993-4.416-.147-.196-1.198-1.595-1.198-3.042 0-1.448.758-2.159 1.026-2.455.268-.295.586-.369.782-.369.196 0 .392.001.564.01.185.01.433-.07.677.515.245.586.832 2.031.905 2.178.073.147.122.319.024.515-.098.196-.147.319-.294.491-.147.172-.309.385-.441.518-.147.147-.301.307-.129.602.172.295.766 1.265 1.648 2.05 1.135 1.01 2.091 1.322 2.386 1.469.295.147.466.123.638-.073.172-.196.735-.858.931-1.152.196-.295.392-.245.662-.147.27.098 1.716.81 2.01 1.006.294.196.49.295.564.417.073.123.073.712-.171 1.401z" />
          </svg>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Chat</span>
        </a>
      )}

      {/* Express Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">১-ক্লিক এক্সপ্রেস চেকআউট</h3>
                <p className="text-xs text-slate-300">দ্রুত অর্ডার নিশ্চিত করতে নিচের ফর্মটি পূরণ করুন</p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              /* Success Screen */
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ✓
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">
                  আপনার অর্ডারটি সফল হয়েছে!
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  অর্ডার আইডি: <span className="font-mono font-bold text-indigo-600">{orderSuccess.orderNumber}</span>
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1 mb-6">
                  <p><strong>সর্বমোট প্রদেয়:</strong> ৳{orderSuccess.grandTotal}</p>
                  <p><strong>পেমেন্ট মেথড:</strong> {paymentMethod.toUpperCase()}</p>
                  <p className="text-emerald-700 font-medium">
                    আমাদের প্রতিনিধি শীঘ্রই ফোন করে অর্ডারটি কনফার্ম করবেন।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition"
                >
                  ঠিক আছে (Close)
                </button>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handleSubmitOrder} className="p-5 space-y-4">
                {/* Selected Product Summary */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={selectedProduct.image || 'https://via.placeholder.com/100'}
                    alt={selectedProduct.title || selectedProduct.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 truncate">
                      {selectedProduct.title || selectedProduct.name}
                    </h5>
                    <p className="text-xs text-indigo-600 font-extrabold">৳{unitPrice}</p>
                  </div>
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-slate-600 font-bold hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 font-bold hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Details Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="যেমন: 01712345678"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="বাসা/রোড নম্বর, এলাকা, থানা ও জেলা"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ডেলিভারি এলাকা (শিপিং জোন)
                    </label>
                    <select
                      value={shippingZone}
                      onChange={(e) => setShippingZone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="inside-dhaka">ঢাকার ভেতরে (৳৬০)</option>
                      <option value="outside-dhaka">ঢাকার বাইরে (৳১২০)</option>
                    </select>
                  </div>

                  {/* Coupon Code Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ডিসকাউন্ট কুপন কোড (যদি থাকে)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. EID2026"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      পেমেন্ট মেথড সিলেক্ট করুন
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          paymentMethod === 'cod'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        ক্যাশ অন ডেলিভারি (COD)
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          paymentMethod === 'bkash'
                            ? 'bg-pink-600 text-white border-pink-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        bKash
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('nagad')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          paymentMethod === 'nagad'
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Nagad
                      </button>
                    </div>
                  </div>

                  {/* Transaction ID Input if bKash or Nagad is chosen */}
                  {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <p className="font-bold text-slate-800">
                        {paymentMethod === 'bkash' ? 'bKash Merchant/Personal' : 'Nagad Personal'} নম্বর:{' '}
                        <span className="font-mono text-indigo-600 font-black">01712345678</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        টাকা পাঠানোর পর প্রাপ্ত ট্রানজ্যাকশন আইডি (TrxID) নিচে দিন:
                      </p>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 8N7A6D5E9"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>প্রোডাক্ট মোট ({quantity}টি):</span>
                    <span>৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>৳{shippingCharge}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>কুপন ডিসকাউন্ট:</span>
                      <span>-৳{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>সর্বমোট (Grand Total):</span>
                    <span className="text-indigo-600">৳{grandTotal}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-3 text-white font-extrabold text-sm rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার কনফার্ম করুন (৳${grandTotal})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
