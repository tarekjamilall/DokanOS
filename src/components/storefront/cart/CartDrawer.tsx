'use client';

import React from 'react';
import { useCartStore, CartItem } from '@/store/useCartStore';

type CartDrawerProps = {
  domain: string;
};

export default function CartDrawer({ domain }: CartDrawerProps) {
  const {
    cart,
    isCartDrawerOpen,
    toggleCartDrawer,
    removeItem,
    updateQuantity,
    getCartTotal,
  } = useCartStore();

  if (!isCartDrawerOpen) return null;

  const totalPayable = getCartTotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={() => toggleCartDrawer(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200 flex flex-col justify-between animate-in slide-in-from-right duration-250">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="text-base font-black text-stone-900">আপনার শপিং কার্ট</h2>
              <span className="text-[10px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full">
                {cart.length} টি আইটেম
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleCartDrawer(false)}
              className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-bold text-xs flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl">
                  🛒
                </div>
                <h3 className="font-extrabold text-stone-800 text-sm">আপনার কার্ট বর্তমানে খালি</h3>
                <p className="text-xs text-stone-400 max-w-xs">
                  পছন্দের প্রোডাক্টের উপর ক্লিক করে &quot;অর্ডার করুন&quot; বাটনে চাপ দিয়ে প্রোডাক্ট যুক্ত করুন।
                </p>
              </div>
            ) : (
              cart.map((item: CartItem) => (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                  {/* Thumbnail */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 text-xl shrink-0">
                      📦
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-extrabold text-xs text-stone-900 truncate">
                      {item.title}
                    </h4>
                    {item.selectedVariant && (
                      <span className="text-[10px] text-stone-500 font-mono block">
                        ভ্যারিয়েন্ট: {item.selectedVariant}
                      </span>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-0.5 hover:bg-stone-100 text-stone-700"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-stone-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-0.5 hover:bg-stone-100 text-stone-700"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <span className="font-black text-xs text-[#8A1538]">
                        ৳{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-stone-300 hover:text-rose-600 text-xs p-1 transition"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="flex justify-between items-center text-sm font-extrabold text-stone-900">
                <span>সর্বমোট বিল (Subtotal):</span>
                <span className="text-base font-black text-[#8A1538]">৳{totalPayable}</span>
              </div>
              <p className="text-[10px] text-stone-400">
                * ডেলিভারি চার্জ এবং ডিসকাউন্ট কুপন চেকআউট পেজে যুক্ত হবে।
              </p>

              <a
                href={`/${domain}/checkout`}
                onClick={() => toggleCartDrawer(false)}
                className="w-full py-3 bg-[#8A1538] hover:bg-rose-900 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer text-center block"
              >
                <span>অর্ডার কনফার্ম করতে এগিয়ে যান ➔</span>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}