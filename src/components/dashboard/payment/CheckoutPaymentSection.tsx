'use client';

import { useState } from 'react';
import { PaymentMethod } from './PaymentSettingsTab';

interface CheckoutPaymentSectionProps {
  mfsMethods: PaymentMethod[];
  paymentMethod: string;
  setPaymentMethod: (id: string) => void;
  formData: {
    bkashNumber: string;
    trxId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function CheckoutPaymentSection({
  mfsMethods,
  paymentMethod,
  setPaymentMethod,
  formData,
  handleInputChange,
}: CheckoutPaymentSectionProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('নাম্বারটি কপি করা হয়েছে!');
  };

  const selectedMfs = mfsMethods.find((m) => m.id === paymentMethod);

  return (
    <div className="border border-gray-200 p-4 md:p-8 bg-white shadow-xs rounded-xl font-sans">
      <h2 className="text-base md:text-lg font-bold text-[#3B3433] mb-6 border-b border-gray-100 pb-4">
        পেমেন্ট অপশন
      </h2>

      {/* Payment Option Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        {mfsMethods.map((method) => {
          const isSelected = paymentMethod === method.id;
          return (
            <label
              key={method.id}
              className={`flex items-center p-3.5 md:p-4 border rounded-xl cursor-pointer transition-all ${
                isSelected ? 'border-[#8A1538] bg-red-50/10 shadow-xs' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={isSelected}
                onChange={() => setPaymentMethod(method.id)}
                className="hidden"
              />
              <div
                className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 ${
                  isSelected ? 'border-[#8A1538]' : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#8A1538]"></div>}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#3B3433] text-xs sm:text-sm capitalize leading-tight">
                  {method.provider}
                </span>
                {method.id !== 'cod' && (
                  <span className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-wider">
                    {method.type}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Selected Method Instructions & Input Panel */}
      {selectedMfs && (
        <div className="border border-orange-200 bg-[#FCFBF8] p-4 md:p-6 rounded-xl animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {selectedMfs.id !== 'cod' && (
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="bg-[#A46522] text-white text-[10px] font-bold px-2 py-1 rounded-xs uppercase tracking-widest">
                    {selectedMfs.type}
                  </span>
                  <span className="text-[#8A1538] font-black text-lg md:text-xl tracking-wider font-mono">
                    {selectedMfs.number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedMfs.number)}
                    className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-bold hover:bg-gray-300 transition-colors flex items-center gap-1 active:scale-95"
                  >
                    কপি করুন
                  </button>
                </div>
              )}

              <div
                className={`text-gray-600 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line bg-white/50 p-3.5 md:p-4 border border-gray-100 rounded-lg ${
                  selectedMfs.id !== 'cod' ? 'mb-6' : ''
                }`}
              >
                {selectedMfs.instructions}
              </div>

              {selectedMfs.id !== 'cod' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      যে নম্বর থেকে টাকা পাঠিয়েছেন (১১ ডিজিট) *
                    </label>
                    <input
                      type="tel"
                      name="bkashNumber"
                      value={formData.bkashNumber}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-sm outline-none focus:border-[#8A1538] rounded-lg tracking-widest font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">TrxID (ট্রানজেকশন আইডি) *</label>
                    <input
                      type="text"
                      name="trxId"
                      value={formData.trxId}
                      onChange={handleInputChange}
                      placeholder="যেমন: 8N7A6B5C"
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-sm outline-none focus:border-[#8A1538] rounded-lg uppercase font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {selectedMfs.qrCodeUrl && selectedMfs.id !== 'cod' && (
              <div className="w-full md:w-32 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                <div className="w-24 h-24 bg-white p-1 border border-gray-200 rounded-xl shadow-xs mb-2">
                  <img src={selectedMfs.qrCodeUrl} alt="QR Code" className="w-full h-full object-cover rounded-lg" />
                </div>
                <p className="text-[10px] text-center text-gray-500 font-bold tracking-widest uppercase">
                  স্ক্যান করে পে করুন
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
