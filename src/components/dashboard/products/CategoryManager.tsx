'use client';

import React, { useState, useEffect, useRef } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  image?: string;
  count?: number;
};

type CategoryManagerProps = {
  initialCategories?: Category[];
  onCategoryChange?: (categories: Category[]) => void;
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

export default function CategoryManager({
  initialCategories = [],
  onCategoryChange,
}: CategoryManagerProps) {
  // Category List State
  const [categories, setCategories] = useState<Category[]>(
    initialCategories.length > 0
      ? initialCategories
      : [
          {
            id: 'cat-1',
            name: 'Premium Cotton T-Shirts',
            slug: 'premium-cotton-tshirts',
            parentId: null,
            description: '100% Combed Organic Cotton Luxury Wear',
            count: 24,
          },
          {
            id: 'cat-2',
            name: 'Polarized Aviator Sunglasses',
            slug: 'polarized-aviator-sunglasses',
            parentId: null,
            description: 'UV400 Protected Luxury Eyewear Collection',
            count: 18,
          },
          {
            id: 'cat-3',
            name: 'Slim-Fit Graphic Tees',
            slug: 'slim-fit-graphic-tees',
            parentId: 'cat-1',
            description: 'Designer Edition Breathable Urban Fashion',
            count: 9,
          },
          {
            id: 'cat-4',
            name: 'Handcrafted Leather Belts',
            slug: 'handcrafted-leather-belts',
            parentId: null,
            description: 'Full-Grain Italian Genuine Leather Accessories',
            count: 12,
          },
        ]
  );

  // Form States for Adding Category
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [parentId, setParentId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    category: Category | null;
    hasChildren: boolean;
  }>({
    show: false,
    category: null,
    hasChildren: false,
  });

  // File Input Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editImageInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-generate Romanized Slug for New Category
  useEffect(() => {
    if (!isCustomSlug && name) {
      setSlug(bnToEnSlug(name));
    }
  }, [name, isCustomSlug]);

  // Image Upload Handler (New Category)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        showToast('High-resolution category thumbnail attached.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Upload Handler (Editing Category)
  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCategory) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditingCategory({ ...editingCategory, image: reader.result as string });
        showToast('Category image updated successfully.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a valid category name.', 'error');
      return;
    }

    const finalSlug = slug.trim() || bnToEnSlug(name);
    
    // Check duplicate slug
    if (categories.some((c) => c.slug === finalSlug)) {
      showToast('A category with this unique slug already exists!', 'error');
      return;
    }

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      parentId: parentId || null,
      description: description.trim(),
      image,
      count: 0,
    };

    const updated = [newCat, ...categories];
    setCategories(updated);
    if (onCategoryChange) onCategoryChange(updated);

    // Reset Form
    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setParentId('');
    setDescription('');
    setImage('');
    showToast('✨ Premium category added successfully!', 'success');
  };

  // Trigger Delete Confirmation Modal
  const requestDeleteCategory = (cat: Category) => {
    const hasChildren = categories.some((c) => c.parentId === cat.id);
    setDeleteModal({
      show: true,
      category: cat,
      hasChildren,
    });
  };

  // Confirm Delete Action (Subcategories automatically convert to top-level)
  const confirmDeleteCategory = () => {
    if (!deleteModal.category) return;

    const targetId = deleteModal.category.id;
    
    // Delete target category and convert any of its sub-categories to top-level (parentId: null)
    const updated = categories
      .filter((c) => c.id !== targetId)
      .map((c) => (c.parentId === targetId ? { ...c, parentId: null } : c));

    setCategories(updated);
    if (onCategoryChange) onCategoryChange(updated);
    
    setDeleteModal({ show: false, category: null, hasChildren: false });
    showToast('Category deleted successfully.', 'success');
  };

  // Save Quick Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    const updated = categories.map((c) =>
      c.id === editingCategory.id ? editingCategory : c
    );
    setCategories(updated);
    if (onCategoryChange) onCategoryChange(updated);
    setEditingCategory(null);
    showToast('Category updated successfully!', 'success');
  };

  // Organize Categories into Indented Tree Hierarchy
  const getHierarchicalCategories = (): { category: Category; level: number }[] => {
    const filtered = categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If searching, show flat list
    if (searchQuery.trim()) {
      return filtered.map((c) => ({ category: c, level: 0 }));
    }

    const result: { category: Category; level: number }[] = [];

    const appendChildren = (parentId: string | null, level: number) => {
      const children = categories.filter((c) => (c.parentId || null) === parentId);
      children.forEach((child) => {
        result.push({ category: child, level });
        appendChildren(child.id, level + 1);
      });
    };

    appendChildren(null, 0);

    // Append orphans
    const processedIds = new Set(result.map((r) => r.category.id));
    categories.forEach((c) => {
      if (!processedIds.has(c.id)) {
        result.push({ category: c, level: 0 });
      }
    });

    return result;
  };

  const hierarchicalList = getHierarchicalCategories();

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
            <h2 className="text-base font-black text-[#3B3433]">🏷️ Product Categories</h2>
            <span className="text-[9px] bg-gradient-to-r from-[#8A1538] to-rose-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              PRO SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            WooCommerce Nested Category Tree & Indented Directory Manager
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Categories: <strong className="text-[#8A1538]">{categories.length}</strong></span>
        </div>
      </div>

      {/* 2-Column Layout: Left (Add Category Form), Right (Indented Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Add New Category Form (4 Cols) */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleAddCategory}
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sticky top-20"
          >
            <h3 className="font-extrabold text-xs text-stone-900 border-b pb-2 flex items-center justify-between">
              <span>➕ Add New Category</span>
              <span className="text-[10px] text-[#8A1538] font-mono font-bold">TAXONOMY</span>
            </h3>

            {/* Category Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Cotton T-Shirt"
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none transition placeholder:text-stone-300"
              />
            </div>

            {/* Category Slug */}
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
                placeholder="e.g. premium-cotton-tshirt"
                className={`w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] transition placeholder:text-stone-300 ${
                  !isCustomSlug ? 'bg-stone-50 text-stone-500' : 'bg-white font-bold'
                }`}
              />
            </div>

            {/* Parent Category Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Parent Category
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-xl bg-white font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8A1538]"
              >
                <option value="">None (Top-Level Root Category)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentId ? '— ' : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. High-end organic apparel crafted with 100% combed cotton..."
                className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none placeholder:text-stone-300"
              ></textarea>
            </div>

            {/* Thumbnail Image */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />

              {image ? (
                <div className="relative w-20 h-20 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                  <img src={image} alt="Cat Thumbnail" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 bg-rose-600 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center hover:bg-rose-700"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-2.5 bg-stone-50 border-2 border-dashed border-stone-300 hover:border-[#8A1538] rounded-xl text-xs font-bold text-stone-600 transition flex items-center justify-center gap-2 group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🖼️</span>
                  <span>Upload Icon / Image</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition"
            >
              + Create Category
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Indented Category Tree Directory (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories e.g. Polarized Sunglasses, T-Shirts..."
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
                    <th className="p-3.5 w-12 text-center">Image</th>
                    <th className="p-3.5">Category Name</th>
                    <th className="p-3.5">Slug</th>
                    <th className="p-3.5 text-center">Products</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
                  {hierarchicalList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400 font-bold">
                        No category matches your search query.
                      </td>
                    </tr>
                  ) : (
                    hierarchicalList.map(({ category: cat, level }) => {
                      return (
                        <tr key={cat.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3 text-center">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-8 h-8 rounded-lg object-cover mx-auto border border-stone-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 mx-auto flex items-center justify-center text-xs">
                                📁
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {/* Indentation Graphic Cues */}
                              {level > 0 && (
                                <span className="text-stone-300 font-mono select-none" style={{ paddingLeft: `${(level - 1) * 16}px` }}>
                                  └─
                                </span>
                              )}
                              <span className={`font-extrabold ${level === 0 ? 'text-stone-900 text-xs' : 'text-[#8A1538] text-[11px]'}`}>
                                {cat.name}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[10px] text-stone-400 truncate max-w-xs mt-0.5" style={{ paddingLeft: `${level * 16}px` }}>
                                {cat.description}
                              </p>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-stone-500">
                            {cat.slug}
                          </td>
                          <td className="p-3 text-center font-bold">
                            <span className="px-2.5 py-0.5 bg-stone-100 rounded-full text-[10px] text-stone-700 font-bold">
                              {cat.count || 0}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setEditingCategory({ ...cat })}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => requestDeleteCategory(cat)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-lg text-[10px] transition border border-rose-100"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ⚠️ DELETE CONFIRMATION POPUP MODAL (PERMITTED DELETION)             */}
      {/* =================================================================== */}
      {deleteModal.show && deleteModal.category && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative">
            
            {/* Top Close Cross Button */}
            <button
              type="button"
              onClick={() => setDeleteModal({ show: false, category: null, hasChildren: false })}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
              aria-label="Close Popup"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg font-bold shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">Confirm Deletion</h3>
                <p className="text-[11px] text-stone-400 font-mono">Permanent Category Removal</p>
              </div>
            </div>

            {/* Modal Body Warning */}
            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs space-y-2 text-stone-700">
              <p>
                Are you sure you want to delete category:{' '}
                <strong className="text-[#8A1538] font-bold">&quot;{deleteModal.category.name}&quot;</strong>?
              </p>

              {deleteModal.hasChildren ? (
                <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold space-y-1">
                  <span>💡 Note for Sub-categories:</span>
                  <p className="font-normal text-[10px]">
                    This category has sub-categories. Deleting this parent will automatically convert its sub-categories into top-level root categories.
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-stone-500 font-medium">
                  This action cannot be undone.
                </p>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ show: false, category: null, hasChildren: false })}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ✏️ EDIT CATEGORY POPUP MODAL                                        */}
      {/* =================================================================== */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative"
          >
            {/* Top Close Cross Button */}
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-stone-900">✏️ Quick Edit Category</h3>
              <p className="text-[10px] text-stone-400 font-mono">Update Taxonomy Attributes</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Polarized Aviator Sunglasses"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono text-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Parent Category</label>
                <select
                  value={editingCategory.parentId || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, parentId: e.target.value || null })
                  }
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white font-bold text-stone-700"
                >
                  <option value="">None (Top-Level Root Category)</option>
                  {categories
                    .filter((c) => c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="e.g. UV400 Protected Luxury Eyewear Collection"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={editImageInputRef}
                  onChange={handleEditImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editImageInputRef.current?.click()}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition"
                >
                  Change Image
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
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
