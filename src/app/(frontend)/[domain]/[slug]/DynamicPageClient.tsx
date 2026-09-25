'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Props = {
  domain: string;
  storeName: string;
  primaryColor?: string;
  brandLogo?: string;
  pageData: any;
};

export default function DynamicPageClient({
  domain,
  storeName,
  primaryColor = '#4f46e5',
  brandLogo,
  pageData,
}: Props) {
  const blocks = pageData?.blocks || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
            ← মেইন স্টোরে ফিরুন
          </Link>
        </div>
      </header>

      {/* Dynamic Blocks Rendering Engine */}
      <main className="space-y-12">
        {blocks.map((block: any, idx: number) => {
          switch (block.blockType) {
            case 'heroBanner':
              return (
                <section
                  key={idx}
                  className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4"
                >
                  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4 text-center md:text-left">
                      {block.badgeText && (
                        <span className="px-3.5 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold rounded-full inline-block">
                          {block.badgeText}
                        </span>
                      )}
                      <h1 className="text-3xl sm:text-5xl font-black leading-tight">
                        {block.headline}
                      </h1>
                      {block.subheadline && (
                        <p className="text-slate-300 text-sm leading-relaxed">{block.subheadline}</p>
                      )}
                      <div>
                        <a
                          href="#order-section"
                          style={{ backgroundColor: primaryColor }}
                          className="inline-block px-8 py-3.5 text-white font-extrabold text-xs rounded-2xl shadow-lg hover:opacity-90 transition-all"
                        >
                          {block.buttonText || 'অর্ডার করতে ক্লিক করুন'}
                        </a>
                      </div>
                    </div>

                    {block.imageUrl && (
                      <div className="flex justify-center">
                        <img
                          src={block.imageUrl}
                          alt={block.headline}
                          className="max-w-xs sm:max-w-sm rounded-3xl shadow-2xl border-4 border-white/10"
                        />
                      </div>
                    )}
                  </div>
                </section>
              );

            case 'featureGrid':
              return (
                <section key={idx} className="max-w-6xl mx-auto px-4 py-6">
                  {block.title && (
                    <h3 className="text-xl font-black text-center text-slate-900 mb-8">
                      {block.title}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {block.features?.map((item: any, fIdx: number) => (
                      <div
                        key={fIdx}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2"
                      >
                        <div className="text-3xl mb-2">{item.icon || '✓'}</div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            case 'testimonials':
              return (
                <section key={idx} className="bg-white py-12 border-y border-slate-200">
                  <div className="max-w-5xl mx-auto px-4">
                    <h3 className="text-xl font-black text-center text-slate-900 mb-8">
                      {block.title || 'কাস্টমারদের প্রতিক্রিয়া'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {block.reviews?.map((rev: any, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 relative"
                        >
                          <div className="text-amber-400 text-sm font-bold">
                            {'★'.repeat(rev.rating || 5)}
                          </div>
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            "{rev.comment}"
                          </p>
                          <p className="text-xs font-bold text-slate-900 pt-2 border-t border-slate-200">
                            — {rev.customerName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'faqAccordion':
              return (
                <section key={idx} className="max-w-3xl mx-auto px-4 py-6">
                  <h3 className="text-xl font-black text-center text-slate-900 mb-8">
                    {block.title || 'সাধারণ প্রশ্ন ও উত্তর'}
                  </h3>
                  <div className="space-y-3">
                    {block.faqs?.map((faq: any, qIdx: number) => (
                      <details
                        key={qIdx}
                        className="bg-white rounded-2xl border border-slate-200 p-4 group [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                      >
                        <summary className="flex items-center justify-between font-bold text-xs text-slate-900">
                          <span>{faq.question}</span>
                          <span className="transition group-open:rotate-180">▼</span>
                        </summary>
                        <p className="mt-3 text-xs text-slate-600 leading-relaxed pt-3 border-t border-slate-100">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>
    </div>
  );
}
