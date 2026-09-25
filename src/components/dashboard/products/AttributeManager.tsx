'use client';

import React, { useState, useEffect } from 'react';

export type AttributeTerm = {
  id: string;
  name: string;
  slug: string;
  value?: string; // Hex color code or Label short code
};

export type Attribute = {
  id: string;
  name: string;
  slug: string;
  type: 'color' | 'button' | 'select' | 'image';
  terms: AttributeTerm[];
};

type AttributeManagerProps = {
  initialAttributes?: Attribute[];
  onAttributeChange?: (attributes: Attribute[]) => void;
};

// Bengali to English / Romanized Slug Generator Helper
function bnToEnSlug(text: string): string {
  if (!text) return '';
  const bnMap: Record<string, string> = {
    'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'ঋ': 'ri',
    'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'v', 'ম': 'm',
    'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
    'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ৃ': 'ri',
    'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': '',
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };

  let converted = '';
  const str = text.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    converted += bnMap[char] !== undefined ? bnMap[char] : char;
  }
  return converted
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AttributeManager({
  initialAttributes = [],
  onAttributeChange,
}: AttributeManagerProps) {
  // Attributes List State
  const [attributes, setAttributes] = useState<Attribute[]>(
    initialAttributes.length > 0
      ? initialAttributes
      : [
          {
            id: 'attr-1',
            name: 'Color Swatch',
            slug: 'color-swatch',
            type: 'color',
            terms: [
              { id: 't-1', name: 'Crimson Maroon', slug: 'crimson-maroon', value: '#8A1538' },
              { id: 't-2', name: 'Midnight Navy', slug: 'midnight-navy', value: '#1E293B' },
              { id: 't-3', name: 'Rose Gold', slug: 'rose-gold', value: '#B76E79' },
            ],
          },
          {
            id: 'attr-2',
            name: 'Apparel Size',
            slug: 'apparel-size',
            type: 'button',
            terms: [
              { id: 't-4', name: 'Small', slug: 'small', value: 'S' },
              { id: 't-5', name: 'Medium', slug: 'medium', value: 'M' },
              { id: 't-6', name: 'Large', slug: 'large', value: 'L' },
              { id: 't-7', name: 'Extra Large', slug: 'extra-large', value: 'XL' },
            ],
          },
          {
            id: 'attr-[#',
            name: 'Frame Material',
            slug: 'frame-material',
            type: 'select',
            terms: [
              { id: 't-8', name: 'Titanium Alloy', slug: 'titanium-alloy' },
              { id: 't-9', name: 'Italian Acetate', slug: 'italian-acetate' },
            ],
          },
        ]
  );

  // Form States for Adding New Attribute
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [type, setType] = useState<'color' | 'button' | 'select' | 'image'>('color');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [managingTermsAttribute, setManagingTermsAttribute] = useState<Attribute | null>(null);
  
  // Term Form State inside Manage Terms Modal
  const [newTermName, setNewTermName] = useState('');
  const [newTermValue, setNewTermValue] = useState('#8A1538');

  // Centered Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; attribute: Attribute | null }>({
    show: false,
    attribute: null,
  });

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3500);
  };

  // Auto-generate Romanized Slug
  useEffect(() => {
    if (!isCustomSlug && name) {
      setSlug(bnToEnSlug(name));
    }
  }, [name, isCustomSlug]);

  // Add New Attribute
  const handleAddAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter an attribute name.', 'error');
      return;
    }

    const finalSlug = slug.trim() || bnToEnSlug(name);

    if (attributes.some((a) => a.slug === finalSlug)) {
      showToast('An attribute with this slug already exists!', 'error');
      return;
    }

    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      type,
      terms: [],
    };

    const updated = [newAttr, ...attributes];
    setAttributes(updated);
    if (onAttributeChange) onAttributeChange(updated);

    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setType('color');
    showToast('✨ New variation attribute created successfully!', 'success');
  };

  // Confirm Delete Action
  const confirmDeleteAttribute = () => {
    if (!deleteModal.attribute) return;

    const targetId = deleteModal.attribute.id;
    const updated = attributes.filter((a) => a.id !== targetId);

    setAttributes(updated);
    if (onAttributeChange) onAttributeChange(updated);

    setDeleteModal({ show: false, attribute: null });
    showToast('Attribute deleted successfully.', 'success');
  };

  // Save Edit Attribute
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttribute || !editingAttribute.name.trim()) return;

    const updated = attributes.map((a) => (a.id === editingAttribute.id ? editingAttribute : a));
    setAttributes(updated);
    if (onAttributeChange) onAttributeChange(updated);
    setEditingAttribute(null);
    showToast('Attribute updated successfully!', 'success');
  };

  // Add Term to Attribute
  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingTermsAttribute || !newTermName.trim()) return;

    const newTerm: AttributeTerm = {
      id: `t-${Date.now()}`,
      name: newTermName.trim(),
      slug: bnToEnSlug(newTermName),
      value: managingTermsAttribute.type === 'color' ? newTermValue : newTermName.trim(),
    };

    const updatedAttribute = {
      ...managingTermsAttribute,
      terms: [...managingTermsAttribute.terms, newTerm],
    };

    const updatedAttributes = attributes.map((a) =>
      a.id === managingTermsAttribute.id ? updatedAttribute : a
    );

    setAttributes(updatedAttributes);
    setManagingTermsAttribute(updatedAttribute);
    if (onAttributeChange) onAttributeChange(updatedAttributes);

    setNewTermName('');
    showToast('Swatch term added successfully!', 'success');
  };

  // Delete Term from Attribute
  const handleDeleteTerm = (termId: string) => {
    if (!managingTermsAttribute) return;

    const updatedAttribute = {
      ...managingTermsAttribute,
      terms: managingTermsAttribute.terms.filter((t) => t.id !== termId),
    };

    const updatedAttributes = attributes.map((a) =>
      a.id === managingTermsAttribute.id ? updatedAttribute : a
    );

    setAttributes(updatedAttributes);
    setManagingTermsAttribute(updatedAttribute);
    if (onAttributeChange) onAttributeChange(updatedAttributes);
    showToast('Term removed.', 'info');
  };

  // Filtered List
  const filteredAttributes = attributes.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-[#3B3433] relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border text-white ${
              toast.type === 'success'
                ? 'bg-[#8A1538] border-[#8A1538]'
                : toast.type === 'error'
                ? 'bg-rose-700 border-rose-600'
                : 'bg-stone-800 border-stone-700'
            }`}
          >
            <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">🎨 Product Attributes & Variation Swatches</h2>
            <span className="text-[9px] bg-gradient-to-r from-[#8A1538] to-rose-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              PRO SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Configure Visual Swatches (Color Circles, Label Buttons, Image Thumbnails)
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Attributes: <strong className="text-[#8A1538]">{attributes.length}</strong></span>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Add New Attribute Form */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleAddAttribute}
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sticky top-20"
          >
            <h3 className="font-extrabold text-xs text-stone-900 border-b pb-2 flex items-center justify-between">
              <span>➕ Add New Attribute</span>
              <span className="text-[10px] text-[#8A1538] font-mono font-bold">VARIATION</span>
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Attribute Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Color Swatch, Apparel Size, Frame Material"
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none transition placeholder:text-stone-300"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">URL Slug</label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug(!isCustomSlug)}
                  className="text-[10px] font-bold text-[#8A1538] hover:underline"
                >
                  {isCustomSlug ? 'Auto-Generate' : 'Edit Slug'}
                </button>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                readOnly={!isCustomSlug}
                placeholder="e.g. color-swatch"
                className={`w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] transition placeholder:text-stone-300 ${
                  !isCustomSlug ? 'bg-stone-50 text-stone-500' : 'bg-white font-bold'
                }`}
              />
            </div>

            {/* Display Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Frontend Display Type (Swatch Type)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              >
                <option value="color">🎨 Color Circle Swatch (Hex Picker)</option>
                <option value="button">🏷️ Button / Label Swatch (S, M, L, XL)</option>
                <option value="select">📋 Standard Select Dropdown</option>
                <option value="image">🖼️ Image Swatch Thumbnail</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition"
            >
              + Create Attribute
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Attributes Directory Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attributes e.g. Color, Size, Frame..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none placeholder:text-stone-300"
              />
              <span className="absolute left-3 top-2 text-stone-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1E1D1E] text-white font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Attribute Name</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Values / Swatches</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
                  {filteredAttributes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400 font-bold">
                        No attributes match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredAttributes.map((attr) => (
                      <tr key={attr.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3">
                          <span className="font-extrabold text-stone-900 text-xs block">
                            {attr.name}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {attr.slug}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide bg-stone-100 text-stone-700 border border-stone-200">
                            {attr.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                            {attr.terms.length === 0 ? (
                              <span className="text-[10px] text-stone-300 italic">No values configured</span>
                            ) : (
                              attr.terms.slice(0, 5).map((t) => (
                                <span
                                  key={t.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-md text-[10px] font-bold text-stone-700"
                                >
                                  {attr.type === 'color' && t.value && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                      style={{ backgroundColor: t.value }}
                                    ></span>
                                  )}
                                  <span>{t.name}</span>
                                </span>
                              ))
                            )}
                            {attr.terms.length > 5 && (
                              <span className="text-[9px] font-bold text-stone-400">
                                +{attr.terms.length - 5} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setManagingTermsAttribute(attr)}
                            className="px-2.5 py-1 bg-[#8A1538]/10 hover:bg-[#8A1538]/20 text-[#8A1538] font-extrabold rounded-lg text-[10px] transition border border-[#8A1538]/20"
                          >
                            ⚙️ Configure Terms ({attr.terms.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAttribute({ ...attr })}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ show: true, attribute: attr })}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-lg text-[10px] transition border border-rose-100"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ⚙️ MANAGE TERMS POPUP MODAL */}
      {managingTermsAttribute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setManagingTermsAttribute(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-stone-900">
                ⚙️ Configure Terms for &quot;{managingTermsAttribute.name}&quot;
              </h3>
              <p className="text-[10px] text-stone-400 font-mono">
                Manage Individual Swatch Values (Colors, Sizes, Options)
              </p>
            </div>

            {/* Form to add term */}
            <form onSubmit={handleAddTerm} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
              <span className="text-[11px] font-extrabold text-stone-800 block">➕ Add New Swatch Value</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className={managingTermsAttribute.type === 'color' ? 'sm:col-span-6' : 'sm:col-span-8'}>
                  <input
                    type="text"
                    required
                    value={newTermName}
                    onChange={(e) => setNewTermName(e.target.value)}
                    placeholder={
                      managingTermsAttribute.type === 'color'
                        ? 'e.g. Crimson Maroon'
                        : 'e.g. Small (S)'
                    }
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white font-bold"
                  />
                </div>

                {managingTermsAttribute.type === 'color' && (
                  <div className="sm:col-span-3 flex items-center gap-1.5 bg-white px-2 py-1 border border-stone-300 rounded-lg">
                    <input
                      type="color"
                      value={newTermValue}
                      onChange={(e) => setNewTermValue(e.target.value)}
                      className="w-6 h-6 border-0 p-0 rounded cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-stone-600">{newTermValue}</span>
                  </div>
                )}

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-lg shadow"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </form>

            {/* Terms List Table */}
            <div className="max-h-56 overflow-y-auto border border-stone-200 rounded-xl divide-y">
              {managingTermsAttribute.terms.length === 0 ? (
                <div className="p-6 text-center text-stone-400 text-xs font-bold">
                  No swatch terms added yet. Use the form above.
                </div>
              ) : (
                managingTermsAttribute.terms.map((t) => (
                  <div key={t.id} className="p-2.5 flex items-center justify-between hover:bg-stone-50 text-xs">
                    <div className="flex items-center gap-2">
                      {managingTermsAttribute.type === 'color' && t.value && (
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: t.value }}
                        ></span>
                      )}
                      <span className="font-extrabold text-stone-800">{t.name}</span>
                      <span className="text-[10px] font-mono text-stone-400">({t.slug})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTerm(t.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold px-2 py-0.5 rounded hover:bg-rose-50"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setManagingTermsAttribute(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ DELETE CONFIRMATION POPUP MODAL */}
      {deleteModal.show && deleteModal.attribute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setDeleteModal({ show: false, attribute: null })}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg font-bold shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">Confirm Deletion</h3>
                <p className="text-[11px] text-stone-400 font-mono">Permanent Attribute Removal</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs space-y-2 text-stone-700">
              <p>
                Are you sure you want to delete attribute:{' '}
                <strong className="text-[#8A1538] font-bold">&quot;{deleteModal.attribute.name}&quot;</strong>?
              </p>
              <p className="text-[10px] text-stone-500 font-medium">
                This action cannot be undone. Product variations using this attribute will lose swatch mappings.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ show: false, attribute: null })}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteAttribute}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT ATTRIBUTE POPUP MODAL */}
      {editingAttribute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative"
          >
            <button
              type="button"
              onClick={() => setEditingAttribute(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-stone-900">✏️ Quick Edit Attribute</h3>
              <p className="text-[10px] text-stone-400 font-mono">Update Attribute Title & Type</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Attribute Title</label>
                <input
                  type="text"
                  required
                  value={editingAttribute.name}
                  onChange={(e) => setEditingAttribute({ ...editingAttribute, name: e.target.value })}
                  placeholder="e.g. Color Swatch"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingAttribute.slug}
                  onChange={(e) => setEditingAttribute({ ...editingAttribute, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono text-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Display Type</label>
                <select
                  value={editingAttribute.type}
                  onChange={(e) => setEditingAttribute({ ...editingAttribute, type: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white font-bold text-stone-700"
                >
                  <option value="color">🎨 Color Circle Swatch</option>
                  <option value="button">🏷️ Button / Label Swatch</option>
                  <option value="select">📋 Standard Select Dropdown</option>
                  <option value="image">🖼️ Image Swatch Thumbnail</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingAttribute(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
