'use client';

import React, { useState, useEffect, useRef } from 'react';

type Brand = {
  id: string;
  name: string;
  slug: string;
  website?: string;
  description?: string;
  logo?: string;
  isFeatured?: boolean;
  productCount?: number;
};

type BrandManagerProps = {
  initialBrands?: Brand[];
  onBrandChange?: (brands: Brand[]) => void;
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

export default function BrandManager({
  initialBrands = [],
  onBrandChange,
}: BrandManagerProps) {
  // Brand List State
  const [brands, setBrands] = useState<Brand[]>(
    initialBrands.length > 0
      ? initialBrands
      : [
          {
            id: 'brand-1',
            name: 'Ray-Ban',
            slug: 'ray-ban',
            website: 'https://www.ray-ban.com',
            description: 'Iconic Luxury Eyewear & Polarized Sunglasses',
            isFeatured: true,
            productCount: 18,
          },
          {
            id: 'brand-2',
            name: 'Rolex',
            slug: 'rolex',
            website: 'https://www.rolex.com',
            description: 'Swiss Luxury Timepieces & Wristwatches',
            isFeatured: true,
            productCount: 12,
          },
          {
            id: 'brand-3',
            name: 'Nike',
            slug: 'nike',
            website: 'https://www.nike.com',
            description: 'Premium Sportswear & Designer Footwear',
            isFeatured: false,
            productCount: 35,
          },
        ]
  );

  // Form States for Adding Brand
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    brand: Brand | null;
  }>({
    show: false,
    brand: null,
  });

  // File Input Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const editLogoInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-generate Romanized Slug for New Brand
  useEffect(() => {
    if (!isCustomSlug && name) {
      setSlug(bnToEnSlug(name));
    }
  }, [name, isCustomSlug]);

  // Image Upload Handler (New Brand Logo)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
        showToast('Brand logo attached successfully.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Upload Handler (Editing Brand Logo)
  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingBrand) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditingBrand({ ...editingBrand, logo: reader.result as string });
        showToast('Brand logo updated.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Brand Handler
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a valid brand name.', 'error');
      return;
    }

    const finalSlug = slug.trim() || bnToEnSlug(name);
    
    // Check duplicate slug
    if (brands.some((b) => b.slug === finalSlug)) {
      showToast('A brand with this unique slug already exists!', 'error');
      return;
    }

    const newBrandItem: Brand = {
      id: `brand-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      website: website.trim(),
      description: description.trim(),
      logo,
      isFeatured,
      productCount: 0,
    };

    const updated = [newBrandItem, ...brands];
    setBrands(updated);
    if (onBrandChange) onBrandChange(updated);

    // Reset Form
    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setWebsite('');
    setDescription('');
    setLogo('');
    setIsFeatured(false);
    showToast('✨ New premium brand added successfully!', 'success');
  };

  // Trigger Delete Confirmation Modal
  const requestDeleteBrand = (brand: Brand) => {
    setDeleteModal({
      show: true,
      brand,
    });
  };

  // Confirm Delete Action
  const confirmDeleteBrand = () => {
    if (!deleteModal.brand) return;

    const targetId = deleteModal.brand.id;
    const updated = brands.filter((b) => b.id !== targetId);

    setBrands(updated);
    if (onBrandChange) onBrandChange(updated);
    
    setDeleteModal({ show: false, brand: null });
    showToast('Brand deleted successfully.', 'success');
  };

  // Save Quick Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name.trim()) return;

    const updated = brands.map((b) =>
      b.id === editingBrand.id ? editingBrand : b
    );
    setBrands(updated);
    if (onBrandChange) onBrandChange(updated);
    setEditingBrand(null);
    showToast('Brand details updated successfully!', 'success');
  };

  // Filtered Brands List
  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-base font-black text-[#3B3433]">🏷️ Brand Directory</h2>
            <span className="text-[9px] bg-gradient-to-r from-[#8A1538] to-rose-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              PRO SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Manage Global Brands, Logos, and Storefront Filters
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Brands: <strong className="text-[#8A1538]">{brands.length}</strong></span>
        </div>
      </div>

      {/* 2-Column Layout: Left (Add Brand Form), Right (Brand Directory Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Add New Brand Form (4 Cols) */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleAddBrand}
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sticky top-20"
          >
            <h3 className="font-extrabold text-xs text-stone-900 border-b pb-2 flex items-center justify-between">
              <span>➕ Add New Brand</span>
              <span className="text-[10px] text-[#8A1538] font-mono font-bold">TAXONOMY</span>
            </h3>

            {/* Brand Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ray-Ban, Rolex, Nike"
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none transition placeholder:text-stone-300"
              />
            </div>

            {/* Brand Slug */}
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
                placeholder="e.g. ray-ban"
                className={`w-full px-3.5 py-2 text-xs font-mono border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] transition placeholder:text-stone-300 ${
                  !isCustomSlug ? 'bg-stone-50 text-stone-500' : 'bg-white font-bold'
                }`}
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.ray-ban.com"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none placeholder:text-stone-300 font-mono"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Brand Overview / Tagline
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Iconic Luxury Eyewear & Polarized Sunglasses..."
                className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none placeholder:text-stone-300"
              ></textarea>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Brand Logo
              </label>
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                className="hidden"
              />

              {logo ? (
                <div className="relative w-20 h-20 bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                  <img src={logo} alt="Brand Logo" className="w-full h-full object-contain p-1" />
                  <button
                    type="button"
                    onClick={() => setLogo('')}
                    className="absolute top-1 right-1 bg-rose-600 text-white w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center hover:bg-rose-700"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-2.5 bg-stone-50 border-2 border-dashed border-stone-300 hover:border-[#8A1538] rounded-xl text-xs font-bold text-stone-600 transition flex items-center justify-center gap-2 group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">🏷️</span>
                  <span>Upload Brand Logo</span>
                </button>
              )}
            </div>

            {/* Star Featured Brand */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="checkbox"
                id="brandFeat"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#8A1538] rounded cursor-pointer"
              />
              <label htmlFor="brandFeat" className="text-xs font-bold text-stone-800 cursor-pointer">
                ⭐ Star Featured Brand
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition"
            >
              + Create Brand
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Brand Directory Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Search Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand by name e.g. Ray-Ban, Rolex..."
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
                    <th className="p-3.5 w-14 text-center">Logo</th>
                    <th className="p-3.5">Brand Name</th>
                    <th className="p-3.5">Slug & Website</th>
                    <th className="p-3.5 text-center">Featured</th>
                    <th className="p-3.5 text-center">Products</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
                  {filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400 font-bold">
                        No brands match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map((brand) => (
                      <tr key={brand.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3 text-center">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-9 h-9 rounded-lg object-contain mx-auto border border-stone-200 bg-stone-50 p-0.5"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 mx-auto flex items-center justify-center font-black text-xs text-[#8A1538]">
                              {brand.name.charAt(0)}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-stone-900 text-xs block">
                            {brand.name}
                          </span>
                          {brand.description && (
                            <p className="text-[10px] text-stone-400 truncate max-w-xs mt-0.5">
                              {brand.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-stone-500">
                          <div>{brand.slug}</div>
                          {brand.website && (
                            <a
                              href={brand.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#8A1538] hover:underline font-bold block truncate max-w-[140px]"
                            >
                              🔗 Website
                            </a>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {brand.isFeatured ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-extrabold">
                              ⭐ Featured
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-300 font-bold">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className="px-2.5 py-0.5 bg-stone-100 rounded-full text-[10px] text-stone-700 font-bold">
                            {brand.productCount || 0}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setEditingBrand({ ...brand })}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteBrand(brand)}
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

      {/* =================================================================== */}
      {/* ⚠️ DELETE CONFIRMATION POPUP MODAL (CENTERED WITH CROSS BUTTON)     */}
      {/* =================================================================== */}
      {deleteModal.show && deleteModal.brand && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative">
            
            {/* Top Close Cross Button */}
            <button
              type="button"
              onClick={() => setDeleteModal({ show: false, brand: null })}
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
                <p className="text-[11px] text-stone-400 font-mono">Permanent Brand Removal</p>
              </div>
            </div>

            {/* Modal Body Warning */}
            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs space-y-2 text-stone-700">
              <p>
                Are you sure you want to delete brand:{' '}
                <strong className="text-[#8A1538] font-bold">&quot;{deleteModal.brand.name}&quot;</strong>?
              </p>
              <p className="text-[10px] text-stone-500 font-medium">
                This action cannot be undone. Products linked to this brand will become unbranded.
              </p>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ show: false, brand: null })}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteBrand}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ✏️ EDIT BRAND POPUP MODAL                                           */}
      {/* =================================================================== */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative"
          >
            {/* Top Close Cross Button */}
            <button
              type="button"
              onClick={() => setEditingBrand(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-stone-900">✏️ Quick Edit Brand</h3>
              <p className="text-[10px] text-stone-400 font-mono">Update Brand Taxonomy Attributes</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={editingBrand.name}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. Ray-Ban"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingBrand.slug}
                  onChange={(e) => setEditingBrand({ ...editingBrand, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono text-stone-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Official Website</label>
                <input
                  type="url"
                  value={editingBrand.website || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description / Tagline</label>
                <textarea
                  rows={2}
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                  placeholder="e.g. Iconic Luxury Eyewear Collection"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Brand Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={editLogoInputRef}
                  onChange={handleEditLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editLogoInputRef.current?.click()}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition"
                >
                  Change Logo
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editBrandFeat"
                  checked={editingBrand.isFeatured || false}
                  onChange={(e) => setEditingBrand({ ...editingBrand, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-[#8A1538] rounded cursor-pointer"
                />
                <label htmlFor="editBrandFeat" className="text-xs font-bold text-stone-800 cursor-pointer">
                  ⭐ Star Featured Brand
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingBrand(null)}
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
