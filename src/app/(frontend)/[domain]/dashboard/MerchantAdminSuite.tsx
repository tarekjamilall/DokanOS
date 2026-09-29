'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ============================================================================
// 🔮 MODULAR COMPONENTS IMPORT SECTION (All imports preserved)
// ============================================================================
import AddProductForm from '@/components/dashboard/products/AddProductForm';
import ProductList from '@/components/dashboard/products/ProductList';
import CategoryManager from '@/components/dashboard/products/CategoryManager';
import BrandManager from '@/components/dashboard/products/BrandManager';
import TagManager from '@/components/dashboard/products/TagManager';
import AttributeManager from '@/components/dashboard/products/AttributeManager';
import CouponManager from '@/components/dashboard/products/CouponManager';
import OrderList from '@/components/dashboard/orders/OrderList';
import PaymentSettingsTab from '@/components/dashboard/payment/PaymentSettingsTab';

type MerchantAdminSuiteProps = {
  domain?: string;
  storeName?: string;
  brandLogo?: string;
  orders?: any[];
  products?: any[];
  categories?: any[];
  brands?: any[];
  coupons?: any[];
  pages?: any[];
};

function InnerMerchantAdminSuite({
  domain = '',
  storeName = 'Online Care Bazar',
  brandLogo = '',
  orders = [],
  products = [],
  categories = [],
  brands = [],
  coupons = [],
  pages = [],
}: MerchantAdminSuiteProps) {
  const searchParams = useSearchParams();

  // 📱 MOBILE SIDEBAR STATE
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 🧭 TAB & SUB-TAB NAVIGATION ENGINE WITH URL SYNC
  const initialTab = (searchParams.get('tab') as any) || 'overview';
  const initialEcomSub = (searchParams.get('sub') as any) || 'products';
  const initialProductSubSub = (searchParams.get('subsub') as any) || 'all';
  const initialSiteBuilderSub = (searchParams.get('sub') as any) || 'landing-pages';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'ecommerce' | 'media' | 'pages' | 'analytics' | 'site-builder' | 'settings'
  >(initialTab);

  const [activeEcomSubTab, setActiveEcomSubTab] = useState<
    'orders' | 'products' | 'payments' | 'settings'
  >(initialEcomSub);

  const [activeProductSubTab, setActiveProductSubTab] = useState<
    'all' | 'add' | 'brands' | 'categories' | 'tags' | 'attributes' | 'coupon'
  >(initialProductSubSub);

  const [activeSiteBuilderSubTab, setActiveSiteBuilderSubTab] = useState<
    'navigation' | 'branding' | 'conversion'
  >(initialSiteBuilderSub);


  // Sync state with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const subParam = searchParams.get('sub');
    const subsubParam = searchParams.get('subsub');

    if (tabParam) setActiveTab(tabParam as any);
    if (subParam) setActiveEcomSubTab(subParam as any);
    if (subsubParam) setActiveProductSubTab(subsubParam as any);
  }, [searchParams]);

  const updateUrlParams = (tab: string, sub?: string, subsub?: string) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (sub) params.set('sub', sub);
    if (subsub) params.set('subsub', subsub);

    const newUrl = `?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
  };

  // Nav Handlers
  const handleMainTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
    if (tab === 'ecommerce') {
      updateUrlParams(tab, activeEcomSubTab, activeEcomSubTab === 'products' ? activeProductSubTab : undefined);
    } else if (tab === 'site-builder') {
      updateUrlParams(tab, activeSiteBuilderSubTab);
    } else {
      updateUrlParams(tab);
    }
  };

  const handleEcomSubTabChange = (sub: any) => {
    setActiveEcomSubTab(sub);
    setIsMobileSidebarOpen(false);
    if (sub === 'products') {
      updateUrlParams('ecommerce', sub, activeProductSubTab);
    } else {
      updateUrlParams('ecommerce', sub);
    }
  };

  const handleProductSubSubTabChange = (subsub: any) => {
    setActiveProductSubTab(subsub);
    setIsMobileSidebarOpen(false);
    updateUrlParams('ecommerce', 'products', subsub);
  };

  const handleSiteBuilderSubTabChange = (sub: any) => {
    setActiveSiteBuilderSubTab(sub);
    setIsMobileSidebarOpen(false);
    updateUrlParams('site-builder', sub);
  };

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const safeStoreName = storeName && storeName.trim() ? storeName : 'Online Care Bazar';

  const handleLogout = () => {
    showToast('Logged out successfully.', 'success');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  // Dynamic Stats Calculations
  const totalSales = orders.reduce((sum, ord) => sum + (Number(ord.total) || Number(ord.amount) || Number(ord.total_price) || 0), 0);
  const outOfStockCount = products.filter((p) => p.stockStatus === 'outofstock' || p.stockQuantity === 0 || Number(p.stock) === 0).length;

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#FDFDFD] font-sans text-[#3B3433] selection:bg-[#8A1538] selection:text-white relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border text-white ${toast.type === 'success' ? 'bg-[#8A1538] border-[#8A1538]' : 'bg-rose-700 border-rose-600'
              }`}
          >
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 1. AUTHENTIC DARK SIDEBAR (w-[280px] & Clean Professional SVG Icons) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-[280px] h-full bg-[#2B2927] text-gray-300 flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } border-r border-stone-800/80 shadow-2xl`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 truncate">
            {brandLogo ? (
              <img src={brandLogo} alt={safeStoreName} className="w-10 h-10 rounded-xl object-cover border border-stone-700 shadow-xs" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-tr from-[#8A1538] to-rose-700 rounded-xl flex items-center justify-center font-black text-base text-white shadow-md border border-rose-500/20">
                {safeStoreName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <h2 className="font-extrabold text-lg text-white tracking-tight truncate flex items-center">
                <span>{safeStoreName}</span>
                <span className="text-[#E5B361] ml-0.5 font-black text-xl">.</span>
              </h2>
              <p className="text-[10px] text-[#E5B361] font-extrabold uppercase tracking-widest mt-0.5">ADMIN PANEL</p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="Close Mobile Menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation Menu with SVG Icons */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 text-xs font-bold overflow-y-auto scrollbar-thin scrollbar-thumb-stone-700">
          {/* TAB 1: Overview */}
          <button
            onClick={() => handleMainTabChange('overview')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'overview'
                ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-sm font-bold">Overview</span>
          </button>

          {/* TAB 2: Ecommerce */}
          <div>
            <button
              onClick={() => handleMainTabChange('ecommerce')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'ecommerce'
                  ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm font-bold">Ecommerce</span>
              </div>
              {/* Professional SVG Chevron Angle Bracket */}
              <svg
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${activeTab === 'ecommerce' ? 'rotate-180 text-white' : 'text-stone-400 group-hover:text-white'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Subtabs Tree */}
            {activeTab === 'ecommerce' && (
              <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-[#8A1538]/50 ml-5">
                <button
                  onClick={() => handleEcomSubTabChange('orders')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all text-xs font-semibold flex items-center justify-between gap-2.5 ${activeEcomSubTab === 'orders'
                      ? 'text-[#E5B361] font-extrabold bg-stone-800/80'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Orders</span>
                  </div>
                  {orders.length > 0 && (
                    <span className="bg-[#E5B361] text-[#2B2927] text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      {orders.length}
                    </span>
                  )}
                </button>

                <div>
                  <button
                    onClick={() => handleEcomSubTabChange('products')}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-all text-xs font-semibold flex items-center justify-between gap-2.5 ${activeEcomSubTab === 'products'
                        ? 'text-[#E5B361] font-extrabold bg-stone-800/80'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>Products</span>
                    </div>
                    <span className="text-stone-400 text-[10px]">({products.length})</span>
                  </button>

                  {/* Sub-sub tabs under Products with SVG Icons */}
                  {activeEcomSubTab === 'products' && (
                    <div className="pl-3 mt-1 space-y-1 text-[11px] font-medium">
                      {[
                        {
                          id: 'all',
                          label: 'All Products',
                          icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
                        },
                        {
                          id: 'add',
                          label: 'Add products',
                          icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
                        },
                        {
                          id: 'brands',
                          label: `Brands (${brands.length})`,
                          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
                        },
                        {
                          id: 'categories',
                          label: `Categories (${categories.length})`,
                          icon: 'M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01M15 7h.01M15 11h.01M15 15h.01',
                        },
                        {
                          id: 'tags',
                          label: 'Tags',
                          icon: 'M7 7h.01M7 11h.01M7 15h.01M11 7h.01M11 11h.01M11 15h.01',
                        },
                        {
                          id: 'attributes',
                          label: 'Attributes',
                          icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
                        },
                        {
                          id: 'coupon',
                          label: `Coupon (${coupons.length})`,
                          icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
                        },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleProductSubSubTabChange(sub.id as any)}
                          className={`w-full text-left py-1.5 px-2.5 rounded-md transition-all flex items-center gap-2 ${activeProductSubTab === sub.id
                              ? 'bg-stone-800 text-white font-extrabold border-l-2 border-[#E5B361]'
                              : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sub.icon} />
                          </svg>
                          <span>{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleEcomSubTabChange('payments')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all text-xs font-semibold flex items-center gap-2.5 ${activeEcomSubTab === 'payments'
                      ? 'text-[#E5B361] font-extrabold bg-stone-800/80'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Payments</span>
                </button>

                <button
                  onClick={() => handleEcomSubTabChange('settings')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all text-xs font-semibold flex items-center gap-2.5 ${activeEcomSubTab === 'settings'
                      ? 'text-[#E5B361] font-extrabold bg-stone-800/80'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>eCommerce Settings</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 3: Media */}
          <button
            onClick={() => handleMainTabChange('media')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'media'
                ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-bold">Media</span>
          </button>

          {/* TAB 4: Pages */}
          <button
            onClick={() => handleMainTabChange('pages')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'pages'
                ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-bold">Pages ({pages.length})</span>
          </button>

          {/* TAB 5: Analytics */}
          <button
            onClick={() => handleMainTabChange('analytics')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'analytics'
                ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-bold">Analytics</span>
          </button>

          {/* TAB 6: Site Builder */}
          <div>
            <button
              onClick={() => handleMainTabChange('site-builder')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'site-builder'
                  ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm font-bold">Site Builder</span>
              </div>
              {/* Professional SVG Chevron Angle Bracket */}
              <svg
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${activeTab === 'site-builder' ? 'rotate-180 text-white' : 'text-stone-400 group-hover:text-white'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {activeTab === 'site-builder' && (
              <div className="pl-3.5 mt-1.5 space-y-1 border-l-2 border-[#8A1538]/50 ml-5 text-xs font-semibold">
                {/* ১. নেভিগেশন (Navigation) */}
                <button
                  onClick={() => handleSiteBuilderSubTabChange('navigation')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all flex items-center gap-2.5 ${activeSiteBuilderSubTab === 'navigation' ? 'text-[#E5B361] font-bold bg-stone-800/80' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Navigation</span>
                </button>

                {/* ২. ব্র্যান্ডিং (Branding) */}
                <button
                  onClick={() => handleSiteBuilderSubTabChange('branding')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all flex items-center gap-2.5 ${activeSiteBuilderSubTab === 'branding' ? 'text-[#E5B361] font-bold bg-stone-800/80' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span>Branding</span>
                </button>

                {/* ৩. কনভার্সন (Conversion) */}
                <button
                  onClick={() => handleSiteBuilderSubTabChange('conversion')}
                  className={`w-full text-left py-2 px-3 rounded-lg transition-all flex items-center gap-2.5 ${activeSiteBuilderSubTab === 'conversion' ? 'text-[#E5B361] font-bold bg-stone-800/80' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Conversion</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 7: Settings */}
          <button
            onClick={() => handleMainTabChange('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'settings'
                ? 'bg-[#8A1538] text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-bold">Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800/80 space-y-2 bg-stone-900/40 shrink-0">
          <a
            href={`http://${domain || 'test-4'}.localhost:3000`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Visit Storefront</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT (Responsive Container with min-w-0 and overflow-x-hidden) */}
      <main className="flex-1 h-full overflow-y-auto bg-[#F6F4EB]/30 min-w-0 flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-2xs gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold transition flex items-center justify-center shrink-0"
              aria-label="Open Mobile Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="truncate">
              <h1 className="text-xs sm:text-base font-black text-[#3B3433] capitalize flex items-center gap-1.5 truncate">
                <span className="truncate">{activeTab === 'overview' ? 'Overview' : activeTab}</span>
                <span className="text-[#8A1538] hidden sm:inline">Management</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-mono hidden sm:block">
                URL: /dashboard?tab={activeTab}{activeTab === 'ecommerce' ? `&sub=${activeEcomSubTab}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE
            </span>

            <a
              href={`http://${domain || 'test-4'}.localhost:3000`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 sm:px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <span>👁️</span>
              <span>View Site</span>
            </a>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <div className="p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-6 flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-100 block">মোট আয় (SALES)</span>
                      <h3 className="text-xl sm:text-2xl font-black mt-1">৳{totalSales}</h3>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center text-base sm:text-lg backdrop-blur-xs">
                      💵
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-4 sm:p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-100 block">মোট অর্ডার</span>
                      <h3 className="text-xl sm:text-2xl font-black mt-1">{orders.length}</h3>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center text-base sm:text-lg backdrop-blur-xs">
                      🛍️
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-4 sm:p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">মোট প্রোডাক্ট</span>
                      <h3 className="text-xl sm:text-2xl font-black mt-1">{products.length}</h3>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center text-base sm:text-lg backdrop-blur-xs">
                      📦
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-500 to-red-600 p-4 sm:p-5 rounded-2xl text-white shadow-md relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100 block">স্টক আউট / লো-স্টক</span>
                      <h3 className="text-xl sm:text-2xl font-black mt-1">{outOfStockCount}</h3>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center text-base sm:text-lg backdrop-blur-xs">
                      ⚠️
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders & Stock Alert */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
                <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 min-w-0">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-xs text-slate-900">সাম্প্রতিক অর্ডারসমূহ</h3>
                    <button
                      onClick={() => handleMainTabChange('ecommerce')}
                      className="text-[10px] font-bold text-[#8A1538] hover:underline"
                    >
                      সব দেখুন ➔
                    </button>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px] border-b">
                          <th className="py-2.5 px-3">ORDER ID</th>
                          <th className="py-2.5 px-3">CUSTOMER</th>
                          <th className="py-2.5 px-3 text-right">AMOUNT</th>
                          <th className="py-2.5 px-3 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700 font-medium">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-stone-400 font-bold">
                              এখনো কোনো অর্ডার পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          orders.slice(0, 5).map((ord: any) => (
                            <tr key={ord.id || ord.order_id}>
                              <td className="py-3 px-3 font-mono font-black text-[#8A1538]">
                                #{ord.orderNumber || ord.id || ord.order_id}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold block text-slate-900">
                                  {ord.customerName || ord.customer_name || ord.shippingAddress?.fullName || 'Guest Customer'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {ord.customerPhone || ord.phone || ord.shippingAddress?.phone || ''}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold">
                                ৳{ord.total || ord.amount || ord.total_price || 0}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200 uppercase">
                                  {ord.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 min-w-0">
                  <h3 className="font-extrabold text-xs text-rose-600 flex items-center gap-1.5 border-b pb-2">
                    <span>⚠️</span>
                    <span>লো-স্টক নোটিফিকেশন</span>
                  </h3>

                  {outOfStockCount === 0 ? (
                    <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-1">
                      <span className="text-2xl block">🎉</span>
                      <p className="text-xs font-bold text-emerald-800">সব প্রোডাক্টের স্টক পর্যাপ্ত আছে!</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs space-y-2">
                      <p className="font-bold text-rose-800">
                        {outOfStockCount} টি প্রোডাক্টের স্টক শেষ হয়ে গেছে!
                      </p>
                      <button
                        onClick={() => handleEcomSubTabChange('products')}
                        className="text-[10px] font-bold text-[#8A1538] underline"
                      >
                        প্রোডাক্ট ক্যাটাগরি আপডেট করুন ➔
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ECOMMERCE - PRODUCTS SUBTAB */}
          {activeTab === 'ecommerce' && activeEcomSubTab === 'products' && (
            <div className="space-y-4 min-w-0">
              {activeProductSubTab === 'all' && (
                <ProductList
                  initialProducts={products}
                  categories={categories}
                  onAddNew={() => handleProductSubSubTabChange('add')}
                />
              )}

              {activeProductSubTab === 'add' && (
                <AddProductForm
                  categories={categories}
                  brands={brands}
                  domain={domain}
                  onSuccess={() => handleProductSubSubTabChange('all')}
                />
              )}

              {activeProductSubTab === 'brands' && (
                <BrandManager initialBrands={brands} />
              )}

              {activeProductSubTab === 'categories' && (
                <CategoryManager initialCategories={categories} />
              )}

              {activeProductSubTab === 'tags' && (
                <TagManager />
              )}

              {activeProductSubTab === 'attributes' && (
                <AttributeManager />
              )}

              {activeProductSubTab === 'coupon' && (
                <CouponManager initialCoupons={coupons} />
              )}
            </div>
          )}

          {/* TAB 2: ECOMMERCE - ORDERS SUBTAB */}
          {activeTab === 'ecommerce' && activeEcomSubTab === 'orders' && (
            <div className="min-w-0">
              <OrderList initialOrders={orders} />
            </div>
          )}

          {/* TAB 2: ECOMMERCE - PAYMENTS SUBTAB */}
          {activeTab === 'ecommerce' && activeEcomSubTab === 'payments' && (
            <div className="min-w-0">
              <PaymentSettingsTab />
            </div>
          )}

          {/* TAB 2: ECOMMERCE - SETTINGS SUBTAB */}
          {activeTab === 'ecommerce' && activeEcomSubTab === 'settings' && (
            <div className="bg-white p-6 rounded-2xl border space-y-3 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">⚙️ eCommerce General Settings</h2>
              <p className="text-xs text-slate-500">Currency, tax rates, and store checkout policies.</p>
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === 'media' && (
            <div className="bg-white p-6 rounded-2xl border space-y-3 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">🖼️ Cloudflare R2 Media Gallery</h2>
              <p className="text-xs text-slate-500">Upload and manage product assets and marketing images.</p>
            </div>
          )}

          {/* TAB 4: PAGES */}
          {activeTab === 'pages' && (
            <div className="bg-white p-6 rounded-2xl border space-y-3 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">📄 Custom Site Pages ({pages.length})</h2>
              <p className="text-xs text-slate-500">Manage Terms, Privacy Policy, and About Us pages.</p>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white p-6 rounded-2xl border space-y-3 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">📈 Sales & Conversion Analytics</h2>
              <p className="text-xs text-slate-500">Monitor store GMV, traffic, and order conversion rates.</p>
            </div>
          )}

          {/* TAB 6: SITE BUILDER */}
          {activeTab === 'site-builder' && (
            <div className="bg-white p-6 rounded-2xl border space-y-3 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">🚀 Puck Block Builder & Landing Pages</h2>
              <p className="text-xs text-slate-500">Design custom storefront landing pages and theme blocks.</p>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-2xl border space-y-3 min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">⚙️ Storefront Tracking & Pixels</h2>
              <p className="text-xs text-slate-500">Configure Meta Pixel, Google Tag Manager (GTM), and API tokens.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MerchantAdminSuite(props: MerchantAdminSuiteProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] text-[#8A1538] font-bold text-sm">
          <div className="w-8 h-8 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <InnerMerchantAdminSuite {...props} />
    </Suspense>
  );
}
