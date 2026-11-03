'use client';

import React, { useState, useMemo } from 'react';
import ProductCard, { ProductType } from '@/components/storefront/product/ProductCard';
import { Search, SlidersHorizontal, X, RotateCcw, ShoppingBag } from 'lucide-react';

interface ShopViewProps {
  initialProducts: ProductType[];
}

export default function ShopView({ initialProducts }: ShopViewProps) {
  // লোকাল স্টেটসমূহ (Search, Filters, Sort)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'low-to-high' | 'high-to-low'>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // ইউনিক ক্যাটাগরি লিস্ট এক্সট্র্যাক্ট করা
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.categoryName) cats.add(p.categoryName);
    });
    return ['All', ...Array.from(cats)];
  }, [initialProducts]);

  // 🔍 ফিল্টারিং ও সোর্টিং লজিক
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // ১. সার্চ ফিল্টার
        const matchesSearch = product.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // ২. ক্যাটাগরি ফিল্টার
        const matchesCategory =
          selectedCategory === 'All' || product.categoryName === selectedCategory;

        // ৩. প্রাইস ফিল্টার
        const matchesPrice = product.price <= maxPrice;

        // ৪. ইন-স্টক ফিল্টার
        const matchesStock = inStockOnly ? product.inStock !== false : true;

        return matchesSearch && matchesCategory && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        // সোর্টিং
        if (sortBy === 'low-to-high') return a.price - b.price;
        if (sortBy === 'high-to-low') return b.price - a.price;
        return 0; // Default / Newest
      });
  }, [initialProducts, searchQuery, selectedCategory, maxPrice, inStockOnly, sortBy]);

  // ফিল্টার রিসেট হেলপার
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMaxPrice(5000);
    setInStockOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* 🏷️ টপ হেডার ও সার্চ / সোর্ট বার */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#8A1538]" />
                <span>শপ ক্যাটালগ</span>
              </h1>
              <p className="text-xs text-stone-500 font-semibold mt-1">
                সর্বমোট <span className="text-[#8A1538] font-bold">{filteredProducts.length}</span> টি পণ্য পাওয়া গেছে
              </p>
            </div>

            {/* সার্চ বার ও মোবাইল ফিল্টার বাটন */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* সার্চ ইনপুট */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full h-10 pl-9 pr-3 text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538] outline-none transition-all"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-3 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* মোবাইল ফিল্টার বাটন */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden h-10 px-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-stone-100"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#8A1538]" />
                <span>ফিল্টার</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🛍️ শপ লেআউট (সাইডবার + প্রোডাক্ট গ্রিড) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 🎛️ ডেস্কটপ সাইডবার ফিল্টার (৩ কলাম) */}
          <div className="hidden lg:block lg:col-span-3 space-y-5 bg-white rounded-3xl border border-stone-200/80 p-5 shadow-2xs sticky top-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#8A1538]" />
                <span>ফিল্টার প্যানেল</span>
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-[#8A1538] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            </div>

            {/* সোর্টিং ফিল্টার */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">সাজান (Sort By):</label>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 text-xs font-bold text-stone-800 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-[#8A1538]"
              >
                <option value="newest">নতুন পণ্য আগে</option>
                <option value="low-to-high">দাম: কম থেকে বেশি</option>
                <option value="high-to-low">দাম: বেশি থেকে কম</option>
              </select>
            </div>

            {/* ক্যাটাগরি ফিল্টার */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700 block">ক্যাটাগরি:</label>
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-rose-50 text-[#8A1538] border border-rose-200'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat === 'All' ? 'সকল ক্যাটাগরি' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* প্রাইস রেঞ্জ ফিল্টার */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                <span>সর্বোচ্চ বাজেট:</span>
                <span className="text-[#8A1538]">৳ {maxPrice}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#8A1538] cursor-pointer"
              />
            </div>

            {/* ইন-স্টক ফিল্টার টগল */}
            <div className="pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#8A1538]"
                />
                <span className="text-xs font-bold text-stone-700">শুধু স্টকে থাকা পণ্য</span>
              </label>
            </div>
          </div>

          {/* 📦 প্রোডাক্ট গ্রিড সেকশন (৯ কলাম) */}
          <div className="lg:col-span-9">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => alert(`কার্টে যোগ করা হয়েছে: ${p.title}`)}
                    onBuyNow={(p) => alert(`অর্ডার করা হচ্ছে: ${p.title}`)}
                  />
                ))}
              </div>
            ) : (
              /* কোনো প্রডাক্ট না পাওয়া গেলে ফাঁকা স্টেট */
              <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-[#8A1538] rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-stone-900">
                  কোনো পণ্য খুঁজে পাওয়া যায়নি!
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো পণ্য এই মুহূর্তে নেই। দয়া করে ফিল্টার পরিবর্তন বা রিসেট করুন।
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#8A1538] text-white text-xs font-bold rounded-xl hover:bg-[#6e102c] transition-all"
                >
                  সব ফিল্টার রিসেট করুন
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 📱 মোবাইল স্লাইড-আউট ফিল্টার ড্রোয়ার */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 space-y-5 overflow-y-auto z-10 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#8A1538]" />
                <span>ফিল্টার অপশন</span>
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* সোর্টিং ফিল্টার */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">সাজান (Sort By):</label>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 text-xs font-bold text-stone-800 bg-stone-50 border border-stone-200 rounded-xl outline-none"
              >
                <option value="newest">নতুন পণ্য আগে</option>
                <option value="low-to-high">দাম: কম থেকে বেশি</option>
                <option value="high-to-low">দাম: বেশি থেকে কম</option>
              </select>
            </div>

            {/* ক্যাটাগরি ফিল্টার */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-700 block">ক্যাটাগরি:</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                      selectedCategory === cat
                        ? 'bg-rose-50 text-[#8A1538] border border-rose-200'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {cat === 'All' ? 'সকল ক্যাটাগরি' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* প্রাইস ফিল্টার */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                <span>সর্বোচ্চ বাজেট:</span>
                <span className="text-[#8A1538]">৳ {maxPrice}</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#8A1538]"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="flex-1 h-10 border border-stone-200 text-stone-700 text-xs font-bold rounded-xl"
              >
                রিসেট
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-10 bg-[#8A1538] text-white text-xs font-bold rounded-xl"
              >
                প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
