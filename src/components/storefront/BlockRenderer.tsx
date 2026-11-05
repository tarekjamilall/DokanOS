'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SectionBlock = {
  id: string;
  type: string;
  title?: string;
  enabled: boolean;
  settings?: any;
};

type BlockRendererProps = {
  blocks?: SectionBlock[];
  domain: string;
  storeName?: string;
  products?: any[];
  categories?: any[];
  activeCategory?: string;
  primaryColor?: string;
};

export default function BlockRenderer({
  blocks = [],
  domain,
  storeName = 'DokanStore',
  products = [],
  categories = [],
  activeCategory = 'all',
  primaryColor = '#8A1538',
}: BlockRendererProps) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // শুধু অন (Enabled) থাকা ব্লকগুলোই রেন্ডার হবে
  const activeBlocks = blocks.filter((b) => b.enabled);

  const handleBuyNow = (productId: string) => {
    router.push(`/checkout?product=${productId}&qty=1`);
  };

  if (!activeBlocks || activeBlocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {activeBlocks.map((block) => {
        switch (block.type) {
          
          /* -------------------------------------------------------------
           * 1. HERO BANNER BLOCK
           * ------------------------------------------------------------- */
          case 'hero-banner':
            return (
              <section key={block.id} className="w-full">
                <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-stone-800">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3.5 py-1.5 rounded-full font-bold">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                        <span>প্ৰিমিয়াম এক্সক্লুসিভ কালেকশন ২০২৬</span>
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                        {storeName} — <span style={{ color: primaryColor }}>সেরা দামে ১০০% অরিজিনাল</span> পণ্য
                      </h1>
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg">
                        সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধায় দ্রুততম সময়ে আপনার পছন্দের পণ্য বুঝে নিন।
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                        <a
                          href="#products"
                          style={{ backgroundColor: primaryColor }}
                          className="px-6 py-3 rounded-xl font-extrabold text-xs text-white shadow-lg transition hover:opacity-90"
                        >
                          🛍️ কালেকশন দেখুন
                        </a>
                        <div className="text-xs text-stone-400 font-bold flex items-center gap-2">
                          <span>✅ ক্যাশ অন ডেলিভারি</span>
                          <span>•</span>
                          <span>⚡ দ্রুত ডেলিভারি</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex justify-center">
                      <div className="w-full max-w-xs bg-stone-900/90 p-3 rounded-2xl border border-stone-800 shadow-2xl">
                        <div className="h-56 rounded-xl bg-stone-800 overflow-hidden relative">
                          <img
                            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                            alt="Hero Feature"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );

          /* -------------------------------------------------------------
           * 2. CATEGORY SHOWCASE BLOCK
           * ------------------------------------------------------------- */
          case 'category-showcase':
            return (
              <section key={block.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
                    📂 ক্যাটাগরি অনুযায়ী প্রডাক্ট খুঁজুন
                  </h2>
                </div>

                {categories.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Link
                      href={`/${domain}`}
                      className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                        activeCategory === 'all'
                          ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <span className="text-xl">✨</span>
                      <span className="text-xs font-bold">সব ক্যাটাগরি</span>
                    </Link>

                    {categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/${domain}?category=${cat.slug}`}
                        className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                          activeCategory === cat.slug
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <span className="text-xl">🏷️</span>
                        <span className="text-xs font-bold line-clamp-1">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </section>
            );

          /* -------------------------------------------------------------
           * 3. PRODUCT DISPLAY GRID BLOCK
           * ------------------------------------------------------------- */
          case 'product-grid':
            return (
              <section key={block.id} id="products" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
                    🛍️ আমাদের প্রডাক্ট কালেকশন ({products.length})
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                    <span className="text-3xl">📦</span>
                    <p className="text-xs font-bold text-stone-600">কোনো প্রডাক্ট পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between p-3 space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="h-44 rounded-xl bg-stone-100 overflow-hidden relative border border-stone-100">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={
                                  typeof product.images[0].image === 'string'
                                    ? product.images[0].image
                                    : product.images[0].image?.url
                                }
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 font-mono text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <h3 className="text-xs font-bold text-stone-900 line-clamp-2">
                            {product.title}
                          </h3>
                          <div className="flex items-baseline gap-2">
                            <span style={{ color: primaryColor }} className="text-sm font-black">
                              ৳ {product.price}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-[10px] text-stone-400 line-through font-mono">
                                ৳ {product.compareAtPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBuyNow(product.id)}
                          style={{ backgroundColor: primaryColor }}
                          className="w-full py-2.5 text-white font-extrabold text-xs rounded-xl shadow-2xs transition hover:opacity-90 cursor-pointer"
                        >
                          অর্ডার করুন
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );

          /* -------------------------------------------------------------
           * 4. PAS (PROBLEM-AGITATION-SOLUTION) CONVERSION BLOCK
           * ------------------------------------------------------------- */
          case 'pas-block':
            return (
              <section key={block.id} className="bg-rose-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-900 shadow-xl">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full font-bold">
                    কেন আমাদের থেকে অর্ডার করবেন?
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    নকল প্রডাক্টের বাজারে আসল ও খাঁটি কোয়ালিটির নিশ্চয়তা!
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-rose-400 font-bold block">❌ বাজারে বিদ্যমান সমস্যা</span>
                    <p className="text-stone-300">অনলাইনে কম দামে কিনে ছবি ও আসল প্রডাক্টের অমিল পেয়ে প্রতারিত হওয়া।</p>
                  </div>

                  <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 space-y-1">
                    <span className="text-amber-400 font-bold block">⚠️ অতিরিক্ত উদ্বেগ</span>
                    <p className="text-stone-300">অগ্রিম টাকা দিয়ে প্রডাক্ট না পাওয়া এবং কাস্টমার সাপোর্টে সঠিক সাড়া না পাওয়া।</p>
                  </div>

                  <div className="bg-emerald-950/80 p-4 rounded-2xl border border-emerald-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">✅ আমাদের ১০০% সমাধান</span>
                    <p className="text-stone-200">১ টাকাও অগ্রিম ছাড়াই ক্যাশ অন ডেলিভারিতে প্রডাক্ট হাতে পেয়ে দেখে বিল পরিশোধ করার সুবিধা!</p>
                  </div>
                </div>
              </section>
            );

          /* -------------------------------------------------------------
           * 5. FAQ ACCORDION BLOCK
           * ------------------------------------------------------------- */
          case 'faq-accordion':
            const faqs = [
              { q: 'আমি কীভাবে অর্ডার করব?', a: 'পছন্দের প্রডাক্টের নিচে "অর্ডার করুন" বাটনে ক্লিক করে নাম, ঠিকানা ও ফোন নম্বর দিয়ে ক্যাশ অন ডেলিভারিতে ১-ক্লিকে অর্ডার সম্পন্ন করুন।' },
              { q: 'ডেলিভারি চার্জ কত এবং কতদিন সময় লাগবে?', a: 'ঢাকার ভেতরে ডেলিভারি চার্জ ৳৬০ (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ৳১২০ (২-৩ দিন)।' },
              { q: 'প্রডাক্ট পছন্দ না হলে কি রিটার্ন করা যাবে?', a: 'জি! ডেলিভারিম্যানের সামনে প্রডাক্ট চেক করে অপছন্দ হলে সাথে সাথে রিটার্ন করতে পারবেন।' },
            ];

            return (
              <section key={block.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-4">
                <h2 className="text-base font-extrabold text-stone-900 text-center">
                  ❓ সাধারণ জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
                </h2>

                <div className="space-y-3 max-w-2xl mx-auto text-xs">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-stone-200 rounded-2xl overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full text-left p-4 bg-stone-50 font-bold text-stone-900 flex justify-between items-center cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span>{openFaq === index ? '➖' : '➕'}</span>
                      </button>
                      {openFaq === index && (
                        <div className="p-4 bg-white text-stone-600 font-medium border-t border-stone-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );

          /* -------------------------------------------------------------
           * 6. CUSTOMER REVIEWS & SOCIAL PROOF BLOCK
           * ------------------------------------------------------------- */
          case 'reviews-strip':
            return (
              <section key={block.id} className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-4">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-amber-400 text-sm">
                    ★ ★ ★ ★ ★
                  </div>
                  <h2 className="text-base font-extrabold text-white">
                    আমাদের সম্মানিত কাস্টমারদের মতামত (৪.৯/৫ রেটিং)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {[
                    { name: 'রাহাত চৌধুরী', text: 'অর্ডার করার ২ দিনের মধ্যেই প্রডাক্ট হাতে পেয়েছি। ফেব্রিক ও কোয়ালিটি সেরা!' },
                    { name: 'তানজিলা রহমান', text: 'ক্যাশ অন ডেলিভারিতে পেয়ে খুব সুবিধা হয়েছে। সেম টু সেম প্রডাক্ট পেয়েছি।' },
                    { name: 'নাসিম আহমেদ', text: 'কাস্টমার সাপোর্ট খুব হেল্পফুল ছিল। প্রোডাক্ট ১০০% অরিজিনাল।' },
                  ].map((review, i) => (
                    <div key={i} className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between text-amber-400 text-[10px]">
                        <span>★★★★★</span>
                        <span className="text-stone-500 font-mono">ভেরিফাইড বাইয়ার</span>
                      </div>
                      <p className="text-stone-300 font-medium">"{review.text}"</p>
                      <span className="text-xs font-bold text-white block">— {review.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}