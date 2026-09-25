'use client';

import React, { useState, useEffect } from 'react';
import { Product, StockStatus } from './ProductList';

type ProductQuickEditModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
};

export default function ProductQuickEditModal({
  isOpen,
  product,
  onClose,
  onSave,
}: ProductQuickEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...product, ...formData } as Product);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        <div className="border-b border-stone-100 pb-2">
          <h3 className="font-extrabold text-base text-stone-900">
            ⚡ Quick Edit Product #{product.numericId || product.id}
          </h3>
          <p className="text-[11px] text-stone-400 font-mono">Fast inline modifications</p>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-extrabold text-stone-700 block mb-1">Product Title</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-stone-700 block mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-stone-900 focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-extrabold text-stone-700 block mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: Number(e.target.value),
                    stockStatus: Number(e.target.value) > 0 ? 'instock' : 'outofstock',
                  })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-stone-900 focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-stone-700 block mb-1">Regular Price (৳)</label>
              <input
                type="number"
                value={formData.regularPrice ?? 0}
                onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
                className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-stone-900 focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-extrabold text-stone-700 block mb-1">Sale Price (৳)</label>
              <input
                type="number"
                value={formData.salePrice ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl font-mono text-stone-900 focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-stone-700 block mb-1">Stock Status</label>
              <select
                value={formData.stockStatus || 'instock'}
                onChange={(e) =>
                  setFormData({ ...formData, stockStatus: e.target.value as StockStatus })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl font-bold text-stone-800 bg-white"
              >
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="onbackorder">On Backorder</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-stone-700 block mb-1">Publish Status</label>
              <select
                value={formData.status || 'published'}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl font-bold text-stone-800 bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
