'use client';

import React, { useState, useEffect } from 'react';

type Tag = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
};

type TagManagerProps = {
  initialTags?: Tag[];
  onTagChange?: (tags: Tag[]) => void;
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
    .replace(/^-+|-+\$/g, '');
}

export default function TagManager({
  initialTags = [],
  onTagChange,
}: TagManagerProps) {
  // Tag List State
  const [tags, setTags] = useState<Tag[]>(
    initialTags.length > 0
      ? initialTags
      : [
          {
            id: 'tag-1',
            name: 'Summer Collection',
            slug: 'summer-collection',
            description: 'Curated lightweight apparel for warm weather',
            count: 32,
          },
          {
            id: 'tag-2',
            name: '100% Organic Cotton',
            slug: '100-organic-cotton',
            description: 'Eco-friendly breathable luxury fabric',
            count: 24,
          },
          {
            id: 'tag-3',
            name: 'Polarized UV400',
            slug: 'polarized-uv400',
            description: 'Maximum eye protection luxury sunglasses lens',
            count: 15,
          },
          {
            id: 'tag-4',
            name: 'Limited Edition',
            slug: 'limited-edition',
            description: 'Exclusive handcrafted seasonal items',
            count: 8,
          },
        ]
  );

  // Form States
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [description, setDescription] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; tag: Tag | null }>({
    show: false,
    tag: null,
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

  // Add Tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a valid tag name.', 'error');
      return;
    }

    const finalSlug = slug.trim() || bnToEnSlug(name);

    if (tags.some((t) => t.slug === finalSlug)) {
      showToast('A tag with this unique slug already exists!', 'error');
      return;
    }

    const newTagItem: Tag = {
      id: `tag-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      count: 0,
    };

    const updated = [newTagItem, ...tags];
    setTags(updated);
    if (onTagChange) onTagChange(updated);

    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setDescription('');
    showToast('✨ New product tag created successfully!', 'success');
  };

  // Confirm Delete Action
  const confirmDeleteTag = () => {
    if (!deleteModal.tag) return;

    const targetId = deleteModal.tag.id;
    const updated = tags.filter((t) => t.id !== targetId);

    setTags(updated);
    if (onTagChange) onTagChange(updated);

    setDeleteModal({ show: false, tag: null });
    showToast('Tag deleted successfully.', 'success');
  };

  // Save Quick Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editingTag.name.trim()) return;

    const updated = tags.map((t) => (t.id === editingTag.id ? editingTag : t));
    setTags(updated);
    if (onTagChange) onTagChange(updated);
    setEditingTag(null);
    showToast('Tag updated successfully!', 'success');
  };

  // Filtered List
  const filteredTags = tags.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-base font-black text-[#3B3433]">🏷️ Product Tags</h2>
            <span className="text-[9px] bg-gradient-to-r from-[#8A1538] to-rose-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              PRO SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Organize Catalog Keywords and Cross-Selling Labels
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Tags: <strong className="text-[#8A1538]">{tags.length}</strong></span>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Add Tag Form */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleAddTag}
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sticky top-20"
          >
            <h3 className="font-extrabold text-xs text-stone-900 border-b pb-2 flex items-center justify-between">
              <span>➕ Add New Tag</span>
              <span className="text-[10px] text-[#8A1538] font-mono font-bold">TAXONOMY</span>
            </h3>

            {/* Tag Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tag Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Collection, 100% Organic"
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
                placeholder="e.g. summer-collection"
                className={`w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] transition placeholder:text-stone-300 ${
                  !isCustomSlug ? 'bg-stone-50 text-stone-500' : 'bg-white font-bold'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tag Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High-end organic apparel & curated lifestyle essentials..."
                className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none placeholder:text-stone-300"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition"
            >
              + Create Tag
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Tags Directory Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags e.g. Summer Collection, UV400..."
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
                    <th className="p-3.5">Tag Name</th>
                    <th className="p-3.5">Slug</th>
                    <th className="p-3.5 text-center">Products</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
                  {filteredTags.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400 font-bold">
                        No tags match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredTags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3">
                          <span className="font-extrabold text-stone-900 text-xs block">
                            #{tag.name}
                          </span>
                          {tag.description && (
                            <p className="text-[10px] text-stone-400 truncate max-w-xs mt-0.5">
                              {tag.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-500">
                          {tag.slug}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className="px-2.5 py-0.5 bg-stone-100 rounded-full text-[10px] text-stone-700 font-bold">
                            {tag.count || 0}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setEditingTag({ ...tag })}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ show: true, tag })}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-lg text-[10px] transition border border-rose-100"
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

      {/* ⚠️ DELETE CONFIRMATION POPUP MODAL */}
      {deleteModal.show && deleteModal.tag && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setDeleteModal({ show: false, tag: null })}
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
                <p className="text-[11px] text-stone-400 font-mono">Permanent Tag Removal</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs space-y-2 text-stone-700">
              <p>
                Are you sure you want to delete tag:{' '}
                <strong className="text-[#8A1538] font-bold">&quot;#{deleteModal.tag.name}&quot;</strong>?
              </p>
              <p className="text-[10px] text-stone-500 font-medium">
                This action cannot be undone. Products linked to this tag will simply lose this label.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ show: false, tag: null })}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteTag}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT TAG POPUP MODAL */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative"
          >
            <button
              type="button"
              onClick={() => setEditingTag(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-stone-900">✏️ Quick Edit Tag</h3>
              <p className="text-[10px] text-stone-400 font-mono">Update Tag Keywords</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tag Name</label>
                <input
                  type="text"
                  required
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  placeholder="e.g. Summer Collection"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingTag.slug}
                  onChange={(e) => setEditingTag({ ...editingTag, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono text-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingTag.description || ''}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                  placeholder="e.g. Curated lightweight apparel for warm weather"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingTag(null)}
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
