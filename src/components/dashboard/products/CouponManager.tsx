'use client';

import React, { useState } from 'react';

export type Coupon = {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: number;
  minSpend?: number;
  applicableProducts?: string[]; // IDs or Names of specific products
  limitUsageToXItems?: number;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  status: 'active' | 'expired' | 'disabled';
  description?: string;
};

type CouponManagerProps = {
  initialCoupons?: Coupon[];
  availableProducts?: { id: string; name: string }[];
  onCouponChange?: (coupons: Coupon[]) => void;
};

// Default Sample Products for Selector
const DEFAULT_PRODUCTS = [
  { id: 'prod-1', name: 'Ray-Ban Aviator Sunglasses' },
  { id: 'prod-2', name: 'Rolex Submariner Watch' },
  { id: 'prod-3', name: 'Nike Air Max Sneakers' },
  { id: 'prod-4', name: '100% Organic Cotton T-Shirt' },
];

export default function CouponManager({
  initialCoupons = [],
  availableProducts = DEFAULT_PRODUCTS,
  onCouponChange,
}: CouponManagerProps) {
  // Coupon List State
  const [coupons, setCoupons] = useState<Coupon[]>(
    initialCoupons.length > 0
      ? initialCoupons
      : [
          {
            id: 'coup-1',
            code: 'SUMMER500',
            discountType: 'fixed_cart',
            amount: 500,
            minSpend: 2500,
            expiryDate: '2026-10-31',
            usageLimit: 100,
            usageCount: 28,
            status: 'active',
            description: 'Flat ৳500 OFF on order total above ৳2,500',
          },
          {
            id: 'coup-2',
            code: 'RAYBAN1000',
            discountType: 'fixed_product',
            amount: 1000,
            minSpend: 3000,
            applicableProducts: ['prod-1'],
            limitUsageToXItems: 2,
            expiryDate: '2026-12-31',
            usageLimit: 50,
            usageCount: 14,
            status: 'active',
            description: 'Flat ৳1,000 OFF per Ray-Ban Sunglass (Max 2 items)',
          },
          {
            id: 'coup-3',
            code: 'LUXURY20',
            discountType: 'percent',
            amount: 20,
            minSpend: 5000,
            expiryDate: '2026-12-31',
            usageLimit: 50,
            usageCount: 12,
            status: 'active',
            description: '20% OFF on Storefront Purchases',
          },
        ]
  );

  // Form States for Adding Coupon
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed_cart' | 'fixed_product'>('fixed_cart');
  const [amount, setAmount] = useState<number | ''>('');
  const [minSpend, setMinSpend] = useState<number | ''>('');
  const [applicableProducts, setApplicableProducts] = useState<string[]>([]);
  const [limitUsageToXItems, setLimitUsageToXItems] = useState<number | ''>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Centered Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; coupon: Coupon | null }>({
    show: false,
    coupon: null,
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

  // Helper: Auto Code Generator
  const generateRandomCode = () => {
    const prefixes = ['PROMO', 'LUX', 'VIP', 'DEAL', 'SAVE'];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    setCode(`${prefix}${randomNum}`);
  };

  // Toggle Product Selection for Add Form
  const toggleAddProductSelection = (productId: string) => {
    if (applicableProducts.includes(productId)) {
      setApplicableProducts(applicableProducts.filter((id) => id !== productId));
    } else {
      setApplicableProducts([...applicableProducts, productId]);
    }
  };

  // Toggle Product Selection for Edit Modal
  const toggleEditProductSelection = (productId: string) => {
    if (!editingCoupon) return;
    const current = editingCoupon.applicableProducts || [];
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];

    setEditingCoupon({ ...editingCoupon, applicableProducts: updated });
  };

  // Add Coupon Handler
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Please enter or generate a coupon code.', 'error');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showToast('Please enter a valid discount amount.', 'error');
      return;
    }

    if (discountType === 'fixed_product' && applicableProducts.length === 0) {
      showToast('Please select at least one applicable product for Fixed Product Discount.', 'error');
      return;
    }

    const formattedCode = code.trim().toUpperCase();

    if (coupons.some((c) => c.code === formattedCode)) {
      showToast('A coupon with this promo code already exists!', 'error');
      return;
    }

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: formattedCode,
      discountType,
      amount: Number(amount),
      minSpend: minSpend !== '' ? Number(minSpend) : undefined,
      applicableProducts: applicableProducts.length > 0 ? applicableProducts : undefined,
      limitUsageToXItems: limitUsageToXItems !== '' ? Number(limitUsageToXItems) : undefined,
      expiryDate: expiryDate || undefined,
      usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
      usageCount: 0,
      status: 'active',
      description: description.trim(),
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    if (onCouponChange) onCouponChange(updated);

    // Reset Form
    setCode('');
    setDiscountType('fixed_cart');
    setAmount('');
    setMinSpend('');
    setApplicableProducts([]);
    setLimitUsageToXItems('');
    setExpiryDate('');
    setUsageLimit('');
    setDescription('');
    showToast('🎉 New promotional coupon created successfully!', 'success');
  };

  // Confirm Delete Action
  const confirmDeleteCoupon = () => {
    if (!deleteModal.coupon) return;

    const targetId = deleteModal.coupon.id;
    const updated = coupons.filter((c) => c.id !== targetId);

    setCoupons(updated);
    if (onCouponChange) onCouponChange(updated);

    setDeleteModal({ show: false, coupon: null });
    showToast('Coupon deleted successfully.', 'success');
  };

  // Save Edit Coupon
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editingCoupon.code.trim()) return;

    if (editingCoupon.discountType === 'fixed_product' && (!editingCoupon.applicableProducts || editingCoupon.applicableProducts.length === 0)) {
      showToast('Please select at least one product for Fixed Product Discount.', 'error');
      return;
    }

    const updated = coupons.map((c) =>
      c.id === editingCoupon.id
        ? {
            ...editingCoupon,
            code: editingCoupon.code.trim().toUpperCase(),
            amount: Number(editingCoupon.amount) || 0,
            minSpend: editingCoupon.minSpend ? Number(editingCoupon.minSpend) : undefined,
            limitUsageToXItems: editingCoupon.limitUsageToXItems ? Number(editingCoupon.limitUsageToXItems) : undefined,
            usageLimit: editingCoupon.usageLimit ? Number(editingCoupon.usageLimit) : undefined,
          }
        : c
    );
    setCoupons(updated);
    if (onCouponChange) onCouponChange(updated);
    setEditingCoupon(null);
    showToast('Coupon details updated successfully!', 'success');
  };

  // Filtered Coupons List
  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <h2 className="text-base font-black text-[#3B3433]">🎟️ Promotional Coupons & Discounts</h2>
            <span className="text-[9px] bg-gradient-to-r from-[#8A1538] to-rose-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              PRO SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Manage Promo Codes, Product Level Restrictions & Usage Rules
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active Coupons: <strong className="text-[#8A1538]">{coupons.length}</strong></span>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Add New Coupon Form (4 Cols) */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleAddCoupon}
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4 sticky top-20"
          >
            <h3 className="font-extrabold text-xs text-stone-900 border-b pb-2 flex items-center justify-between">
              <span>➕ Add New Coupon</span>
              <span className="text-[10px] text-[#8A1538] font-mono font-bold">DISCOUNT</span>
            </h3>

            {/* Coupon Promo Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Promo Code <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[10px] font-bold text-[#8A1538] hover:underline"
                >
                  ⚡ Auto Code
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. RAYBAN1000, SUMMER500"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-black tracking-wider border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none transition placeholder:text-stone-300 uppercase"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs font-bold border border-stone-300 rounded-xl bg-white focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              >
                <option value="fixed_cart">💵 Fixed Cart Discount (পুরো বিলে মোট ছাড়)</option>
                <option value="fixed_product">📦 Fixed Product Discount (নির্দিষ্ট প্রোডাক্টে পার-আইটেম ছাড়)</option>
                <option value="percent">% Percentage Discount (শতাংশ ছাড়)</option>
              </select>
            </div>

            {/* Coupon Amount */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Discount Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder={discountType === 'percent' ? 'e.g. 20' : 'e.g. 500'}
                  className="w-full pl-8 pr-3 py-2.5 text-xs font-bold border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
                />
                <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-xs">
                  {discountType === 'percent' ? '%' : '৳'}
                </span>
              </div>
            </div>

            {/* DYNAMIC SECTION: Applicable Products Selection */}
            {discountType === 'fixed_product' && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <label className="block text-[11px] font-extrabold text-amber-900">
                  🎯 Select Applicable Products <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {availableProducts.map((p) => {
                    const isSelected = applicableProducts.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleAddProductSelection(p.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between border transition ${
                          isSelected
                            ? 'bg-[#8A1538] text-white border-[#8A1538]'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="text-[10px] ml-2 shrink-0">{isSelected ? '✓ Added' : '+ Add'}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Limit Usage to X Items */}
                <div>
                  <label className="block text-[10px] font-bold text-amber-800 mb-1">
                    Limit Discount to X Items per Order (Optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={limitUsageToXItems}
                    onChange={(e) => setLimitUsageToXItems(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 2 (সর্বোচ্চ ২টি আইটেমে ছাড় পাবে)"
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-[#8A1538]"
                  />
                </div>
              </div>
            )}

            {/* Minimum Spend */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Minimum Cart Spend (Optional)
              </label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-[#8A1538]"
              />
            </div>

            {/* Expiry Date & Usage Limit */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 100"
                  className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Voucher Summary / Terms
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Flat ৳1000 OFF on Ray-Ban Sunglasses..."
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow transition"
            >
              + Create Coupon
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Coupon Directory Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Toolbar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by promo code e.g. RAYBAN1000, SUMMER500..."
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
                    <th className="p-3.5">Promo Code</th>
                    <th className="p-3.5">Type & Value</th>
                    <th className="p-3.5">Target Products</th>
                    <th className="p-3.5 text-center">Usage</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400 font-bold">
                        No coupons match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3">
                          <span className="font-mono font-black text-xs text-[#8A1538] tracking-wider block">
                            🎟️ {coupon.code}
                          </span>
                          {coupon.description && (
                            <p className="text-[10px] text-stone-400 truncate max-w-xs mt-0.5">
                              {coupon.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3 font-extrabold text-stone-900">
                          <div>
                            {coupon.discountType === 'percent'
                              ? `${coupon.amount}% OFF`
                              : `৳${coupon.amount} OFF`}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-stone-400 uppercase">
                            {coupon.discountType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-[11px]">
                          {coupon.discountType === 'fixed_product' ? (
                            <div>
                              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[9px]">
                                🎯 {coupon.applicableProducts?.length || 0} Products
                              </span>
                              {coupon.limitUsageToXItems && (
                                <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                                  Max {coupon.limitUsageToXItems} items/order
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-stone-400 font-bold text-[10px]">Entire Cart</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className="px-2 py-0.5 bg-stone-100 rounded-full text-[10px] text-stone-700">
                            {coupon.usageCount || 0}
                            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                              coupon.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : coupon.status === 'expired'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}
                          >
                            {coupon.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setEditingCoupon({ ...coupon })}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteModal({ show: true, coupon })}
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
      {deleteModal.show && deleteModal.coupon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setDeleteModal({ show: false, coupon: null })}
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
                <p className="text-[11px] text-stone-400 font-mono">Permanent Coupon Removal</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs space-y-2 text-stone-700">
              <p>
                Are you sure you want to delete coupon:{' '}
                <strong className="text-[#8A1538] font-bold">&quot;{deleteModal.coupon.code}&quot;</strong>?
              </p>
              <p className="text-[10px] text-stone-500 font-medium">
                This action cannot be undone. Customers will no longer be able to apply this voucher code at checkout.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeleteModal({ show: false, coupon: null })}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteCoupon}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ EDIT COUPON POPUP MODAL */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setEditingCoupon(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-3">
              <h3 className="font-black text-sm text-stone-900">✏️ Quick Edit Coupon</h3>
              <p className="text-[10px] text-stone-400 font-mono">Update Promo Voucher Attributes</p>
            </div>

            <div className="space-y-3">
              {/* Promo Code */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Promo Code</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code ?? ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-mono font-black text-[#8A1538]"
                />
              </div>

              {/* Discount Type & Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType ?? 'fixed_cart'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-xl bg-white font-bold"
                  >
                    <option value="fixed_cart">Fixed Cart (৳)</option>
                    <option value="fixed_product">Fixed Product (৳)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.amount ?? ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, amount: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* DYNAMIC SECTION: Applicable Products for Fixed Product */}
              {editingCoupon.discountType === 'fixed_product' && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                  <label className="block text-[11px] font-extrabold text-amber-900">
                    🎯 Applicable Products <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {availableProducts.map((p) => {
                      const isSelected = (editingCoupon.applicableProducts || []).includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleEditProductSelection(p.id)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] font-bold flex items-center justify-between border transition ${
                            isSelected
                              ? 'bg-[#8A1538] text-white border-[#8A1538]'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] ml-2 shrink-0">{isSelected ? '✓ Added' : '+ Add'}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-1">
                      Limit Usage to X Items per Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingCoupon.limitUsageToXItems ?? ''}
                      onChange={(e) =>
                        setEditingCoupon({
                          ...editingCoupon,
                          limitUsageToXItems: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g. 2"
                      className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Minimum Spend */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Minimum Cart Spend (৳)</label>
                <input
                  type="number"
                  value={editingCoupon.minSpend ?? ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, minSpend: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 2500"
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl font-bold"
                />
              </div>

              {/* Expiry Date & Usage Limit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingCoupon.expiryDate ?? ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={editingCoupon.usageLimit ?? ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 100"
                    className="w-full px-2.5 py-2 text-xs border border-stone-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Coupon Status */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Coupon Status</label>
                <select
                  value={editingCoupon.status ?? 'active'}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, status: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl bg-white font-bold"
                >
                  <option value="active">🟢 Active</option>
                  <option value="disabled">⚪ Disabled</option>
                  <option value="expired">🔴 Expired</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Summary Terms</label>
                <textarea
                  rows={2}
                  value={editingCoupon.description ?? ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
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
