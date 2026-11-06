'use client';

import React, { useState, useEffect } from 'react';

type HeaderLink = {
  label: string;
  url: string;
};

type PageOption = {
  id: string;
  title: string;
  slug: string;
};

type SiteBuilderTabProps = {
  domain?: string;
  activeSubTab?: 'branding' | 'header' | 'footer' | 'css';
};

export default function SiteBuilderTab({ domain = '', activeSubTab = 'header' }: SiteBuilderTabProps) {
  const [subTab, setSubTab] = useState<'branding' | 'header' | 'footer' | 'css'>(activeSubTab);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Available Internal Pages for Dynamic Picker
  const [availablePages, setAvailablePages] = useState<PageOption[]>([
    { id: 'sys-home', title: 'হোমপেজ (Home)', slug: '/' },
    { id: 'sys-shop', title: 'সব প্রোডাক্ট ক্যাটালগ (Shop)', slug: '/#products' },
    { id: 'sys-about', title: 'আমাদের কথা (About Us)', slug: '/about-us' },
    { id: 'sys-[#products]', title: 'প্রোডাক্ট গ্রিড', slug: '/#products' },
    { id: 'sys-contact', title: 'যোগাযোগ (Contact Us)', slug: '/contact-us' },
    { id: 'sys-privacy', title: 'প্রাইভেসি পলিসি (Privacy Policy)', slug: '/privacy-policy' },
    { id: 'sys-terms', title: 'সেবার শর্তাবলী (Terms & Conditions)', slug: '/terms-and-conditions' },
    { id: 'sys-return', title: 'রিটার্ন ও রিফান্ড নীতি (Return Policy)', slug: '/return-refund-policy' },
  ]);

  // Theme Settings State
  const [theme, setTheme] = useState({
    brandLogo: '',
    favicon: '',
    primaryColor: '#8A1538',
    headerLayout: 'layout-1', // layout-1 | layout-2 | layout-3
    showAnnouncement: true,
    announcementText: '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি',
    announcementBg: '#0f172a',
    announcementTextColor: '#ffffff',
    headerLinks: [
      { label: 'হোম', url: '/' },
      { label: 'সব প্রোডাক্ট', url: '/#products' },
      { label: 'আমাদের কথা', url: '/about-us' },
      { label: 'যোগাযোগ', url: '/contact-us' },
    ] as HeaderLink[],
    showSearchBar: true,
    showCartIcon: true,
    helplinePhone: '01700000000',
    stickyHeader: true,
    footerAboutText: 'আমরা প্রিমিয়াম মানের পণ্য এবং সেরা কাস্টমার সার্ভিস প্রদান করতে প্রতিশ্রুতিবদ্ধ।',
    supportPhone: '01700000000',
    supportEmail: 'support@example.com',
    address: 'ঢাকা, বাংলাদেশ',
    copyrightText: '© 2026 All Rights Reserved.',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    showTrustBadges: true,
    customCss: '',
    customScripts: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load Existing Theme Settings & Tenant Pages
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Theme Settings
        const themeRes = await fetch(`/api/merchant/theme-settings?domain=${domain}`);
        const themeData = await themeRes.json();
        if (themeRes.ok && themeData.success && themeData.themeSettings) {
          setTheme((prev) => ({ ...prev, ...themeData.themeSettings }));
        }

        // Load Internal Pages List for Picker
        const pagesRes = await fetch(`/api/merchant/pages?domain=${domain}`);
        const pagesData = await pagesRes.json();
        if (pagesRes.ok && pagesData.success && Array.isArray(pagesData.pages)) {
          setAvailablePages(pagesData.pages);
        }
      } catch (err) {
        console.error('Failed to load site builder data:', err);
      }
    };
    if (domain) loadData();
  }, [domain]);

  // Save Theme Settings to API
  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/merchant/theme-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, themeSettings: theme }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('🎉 নেভিগেশন ও গ্লোবাল থিম সেটিং সফলভাবে সেভ হয়েছে!');
      } else {
        showToast('⚠️ সেটিং সেভ করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      showToast('⚠️ নেটওয়ার্ক এরর!');
    } finally {
      setSaving(false);
    }
  };

  // Menu Link Actions
  const handleAddLink = () => {
    setTheme({
      ...theme,
      headerLinks: [...theme.headerLinks, { label: 'নতুন পেজ', url: '/' }],
    });
  };

  const handleUpdateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updatedLinks = [...theme.headerLinks];
    updatedLinks[index][field] = value;
    setTheme({ ...theme, headerLinks: updatedLinks });
  };

  const handleSelectInternalPage = (index: number, pageSlug: string, pageTitle: string) => {
    const updatedLinks = [...theme.headerLinks];
    updatedLinks[index].url = pageSlug;
    if (!updatedLinks[index].label || updatedLinks[index].label === 'নতুন পেজ') {
      updatedLinks[index].label = pageTitle.split(' (')[0];
    }
    setTheme({ ...theme, headerLinks: updatedLinks });
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = theme.headerLinks.filter((_, i) => i !== index);
    setTheme({ ...theme, headerLinks: updatedLinks });
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === theme.headerLinks.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...theme.headerLinks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setTheme({ ...theme, headerLinks: updated });
  };

  return (
    <div className="space-y-6 font-sans text-[#3B3433]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8A1538] text-white text-xs font-black px-5 py-3.5 rounded-2xl shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">🧭 Global Site & Navigation Builder</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              SUITE V2.0
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Manage Logo, Theme Colors, Navigation Links, Header Layouts & Footer Settings
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveTheme}
          className="px-5 py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
        >
          {saving ? 'সেভ হচ্ছে...' : '💾 সেটিং সেভ ও পাবলিশ করুন'}
        </button>
      </div>

      {/* Sub-Tabs Selector Bar */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        {[
          { id: 'header', label: '🧭 ১. হেডার ও নেভিগেশন ম্যানেজার' },
          { id: 'branding', label: '🎨 ২. ব্র্যান্ডিং ও কালার' },
          { id: 'footer', label: '📌 ৩. ফুটার সেটিং' },
          { id: 'css', label: '💻 ৪. কাস্টম সিএসএস ও কোড' },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setSubTab(tabItem.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
              subTab === tabItem.id
                ? 'bg-[#8A1538] text-white font-black shadow-2xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: HEADER & DYNAMIC NAVIGATION MANAGER */}
      {subTab === 'header' && (
        <div className="space-y-6">
          {/* Header Layout Picker */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
              📐 হেডার লেআউট স্টাইল (Header Layout Style)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'layout-1', title: 'Layout 1: Standard Left-Logo', desc: 'টপ নোটিশ বার, বাঁপাশে লোগো, সার্চ বার ও রাইট অ্যাকশন বাটন।' },
                { id: 'layout-2', title: 'Layout 2: Centered Logo Multi-Tier', desc: 'মাঝে বড় ব্র্যান্ড লোগো এবং নিচে ক্যাটাগরি নেভিগেশন লিংক বার।' },
                { id: 'layout-3', title: 'Layout 3: Minimalist Compact', desc: 'ক্লিন মিনিমাল লেআউট উইথ কুইক কন্টাক্ট বাটন।' },
              ].map((layout) => (
                <div
                  key={layout.id}
                  onClick={() => setTheme({ ...theme, headerLayout: layout.id })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition space-y-2 ${
                    theme.headerLayout === layout.id
                      ? 'border-[#8A1538] bg-rose-50/30'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-stone-900">{layout.title}</span>
                    {theme.headerLayout === layout.id && (
                      <span className="text-[10px] bg-[#8A1538] text-white font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">{layout.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Navigation Menu Items Manager with Internal Page Picker */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">🔗 নেভিগেশন মেনু এডিটর (Navigation Menu)</h3>
                <p className="text-[11px] text-stone-400">
                  ড্রপডাউন থেকে প্রজেক্টের যেকোনো পেজ সিলেক্ট করুন বা কাস্টম লিংক বসান
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3.5 py-2 bg-stone-900 text-white font-extrabold text-xs rounded-xl hover:bg-stone-800 transition cursor-pointer"
              >
                + নতুন মেনু যোগ করুন
              </button>
            </div>

            <div className="space-y-3">
              {theme.headerLinks.map((link, idx) => (
                <div key={idx} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-black text-stone-400">Menu Item #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveLink(idx, 'up')}
                        className="w-7 h-7 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                        title="উপরে তুলুন"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === theme.headerLinks.length - 1}
                        onClick={() => handleMoveLink(idx, 'down')}
                        className="w-7 h-7 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                        title="নিচে নামান"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        className="w-7 h-7 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title="ডিলিট করুন"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs font-bold">
                    {/* Menu Label Name */}
                    <div className="md:col-span-4">
                      <label className="block text-stone-700 text-[11px] mb-1">মেনুর নাম (Label)</label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                        placeholder="যেমন: হোম, শপ, আমাদের কথা"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none"
                      />
                    </div>

                    {/* Internal Page Picker Select */}
                    <div className="md:col-span-4">
                      <label className="block text-stone-700 text-[11px] mb-1">ইন্টারনাল পেজ সিলেক্ট করুন</label>
                      <select
                        onChange={(e) => {
                          const selected = availablePages.find((p) => p.slug === e.target.value);
                          if (selected) {
                            handleSelectInternalPage(idx, selected.slug, selected.title);
                          }
                        }}
                        defaultValue=""
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          -- পেজ বাছুন (Auto Link) --
                        </option>
                        {availablePages.map((page) => (
                          <option key={page.id} value={page.slug}>
                            {page.title} ({page.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target URL */}
                    <div className="md:col-span-4">
                      <label className="block text-stone-700 text-[11px] mb-1">কাস্টম ইউআরএল (Target URL)</label>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                        placeholder="যেমন: /about-us বা https://..."
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-mono text-stone-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Announcement Bar Settings */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-stone-900">📢 টপ অ্যানাউন্সমেন্ট বার (Notice Bar)</h3>
              <input
                type="checkbox"
                checked={theme.showAnnouncement}
                onChange={(e) => setTheme({ ...theme, showAnnouncement: e.target.checked })}
                className="w-5 h-5 text-[#8A1538] rounded cursor-pointer"
              />
            </div>

            {theme.showAnnouncement && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                <div className="md:col-span-2">
                  <label className="block text-stone-800 mb-1">নোটিশ মেসেজ (Text)</label>
                  <input
                    type="text"
                    value={theme.announcementText}
                    onChange={(e) => setTheme({ ...theme, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 mb-1">ব্যাকগ্রাউন্ড কালার</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.announcementBg}
                      onChange={(e) => setTheme({ ...theme, announcementBg: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.announcementBg}
                      onChange={(e) => setTheme({ ...theme, announcementBg: e.target.value })}
                      className="px-3 py-1.5 border border-stone-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-800 mb-1">টেক্সট কালার</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.announcementTextColor}
                      onChange={(e) => setTheme({ ...theme, announcementTextColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={theme.announcementTextColor}
                      onChange={(e) => setTheme({ ...theme, announcementTextColor: e.target.value })}
                      className="px-3 py-1.5 border border-stone-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Header Feature Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 text-xs font-bold">
            <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">⚙️ হেডার অ্যাকশন ও হেল্পলাইন</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-800 mb-1">হেল্পলাইন ফোন নম্বর</label>
                <input
                  type="text"
                  value={theme.helplinePhone}
                  onChange={(e) => setTheme({ ...theme, helplinePhone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl font-mono text-stone-800"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-800">🔍 সার্চ বার দৃশ্যমান রাখা</span>
                  <input
                    type="checkbox"
                    checked={theme.showSearchBar}
                    onChange={(e) => setTheme({ ...theme, showSearchBar: e.target.checked })}
                    className="w-4 h-4 text-[#8A1538] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-800">🛒 কার্ট আইকন ও ব্যাজ দেখা যাবে</span>
                  <input
                    type="checkbox"
                    checked={theme.showCartIcon}
                    onChange={(e) => setTheme({ ...theme, showCartIcon: e.target.checked })}
                    className="w-4 h-4 text-[#8A1538] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-800">📌 স্টিকি হেডার (Scroll Fixed)</span>
                  <input
                    type="checkbox"
                    checked={theme.stickyHeader}
                    onChange={(e) => setTheme({ ...theme, stickyHeader: e.target.checked })}
                    className="w-4 h-4 text-[#8A1538] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BRANDING & COLOR */}
      {subTab === 'branding' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-6">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">🎨 ব্র্যান্ডিং ও কালার প্যালেট</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
            <div className="space-y-3">
              <label className="block text-stone-800 font-extrabold">স্টোর প্রাইমারি థিম কালার</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border-0 p-0 cursor-pointer shadow-xs"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                  className="px-3.5 py-2 border border-stone-300 rounded-xl font-mono font-bold text-stone-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-stone-800 font-extrabold">ব্র্যান্ড লোগো ইউআরএল (Brand Logo URL)</label>
              <input
                type="text"
                value={theme.brandLogo}
                onChange={(e) => setTheme({ ...theme, brandLogo: e.target.value })}
                placeholder="[suspicious link removed]"
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl font-mono text-stone-800 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FOOTER SETTINGS */}
      {subTab === 'footer' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 text-xs font-bold">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">📌 ফুটার ইনফরমেশন ও সোশাল লিংক</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-800 mb-1">সাপোর্ট ফোন নম্বর</label>
              <input
                type="text"
                value={theme.supportPhone}
                onChange={(e) => setTheme({ ...theme, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-stone-800 mb-1">সাপোর্ট ইমেইল</label>
              <input
                type="email"
                value={theme.supportEmail}
                onChange={(e) => setTheme({ ...theme, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CUSTOM CSS */}
      {subTab === 'css' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 text-xs font-bold">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">💻 কাস্টম সিএসএস কোড ইনজেক্টর</h3>

          <div>
            <label className="block text-stone-800 mb-1">কাস্টম সিএসএস (Custom CSS)</label>
            <textarea
              rows={6}
              value={theme.customCss}
              onChange={(e) => setTheme({ ...theme, customCss: e.target.value })}
              placeholder="e.g. .store-hero { border-radius: 20px; }"
              className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}