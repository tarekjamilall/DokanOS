'use client';

import React, { useState, useEffect } from 'react';

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

  // Theme Settings Form States
  const [theme, setTheme] = useState({
    brandLogo: '',
    favicon: '',
    primaryColor: '#8A1538',
    showAnnouncement: true,
    announcementText: '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি',
    announcementBg: '#0f172a',
    announcementTextColor: '#ffffff',
    headerLinks: [
      { label: 'হোম', url: '/' },
      { label: 'সব প্রোডাক্ট', url: '/#products' },
      { label: 'আমাদের কথা', url: '/about-us' },
      { label: 'যোগাযোগ', url: '/contact-us' },
    ],
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
        showToast('🎉 থিম ব্রান্ডিং ও কালার সেটিং লাইভ স্টোরফ্রন্টে পাবলিশ হয়েছে!');
      } else {
        showToast('⚠️ থিম সেভ করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      showToast('⚠️ নেটওয়ার্ক এরর!');
    } finally {
      setSaving(false);
    }
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
            <h2 className="text-base font-black text-[#3B3433]">🎨 Theme Customization & Site Builder</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              THEME ENGINE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Configure Logo, Primary Color Palette, Announcement Bar & Custom CSS
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveTheme}
          className="px-5 py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
        >
          {saving ? 'সেভ হচ্ছে...' : '💾 থিম সেভ ও পাবলিশ করুন'}
        </button>
      </div>

      {/* Sub-Tabs Selector Bar */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        {[
          { id: 'branding', label: '🎨 ১. ব্র্যান্ডিং ও কালার' },
          { id: 'header', label: '🧭 ২. হেডার ও নেভিগেশন' },
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

      {/* SUB-TAB 1: BRANDING & COLOR PALETTE (Step 177) */}
      {subTab === 'branding' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-6">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            🎨 ব্রান্ড কালার ও লোগো কনফিগারেশন
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
            {/* Primary Color Picker */}
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

              {/* Preset Color Swatches */}
              <div className="flex items-center gap-2 pt-1">
                {[
                  { name: 'Royal Crimson', hex: '#8A1538' },
                  { name: 'Emerald Green', hex: '#059669' },
                  { name: 'Royal Indigo', hex: '#4f46e5' },
                  { name: 'Crimson Red', hex: '#dc2626' },
                  { name: 'Slate Black', hex: '#0f172a' },
                ].map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setTheme({ ...theme, primaryColor: swatch.hex })}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition"
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            {/* Brand Logo URL */}
            <div className="space-y-2">
              <label className="block text-stone-800 font-extrabold">ব্র্যান্ড লোগো ইউআরএল (Brand Logo URL)</label>
              <input
                type="text"
                value={theme.brandLogo}
                onChange={(e) => setTheme({ ...theme, brandLogo: e.target.value })}
                placeholder="[suspicious link removed]"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-800"
              />
            </div>
          </div>

          {/* Announcement Bar Settings (Step 178) */}
          <div className="border-t pt-5 space-y-4 text-xs font-bold">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-stone-900">📣 টপ এনাউন্সমেন্ট বার (Announcement Bar)</h4>
                <p className="text-[10px] text-stone-400 font-mono">ওয়েবসাইটের একদম উপরে গুরুত্বপূর্ণ নোটিশ বা অফার দেখান</p>
              </div>
              <input
                type="checkbox"
                checked={theme.showAnnouncement}
                onChange={(e) => setTheme({ ...theme, showAnnouncement: e.target.checked })}
                className="w-5 h-5 text-[#8A1538] rounded cursor-pointer"
              />
            </div>

            {theme.showAnnouncement && (
              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-stone-700 mb-1">এনাউন্সমেন্ট টেক্সট</label>
                  <input
                    type="text"
                    value={theme.announcementText}
                    onChange={(e) => setTheme({ ...theme, announcementText: e.target.value })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl bg-white font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: HEADER & NAVIGATION (Step 179) */}
      {subTab === 'header' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-6 text-xs font-bold">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            🧭 হেডার নেভিগেশন ও হেল্পলাইন
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-stone-800 mb-1">হেল্পলাইন বা ওয়াটসঅ্যাপ ফোন নম্বর</label>
              <input
                type="text"
                value={theme.helplinePhone}
                onChange={(e) => setTheme({ ...theme, helplinePhone: e.target.value })}
                className="w-full max-w-md px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-800"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <h4 className="font-extrabold text-stone-900">📌 স্টিকি হেডার (Sticky Header)</h4>
                <p className="text-[10px] text-stone-400 font-mono">স্ক্স্রোল করার সময় হেডার নেভিগেশন বার উপরে ফিক্সড থাকবে</p>
              </div>
              <input
                type="checkbox"
                checked={theme.stickyHeader}
                onChange={(e) => setTheme({ ...theme, stickyHeader: e.target.checked })}
                className="w-5 h-5 text-[#8A1538] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FOOTER SETTINGS (Step 186) */}
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

            <div className="md:col-span-2">
              <label className="block text-stone-800 mb-1">ফেসবুক পেজ ইউআরএল (Facebook Page URL)</label>
              <input
                type="text"
                value={theme.facebookUrl}
                onChange={(e) => setTheme({ ...theme, facebookUrl: e.target.value })}
                placeholder="[suspicious link removed]"
                className="w-full px-3.5 py-2 border border-stone-300 rounded-xl font-mono text-stone-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CUSTOM CSS (Step 187) */}
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
              className="w-full p-3 font-mono text-xs border border-stone-300 rounded-xl bg-slate-900 text-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}