'use client';

import React from 'react';
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
  const htmlContent = pageData?.content || '';

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

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 border-b border-slate-200 pb-4">
          {pageData?.title}
        </h1>

        {/* 1. Direct Content Container (For Legal & System Pages) */}
        {htmlContent && (
          <div
            className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm prose prose-indigo max-w-none text-slate-700 leading-relaxed text-sm"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {/* 2. Dynamic Blocks Builder Layout */}
        {blocks.length > 0 && (
          <div className="space-y-12 pt-4">
            {blocks.map((block: any, idx: number) => {
              switch (block.blockType) {
                case 'heroBanner':
                  return (
                    <section
                      key={idx}
                      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-6 rounded-3xl"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4">
                          {block.badgeText && (
                            <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold rounded-full inline-block">
                              {block.badgeText}
                            </span>
                          )}
                          <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                            {block.headline}
                          </h2>
                          {block.subheadline && (
                            <p className="text-slate-300 text-xs leading-relaxed">{block.subheadline}</p>
                          )}
                        </div>
                        {block.imageUrl && (
                          <img
                            src={block.imageUrl}
                            alt={block.headline}
                            className="rounded-2xl shadow-xl max-h-64 object-cover mx-auto"
                          />
                        )}
                      </div>
                    </section>
                  );
                default:
                  return null;
              }
            })}
          </div>
        )}
      </main>
    </div>
  );
}