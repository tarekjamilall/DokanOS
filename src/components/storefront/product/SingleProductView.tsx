'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, CheckCircle2, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';

// 🛍️ ১. ভ্যারিয়েশন টাইপ (WooCommerce Style)
export interface ProductVariation {
  id: string;
  attributes: {
    size?: string;
    color?: string;
  };
  price: number;
  regularPrice?: number;
  image?: string;
  inStock?: boolean;
}

export interface SingleProductType {
  id: string;
  title: string;
  slug: string;
  categoryName?: string;
  price: number;
  regularPrice?: number;
  inStock: boolean;
  images: string[];
  description: string;
  features?: string[];
  sizes?: string[];
  colors?: string[];
  variations?: ProductVariation[]; // ডায়নামিক ভ্যারিয়েশন ডাটা
}

interface SingleProductViewProps {
  product: SingleProductType;
}

export default function SingleProductView({ product }: SingleProductViewProps) {
  const router = useRouter();

  // লোকাল স্টেটসমূহ
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || '/placeholder-product.png');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  // ডায়নামিক প্রাইস ও স্টক স্টেট
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentRegularPrice, setCurrentRegularPrice] = useState(product.regularPrice);
  const [isCurrentInStock, setIsCurrentInStock] = useState(product.inStock);

  // 🔄 কালার বা সাইজ পরিবর্তন হলে ছবি ও দাম অটোমেটিক আপডেট করার লজিক
  useEffect(() => {
    if (product.variations && product.variations.length > 0) {
      const matchedVariation = product.variations.find((v) => {
        const matchSize = !v.attributes.size || v.attributes.size === selectedSize;
        const matchColor = !v.attributes.color || v.attributes.color === selectedColor;
        return matchSize && matchColor;
      });

      if (matchedVariation) {
        setCurrentPrice(matchedVariation.price);
        if (matchedVariation.regularPrice) {
          setCurrentRegularPrice(matchedVariation.regularPrice);
        }
        if (matchedVariation.image) {
          setSelectedImage(matchedVariation.image);
        }
        if (matchedVariation.inStock !== undefined) {
          setIsCurrentInStock(matchedVariation.inStock);
        }
      }
    }
  }, [selectedSize, selectedColor, product.variations]);

  // 🧮 মোট মূল্য হিসাব (Quantity × Unit Price)
  const totalPrice = currentPrice * quantity;

  // ডিসকাউন্ট পার্সেন্টেজ হিসাব
  const hasDiscount = currentRegularPrice && currentRegularPrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((currentRegularPrice! - currentPrice) / currentRegularPrice!) * 100)
    : 0;

  // টাকা ফরম্যাটিং
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD').format(amount);
  };

  // কোয়ান্টিটি হ্যান্ডলার
  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') setQuantity((prev) => prev + 1);
    if (type === 'dec' && quantity > 1) setQuantity((prev) => prev - 1);
  };

  // বাই নাউ (চেকাউট পেজে রিডাইরেক্ট)
  const handleBuyNow = () => {
    router.push(
      `/checkout?product=${product.id}&qty=${quantity}&size=${encodeURIComponent(selectedSize)}&color=${encodeURIComponent(selectedColor)}&total=${totalPrice}`
    );
  };

  // কার্টে যোগ করার হ্যান্ডলার
  const handleAddToCart = () => {
    alert(
      `কার্টে যোগ করা হয়েছে: ${product.title}\nকালার: ${selectedColor || 'N/A'}\nসাইজ: ${selectedSize || 'N/A'}\nপরিমাণ: ${quantity}টি\nমোট দাম: ৳ ${formatAmount(totalPrice)}`
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* ব্যাক বাটন */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#8A1538] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পেছনে যান</span>
        </button>

        {/* 🛍️ মূল প্রোডাক্ট কন্টেইনার */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 md:p-8 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* 🖼️ ইমেজ গ্যালারি */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl bg-stone-100 overflow-hidden border border-stone-200/60">
              {hasDiscount && isCurrentInStock && (
                <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                  -{discountPercentage}% ছাড়
                </span>
              )}
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* থাম্বনেইল লিস্ট */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === imgUrl
                        ? 'border-[#8A1538] ring-2 ring-[#8A1538]/20'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 📝 প্রোডাক্ট ইনফো ও প্রাইসিং */}
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              {product.categoryName && (
                <span className="text-xs font-bold text-[#8A1538] bg-rose-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {product.categoryName}
                </span>
              )}
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isCurrentInStock
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCurrentInStock ? 'স্টকে আছে' : 'স্টক আউট'}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-snug">
              {product.title}
            </h1>

            {/* 💰 ডায়নামিক প্রাইস ডিসপ্লে (পরিমাণ ও ভ্যারিয়েশন অনুযায়ী) */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between">
              <div>
                <span className="text-2xl font-black text-[#8A1538]">
                  ৳ {formatAmount(totalPrice)}
                </span>
                {quantity > 1 && (
                  <span className="text-xs font-semibold text-stone-500 block">
                    (প্রতিটি ৳ {formatAmount(currentPrice)})
                  </span>
                )}
              </div>
              {hasDiscount && (
                <s className="text-sm font-bold text-stone-400 line-through">
                  ৳ {formatAmount(currentRegularPrice! * quantity)}
                </s>
              )}
            </div>

            {/* 🎨 কালার সেলেক্টর */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  কালার সিলেক্ট করুন: <span className="text-[#8A1538]">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        selectedColor === color
                          ? 'bg-[#8A1538] text-white border-[#8A1538] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 📏 সাইজ সেলেক্টর */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  সাইজ সিলেক্ট করুন: <span className="text-[#8A1538]">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[42px] h-9 px-3 text-xs font-bold rounded-xl border transition-all ${
                        selectedSize === size
                          ? 'bg-[#8A1538] text-white border-[#8A1538] shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔢 কোয়ান্টিটি সিলেক্টর */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">পরিমাণ:</label>
              <div className="inline-flex items-center rounded-xl border border-stone-200 bg-white p-1">
                <button
                  onClick={() => handleQuantityChange('dec')}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-black text-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange('inc')}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 🚀 বাটনসমূহ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={!isCurrentInStock}
                onClick={handleAddToCart}
                className="h-12 bg-white border-2 border-[#8A1538] text-[#8A1538] hover:bg-rose-50 text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                type="button"
                disabled={!isCurrentInStock}
                onClick={handleBuyNow}
                className="h-12 bg-[#8A1538] hover:bg-[#6e102c] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-rose-900/10 transition-all active:scale-98 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>অর্ডার করুন (৳ {formatAmount(totalPrice)})</span>
              </button>
            </div>

            {/* ট্রাস্ট ব্যাজ */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-3 text-[11px] text-stone-600 font-semibold">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8A1538]" />
                <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8A1538]" />
                <span>১০০% অরিজিনাল প্রডাক্ট</span>
              </div>
            </div>

          </div>
        </div>

        {/* 📖 বিবরণী ও ফিচার */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-2xs space-y-6">
          <h2 className="text-base font-extrabold text-stone-900 border-b border-stone-100 pb-3">
            পণ্য বিবরণী ও বৈশিষ্ট্যসমূহ
          </h2>

          <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
            <p>{product.description}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                মূল বৈশিষ্ট্যসমূহ:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      {/* 📱 মোবাইল স্টিকি ফুটার */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 z-50 flex items-center gap-2">
        <button
          type="button"
          disabled={!isCurrentInStock}
          onClick={handleAddToCart}
          className="h-11 w-12 border border-stone-200 rounded-xl flex items-center justify-center text-stone-700 shrink-0 active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={!isCurrentInStock}
          onClick={handleBuyNow}
          className="h-11 flex-1 bg-[#8A1538] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 disabled:opacity-50"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>অর্ডার করুন (৳ {formatAmount(totalPrice)})</span>
        </button>
      </div>

    </div>
  );
}
