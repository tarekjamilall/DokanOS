'use client';

import React from 'react';
import Link from 'next/link';

type FooterProps = {
  domain?: string;
  storeName?: string;
  brandLogo?: string;
  primaryColor?: string;
  footerAboutText?: string;
  supportPhone?: string;
  supportEmail?: string;
  address?: string;
  copyrightText?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  showTrustBadges?: boolean;
};

export default function Footer({
  domain = '',
  storeName = 'DokanStore',
  brandLogo = '',
  primaryColor = '#8A1538',
  footerAboutText = 'আমরা প্রিমিয়াম মানের সেরা পণ্য এবং দ্রুততম কাস্টমার ডেলিভারি নিশ্চিত করতে প্রতিশ্রুতিবদ্ধ।',
  supportPhone = '01700000000',
  supportEmail = 'support@example.com',
  address = 'ঢাকা, বাংলাদেশ',
  copyrightText = '© 2026 All Rights Reserved.',
  facebookUrl = '',
  instagramUrl = '',
  youtubeUrl = '',
  showTrustBadges = true,
}: FooterProps) {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        
        {/* 🛡️ 1. Trust & Service Feature Badges */}
        {showTrustBadges && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-stone-800 text-xs">
            <div className="flex items-center gap-3 bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
              <span className="text-2xl">🚚</span>
              <div>
                <h4 className="font-extrabold text-white">দ্রুত ডেলিভারি</h4>
                <p className="text-[11px] text-stone-400">সারা দেশে ক্যাশ অন ডেলিভারি</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
              <span className="text-2xl">🛡️</span>
              <div>
                <h4 className="font-extrabold text-white">১০০% অরিজিনাল</h4>
                <p className="text-[11px] text-stone-400">সর্বোচ্চ গুণগত মানের নিশ্চয়তা</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
              <span className="text-2xl">🔄</span>
              <div>
                <h4 className="font-extrabold text-white">সহজ রিটার্ন পলিসি</h4>
                <p className="text-[11px] text-stone-400">৭ দিনের রিটার্ন ও রিফান্ড সুবিধা</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
              <span className="text-2xl">🎧</span>
              <div>
                <h4 className="font-extrabold text-white">২৪/৭ সাপোর্ট কেয়ার</h4>
                <p className="text-[11px] text-stone-400">অনলাইন দ্রুত কাস্টমার সার্ভিস</p>
              </div>
            </div>
          </div>
        )}

        {/* 📋 2. Main Footer Widgets (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
          
          {/* Brand Info (5 Columns) */}
          <div className="md:col-span-5 space-y-4">
            <Link href={`/${domain}`} className="flex items-center gap-2">
              {brandLogo ? (
                <img src={brandLogo} alt={storeName} className="h-8 w-auto object-contain rounded" />
              ) : (
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="w-8 h-8 text-white rounded-xl flex items-center justify-center font-black text-base shadow-sm"
                >
                  {storeName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-lg font-black text-white tracking-tight">{storeName}</span>
            </Link>

            <p className="text-stone-400 leading-relaxed max-w-sm">{footerAboutText}</p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-1">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition"
                >
                  📘
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition"
                >
                  📷
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition"
                >
                  ▶️
                </a>
              )}
            </div>
          </div>

          {/* Quick Links (3 Columns) */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">প্রয়োজনীয় পেজসমূহ</h3>
            <ul className="space-y-2 text-stone-400 font-semibold">
              <li>
                <Link href={`/${domain}/about-us`} className="hover:text-white transition">
                  আমাদের কথা (About Us)
                </Link>
              </li>
              <li>
                <Link href={`/${domain}/privacy-policy`} className="hover:text-white transition">
                  প্রাইভেসি পলিসি (Privacy Policy)
                </Link>
              </li>
              <li>
                <Link href={`/${domain}/terms-and-conditions`} className="hover:text-white transition">
                  সেবার শর্তাবলী (Terms & Conditions)
                </Link>
              </li>
              <li>
                <Link href={`/${domain}/return-refund-policy`} className="hover:text-white transition">
                  রিটার্ন ও রিফান্ড নীতি
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (4 Columns) */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">যোগাযোগের ঠিকানা</h3>
            <ul className="space-y-2.5 text-stone-400 font-medium">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href={`tel:${supportPhone}`} className="hover:text-white font-mono">
                  {supportPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href={`mailto:${supportEmail}`} className="hover:text-white font-mono">
                  {supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>{address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 💳 3. Copyright & Payment Gateway Icons */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-medium">
          <p>{copyrightText || `© 2026 ${storeName}. All Rights Reserved.`}</p>

          <div className="flex items-center gap-2 font-bold text-stone-400">
            <span>নিরাপদ পেমেন্ট:</span>
            <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-rose-400 font-mono">
              bKash
            </span>
            <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-orange-400 font-mono">
              Nagad
            </span>
            <span className="bg-stone-800 px-2 py-0.5 rounded border border-stone-700 text-emerald-400 font-mono">
              COD
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}