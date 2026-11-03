'use client';

import React, { useState } from 'react';

// 6 Core E-Commerce Block Types
export type BlockType =
  | 'heroBanner'
  | 'productGrid'
  | 'productSpotlight'
  | 'featureGrid'
  | 'testimonials'
  | 'faqAccordion';

export type Block = {
  id: string;
  type: BlockType;
  data: any;
};

type BlockPageBuilderProps = {
  domain: string;
  onBack?: () => void;
  onSaveSuccess?: () => void;
};

export default function BlockPageBuilder({ domain, onBack, onSaveSuccess }: BlockPageBuilderProps) {
  // Page Metadata
  const [pageTitle, setPageTitle] = useState('ইদ অফার মেগা ডিল');
  const [pageSlug, setPageSlug] = useState('eid-offer-mega-deal');
  
  // Responsive Canvas State ('desktop' | 'tablet' | 'mobile')
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Selected Block Index for Property Editing
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Blocks Stack State (Step 147)
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'b-1',
      type: 'heroBanner',
      data: {
        pillBadge: '🔥 সীমিত সময়ের অফার',
        headline: 'ইদ কালেকশনে পাচ্ছেন সর্বোচ্চ ৫০% পর্যন্ত ছাড়!',
        subheadline: 'প্রিমিয়াম কোয়ালিটির এক্সক্লুসিভ ফ্যাশন আউটফিট ও এক্সেসরিজ সরাসরি হোম ডেলিভারিতে পান।',
        bgImage: '[suspicious link removed]',
        buttonText: 'অর্ডার করুন এখনই ➔',
        buttonLink: '#products',
      },
    },
    {
      id: 'b-2',
      type: 'productSpotlight',
      data: {
        headline: '⚡ ইদ মেগা হট ডিল (Featured Product)',
        productTitle: 'রয়্যাল এমব্রয়ডারি কটোন পাঞ্জাবি সেট',
        price: '২৪৫০',
        originalPrice: '৩৪৫০',
        image: '[suspicious link removed]',
        countdownMinutes: 45,
        fomoText: 'মাত্র ১২ টি প্রোডাক্ট স্টকে আছে!',
      },
    },
    {
      id: 'b-3',
      type: 'featureGrid',
      data: {
        features: [
          { icon: '🚚', title: 'দ্রুত ডেলিভারি', desc: 'ঢাকার ভেতরে ২৪ ঘন্টায় ডেলিভারি' },
          { icon: '💯', title: '১০০% অরিজিনাল', desc: 'পণ্য দেখে পেমেন্ট করার সুযোগ' },
          { icon: '🔄', title: 'সহজ রিটার্ন', desc: '৭ দিনের মধ্যে এক্সচেঞ্জ সুবিধা' },
          { icon: '📞', title: '২৪/৭ কাস্টমার সাপোর্ট', desc: 'যেকোনো প্রয়োজনে আমাদের কল করুন' },
        ],
      },
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Add New Block to Canvas Stack
  const handleAddBlock = (type: BlockType) => {
    let defaultData: any = {};

    if (type === 'heroBanner') {
      defaultData = {
        pillBadge: '✨ নতুন অফার',
        headline: 'আপনার আকর্ষণীয় শিরোনাম এখানে লিখুন',
        subheadline: 'পণ্যের অফার ও বিস্তারিত বিবরণ এখানে যোগ করুন।',
        bgImage: '',
        buttonText: 'এখনই কিনুন',
        buttonLink: '#',
      };
    } else if (type === 'productGrid') {
      defaultData = {
        title: '🔥 আমাদের ট্রেন্ডিং কালেকশন',
        category: 'all',
        columns: 3,
      };
    } else if (type === 'productSpotlight') {
      defaultData = {
        headline: '⚡ ধামাকা অফার',
        productTitle: 'প্রোডাক্টের নাম',
        price: '১২০০',
        originalPrice: '১৬০০',
        countdownMinutes: 60,
        fomoText: 'স্টক সীমিত!',
      };
    } else if (type === 'featureGrid') {
      defaultData = {
        features: [
          { icon: '🚚', title: 'ক্যাশ অন ডেলিভারি', desc: 'সারা বাংলাদেশে COD' },
          { icon: '🛡️', title: 'গ্যারান্টি', desc: 'কোয়ালিটি ১০০% নিশ্চিত' },
        ],
      };
    } else if (type === 'testimonials') {
      defaultData = {
        title: '💬 কাস্টমারদের পজিটিভ রিভিউ',
        reviews: [
          { name: 'তানভীর হাসান', comment: 'প্রোডাক্টের কোয়ালিটি অনেক ভালো ছিল!', rating: 5 },
        ],
      };
    } else if (type === 'faqAccordion') {
      defaultData = {
        title: '❓ সাধারণ জিজ্ঞাসিত প্রশ্নাবলি (FAQ)',
        faqs: [
          { q: 'ডেলিভারি চার্জ কত?', a: 'ঢাকার ভেতরে ৳৬০, ঢাকার বাইরে ৳১২০।' },
        ],
      };
    }

    const newBlock: Block = {
      id: `b-${Date.now()}`,
      type,
      data: defaultData,
    };

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    showToast('✨ নতুন ব্লক ক্যানভাসে যোগ করা হয়েছে!');
  };

  // Move Block Up/Down (Step 148)
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    )
      return;

    const updated = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
  };

  // Delete Block
  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  // Update Selected Block Data (Step 149)
  const updateSelectedBlockData = (key: string, value: any) => {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlockId ? { ...b, data: { ...b.data, [key]: value } } : b
      )
    );
  };

  // Save Page to MongoDB API (Step 151)
  const handleSavePage = async () => {
    if (!pageTitle.trim()) return showToast('⚠️ অনুগ্রহ করে পেজ টাইটেল লিখুন।');

    setSaving(true);
    try {
      const res = await fetch('/api/merchant/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          title: pageTitle,
          slug: pageSlug || pageTitle.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          content: JSON.stringify(blocks), // JSON blocks schema
          status: 'published',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('🎉 ল্যান্ডিং পেজ সফলভাবে ডাটাবেসে সেভ ও পাবলিশ হয়েছে!');
        if (onSaveSuccess) onSaveSuccess();
      } else {
        showToast(data.error || '⚠️ সেভ করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      showToast('⚠️ নেটওয়ার্ক এরর!');
    } finally {
      setSaving(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-stone-100 font-sans text-stone-900 -m-3 sm:-m-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Top Navbar Toolbar */}
      <div className="bg-white border-b border-stone-200 px-4 py-2.5 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              type="button"
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs rounded-xl"
            >
              ◀ ফিরে যান
            </button>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="font-black text-sm text-stone-900 bg-transparent border-b border-dashed border-stone-400 focus:border-[#8A1538] focus:outline-none px-1"
              placeholder="পেজ টাইটেল লিখুন"
            />
            <span className="text-stone-300">/</span>
            <span className="text-xs font-mono text-[#8A1538] font-bold">/{pageSlug}</span>
          </div>
        </div>

        {/* Responsive Device View Toggle (Step 150) */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDeviceView('desktop')}
            className={`px-3 py-1 rounded-lg transition ${
              deviceView === 'desktop' ? 'bg-[#8A1538] text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            🖥️ Desktop
          </button>
          <button
            type="button"
            onClick={() => setDeviceView('tablet')}
            className={`px-3 py-1 rounded-lg transition ${
              deviceView === 'tablet' ? 'bg-[#8A1538] text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            📟 Tablet
          </button>
          <button
            type="button"
            onClick={() => setDeviceView('mobile')}
            className={`px-3 py-1 rounded-lg transition ${
              deviceView === 'mobile' ? 'bg-[#8A1538] text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            📱 Mobile
          </button>
        </div>

        {/* Save & Publish Action */}
        <button
          type="button"
          disabled={saving}
          onClick={handleSavePage}
          className="px-5 py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-black text-xs rounded-xl shadow transition"
        >
          {saving ? 'সেভ হচ্ছে...' : '💾 সেভ ও পাবলিশ করুন'}
        </button>
      </div>

      {/* Main Split Screen Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Controls & Block Inserter Drawer (w-80 or w-96) */}
        <div className="w-80 sm:w-96 bg-white border-r border-stone-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Add New Block Selector */}
          <div className="p-4 border-b border-stone-100 bg-stone-50 space-y-2">
            <span className="text-[10px] font-black text-[#8A1538] uppercase tracking-wider block">
              ➕ ব্লক যোগ করুন (BLOCK INSERTER)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleAddBlock('heroBanner')}
                className="p-2 bg-white hover:bg-rose-50 border border-stone-200 text-stone-800 rounded-xl text-left"
              >
                🖼️ Hero Banner
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock('productSpotlight')}
                className="p-2 bg-white hover:bg-rose-50 border border-stone-200 text-stone-800 rounded-xl text-left"
              >
                ⚡ Spotlight Deal
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock('featureGrid')}
                className="p-2 bg-white hover:bg-rose-50 border border-stone-200 text-stone-800 rounded-xl text-left"
              >
                ✨ Trust Badges
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock('testimonials')}
                className="p-2 bg-white hover:bg-rose-50 border border-stone-200 text-stone-800 rounded-xl text-left"
              >
                💬 Testimonials
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock('faqAccordion')}
                className="p-2 bg-white hover:bg-rose-50 border border-stone-200 text-stone-800 rounded-xl text-left"
              >
                ❓ FAQ Accordion
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock('productGrid')}
                className="p-2 bg-white hover:bg-rose-50 border border-stone-200 text-stone-800 rounded-xl text-left"
              >
                🛍️ Product Grid
              </button>
            </div>
          </div>

          {/* Block Stack Reorder List */}
          <div className="p-4 border-b border-stone-100 space-y-2">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
              📋 ক্যানভাস ব্লক লেআউট (LAYOUT STACK - {blocks.length})
            </span>
            <div className="space-y-1.5">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                    selectedBlockId === block.id
                      ? 'bg-rose-50/80 border-[#8A1538] font-black text-[#8A1538]'
                      : 'bg-stone-50 border-stone-200 font-extrabold text-stone-800'
                  }`}
                >
                  <span className="truncate">
                    {index + 1}. {block.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(index, 'up');
                      }}
                      className="p-1 hover:bg-stone-200 rounded text-[10px]"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(index, 'down');
                      }}
                      className="p-1 hover:bg-stone-200 rounded text-[10px]"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="p-1 hover:bg-rose-100 text-rose-600 rounded text-[10px]"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block Property Live Controls Panel (Step 149) */}
          <div className="p-4 flex-1 space-y-3">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
              ⚙️ ব্লক সেটিংস এডিটর (LIVE PROPERTY EDITOR)
            </span>

            {!selectedBlock ? (
              <div className="text-center p-6 text-stone-400 text-xs font-bold">
                ক্যানভাস থেকে এডিট করতে যেকোনো একটি ব্লকের ওপর চাপ দিন।
              </div>
            ) : (
              <div className="space-y-3 text-xs font-bold">
                {selectedBlock.type === 'heroBanner' && (
                  <>
                    <div>
                      <label className="block text-stone-600 mb-1">পিল ব্যাজ (Badge Text)</label>
                      <input
                        type="text"
                        value={selectedBlock.data.pillBadge || ''}
                        onChange={(e) => updateSelectedBlockData('pillBadge', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">হেডলাইন (Headline)</label>
                      <textarea
                        rows={2}
                        value={selectedBlock.data.headline || ''}
                        onChange={(e) => updateSelectedBlockData('headline', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">সাব-হেডলাইন (Subheadline)</label>
                      <textarea
                        rows={3}
                        value={selectedBlock.data.subheadline || ''}
                        onChange={(e) => updateSelectedBlockData('subheadline', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">ব্যাকগ্রাউন্ড ইমেজ URL</label>
                      <input
                        type="text"
                        value={selectedBlock.data.bgImage || ''}
                        onChange={(e) => updateSelectedBlockData('bgImage', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg font-mono text-[10px]"
                      />
                    </div>
                  </>
                )}

                {selectedBlock.type === 'productSpotlight' && (
                  <>
                    <div>
                      <label className="block text-stone-600 mb-1">অফার হেডিং (Headline)</label>
                      <input
                        type="text"
                        value={selectedBlock.data.headline || ''}
                        onChange={(e) => updateSelectedBlockData('headline', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">প্রোডাক্টের নাম</label>
                      <input
                        type="text"
                        value={selectedBlock.data.productTitle || ''}
                        onChange={(e) => updateSelectedBlockData('productTitle', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-600 mb-1">বিক্রয় মূল্য (৳)</label>
                        <input
                          type="text"
                          value={selectedBlock.data.price || ''}
                          onChange={(e) => updateSelectedBlockData('price', e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1">আগের মূল্য (৳)</label>
                        <input
                          type="text"
                          value={selectedBlock.data.originalPrice || ''}
                          onChange={(e) => updateSelectedBlockData('originalPrice', e.target.value)}
                          className="w-full p-2 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">FOMO ওয়ার্নিং টেক্সট</label>
                      <input
                        type="text"
                        value={selectedBlock.data.fomoText || ''}
                        onChange={(e) => updateSelectedBlockData('fomoText', e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Canvas Preview Container */}
        <div className="flex-1 bg-stone-200/60 p-4 sm:p-8 overflow-y-auto flex justify-center items-start">
          <div
            className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden ${
              deviceView === 'mobile'
                ? 'w-[375px] rounded-[36px] border-[8px] border-stone-900 min-h-[667px]'
                : deviceView === 'tablet'
                ? 'w-[768px] rounded-2xl border border-stone-300 min-h-[800px]'
                : 'w-full max-w-5xl rounded-2xl border border-stone-300 min-h-[900px]'
            }`}
          >
            {/* Live Rendered Canvas Sections */}
            <div className="divide-y divide-stone-100">
              {blocks.map((block) => {
                const isSelected = selectedBlockId === block.id;

                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`relative cursor-pointer transition ${
                      isSelected ? 'ring-2 ring-[#8A1538] ring-inset' : 'hover:opacity-95'
                    }`}
                  >
                    {/* Render Section Block Components */}
                    {block.type === 'heroBanner' && (
                      <div
                        className="bg-slate-900 text-white p-8 sm:p-12 text-center bg-cover bg-center relative"
                        style={{
                          backgroundImage: block.data.bgImage ? `url(${block.data.bgImage})` : undefined,
                        }}
                      >
                        <div className="absolute inset-0 bg-black/60 z-0" />
                        <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
                          {block.data.pillBadge && (
                            <span className="px-3 py-1 bg-[#8A1538] text-white text-[11px] font-extrabold rounded-full inline-block">
                              {block.data.pillBadge}
                            </span>
                          )}
                          <h1 className="text-2xl sm:text-4xl font-black">{block.data.headline}</h1>
                          <p className="text-xs sm:text-sm text-stone-200">{block.data.subheadline}</p>
                          <button
                            type="button"
                            className="px-6 py-2.5 bg-[#8A1538] text-white text-xs font-black rounded-xl shadow-lg mt-2"
                          >
                            {block.data.buttonText || 'এখনই অর্ডার করুন'}
                          </button>
                        </div>
                      </div>
                    )}

                    {block.type === 'productSpotlight' && (
                      <div className="p-6 sm:p-8 bg-amber-50/50">
                        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center">
                          {block.data.image && (
                            <img
                              src={block.data.image}
                              alt="Spotlight"
                              className="w-36 h-36 object-cover rounded-xl shrink-0"
                            />
                          )}
                          <div className="space-y-2 text-left flex-1">
                            <span className="text-xs font-black text-rose-600 block">
                              {block.data.headline}
                            </span>
                            <h3 className="font-extrabold text-sm text-stone-900">
                              {block.data.productTitle}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-[#8A1538]">
                                ৳{block.data.price}
                              </span>
                              {block.data.originalPrice && (
                                <span className="text-xs text-stone-400 line-through">
                                  ৳{block.data.originalPrice}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-amber-800 font-extrabold">
                              🔥 {block.data.fomoText}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {block.type === 'featureGrid' && (
                      <div className="p-6 bg-white grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        {(block.data.features || []).map((feat: any, idx: number) => (
                          <div key={idx} className="p-3 bg-stone-50 rounded-xl space-y-1">
                            <span className="text-2xl block">{feat.icon}</span>
                            <h4 className="font-extrabold text-xs text-stone-900">{feat.title}</h4>
                            <p className="text-[10px] text-stone-500">{feat.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}