'use client';

import React, { useState, useEffect } from 'react';

type SettingsTabProps = {
  domain?: string;
};

export default function SettingsTab({ domain = '' }: SettingsTabProps) {
  const [activeSubSection, setActiveSubSection] = useState<'pixels' | 'api' | 'security'>('pixels');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pixel & Tracking States
  const [metaPixelId, setMetaPixelId] = useState('');
  const [facebookCapiToken, setFacebookCapiToken] = useState('');
  const [gtmContainerId, setGtmContainerId] = useState('');
  const [ga4MeasurementId, setGa4MeasurementId] = useState('');

  // API Tokens State
  const [apiTokens, setApiTokens] = useState<Array<{ name: string; key: string; createdAt: string }>>([]);
  const [newTokenName, setNewTokenName] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Existing Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/merchant/settings?domain=${domain}`);
        const data = await res.json();
        if (res.ok && data.success && data.settings) {
          setMetaPixelId(data.settings.metaPixelId || '');
          setFacebookCapiToken(data.settings.facebookCapiToken || '');
          setGtmContainerId(data.settings.gtmContainerId || '');
          setGa4MeasurementId(data.settings.ga4MeasurementId || '');
          setApiTokens(data.settings.apiTokens || []);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    if (domain) fetchSettings();
  }, [domain]);

  // Save Tracking Pixels
  const handleSavePixels = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          settings: {
            metaPixelId,
            facebookCapiToken,
            gtmContainerId,
            ga4MeasurementId,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('🎉 মার্কেটিং পিক্সেল ও ট্র্যাকিং আইডি ডাটাবেসে সেভ হয়েছে!');
      } else {
        showToast('⚠️ সেটিংস সেভ করতে ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      showToast('⚠️ নেটওয়ার্ক এরর!');
    } finally {
      setLoading(false);
    }
  };

  // Generate New API Token (Step 207)
  const handleGenerateApiToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return showToast('⚠️ টোকেনের একটি নাম দিন (যেমন: Zapier / POS)');

    const generatedKey = `sk_live_${Math.random().toString(36).substring(2)}${Date.now()}`;
    const tokenObj = {
      name: newTokenName.trim(),
      key: generatedKey,
      createdAt: new Date().toLocaleDateString('bn-BD'),
    };

    try {
      const res = await fetch('/api/merchant/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          newApiToken: tokenObj,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApiTokens([tokenObj, ...apiTokens]);
        setNewTokenName('');
        showToast('🔑 নতুন সিক্রেট এপিআই টোকেন তৈরি হয়েছে!');
      }
    } catch (err) {
      showToast('⚠️ এপিআই টোকেন তৈরি করতে সমস্যা হয়েছে!');
    }
  };

  // Copy API Key
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast('📋 এপিআই কি ক্লিপবোর্ডে কপি করা হয়েছে!');
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
            <h2 className="text-base font-black text-[#3B3433]">⚙️ Store Settings, Pixels & API Keys</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              ADVANCED SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Meta Facebook Pixel, Conversion API, GTM, and Secret API Authorization Tokens
          </p>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubSection('pixels')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubSection === 'pixels'
              ? 'bg-[#8A1538] text-white font-black shadow-2xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
          }`}
        >
          🎯 ১. মার্কেটিং ও ট্র্যাকিং পিক্সেল
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('api')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubSection === 'api'
              ? 'bg-[#8A1538] text-white font-black shadow-2xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
          }`}
        >
          🔑 ২. এপিআই টোকেন (Integrations)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection('security')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubSection === 'security'
              ? 'bg-[#8A1538] text-white font-black shadow-2xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
          }`}
        >
          🛡️ ৩. স্টোর সিকিউরিটি
        </button>
      </div>

      {/* SECTION 1: MARKETING & TRACKING PIXELS (Step 202) */}
      {activeSubSection === 'pixels' && (
        <form onSubmit={handleSavePixels} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-6 text-xs font-bold">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            🎯 মেটা (Facebook) পিক্সেল ও ট্র্যাকিং আইডি
          </h3>

          <div className="space-y-4 max-w-2xl">
            {/* Meta Pixel ID */}
            <div>
              <label className="block text-stone-800 mb-1">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 123456789012345"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-800"
              />
              <p className="text-[10px] text-stone-400 font-mono mt-1">
                স্টোরফ্রন্টে স্বয়ংক্রিয়ভাবে PageView, ViewContent, AddToCart, InitiateCheckout, এবং Purchase ইভেন্ট ফায়ার হবে।
              </p>
            </div>

            {/* Facebook CAPI Token */}
            <div>
              <label className="block text-stone-800 mb-1">
                Facebook Conversion API (CAPI) Access Token
              </label>
              <textarea
                rows={3}
                value={facebookCapiToken}
                onChange={(e) => setFacebookCapiToken(e.target.value)}
                placeholder="e.g. EAAG..."
                className="w-full p-3 border border-stone-300 rounded-xl font-mono text-xs text-stone-800"
              />
            </div>

            {/* Google Tag Manager Container ID */}
            <div>
              <label className="block text-stone-800 mb-1">
                Google Tag Manager (GTM) Container ID
              </label>
              <input
                type="text"
                value={gtmContainerId}
                onChange={(e) => setGtmContainerId(e.target.value)}
                placeholder="e.g. GTM-XXXXXXX"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-800"
              />
            </div>

            {/* GA4 Measurement ID */}
            <div>
              <label className="block text-stone-800 mb-1">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                value={ga4MeasurementId}
                onChange={(e) => setGa4MeasurementId(e.target.value)}
                placeholder="e.g. G-XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
            >
              {loading ? 'সেভ হচ্ছে...' : '💾 ট্র্যাকিং পিক্সেল সেভ করুন'}
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: API TOKENS (Step 207) */}
      {activeSubSection === 'api' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-6 text-xs font-bold">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            🔑 থার্ড-পার্টি ইন্টিগ্রেশন এপিআই কি (API Secret Tokens)
          </h3>

          {/* Token Generator Form */}
          <form onSubmit={handleGenerateApiToken} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 max-w-xl">
            <label className="block text-stone-800 font-extrabold">নতুন এপিআই টোকেন তৈরি করুন</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="ইন্টিগ্রেশনের নাম লিখুন (যেমন: Zapier / Custom POS)"
                className="flex-1 px-3.5 py-2 border border-stone-300 rounded-xl bg-white font-extrabold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#8A1538] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
              >
                + টোকেন তৈরি করুন
              </button>
            </div>
          </form>

          {/* API Keys Table */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">
              সক্রিয় এপিআই টোকেন তালিকা ({apiTokens.length})
            </span>

            {apiTokens.length === 0 ? (
              <p className="text-stone-400 text-xs italic">এখনো কোনো এপিআই টোকেন তৈরি করা হয়নি।</p>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden">
                {apiTokens.map((token, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between bg-white hover:bg-stone-50">
                    <div>
                      <span className="font-extrabold text-stone-900 text-xs block">{token.name}</span>
                      <span className="font-mono text-[11px] text-stone-500">{token.key}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(token.key)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-[10px] rounded-lg cursor-pointer"
                    >
                      📋 Copy Key
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: STORE SECURITY */}
      {activeSubSection === 'security' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 text-xs font-bold">
          <h3 className="font-extrabold text-sm text-stone-900 border-b pb-3">
            🛡️ স্টোর সিকিউরিটি ও এডমিন অ্যাকসেস
          </h3>
          <p className="text-stone-500">
            মার্চেন্ট অ্যাকাউন্ট সুরক্ষা এবং টু-ফ্যাক্টর অথেনটিকেশন অপশন।
          </p>
        </div>
      )}
    </div>
  );
}