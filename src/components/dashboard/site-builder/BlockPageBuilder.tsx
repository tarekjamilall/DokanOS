'use client';

import React, { useState } from 'react';

// Section Block Data Types
export type BlankElement = {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'video';
  content: string;
  url?: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  textColor?: string;
  btnBg?: string;
  btnTextColor?: string;
  alignment?: 'left' | 'center' | 'right';
};

export type SectionBlock = {
  id: string;
  type:
    | 'hero-banner'
    | 'category-showcase'
    | 'product-grid'
    | 'pas-block'
    | 'comparison-matrix'
    | 'bundle-builder'
    | 'faq-accordion'
    | 'reviews-strip'
    | 'blank-section';
  title: string;
  enabled: boolean;
  bgColor?: string;
  textColor?: string;
  paddingY?: 'py-4' | 'py-8' | 'py-12' | 'py-16';
  layoutType?: '1-col' | '2-col' | 'split';
  elements?: BlankElement[];
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
      { id: 'b1', type: 'hero-banner', title: '1. Hero Banner Showcase (হিরো স্লাইডার)', enabled: true, bgColor: '#0f172a', textColor: '#ffffff', paddingY: 'py-8' },
      { id: 'b2', type: 'category-showcase', title: '2. Category Showcase (ক্যাটাগরি বাবলস)', enabled: true, bgColor: '#ffffff', textColor: '#1c1917', paddingY: 'py-8' },
      { id: 'b3', type: 'product-grid', title: '3. Product Display Grid (প্রোডাক্ট গ্রিড)', enabled: true, bgColor: '#ffffff', textColor: '#1c1917', paddingY: 'py-8' },
      { id: 'b4', type: 'pas-block', title: '4. PAS Problem-Solution Block (সমস্যা ও সমাধান)', enabled: false, bgColor: '#422006', textColor: '#ffffff', paddingY: 'py-12' },
      { id: 'b5', type: 'faq-accordion', title: '5. FAQ Accordion (প্রশ্ন ও উত্তর)', enabled: true, bgColor: '#ffffff', textColor: '#1c1917', paddingY: 'py-8' },
      { id: 'b6', type: 'reviews-strip', title: '6. Customer Reviews & Social Proof', enabled: true, bgColor: '#1c1917', textColor: '#ffffff', paddingY: 'py-12' },
    ]
  );

  const [activeEditingBlockId, setActiveEditingBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle Block ON/OFF
  const handleToggle = (id: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
  };

  // Reorder Blocks
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
  };

  // Add New Flexible Blank Section
  const handleAddBlankSection = () => {
    const newBlank: SectionBlock = {
      id: `blank-${Date.now()}`,
      type: 'blank-section',
      title: `✨ কাস্টম ব্ল্যাঙ্ক সেকশন #${blocks.length + 1}`,
      enabled: true,
      bgColor: '#ffffff',
      textColor: '#1c1917',
      paddingY: 'py-8',
      layoutType: '1-col',
      elements: [
        { id: `el-1`, type: 'heading', content: 'এখানে আপনার কাস্টম হেডিং লিখুন', fontSize: 'xl', textColor: '#8A1538', alignment: 'center' },
        { id: `el-2`, type: 'text', content: 'এখানে প্রডাক্ট বা সার্ভিসের বিবরণ অথবা অফার সম্পর্কে বিষদ বর্ণনা লিখুন।', fontSize: 'base', textColor: '#44403c', alignment: 'center' },
        { id: `el-3`, type: 'button', content: 'এখনই অর্ডার করুন 🛒', url: '/#products', btnBg: '#8A1538', btnTextColor: '#ffffff', alignment: 'center' },
      ],
    };

    setBlocks([...blocks, newBlank]);
    setActiveEditingBlockId(newBlank.id);
    showToast('✨ নতুন ফ্লেক্সিবল ব্ল্যাঙ্ক সেকশন যোগ করা হয়েছে!');
  };

  // Delete Block
  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (activeEditingBlockId === id) setActiveEditingBlockId(null);
    showToast('🗑️ সেকশন ব্লক মুছে ফেলা হয়েছে');
  };

  // Blank Section Elements Handlers
  const handleAddElementToBlank = (blockId: string, elType: BlankElement['type']) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id !== blockId) return b;
        const currentElements = b.elements || [];
        const newEl: BlankElement =
          elType === 'heading'
            ? { id: `el-${Date.now()}`, type: 'heading', content: 'নতুন হেডিং টেক্সট', fontSize: 'xl', textColor: '#1c1917', alignment: 'left' }
            : elType === 'text'
            ? { id: `el-${Date.now()}`, type: 'text', content: 'এখানে প্যারাগ্রাফের বিবরণ লিখুন...', fontSize: 'base', textColor: '#44403c', alignment: 'left' }
            : elType === 'image'
            ? { id: `el-${Date.now()}`, type: 'image', content: '[suspicious link removed]', alignment: 'center' }
            : elType === 'button'
            ? { id: `el-${Date.now()}`, type: 'button', content: 'অর্ডার করতে ক্লিক করুন', url: '/#products', btnBg: '#8A1538', btnTextColor: '#ffffff', alignment: 'center' }
            : { id: `el-${Date.now()}`, type: 'video', content: '[suspicious link removed]', alignment: 'center' };

        return { ...b, elements: [...currentElements, newEl] };
      })
    );
  };

  const handleUpdateElement = (blockId: string, elId: string, field: keyof BlankElement, value: any) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id !== blockId || !b.elements) return b;
        const updatedEls = b.elements.map((el) => (el.id === elId ? { ...el, [field]: value } : el));
        return { ...b, elements: updatedEls };
      })
    );
  };

  const handleRemoveElement = (blockId: string, elId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id !== blockId || !b.elements) return b;
        return { ...b, elements: b.elements.filter((el) => el.id !== elId) };
      })
    );
  };

  // Save Blocks Layout to Database API
  const handleSaveBlocks = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/merchant/page-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, blocks }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onSave) onSave(blocks);
        showToast('🎉 সেকশন ব্লক লেআউট ও কালার সেটিংস সফলভাবে সেভ হয়েছে!');
      } else {
        showToast('⚠️ ব্লক সেভ করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      showToast('⚠️ নেটওয়ার্ক এরর!');
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

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-stone-900">
              🧩 Dynamic Page & Flexible Block Builder ({pageSlug.toUpperCase()})
            </h3>
            <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              V2.0 LIVE
            </span>
          </div>
          <p className="text-[11px] text-stone-400">
            ব্লক অন/অফ করুন, সিকোয়েন্স পরিবর্তন করুন এবং কালার, সাইজ ও ফ্লেক্সিবল কন্টেন্ট এডিট করুন
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddBlankSection}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
          >
            + নতুন ব্ল্যাঙ্ক সেকশন
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveBlocks}
            className="px-5 py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
          >
            {saving ? 'সেভ হচ্ছে...' : '💾 পেজ ব্লক সেভ করুন'}
          </button>
        </div>
      </div>

      {/* Block List Container */}
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const isEditing = activeEditingBlockId === block.id;

          return (
            <div
              key={block.id}
              className={`rounded-2xl border-2 transition overflow-hidden ${
                block.enabled
                  ? 'border-stone-300 bg-white shadow-2xs'
                  : 'border-stone-200 bg-stone-50/70 opacity-60'
              }`}
            >
              {/* Block Header Strip */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/60 border-b border-stone-200/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-black text-stone-400">#{idx + 1}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-2">
                      <span>{block.title}</span>
                      {block.type === 'blank-section' && (
                        <span className="text-[9px] bg-rose-100 text-[#8A1538] px-2 py-0.5 rounded-full font-bold">
                          Flexible Blank Block
                        </span>
                      )}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                        block.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {block.enabled ? '✓ Visible on Site' : '✕ Hidden'}
                    </span>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveEditingBlockId(isEditing ? null : block.id)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition border cursor-pointer ${
                      isEditing ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {isEditing ? '⚙️ এডিটর বন্ধ করুন' : '✏️ কালার ও স্টাইল এডিট'}
                  </button>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveBlock(idx, 'up')}
                    className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs disabled:opacity-30 cursor-pointer"
                    title="উপরে তুলুন"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={idx === blocks.length - 1}
                    onClick={() => handleMoveBlock(idx, 'down')}
                    className="w-8 h-8 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs disabled:opacity-30 cursor-pointer"
                    title="নিচে নামান"
                  >
                    ▼
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(block.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                      block.enabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-stone-300 text-stone-800 hover:bg-stone-400'
                    }`}
                  >
                    {block.enabled ? 'ON' : 'OFF'}
                  </button>

                  {block.type === 'blank-section' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block.id)}
                      className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold text-xs cursor-pointer"
                      title="ডিলিট করুন"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Block Properties & Style Settings Panel */}
              {isEditing && (
                <div className="p-5 bg-stone-100/70 border-t border-stone-200 space-y-5 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Background Color Picker */}
                    <div>
                      <label className="block text-stone-700 mb-1">ব্যাকগ্রাউন্ড কালার (Bg Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={block.bgColor || '#ffffff'}
                          onChange={(e) =>
                            setBlocks(blocks.map((b) => (b.id === block.id ? { ...b, bgColor: e.target.value } : b)))
                          }
                          className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={block.bgColor || '#ffffff'}
                          onChange={(e) =>
                            setBlocks(blocks.map((b) => (b.id === block.id ? { ...b, bgColor: e.target.value } : b)))
                          }
                          className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs w-28"
                        />
                      </div>
                    </div>

                    {/* Text Color Picker */}
                    <div>
                      <label className="block text-stone-700 mb-1">টেক্সট কালার (Text Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={block.textColor || '#1c1917'}
                          onChange={(e) =>
                            setBlocks(blocks.map((b) => (b.id === block.id ? { ...b, textColor: e.target.value } : b)))
                          }
                          className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={block.textColor || '#1c1917'}
                          onChange={(e) =>
                            setBlocks(blocks.map((b) => (b.id === block.id ? { ...b, textColor: e.target.value } : b)))
                          }
                          className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs w-28"
                        />
                      </div>
                    </div>

                    {/* Padding Selector */}
                    <div>
                      <label className="block text-stone-700 mb-1">সেকশনের ওপর-নিচের গ্যাপ (Padding)</label>
                      <select
                        value={block.paddingY || 'py-8'}
                        onChange={(e) =>
                          setBlocks(blocks.map((b) => (b.id === block.id ? { ...b, paddingY: e.target.value as any } : b)))
                        }
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-800"
                      >
                        <option value="py-4">Small (কম গ্যাপ)</option>
                        <option value="py-8">Medium (মাঝারি গ্যাপ)</option>
                        <option value="py-12">Large (বেশি গ্যাপ)</option>
                        <option value="py-16">Extra Large (বিশাল গ্যাপ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Flexible Blank Section Builder Engine */}
                  {block.type === 'blank-section' && (
                    <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                        <h5 className="font-black text-xs text-[#8A1538]">
                          ✨ ব্ল্যাঙ্ক সেকশন এলিমেন্ট ম্যানেজার (Custom Freeform Elements)
                        </h5>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddElementToBlank(block.id, 'heading')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                          >
                            + হেডিং
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToBlank(block.id, 'text')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                          >
                            + প্যারাগ্রাফ
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToBlank(block.id, 'image')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                          >
                            + ইমেজ/ব্যানার
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToBlank(block.id, 'button')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                          >
                            + বাটন
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddElementToBlank(block.id, 'video')}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-[11px]"
                          >
                            + ভিডিও
                          </button>
                        </div>
                      </div>

                      {/* Elements List */}
                      <div className="space-y-3">
                        {(block.elements || []).map((el, elIdx) => (
                          <div key={el.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-black text-stone-500 uppercase">
                                Element #{elIdx + 1}: {el.type}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveElement(block.id, el.id)}
                                className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                              >
                                ✕ বাদ দিন
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                              {/* Content Field */}
                              <div className="md:col-span-6">
                                <label className="block text-[10px] text-stone-500 mb-0.5">কন্টেন্ট/টেক্সট/ইউআরএল</label>
                                <input
                                  type="text"
                                  value={el.content}
                                  onChange={(e) => handleUpdateElement(block.id, el.id, 'content', e.target.value)}
                                  className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                                />
                              </div>

                              {/* Target URL for Button */}
                              {el.type === 'button' && (
                                <div className="md:col-span-3">
                                  <label className="block text-[10px] text-stone-500 mb-0.5">বাটন লিংক (Target URL)</label>
                                  <input
                                    type="text"
                                    value={el.url || ''}
                                    onChange={(e) => handleUpdateElement(block.id, el.id, 'url', e.target.value)}
                                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg font-mono"
                                  />
                                </div>
                              )}

                              {/* Alignment */}
                              <div className="md:col-span-3">
                                <label className="block text-[10px] text-stone-500 mb-0.5">এলাইনমেন্ট</label>
                                <select
                                  value={el.alignment || 'center'}
                                  onChange={(e) => handleUpdateElement(block.id, el.id, 'alignment', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-stone-300 rounded-lg"
                                >
                                  <option value="left">Left (বাঁপাশে)</option>
                                  <option value="center">Center (মাঝখানে)</option>
                                  <option value="right">Right (ডানপাশে)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}