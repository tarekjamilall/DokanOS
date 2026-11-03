'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const primaryColor = tenantSettings.primaryColor || '#8A1538';

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

  // 🚀 ডাইরেক্ট চেকআউট রিডাইরেক্ট (পপ-আপ ছাড়া)
  const handleBuyNow = (productId: string) => {
    router.push(`/checkout?product=${productId}&qty=1`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium">
        {tenantSettings.announcementText ||
          '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি'}
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
              <p className="text-xs text-slate-500 font-mono">{domain}.localhost:3000</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/track-order"
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition"
            >
              📦 অর্ডার ট্র্যাকিং
            </Link>

            <div className="relative p-2 rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-700"
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
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
            Official Online Store
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">{storeName}-এর ক্যাটালগ</h2>
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
              const inStock =
                prod.stockStatus === 'in_stock' ||
                prod.stockStatus === 'instock' ||
                (prod.stockQuantity ?? 1) > 0;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* 🔗 সঠিক প্রোডাক্ট স্লাগ ইউআরএল: /\${productSlug} */}
                  <Link href={`/${productSlug}`} className="relative aspect-square bg-slate-100 overflow-hidden block">
                    <img
                      src={
                        Array.isArray(prod.images) && prod.images.length > 0
                          ? typeof prod.images[0] === 'string'
                            ? prod.images[0]
                            : prod.images[0].url
                          : prod.featuredImage || prod.image || '/placeholder-product.png'
                      }
                      alt={prod.title || prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSale && inStock && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
                        SALE!
                      </span>
                    )}
                    {!inStock && (
                      <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                        <span className="bg-white text-gray-900 text-xs font-black px-3 py-1 rounded-full uppercase">
                          স্টক আউট
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* 🔗 সঠিক প্রোডাক্ট স্লাগ ইউআরএল: /\${productSlug} */}
                      <Link href={`/${productSlug}`}>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2 mb-2 hover:text-[#8A1538] transition-colors">
                          {prod.title || prod.name}
                        </h4>
                      </Link>
                      <p className={`text-[11px] font-medium mb-3 flex items-center gap-1 ${inStock ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {inStock ? 'স্টকে আছে (In Stock)' : 'স্টক আউট (Out of Stock)'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        {originalPrice && (
                          <span className="text-xs text-slate-400 line-through block leading-none">
                            ৳{originalPrice}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-[#8A1538]">
                          ৳{priceDisplay}
                        </span>
                      </div>

                      {/* 🛍️ ডাইরেক্ট বাই নাউ বাটন */}
                      <button
                        type="button"
                        disabled={!inStock}
                        onClick={() => handleBuyNow(prod.id)}
                        style={{ backgroundColor: primaryColor }}
                        className="px-4 py-2 hover:opacity-90 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        এখনই কিনুন
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
    </div>
  );
}
