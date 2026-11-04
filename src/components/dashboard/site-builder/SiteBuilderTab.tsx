'use client';

import React, { useState, useEffect } from 'react';

type HeaderLink = {
  label: string;
  url: string;
};

type SiteBuilderTabProps = {
  domain?: string;
  activeSubTab?: 'navigation' | 'branding' | 'conversion';
};

export default function SiteBuilderTab({ domain = '', activeSubTab = 'branding' }: SiteBuilderTabProps) {
  const [subTab, setSubTab] = useState<'branding' | 'header' | 'footer' | 'css'>(
    activeSubTab === 'navigation' ? 'header' : 'branding'
  );

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  // Load Existing Theme Settings
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const res = await fetch(`/api/merchant/theme-settings?domain=${domain}`);
        const data = await res.json();
        if (res.ok && data.success && data.themeSettings) {
          setTheme((prev) => ({ ...prev, ...data.themeSettings }));
        }
      } catch (err) {
        console.error('Failed to load theme settings:', err);
      }
    };
    if (domain) loadTheme();
  }, [domain]);

  // Save Theme to API
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
        showToast('🎉 নেভিগেশন ও থিম সেটিং লাইভ স্টোরফ্রন্টে সেভ হয়েছে!');
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
      headerLinks: [...theme.headerLinks, { label: 'নতুন লিংক', url: '/' }],
    });
  };

  const handleUpdateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updatedLinks = [...theme.headerLinks];
    updatedLinks[index][field] = value;
    setTheme({ ...theme, headerLinks: updatedLinks });
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = theme.headerLinks.filter((_, i) => i !== index);
    setTheme({ ...theme, headerLinks: updatedLinks });
  };

  return (
    <div className="space-y-6 font-sans text-[#3B3433]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8A1538] text-white text-xs font-black px-5 py-3.5 rounded-2xl shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">🧭 Navigation & Site Builder Engine</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              THEME MANAGER
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Configure Logo, Navigation Links, Header Layouts, Announcement Bar & Footer
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

      {/* SUB-TAB 1: HEADER & NAVIGATION MANAGER */}
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

          {/* Top Announcement Bar Settings */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-stone-900">
                📢 টপ অ্যানাউন্সমেন্ট বার (Top Notice Bar)
              </h3>
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
                  <label className="block text-stone-800 mb-1">অ্যানাউন্সমেন্ট মেসেজ (Notice Text)</label>
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

          {/* Dynamic Navigation Menu Items Manager */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">🔗 নেভিগেশন লিংক ম্যানেজার (Header Links)</h3>
                <p className="text-[11px] text-stone-400">হেডারে পছন্দের পেজ বা ফিল্টার কাস্টম লিংক যুক্ত করুন</p>
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 bg-stone-900 text-white font-extrabold text-xs rounded-xl hover:bg-stone-800 transition cursor-pointer"
              >
                + নতুন লিংক যোগ করুন
              </button>
            </div>

            <div className="space-y-3">
              {theme.headerLinks.map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-xs font-mono text-stone-400 font-bold">#{idx + 1}</span>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                    placeholder="মেসেজ/টাইটেল (যেমন: শপ)"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                    placeholder="ইউআরএল (যেমন: /about-us)"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="text-stone-400 hover:text-rose-600 font-bold text-xs p-1"
                    title="ডিলিট করুন"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Header Action Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 text-xs font-bold">
            <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
              ⚙️ হেডার ফিচার টগল ও হেল্পলাইন
            </h3>

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
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            🎨 ব্রান্ড কালার ও লোগো কনফিগারেশন
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
            <div className="space-y-3">
              <label className="block text-stone-800 font-extrabold">
                স্টোর প্রাইমারি থিম কালার (Primary Color)
              </label>
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
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            📌 ফুটার ইনফরমেশন ও সোশাল লিংক
          </h3>

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
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            💻 কাস্টম সিএসএস কোড ইনজেক্টর
          </h3>

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