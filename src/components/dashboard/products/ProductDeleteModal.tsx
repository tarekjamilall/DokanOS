'use client';

import React from 'react';
import { Product } from './ProductList';

type ProductDeleteModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export default function ProductDeleteModal({
  isOpen,
  product,
  onClose,
  onConfirm,
  isDeleting = false,
}: ProductDeleteModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        {/* Header Icon & Warning Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 font-black flex items-center justify-center text-xl shrink-0">
            🗑️
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900">
              Delete Product?
            </h3>
            <p className="text-[11px] text-stone-400 font-mono">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Product Details Preview */}
        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl flex items-center gap-3">
          {product.featuredImage ? (
            <img
              src={product.featuredImage}
              alt={product.name || 'Product'}
              className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-lg shrink-0">
              🖼️
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-0.5">
            <h4 className="font-extrabold text-xs text-stone-900 truncate">
              {product.name || product.title || 'Untitled Product'}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
              <span>ID: #{product.numericId}</span>
              {product.sku && <span>• SKU: {product.sku}</span>}
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <p className="text-xs text-stone-600 leading-relaxed">
          Are you sure you want to permanently delete this product from your inventory?
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Yes, Delete Product</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
