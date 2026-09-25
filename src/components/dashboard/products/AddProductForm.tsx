'use client';

import React, { useState, useEffect, useRef } from 'react';

// Character Limits
const SHORT_DESC_LIMIT = 300;
const FULL_DESC_LIMIT = 5000;

// Bengali to English / Romanized Slug Generator Helper
function bnToEnSlug(text: string): string {
  if (!text) return '';
  const bnMap: Record<string, string> = {
    'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'v', 'ম': 'm', 'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh',
    'স': 's', 'হ': 'h', 'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
    'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
    '্': '', '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
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

// Global Attributes (Central Swatch Engine Data)
const GLOBAL_ATTRIBUTES = [
  {
    id: 'attr-color',
    name: 'Color',
    type: 'color',
    values: [
      { id: 'c1', name: 'Red', code: '#FF0000' },
      { id: 'c2', name: 'Blue', code: '#0000FF' },
      { id: 'c3', name: 'Black', code: '#000000' },
      { id: 'c4', name: 'White', code: '#FFFFFF' },
      { id: 'c5', name: 'Green', code: '#008000' },
    ],
  },
  {
    id: 'attr-size',
    name: 'Size',
    type: 'button',
    values: [
      { id: 's1', name: 'S' },
      { id: 's2', name: 'M' },
      { id: 's3', name: 'L' },
      { id: 's4', name: 'XL' },
      { id: 's5', name: 'XXL' },
    ],
  },
];

type AddProductFormProps = {
  initialData?: any;
  categories?: any[];
  brands?: any[];
  domain?: string;
  onSuccess?: () => void;
  onSave?: (data: any) => void;
  onCancel?: () => void;
};

export default function AddProductForm({
  initialData = null,
  categories = [],
  brands = [],
  domain = '',
  onSuccess,
  onSave,
  onCancel,
}: AddProductFormProps) {
  const isEditMode = Boolean(initialData && (initialData.id || initialData.numericId));

  // Hidden File Input Refs
  const productImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

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

  // Basic Product States
  const [title, setTitle] = useState(initialData?.title || initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [productType, setProductType] = useState<'simple' | 'variable' | 'digital' | 'external'>(
    initialData?.type || initialData?.productType || 'simple'
  );
  const [activeDataTab, setActiveDataTab] = useState<
    'general' | 'inventory' | 'shipping' | 'attributes' | 'variations' | 'linked' | 'advanced'
  >('general');

  // General Tab
  const [price, setPrice] = useState(initialData?.price || initialData?.regularPrice || '');
  const [salePrice, setSalePrice] = useState(initialData?.salePrice || '');
  const [saleStartDate, setSaleStartDate] = useState(initialData?.saleStartDate || '');
  const [saleEndDate, setSaleEndDate] = useState(initialData?.saleEndDate || '');
  const [externalUrl, setExternalUrl] = useState(initialData?.externalUrl || '');
  const [buttonText, setButtonText] = useState(initialData?.buttonText || initialData?.externalButtonText || 'Buy Product');

  // Inventory Tab
  const [sku, setSku] = useState(initialData?.sku || '');
  const [manageStock, setManageStock] = useState(initialData?.manageStock ?? true);
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity ?? '10');
  const [stockStatus, setStockStatus] = useState(initialData?.stockStatus || 'instock');
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.lowStockThreshold ?? '2');

  // Shipping & Digital
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [dimensions, setDimensions] = useState(initialData?.dimensions || '');
  const [digitalFileUrl, setDigitalFileUrl] = useState(initialData?.digitalFileUrl || initialData?.downloadUrl || '');

  // Attributes & Variations
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>(
    initialData?.selectedAttributes || {}
  );
  const [variationsList, setVariationsList] = useState<any[]>(
    initialData?.variationsList || initialData?.variations || []
  );

  // Linked Products & Advanced
  const [upsellInput, setUpsellInput] = useState(initialData?.upsellInput || '');
  const [crosssellInput, setCrosssellInput] = useState(initialData?.crosssellInput || '');
  const [purchaseNote, setPurchaseNote] = useState(initialData?.purchaseNote || '');
  const [menuOrder, setMenuOrder] = useState(initialData?.menuOrder ?? '0');

  // Media & Taxonomy Sidebar
  const [productImage, setProductImage] = useState(initialData?.productImage || initialData?.featuredImage || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.galleryImages || []);

  // MULTIPLE VIDEO LINKS SUPPORT
  const [videoInput, setVideoInput] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>(
    initialData?.videoUrls || (initialData?.videoUrl ? [initialData.videoUrl] : [])
  );

  const [category, setCategory] = useState(
    Array.isArray(initialData?.categories) ? initialData.categories[0] : initialData?.category || ''
  );
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : initialData?.tagsInput || ''
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || initialData?.featured || false);
  const [loading, setLoading] = useState(false);

  // Hydration effect when initialData changes
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || initialData.name || '');
      setSlug(initialData.slug || '');
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      setProductType(initialData.type || initialData.productType || 'simple');
      setPrice(initialData.price || initialData.regularPrice || '');
      setSalePrice(initialData.salePrice || '');
      setSaleStartDate(initialData.saleStartDate || '');
      setSaleEndDate(initialData.saleEndDate || '');
      setExternalUrl(initialData.externalUrl || '');
      setButtonText(initialData.buttonText || initialData.externalButtonText || 'Buy Product');
      setSku(initialData.sku || '');
      setManageStock(initialData.manageStock ?? true);
      setStockQuantity(initialData.stockQuantity ?? '10');
      setStockStatus(initialData.stockStatus || 'instock');
      setLowStockThreshold(initialData.lowStockThreshold ?? '2');
      setWeight(initialData.weight || '');
      setDimensions(initialData.dimensions || '');
      setDigitalFileUrl(initialData.digitalFileUrl || initialData.downloadUrl || '');
      if (initialData.selectedAttributes) setSelectedAttributes(initialData.selectedAttributes);
      if (initialData.variationsList || initialData.variations) {
        setVariationsList(initialData.variationsList || initialData.variations);
      }
      setUpsellInput(initialData.upsellInput || '');
      setCrosssellInput(initialData.crosssellInput || '');
      setPurchaseNote(initialData.purchaseNote || '');
      setMenuOrder(initialData.menuOrder ?? '0');
      setProductImage(initialData.productImage || initialData.featuredImage || '');
      setGalleryImages(initialData.galleryImages || []);
      setVideoUrls(initialData.videoUrls || (initialData.videoUrl ? [initialData.videoUrl] : []));
      setCategory(
        Array.isArray(initialData.categories) ? initialData.categories[0] : initialData.category || ''
      );
      setBrand(initialData.brand || '');
      setTagsInput(
        Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tagsInput || ''
      );
      setIsFeatured(initialData.isFeatured || initialData.featured || false);
    }
  }, [initialData]);

  // Auto-generate Romanized Slug
  useEffect(() => {
    if (!isCustomSlug && title && !isEditMode) {
      setSlug(bnToEnSlug(title));
    }
  }, [title, isCustomSlug, isEditMode]);

  // Attribute Handlers
  const toggleAttributeValue = (attrName: string, valueName: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[attrName] || [];
      const updated = current.includes(valueName)
        ? current.filter((v) => v !== valueName)
        : [...current, valueName];
      return { ...prev, [attrName]: updated };
    });
  };

  const handleGenerateVariations = () => {
    const activeAttrs = Object.keys(selectedAttributes).filter(
      (key) => selectedAttributes[key] && selectedAttributes[key].length > 0
    );

    if (activeAttrs.length === 0) {
      showToast('Please select at least one global attribute value first.', 'error');
      return;
    }

    const attrArrays = activeAttrs.map((key) => ({
      attrName: key,
      options: selectedAttributes[key],
    }));

    const cartesian = (acc: any[], curr: any) =>
      acc.flatMap((a) => curr.options.map((b: string) => [...a, { attrName: curr.attrName, option: b }]));

    const initial = attrArrays[0].options.map((opt: string) => [
      { attrName: attrArrays[0].attrName, option: opt },
    ]);

    const combinations = attrArrays.slice(1).reduce(cartesian, initial);

    const generatedVars = combinations.map((combo: any, idx: number) => ({
      id: `var-${Date.now()}-${idx}`,
      sku: sku ? `${sku}-${idx + 1}` : '',
      price: price || '',
      salePrice: salePrice || '',
      stockQuantity: stockQuantity || '5',
      stockStatus: 'instock',
      attributes: combo,
    }));

    setVariationsList(generatedVars);
    setActiveDataTab('variations');
    showToast(`Generated ${generatedVars.length} variants successfully!`, 'success');
  };

  const handleVariationChange = (id: string, field: string, val: any) => {
    setVariationsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Image Upload Handlers
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductImage(reader.result as string);
        showToast('Product main image uploaded.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProductImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProductImage('');
    showToast('Product image removed.', 'info');
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setGalleryImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      showToast(`Added ${files.length} gallery image(s).`, 'info');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Gallery image removed.', 'info');
  };

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === galleryImages.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...galleryImages];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setGalleryImages(updated);
  };

  // Multiple Video Links Handlers
  const handleAddVideoUrl = () => {
    if (!videoInput.trim()) return;
    const url = videoInput.trim();
    if (videoUrls.includes(url)) {
      showToast('This video link is already added.', 'error');
      return;
    }
    setVideoUrls((prev) => [...prev, url]);
    setVideoInput('');
    showToast('Video link added!', 'success');
  };

  const handleRemoveVideoUrl = (index: number) => {
    setVideoUrls((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Video link removed.', 'info');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      showToast('Please fill in required fields (Title & Price).', 'error');
      return;
    }

    const payload = {
      id: initialData?.id || `prod-${Date.now()}`,
      numericId: initialData?.numericId || Math.floor(100 + Math.random() * 900),
      title,
      name: title,
      slug: slug || bnToEnSlug(title),
      shortDescription,
      description,
      productType,
      type: productType,
      price,
      regularPrice: price,
      salePrice,
      saleStartDate,
      saleEndDate,
      externalUrl,
      buttonText,
      sku,
      manageStock,
      stockQuantity,
      stockStatus,
      lowStockThreshold,
      weight,
      dimensions,
      digitalFileUrl,
      selectedAttributes,
      variationsList,
      variations: variationsList,
      upsellInput,
      crosssellInput,
      purchaseNote,
      menuOrder,
      productImage,
      featuredImage: productImage,
      galleryImages,
      videoUrls,
      categories: category ? [category] : ['Uncategorized'],
      category,
      brand,
      tagsInput,
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
      isFeatured,
      featured: isFeatured,
      status: initialData?.status || 'published',
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(
        isEditMode ? '🎉 Product updated successfully!' : '🎉 Product published successfully!',
        'success'
      );
      if (onSave) onSave(payload);
      if (onSuccess) onSuccess();
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans text-[#3B3433] relative pb-12">
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

      {/* Header Container */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-black text-[#3B3433]">
            {isEditMode ? `✏️ Edit Product: ${title}` : '➕ Add New Product'}
          </h1>
          <p className="text-[11px] text-stone-400 font-mono">
            WooCommerce Complete Specification & Meta-Box Engine
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-200 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
          >
            <span>{loading ? 'Saving...' : isEditMode ? '💾 Update Product' : '🚀 Publish Product'}</span>
          </button>
        </div>
      </div>

      {/* Main 12-Col Responsive Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title & Permalink Box */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু (১ কেজি)"
                className="w-full px-3.5 py-2.5 text-sm font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              />
            </div>

            {/* Permalink Bar */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 font-mono text-stone-600 truncate text-[11px]">
                <span className="font-bold text-stone-400">Permalink:</span>
                <span className="hidden sm:inline">http://{domain || 'store'}.localhost:3000/product/</span>
                <span className="font-bold text-[#8A1538] truncate">{slug || 'your-product-slug'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomSlug(!isCustomSlug)}
                className="text-[11px] font-bold text-[#8A1538] hover:underline shrink-0"
              >
                {isCustomSlug ? 'Auto-Translate' : 'Edit Slug'}
              </button>
            </div>

            {isCustomSlug && (
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Custom URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8A1538]"
                />
              </div>
            )}
          </div>

          {/* Short Description */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700">
                Short Description (Summary)
              </label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  shortDescription.length > SHORT_DESC_LIMIT ? 'text-rose-600' : 'text-stone-400'
                }`}
              >
                {shortDescription.length} / {SHORT_DESC_LIMIT}
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={SHORT_DESC_LIMIT}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Brief product highlights shown next to pricing..."
              className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538]"
            ></textarea>
          </div>

          {/* Full Description */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700">
                Full Product Description
              </label>
              <span
                className={`text-[10px] font-mono font-bold ${
                  description.length > FULL_DESC_LIMIT ? 'text-rose-600' : 'text-stone-400'
                }`}
              >
                {description.length} / {FULL_DESC_LIMIT}
              </span>
            </div>
            <textarea
              rows={5}
              maxLength={FULL_DESC_LIMIT}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product specifications, materials, care instructions..."
              className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538]"
            ></textarea>
          </div>

          {/* WOOCOMMERCE PRODUCT DATA META-BOX */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
            <div className="bg-[#1E1D1E] text-white p-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <h3 className="font-extrabold text-xs">Product Data Settings</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-300 font-medium">Type:</span>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  className="px-2.5 py-1 bg-stone-800 text-white font-bold text-xs rounded-lg border border-stone-700 focus:outline-none"
                >
                  <option value="simple">Simple Product</option>
                  <option value="variable">Variable Product</option>
                  <option value="digital">Digital / Downloadable</option>
                  <option value="external">External / Affiliate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[350px]">
              {/* Tab Navigation Sidebar */}
              <div className="md:col-span-4 bg-stone-50 border-b md:border-b-0 md:border-r border-stone-200 p-2">
                <div className="flex md:flex-col overflow-x-auto gap-1">
                  {[
                    { id: 'general', label: 'General Pricing', icon: '🏷️' },
                    { id: 'inventory', label: 'Inventory (Stock)', icon: '📦' },
                    { id: 'shipping', label: 'Shipping & Digital', icon: '🚚' },
                    { id: 'attributes', label: 'Global Attributes', icon: '🎨' },
                    { id: 'variations', label: `Variations (${variationsList.length})`, icon: '🔀' },
                    { id: 'linked', label: 'Linked Products', icon: '🔗' },
                    { id: 'advanced', label: 'Advanced Settings', icon: '⚙️' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveDataTab(tab.id as any)}
                      className={`shrink-0 md:w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition ${
                        activeDataTab === tab.id
                          ? 'bg-white text-[#8A1538] shadow-2xs border border-stone-200'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="md:col-span-8 p-5 text-xs">
                {/* 1. GENERAL TAB */}
                {activeDataTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Regular Price (৳) *
                        </label>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="1500"
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Sale Price (৳)
                        </label>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="1350"
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] font-bold text-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">Sale Start Date</label>
                        <input
                          type="date"
                          value={saleStartDate}
                          onChange={(e) => setSaleStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">Sale End Date</label>
                        <input
                          type="date"
                          value={saleEndDate}
                          onChange={(e) => setSaleEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                        />
                      </div>
                    </div>

                    {productType === 'external' && (
                      <div className="space-y-3 pt-3 border-t border-stone-200">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">External Product URL</label>
                          <input
                            type="url"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Button Text</label>
                          <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. INVENTORY TAB */}
                {activeDataTab === 'inventory' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">SKU Code</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="e.g. GHI-1KG"
                        className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="mStock"
                        checked={manageStock}
                        onChange={(e) => setManageStock(e.target.checked)}
                        className="w-4 h-4 rounded text-[#8A1538]"
                      />
                      <label htmlFor="mStock" className="font-bold text-stone-700 cursor-pointer">
                        Enable Stock Management at Product Level
                      </label>
                    </div>

                    {manageStock && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Low Stock Alert Threshold</label>
                          <input
                            type="number"
                            value={lowStockThreshold}
                            onChange={(e) => setLowStockThreshold(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Stock Status</label>
                      <select
                        value={stockStatus}
                        onChange={(e) => setStockStatus(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
                      >
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="onbackorder">On Backorder</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 3. SHIPPING TAB */}
                {activeDataTab === 'shipping' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Weight (KG)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="1.0"
                          className="w-full px-3 py-2 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Dimensions (L × W × H cm)</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="20 x 15 x 10"
                          className="w-full px-3 py-2 border rounded-xl"
                        />
                      </div>
                    </div>

                    {productType === 'digital' && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
                        <label className="block font-bold text-[#8A1538] mb-1">
                          Digital File Download URL
                        </label>
                        <input
                          type="url"
                          value={digitalFileUrl}
                          onChange={(e) => setDigitalFileUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border rounded-xl bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ATTRIBUTES TAB */}
                {activeDataTab === 'attributes' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <div>
                        <h4 className="font-bold text-stone-900">Central Global Attributes</h4>
                        <p className="text-[11px] text-stone-500">Select attribute values for this product.</p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateVariations}
                        className="px-3.5 py-2 bg-[#8A1538] text-white font-bold rounded-xl text-xs shadow hover:bg-rose-900"
                      >
                        ⚡ Generate Variations
                      </button>
                    </div>

                    <div className="space-y-3">
                      {GLOBAL_ATTRIBUTES.map((attr) => (
                        <div key={attr.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800 text-xs">{attr.name}</span>
                            <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded font-bold uppercase">
                              {attr.type} Swatches
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {attr.values.map((val) => {
                              const isSelected = (selectedAttributes[attr.name] || []).includes(val.name);
                              return (
                                <button
                                  key={val.id}
                                  type="button"
                                  onClick={() => toggleAttributeValue(attr.name, val.name)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
                                    isSelected
                                      ? 'bg-[#8A1538] text-white border-[#8A1538] shadow-2xs'
                                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                                  }`}
                                >
                                  {val.code && (
                                    <span
                                      className="w-3 h-3 rounded-full border border-stone-300 inline-block shrink-0"
                                      style={{ backgroundColor: val.code }}
                                    ></span>
                                  )}
                                  <span>{val.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. VARIATIONS TAB */}
                {activeDataTab === 'variations' && (
                  <div className="space-y-3">
                    <span className="font-bold text-stone-900 block mb-2">
                      Generated Variations ({variationsList.length})
                    </span>

                    {variationsList.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-8 font-bold">
                        No variations generated yet. Select values in &quot;Global Attributes&quot; and click Generate.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {variationsList.map((item, idx) => (
                          <div key={item.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                              <span className="font-bold text-[#8A1538] font-mono text-xs">
                                Variant #{idx + 1}:{' '}
                                {Array.isArray(item.attributes)
                                  ? item.attributes.map((a: any) => `${a.attrName}: ${a.option}`).join(' | ')
                                  : JSON.stringify(item.attributes)}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                Relational Item
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600">Regular Price (৳)</label>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleVariationChange(item.id, 'price', e.target.value)}
                                  className="w-full p-1.5 border rounded bg-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600">Sale Price (৳)</label>
                                <input
                                  type="number"
                                  value={item.salePrice}
                                  onChange={(e) => handleVariationChange(item.id, 'salePrice', e.target.value)}
                                  className="w-full p-1.5 border rounded bg-white font-bold text-emerald-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-stone-600">Stock Qty</label>
                                <input
                                  type="number"
                                  value={item.stockQuantity}
                                  onChange={(e) => handleVariationChange(item.id, 'stockQuantity', e.target.value)}
                                  className="w-full p-1.5 border rounded bg-white font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. LINKED PRODUCTS TAB */}
                {activeDataTab === 'linked' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Up-sells (Recommended Products)</label>
                      <input
                        type="text"
                        value={upsellInput}
                        onChange={(e) => setUpsellInput(e.target.value)}
                        placeholder="e.g. খাঁটি সরিষার তেল, লিচু ফুলের মধু"
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Cross-sells (Cart Recommendations)</label>
                      <input
                        type="text"
                        value={crosssellInput}
                        onChange={(e) => setCrosssellInput(e.target.value)}
                        placeholder="e.g. কালজিরা মধু, প্রিমিয়াম পেস্তা বাদাম"
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 7. ADVANCED TAB */}
                {activeDataTab === 'advanced' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Purchase Note (Post-Order Thank You Note)
                      </label>
                      <textarea
                        rows={2}
                        value={purchaseNote}
                        onChange={(e) => setPurchaseNote(e.target.value)}
                        placeholder="অর্ডার করার জন্য ধন্যবাদ! দ্রুত ডেলিভারির জন্য আমাদের প্রতিনিধি কল করবেন।"
                        className="w-full p-3 border rounded-xl text-xs"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Menu Order (Catalog Display Order)
                      </label>
                      <input
                        type="number"
                        value={menuOrder}
                        onChange={(e) => setMenuOrder(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Product Image Card */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-stone-900 pb-2 border-b">
              📸 Main Product Image
            </h3>

            <input
              type="file"
              accept="image/*"
              ref={productImageInputRef}
              onChange={handleProductImageUpload}
              className="hidden"
            />

            {productImage ? (
              <div className="relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group">
                <img src={productImage} alt="Product Main" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeProductImage}
                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-lg text-xs font-bold shadow transition flex items-center gap-1"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => productImageInputRef.current?.click()}
                className="aspect-square bg-stone-50 border-2 border-dashed border-rose-200 hover:border-[#8A1538] rounded-2xl flex flex-col items-center justify-center text-center p-4 cursor-pointer transition group"
              >
                <span className="text-3xl mb-2">📷</span>
                <span className="text-xs font-extrabold text-stone-800 group-hover:text-[#8A1538]">
                  Upload Product Image
                </span>
                <span className="text-[10px] text-stone-400 mt-1">1:1 Ratio Recommended (Optional)</span>
              </div>
            )}
          </div>

          {/* Product Gallery Images */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-stone-900 pb-2 border-b">
              🖼️ Gallery Images
            </h3>

            <input
              type="file"
              accept="image/*"
              multiple
              ref={galleryImageInputRef}
              onChange={handleGalleryUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => galleryImageInputRef.current?.click()}
              className="w-full p-2.5 bg-stone-50 border-2 border-dashed border-stone-300 hover:border-[#8A1538] rounded-xl text-xs font-bold text-stone-700 hover:text-[#8A1538] transition flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>+ Add Gallery Images</span>
            </button>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {galleryImages.map((gUrl, gIdx) => (
                  <div
                    key={gIdx}
                    className="relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200 group"
                  >
                    <img src={gUrl} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />

                    {/* Angle Bracket Movement Buttons */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveGalleryImage(gIdx, 'left');
                        }}
                        disabled={gIdx === 0}
                        className="w-5 h-5 rounded-full bg-white/90 text-stone-900 text-[11px] font-black shadow flex items-center justify-center leading-none text-center disabled:opacity-30 hover:bg-white hover:scale-105 transition"
                        title="Move Left"
                      >
                        &lt;
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveGalleryImage(gIdx, 'right');
                        }}
                        disabled={gIdx === galleryImages.length - 1}
                        className="w-5 h-5 rounded-full bg-white/90 text-stone-900 text-[11px] font-black shadow flex items-center justify-center leading-none text-center disabled:opacity-30 hover:bg-white hover:scale-105 transition"
                        title="Move Right"
                      >
                        &gt;
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGalleryImage(gIdx);
                        }}
                        className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow flex items-center justify-center leading-none text-center hover:bg-rose-700 hover:scale-105 transition"
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MULTIPLE VIDEO LINKS BOX */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-stone-900 pb-2 border-b flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🎥</span>
                <span>Product Video Links ({videoUrls.length})</span>
              </span>
              <span className="text-[9px] bg-rose-50 text-[#8A1538] font-extrabold px-2 py-0.5 rounded border border-rose-100">
                YouTube / Vimeo / MP4
              </span>
            </h3>

            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVideoUrl();
                    }
                  }}
                  placeholder="Paste YouTube, Vimeo or MP4 URL..."
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddVideoUrl}
                  className="px-3 py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
                >
                  + Add
                </button>
              </div>
              <p className="text-[10px] text-stone-400">
                You can add multiple video links. Photos are optional.
              </p>
            </div>

            {/* Added Video URLs List */}
            {videoUrls.length > 0 && (
              <div className="space-y-2 pt-1">
                {videoUrls.map((vUrl, vIdx) => (
                  <div
                    key={vIdx}
                    className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs flex items-center justify-between gap-2 group hover:border-[#8A1538]/40 transition"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-[#8A1538] font-black text-[10px] flex items-center justify-center shrink-0">
                        {vIdx + 1}
                      </span>
                      <span className="font-mono text-[11px] text-stone-700 font-bold truncate">
                        {vUrl}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVideoUrl(vIdx)}
                      className="text-stone-400 hover:text-rose-600 font-bold text-xs shrink-0 p-1 rounded hover:bg-rose-50 transition"
                      title="Remove Video"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Taxonomy Selectors */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-stone-900 pb-2 border-b">🏷️ Product Taxonomy</h3>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-bold"
              >
                <option value="">Select Category...</option>
                {categories.map((c: any) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white font-bold"
              >
                <option value="">Select Brand...</option>
                {brands.map((b: any) => (
                  <option key={b.id || b.name} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. organic, pure, best-seller"
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="checkbox"
                id="isFeat"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-[#8A1538] rounded cursor-pointer"
              />
              <label htmlFor="isFeat" className="text-xs font-bold text-stone-800 cursor-pointer">
                ⭐ Star Featured Product
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
