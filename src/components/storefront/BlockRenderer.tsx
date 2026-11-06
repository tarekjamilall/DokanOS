'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SectionBlock = {
  id: string;
  type: string;
  title?: string;
  enabled: boolean;
  bgColor?: string;
  textColor?: string;
  paddingY?: string;
  elements?: any[];
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

  const activeBlocks = blocks.filter((b) => b.enabled);

  const handleBuyNow = (productId: string) => {
    router.push(`/checkout?product=${productId}&qty=1`);
  };

  if (!activeBlocks || activeBlocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 font-sans">
      {activeBlocks.map((block) => {
        const customBg = block.bgColor || undefined;
        const customColor = block.textColor || undefined;
        const paddingClass = block.paddingY || 'py-8';

        switch (block.type) {
          /* -------------------------------------------------------------
           * 1. HERO BANNER BLOCK
           * ------------------------------------------------------------- */
          case 'hero-banner':
            return (
              <section
                key={block.id}
                style={{ backgroundColor: customBg }}
                className={`w-full rounded-3xl ${paddingClass} transition-all`}
              >
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
              <section key={block.id} style={{ backgroundColor: customBg, color: customColor }} className={`space-y-4 rounded-3xl ${paddingClass}`}>
                <h2 className="text-sm sm:text-base font-extrabold">📂 ক্যাটাগরি অনুযায়ী প্রডাক্ট খুঁজুন</h2>
                {categories.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    <Link
                      href={`/${domain}`}
                      className={`p-3.5 rounded-2xl border text-center transition ${
                        activeCategory === 'all'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-800 border-stone-200'
                      }`}
                    >
                      <span className="text-xs font-bold">সব ক্যাটাগরি</span>
                    </Link>
                    {categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/${domain}?category=${cat.slug}`}
                        className={`p-3.5 rounded-2xl border text-center transition ${
                          activeCategory === cat.slug
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-800 border-stone-200'
                        }`}
                      >
                        <span className="text-xs font-bold line-clamp-1">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );

          /* -------------------------------------------------------------
           * 3. PRODUCT DISPLAY GRID BLOCK
           * ------------------------------------------------------------- */
          case 'product-grid':
            return (
              <section key={block.id} id="products" style={{ backgroundColor: customBg, color: customColor }} className={`space-y-4 rounded-3xl ${paddingClass}`}>
                <h2 className="text-sm sm:text-base font-extrabold">🛍️ আমাদের প্রডাক্ট কালেকশন ({products.length})</h2>
                {products.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
                    <p className="text-xs font-bold text-stone-600">কোনো প্রডাক্ট পাওয়া যায়নি</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs p-3 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="h-44 rounded-xl bg-stone-100 overflow-hidden relative border border-stone-100">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={typeof product.images.image === 'string' ? product.images.image : product.images.image?.url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 font-mono text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <h3 className="text-xs font-bold text-stone-900 line-clamp-2">{product.title}</h3>
                          <div className="flex items-baseline gap-2">
                            <span style={{ color: primaryColor }} className="text-sm font-black">
                              ৳ {product.price}
                            </span>
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
           * 4. FLEXIBLE BLANK SECTION ENGINE
           * ------------------------------------------------------------- */
          case 'blank-section':
            return (
              <section
                key={block.id}
                style={{ backgroundColor: customBg, color: customColor }}
                className={`w-full rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-2xs space-y-6 ${paddingClass}`}
              >
                {(block.elements || []).map((el: any) => {
                  const alignClass =
                    el.alignment === 'left' ? 'text-left' : el.alignment === 'right' ? 'text-right' : 'text-center';

                  if (el.type === 'heading') {
                    return (
                      <h2
                        key={el.id}
                        style={{ color: el.textColor || customColor }}
                        className={`font-black text-xl sm:text-3xl ${alignClass}`}
                      >
                        {el.content}
                      </h2>
                    );
                  }

                  if (el.type === 'text') {
                    return (
                      <p
                        key={el.id}
                        style={{ color: el.textColor || customColor }}
                        className={`text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto ${alignClass}`}
                      >
                        {el.content}
                      </p>
                    );
                  }

                  if (el.type === 'image') {
                    return (
                      <div key={el.id} className={`flex justify-center ${alignClass}`}>
                        <img src={el.content} alt="Custom Section" className="max-w-full h-auto rounded-2xl shadow-md" />
                      </div>
                    );
                  }

                  if (el.type === 'button') {
                    return (
                      <div key={el.id} className={`flex justify-center ${alignClass}`}>
                        <Link
                          href={el.url || '/#products'}
                          style={{ backgroundColor: el.btnBg || primaryColor, color: el.btnTextColor || '#ffffff' }}
                          className="px-6 py-3 rounded-xl font-extrabold text-xs shadow-md transition hover:opacity-90"
                        >
                          {el.content}
                        </Link>
                      </div>
                    );
                  }

                  if (el.type === 'video') {
                    return (
                      <div key={el.id} className="max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                        <iframe src={el.content} className="w-full h-full" allowFullScreen title="Video Embed"></iframe>
                      </div>
                    );
                  }

                  return null;
                })}
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}