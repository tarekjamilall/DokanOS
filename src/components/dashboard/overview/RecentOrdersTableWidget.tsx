'use client';

import React from 'react';

type OrderItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  grandTotal: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  createdAt: string;
};

const SAMPLE_RECENT_ORDERS: OrderItem[] = [
  {
    id: 'ord-101',
    orderNumber: '#ORD-8821',
    customerName: 'আরিফুল ইসলাম',
    customerPhone: '01712345678',
    grandTotal: 2450,
    status: 'pending',
    createdAt: '১০ মিনিট আগে',
  },
  {
    id: 'ord-102',
    orderNumber: '#ORD-8820',
    customerName: 'সুমাইয়া আক্তার',
    customerPhone: '01898765432',
    grandTotal: 1800,
    status: 'processing',
    createdAt: '২৫ মিনিট আগে',
  },
  {
    id: 'ord-103',
    orderNumber: '#ORD-8819',
    customerName: 'কামরুল হাসান',
    customerPhone: '01911223344',
    grandTotal: 3200,
    status: 'delivered',
    createdAt: '২ ঘণ্টা আগে',
  },
];

type RecentOrdersTableWidgetProps = {
  orders?: OrderItem[];
  onNavigateTab?: (tab: string, sub?: string) => void;
};

export default function RecentOrdersTableWidget({
  orders = SAMPLE_RECENT_ORDERS,
  onNavigateTab,
}: RecentOrdersTableWidgetProps) {
  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">পেন্ডিং</span>;
      case 'processing':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">প্রসেসিং</span>;
      case 'delivered':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">ডেলিভার্ড</span>;
      case 'cancelled':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">ক্যানসেলড</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>🛒</span>
            <span>সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">সর্বশেষ আসা ৫টি গ্রাহক অর্ডার</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('ecommerce', 'orders')}
          className="text-xs font-extrabold text-[#8A1538] hover:underline"
        >
          সব অর্ডার দেখুন ➔
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-medium border-collapse">
          <thead>
            <tr className="bg-stone-50 text-slate-600 border-b border-stone-200">
              <th className="p-3.5 pl-5">অর্ডার নম্বর</th>
              <th className="p-3.5">কাস্টমার নাম ও ফোন</th>
              <th className="p-3.5">মোট মূল্য</th>
              <th className="p-3.5">স্ট্যাটাস</th>
              <th className="p-3.5 text-right pr-5">সময়</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-rose-50/20 transition">
                <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                <td className="p-3.5">
                  <p className="font-bold text-slate-900">{ord.customerName}</p>
                  <p className="text-[10px] font-mono text-slate-400">{ord.customerPhone}</p>
                </td>
                <td className="p-3.5 font-bold text-[#8A1538]">৳ {ord.grandTotal.toLocaleString('en-BD')}</td>
                <td className="p-3.5">{getStatusBadge(ord.status)}</td>
                <td className="p-3.5 text-right pr-5 text-[11px] text-slate-400 font-mono">{ord.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}