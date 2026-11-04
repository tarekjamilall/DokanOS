'use client';

import React, { useState } from 'react';

type SectionBlock = {
  id: string;
  type:
    | 'hero-banner'
    | 'category-showcase'
    | 'product-grid'
    | 'promo-banner'
    | 'pas-block'
    | 'bundle-builder'
    | 'faq-accordion'
    | 'reviews-strip';
  title: string;
  enabled: boolean;
  settings?: any;
};

type BlockPageBuilderProps = {
  domain?: string;
  pageSlug?: string;
  initialBlocks?: SectionBlock[];
  onSave?: (blocks: SectionBlock[]) => void;
};

export default function BlockPageBuilder({
  domain = '',
  pageSlug = 'home',
  initialBlocks,
  onSave,
}: BlockPageBuilderProps) {
  const [blocks, setBlocks] = useState<SectionBlock[]>(
    initialBlocks || [
      { id: 'b1', type: 'hero-banner', title: '1. Hero Banner Showcase (হিরো স্লাইডার)', enabled: true },
      { id: 'b2', type: 'category-showcase', title: '2. Category Showcase (ক্যাটাগরি বাবলস)', enabled: true },
      { id: 'b3', type: 'product-grid', title: '3. Product Display Grid (প্রোডাক্ট গ্রিড)', enabled: true },
      { id: 'b4', type: 'pas-block', title: '4. PAS Problem-Solution Block (সমস্যা ও সমাধান)', enabled: false },
      { id: 'b5', type: 'bundle-builder', title: '5. Quantity Bundle Builder (কোয়ান্টিটি বান্ডেল)', enabled: false },
      { id: 'b6', type: 'faq-accordion', title: '6. FAQ Accordion (প্রশ্ন ও উত্তর)', enabled: true },
      { id: 'b7', type: 'reviews-strip', title: '7. Customer Reviews & Social Proof', enabled: true },
    ]
  );

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Toggle Block On/Off
  const handleToggle = (id: string) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  // Move Block Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setBlocks(updated);
  };

  // Move Block Down
  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setBlocks(updated);
  };

  // Save Blocks to Payload CMS / API
  const handleSaveBlocks = async () => {
    setSaving(true);
    try {
      if (onSave) {
        onSave(blocks);
      }
      showToast('🎉 পেজ ব্লক লেআউট সফলভাবে সেভ ও পাবলিশ করা হয়েছে!');
    } catch (err) {
      showToast('⚠️ ব্লক সেভ করতে সমস্যা হয়েছে!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-6 font-sans text-[#3B3433]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8A1538] text-white text-xs font-black px-5 py-3.5 rounded-2xl shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-stone-900">
              🧩 Dynamic Section Block Builder ({pageSlug.toUpperCase()})
            </h3>
            <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              LIVE PREVIEW READY
            </span>
          </div>
          <p className="text-[11px] text-stone-400">
            টগল বাটন দিয়ে সেকশন অন/অফ করুন এবং Up/Down বাটন দিয়ে ব্লকের সিকোয়েন্স পরিবর্তন করুন
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveBlocks}
          className="px-5 py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
        >
          {saving ? 'সেভ হচ্ছে...' : '💾 সেকশন ব্লক সেভ করুন'}
        </button>
      </div>

      {/* Block List */}
      <div className="space-y-3">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className={`p-4 rounded-2xl border-2 transition flex items-center justify-between gap-4 ${
              block.enabled
                ? 'border-stone-300 bg-white shadow-2xs'
                : 'border-stone-200 bg-stone-50/70 opacity-60'
            }`}
          >
            {/* Block Name & Status */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-black text-stone-400">#{idx + 1}</span>
              <div>
                <h4 className="font-extrabold text-xs text-stone-900">{block.title}</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                    block.enabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {block.enabled ? '✓ Enabled on Storefront' : '✕ Disabled'}
                </span>
              </div>
            </div>

            {/* Controls: Reorder & Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMoveUp(idx)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs disabled:opacity-30 cursor-pointer"
                title="উপরে তুলুন"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={idx === blocks.length - 1}
                onClick={() => handleMoveDown(idx)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs disabled:opacity-30 cursor-pointer"
                title="নিচে নামান"
              >
                ▼
              </button>

              {/* On/Off Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggle(block.id)}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                  block.enabled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                }`}
              >
                {block.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}