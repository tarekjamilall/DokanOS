'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';

type NavbarProps = {
  domain?: string;
  storeName?: string;
  brandLogo?: string;
  primaryColor?: string;
  headerLayout?: string;
  showAnnouncement?: boolean;
  announcementText?: string;
  announcementBg?: string;
  announcementTextColor?: string;
  headerLinks?: { label: string; url: string }[];
  showSearchBar?: boolean;
  showCartIcon?: boolean;
  helplinePhone?: string;
  stickyHeader?: boolean;
};

export default function Navbar({
  domain = '',
  storeName = 'DokanStore',
  brandLogo = '',
  primaryColor = '#8A1538',
  headerLayout = 'layout-1',
  showAnnouncement = true,
  announcementText = '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি',
  announcementBg = '#0f172a',
  announcementTextColor = '#ffffff',
  headerLinks = [
    { label: 'হোম', url: '/' },
    { label: 'সব প্রোডাক্ট', url: '/#products' },
    { label: 'আমাদের কথা', url: '/about-us' },
    { label: 'যোগাযোগ', url: '/contact-us' },
  ],
  showSearchBar = true,
  showCartIcon = true,
  helplinePhone = '01700000000',
  stickyHeader = true,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, toggleCartDrawer } = useCartStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className={`${stickyHeader ? 'sticky top-0 z-40' : 'relative'} w-full transition-all font-sans`}>
      {/* 📢 1. Top Announcement Bar */}
      {showAnnouncement && (
        <div
          style={{ backgroundColor: announcementBg, color: announcementTextColor }}
          className="text-[11px] font-bold py-1.5 px-4 shadow-2xs"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 mx-auto sm:mx-0 text-center sm:text-left">
              <span>🚚</span>
              <span>{announcementText}</span>
            </div>
            {helplinePhone && (
              <div className="hidden sm:flex items-center gap-4 text-[11px]">
                <a href={`tel:${helplinePhone}`} className="hover:opacity-80 transition-opacity">
                  📞 হেল্পলাইন: {helplinePhone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🧭 2. Main Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo / Name */}
          <Link href={`/${domain}`} className="flex items-center gap-2 shrink-0">
            {brandLogo ? (
              <img src={brandLogo} alt={storeName} className="h-9 w-auto object-contain rounded-lg" />
            ) : (
              <div
                style={{ backgroundColor: primaryColor }}
                className="w-9 h-9 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-2xs"
              >
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
              {storeName}
            </span>
          </Link>

          {/* 🔍 Search Bar (Desktop) */}
          {showSearchBar && (
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
                className="w-full h-10 pl-9 pr-4 text-xs font-semibold text-stone-900 bg-stone-100 border border-stone-200 rounded-2xl outline-none focus:bg-white transition-all"
              />
              <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
            </div>
          )}

          {/* 🔗 Dynamic Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-stone-700">
            {headerLinks.map((link, i) => {
              const isActive = pathname === link.url;
              return (
                <Link
                  key={i}
                  href={link.url.startsWith('/') ? `/${domain}${link.url === '/' ? '' : link.url}` : link.url}
                  className={`transition-colors hover:opacity-80 ${
                    isActive ? 'font-extrabold' : ''
                  }`}
                  style={{ color: isActive ? primaryColor : undefined }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* 🛒 Right Action Buttons (Cart & Mobile Hamburger) */}
          <div className="flex items-center gap-3 shrink-0">
            {showCartIcon && (
              <button
                type="button"
                onClick={() => toggleCartDrawer(true)}
                style={{ backgroundColor: primaryColor }}
                className="h-10 px-3.5 rounded-xl text-white font-extrabold text-xs flex items-center gap-2 shadow-sm hover:opacity-90 transition cursor-pointer"
              >
                <span>🛒</span>
                <span className="bg-white text-stone-900 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 font-bold flex items-center justify-center text-base cursor-pointer"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* 📱 Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white p-4 space-y-3 font-bold text-xs animate-in slide-in-from-top duration-200">
            {showSearchBar && (
              <div className="relative mb-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য বা ক্যাটাগরি খুঁজুন..."
                  className="w-full h-9 pl-8 pr-3 text-xs bg-stone-100 border border-stone-200 rounded-xl outline-none"
                />
                <span className="absolute left-2.5 top-2 text-stone-400 text-xs">🔍</span>
              </div>
            )}

            <div className="space-y-2">
              {headerLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.url.startsWith('/') ? `/${domain}${link.url === '/' ? '' : link.url}` : link.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg hover:bg-stone-100 text-stone-800 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {helplinePhone && (
              <a
                href={`tel:${helplinePhone}`}
                className="block text-center py-2.5 bg-stone-900 text-white rounded-xl text-xs font-black mt-2"
              >
                📞 কল করুন: {helplinePhone}
              </a>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}