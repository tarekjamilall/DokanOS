'use client';

import React, { useState } from 'react';

export type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
};

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type Order = {
  id: string;
  orderNumber?: string;
  createdAt?: string;
  date?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingAddress?: {
    fullName?: string;
    name?: string;
    phone?: string;
    address?: string;
    fullAddress?: string;
    street?: string;
    city?: string;
  };
  paymentMethod?: 'COD' | 'bKash' | 'Nagad' | 'Card' | string;
  trxId?: string;
  items?: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  total?: number;
  grandTotal?: number;
  amount?: number;
  status?: OrderStatus;
  merchantNote?: string;
  note?: string;
};

type OrderListProps = {
  initialOrders?: Order[];
  storeName?: string;
  storeLogo?: string;
  onOrderChange?: (orders: Order[]) => void;
};

// Sequential Default Orders
const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '1001',
    createdAt: '2026-09-23T01:15:00.000Z',
    customerName: 'Kazi Tanvir Hasan',
    customerPhone: '01712345678',
    customerAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    paymentMethod: 'COD',
    items: [
      { id: 'i1', name: 'Ray-Ban Aviator Sunglasses', quantity: 1, price: 3200 },
      { id: 'i2', name: 'Polarized UV400 Cleaning Kit', quantity: 1, price: 300 },
    ],
    subtotal: 3500,
    shippingFee: 80,
    discount: 500,
    total: 3080,
    status: 'processing',
    merchantNote: 'বিকাল ৪টার পর কল দিয়ে ডেলিভারি করার অনুরোধ।',
  },
  {
    id: 'ord-1002',
    orderNumber: '1002',
    createdAt: '2026-09-23T01:45:00.000Z',
    customerName: 'Kazi Tanvir Hasan',
    customerPhone: '01712345678',
    customerAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    paymentMethod: 'bKash',
    trxId: 'BK892347291',
    items: [{ id: 'i3', name: 'Rolex Submariner Watch Gold Edition', quantity: 1, price: 12500 }],
    subtotal: 12500,
    shippingFee: 0,
    discount: 1000,
    total: 11500,
    status: 'shipped',
    merchantNote: 'ফুল পেমেন্ট বিকাশ অ্যাডভান্স পাওয়া গেছে।',
  },
  {
    id: 'ord-1003',
    orderNumber: '1003',
    createdAt: '2026-09-22T18:20:00.000Z',
    customerName: 'Nusrat Jahan',
    customerPhone: '01898765432',
    customerAddress: 'Flat 4B, Green Villa, Zindabazar, Sylhet',
    paymentMethod: 'COD',
    items: [{ id: 'i4', name: '100% Organic Cotton Summer Dress', quantity: 2, price: 1800 }],
    subtotal: 3600,
    shippingFee: 120,
    discount: 0,
    total: 3720,
    status: 'pending',
    merchantNote: 'এড্রেস ভেরিফিকেশন বাকি আছে।',
  },
  {
    id: 'ord-1004',
    orderNumber: '1004',
    createdAt: '2026-09-21T11:10:00.000Z',
    customerName: 'Arafat Rahman',
    customerPhone: '01911223344',
    customerAddress: 'GEC Circle, Nasirabad, Chittagong',
    paymentMethod: 'Nagad',
    trxId: 'NG77123490',
    items: [{ id: 'i5', name: 'Italian Acetate Frame Glasses', quantity: 1, price: 2200 }],
    subtotal: 2200,
    shippingFee: 120,
    discount: 200,
    total: 2120,
    status: 'completed',
    merchantNote: 'কাস্টমার পজিটিভ রিভিউ দিয়েছেন।',
  },
];

// Helper: Safe Number Conversion (Prevents ৳NaN)
const safeNum = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Helper: Bangladesh Standard Time (BST - Asia/Dhaka) Formatter
const formatBSTDate = (rawDate?: string | Date): string => {
  if (!rawDate) {
    const now = new Date();
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(now).replace(',', ' •');
  }

  try {
    const dateObj = typeof rawDate === 'string' ? new Date(rawDate) : rawDate;
    if (isNaN(dateObj.getTime())) return String(rawDate);

    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj).replace(',', ' •');
  } catch (e) {
    return String(rawDate);
  }
};

// Helper: Robust Field Extractor for Legacy & New Order Objects
const getOrderFields = (ord: Order) => {
  const orderNumber = ord.orderNumber || ord.id?.replace('ord-', '') || '1001';

  const customerName =
    ord.customerName ||
    ord.shippingAddress?.fullName ||
    ord.shippingAddress?.name ||
    'Guest Customer';

  const customerPhone =
    ord.customerPhone ||
    ord.shippingAddress?.phone ||
    'N/A';

  const addressParts = [
    ord.customerAddress,
    ord.shippingAddress?.address,
    ord.shippingAddress?.fullAddress,
    ord.shippingAddress?.street,
    ord.shippingAddress?.city,
  ].filter(Boolean);

  const customerAddress =
    addressParts.length > 0 ? addressParts.join(', ') : 'No Address Provided';

  const total = safeNum(ord.total ?? ord.grandTotal ?? ord.amount);
  const subtotal = safeNum(ord.subtotal ?? (total > 0 ? total : 0));
  const shippingFee = safeNum(ord.shippingFee);
  const discount = safeNum(ord.discount);

  const createdAt = formatBSTDate(ord.createdAt || ord.date);
  const merchantNote = ord.merchantNote || ord.note || '';
  const status = ord.status || 'pending';
  const paymentMethod = ord.paymentMethod || 'COD';

  return {
    orderNumber,
    customerName,
    customerPhone,
    customerAddress,
    total,
    subtotal,
    shippingFee,
    discount,
    createdAt,
    merchantNote,
    status,
    paymentMethod,
  };
};

export default function OrderList({
  initialOrders = DEFAULT_ORDERS,
  storeName = 'Storefront',
  storeLogo,
  onOrderChange,
}: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals State
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);
  const [noteEditOrder, setNoteEditOrder] = useState<Order | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  // Status Change Handler
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
    setOrders(updated);
    if (onOrderChange) onOrderChange(updated);
    showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
  };

  // Save Merchant Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteEditOrder) return;

    const updated = orders.map((ord) =>
      ord.id === noteEditOrder.id ? { ...ord, merchantNote: tempNoteText.trim() } : ord
    );
    setOrders(updated);
    if (onOrderChange) onOrderChange(updated);

    if (detailsOrder && detailsOrder.id === noteEditOrder.id) {
      setDetailsOrder({ ...detailsOrder, merchantNote: tempNoteText.trim() });
    }

    setNoteEditOrder(null);
    showToast('Merchant note saved successfully!', 'success');
  };

  // Copy Customer Info for Courier / CRM
  const handleCopyCustomerInfo = (order: Order) => {
    const fields = getOrderFields(order);
    const textToCopy = `Customer: ${fields.customerName}\nPhone: ${fields.customerPhone}\nAddress: ${fields.customerAddress}\nMerchant Note: ${fields.merchantNote || 'N/A'}\nCollect COD: ৳${fields.total}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('📋 Customer details copied to clipboard!', 'info');
  };

  // Repeat Customer Order Counter
  const getCustomerOrderCount = (phone?: string) => {
    if (!phone || phone === 'N/A') return 1;
    return orders.filter((o) => (o.customerPhone || o.shippingAddress?.phone) === phone).length;
  };

  // Print Invoice Handler
  const handlePrintInvoice = (order: Order) => {
    const fields = getOrderFields(order);
    const originalTitle = document.title;
    document.title = `Invoice-${fields.orderNumber}`;
    window.print();
    document.title = originalTitle;
  };

  // Filtered Orders Calculation
  const filteredOrders = orders.filter((ord) => {
    const fields = getOrderFields(ord);
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fields.orderNumber.toLowerCase().includes(query) ||
      fields.customerName.toLowerCase().includes(query) ||
      fields.customerPhone.includes(query) ||
      fields.customerAddress.toLowerCase().includes(query) ||
      fields.merchantNote.toLowerCase().includes(query);

    const matchesStatus = selectedStatusTab === 'all' || fields.status === selectedStatusTab;

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Status Badge Class Helper
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'on-hold':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'refunded':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#3B3433] relative">
      {/* CSS PRINT STYLES FOR CLEAN PDF PRINTING */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice-modal,
          #printable-invoice-modal * {
            visibility: visible;
          }
          #printable-invoice-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce no-print">
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
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">🛒 Order Lifecycle & Invoicing</h2>
            <span className="text-[9px] bg-gradient-to-r from-[#8A1538] to-rose-700 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              E-COMMERCE SUITE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Sequential Order IDs • BST Bangladesh Timezone • Printable Invoices & CRM Notes
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Total Orders: <strong className="text-[#8A1538]">{orders.length}</strong></span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'completed', label: 'Completed' },
              { id: 'on-hold', label: 'On Hold' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedStatusTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl transition text-[11px] whitespace-nowrap ${
                  selectedStatusTab === tab.id
                    ? 'bg-[#8A1538] text-white font-black shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, Address..."
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none placeholder:text-stone-300"
            />
            <span className="absolute left-3 top-1.5 text-stone-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      {/* TABLE / MOBILE CARDS VIEW */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden no-print">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1E1D1E] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">SL / Order ID</th>
                <th className="p-3.5">Customer & CRM Info</th>
                <th className="p-3.5">Amount & Payment</th>
                <th className="p-3.5">Merchant Note</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400 font-bold">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord, idx) => {
                  const fields = getOrderFields(ord);
                  const orderCount = getCustomerOrderCount(fields.customerPhone);
                  const isRepeatCustomer = orderCount > 1;

                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/80 transition">
                      {/* Order ID & BST Time */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-stone-400 font-bold">
                            {(currentPage - 1) * itemsPerPage + idx + 1}.
                          </span>
                          <button
                            type="button"
                            onClick={() => setDetailsOrder(ord)}
                            className="font-mono font-black text-xs text-[#8A1538] hover:underline block"
                          >
                            #{fields.orderNumber}
                          </button>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                          {fields.createdAt}
                        </span>
                      </td>

                      {/* Customer CRM Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-xs block">
                            {fields.customerName}
                          </span>
                          {isRepeatCustomer && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded border border-amber-200 flex items-center gap-0.5">
                              👑 {orderCount}টি অর্ডার
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-stone-600 font-bold">
                            {fields.customerPhone}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCustomerInfo(ord)}
                            className="text-[10px] text-[#8A1538] hover:underline font-bold"
                            title="Copy customer info"
                          >
                            📋 Copy
                          </button>
                        </div>

                        <p className="text-[10px] text-stone-500 font-medium truncate max-w-xs mt-0.5">
                          📍 {fields.customerAddress}
                        </p>
                      </td>

                      {/* Amount & Payment */}
                      <td className="p-3.5">
                        <span className="font-black text-xs text-stone-900 block">
                          ৳{fields.total}
                        </span>
                        <span className="text-[10px] font-bold text-stone-500">
                          {fields.paymentMethod} {ord.trxId ? `(${ord.trxId})` : ''}
                        </span>
                      </td>

                      {/* Merchant Note */}
                      <td className="p-3.5">
                        {fields.merchantNote ? (
                          <div className="flex items-start justify-between gap-1 max-w-xs bg-amber-50/80 p-1.5 rounded-lg border border-amber-200">
                            <p className="text-[10px] text-amber-900 font-bold italic truncate">
                              💬 {fields.merchantNote}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setNoteEditOrder(ord);
                                setTempNoteText(fields.merchantNote);
                              }}
                              className="text-[9px] text-[#8A1538] font-bold underline shrink-0"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setNoteEditOrder(ord);
                              setTempNoteText('');
                            }}
                            className="text-[10px] text-stone-400 hover:text-[#8A1538] font-bold italic"
                          >
                            + Add Note
                          </button>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="p-3.5 text-center">
                        <select
                          value={fields.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border focus:outline-none cursor-pointer uppercase ${getStatusBadgeClass(
                            fields.status
                          )}`}
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="processing">🔵 Processing</option>
                          <option value="on-hold">⚪ On Hold</option>
                          <option value="shipped">🟣 Shipped</option>
                          <option value="completed">🟢 Completed</option>
                          <option value="cancelled">🔴 Cancelled</option>
                          <option value="refunded">🟠 Refunded</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(ord)}
                          className="px-2.5 py-1 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold rounded-lg text-[10px] shadow transition"
                        >
                          📄 Invoice
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailsOrder(ord)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition"
                        >
                          👁️ Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-stone-200">
          {paginatedOrders.length === 0 ? (
            <div className="p-6 text-center text-stone-400 font-bold text-xs">
              No orders match your filter criteria.
            </div>
          ) : (
            paginatedOrders.map((ord) => {
              const fields = getOrderFields(ord);
              const orderCount = getCustomerOrderCount(fields.customerPhone);
              const isRepeatCustomer = orderCount > 1;

              return (
                <div key={ord.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDetailsOrder(ord)}
                      className="font-mono font-black text-sm text-[#8A1538] hover:underline"
                    >
                      #{fields.orderNumber}
                    </button>
                    <select
                      value={fields.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${getStatusBadgeClass(
                        fields.status
                      )}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="on-hold">On Hold</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900 text-xs">
                        {fields.customerName}
                      </span>
                      {isRepeatCustomer && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded">
                          👑 {orderCount}টি
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono font-bold text-stone-600 mt-0.5">
                      {fields.customerPhone}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">
                      📍 {fields.customerAddress}
                    </p>
                  </div>

                  <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl text-xs font-bold">
                    <span>
                      Total COD: <strong className="text-[#8A1538]">৳{fields.total}</strong>
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">{fields.createdAt}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyCustomerInfo(ord)}
                      className="px-2.5 py-1 bg-stone-100 text-stone-700 font-bold rounded-lg text-[10px]"
                    >
                      📋 Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(ord)}
                      className="px-3 py-1 bg-[#8A1538] text-white font-bold rounded-lg text-[10px]"
                    >
                      📄 Invoice
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailsOrder(ord)}
                      className="px-3 py-1 bg-stone-800 text-white font-bold rounded-lg text-[10px]"
                    >
                      👁️ Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-600 no-print">
            <span>
              Page {currentPage} of {totalPages} ({filteredOrders.length} total items)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-white border rounded-lg hover:bg-stone-100 disabled:opacity-40"
              >
                ◀ Prev
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 bg-white border rounded-lg hover:bg-stone-100 disabled:opacity-40"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📄 PRINTABLE INVOICE MODAL */}
      {invoiceOrder && (() => {
        const fields = getOrderFields(invoiceOrder);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div
              id="printable-invoice-modal"
              className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition no-print"
              >
                ✕
              </button>

              {/* Dynamic Header & Branding */}
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-center gap-3">
                  {storeLogo ? (
                    <img src={storeLogo} alt={storeName} className="w-10 h-10 object-contain rounded-lg border border-stone-200" />
                  ) : (
                    <div className="w-10 h-10 bg-[#8A1538] text-white font-black text-lg rounded-xl flex items-center justify-center shadow-2xs">
                      {(storeName || 'S').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h1 className="text-base font-black text-[#8A1538] uppercase tracking-wider">
                      {storeName}
                    </h1>
                    <p className="text-[10px] text-stone-500 font-mono">
                      Official Cash Memo & Delivery Order
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-stone-900 block">
                    INVOICE #{fields.orderNumber}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block">
                    Date: {fields.createdAt}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-black text-[#8A1538] uppercase block">
                  Customer Information
                </span>
                <p className="font-extrabold text-stone-900">{fields.customerName}</p>
                <p className="font-mono text-stone-700 font-bold">{fields.customerPhone}</p>
                <p className="text-stone-600 text-[11px]">{fields.customerAddress}</p>
                {fields.merchantNote && (
                  <p className="text-[10px] text-amber-900 font-bold italic mt-1 border-t pt-1 border-stone-200">
                    Note: {fields.merchantNote}
                  </p>
                )}
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-stone-100 text-stone-700 font-extrabold uppercase text-[10px]">
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-stone-800">
                  {(invoiceOrder.items || []).map((item) => {
                    const qty = safeNum(item.quantity);
                    const price = safeNum(item.price);
                    return (
                      <tr key={item.id}>
                        <td className="py-2.5 px-2 font-bold">{item.name}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{qty}</td>
                        <td className="py-2.5 px-2 text-right font-mono">৳{price}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold">
                          ৳{qty * price}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary */}
              <div className="border-t pt-3 space-y-1.5 text-xs text-stone-700 font-bold">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳{fields.subtotal}</span>
                </div>
                {fields.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{fields.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-mono">৳{fields.shippingFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 border-t pt-2">
                  <span>Total Payable (COD):</span>
                  <span className="font-mono text-[#8A1538]">৳{fields.total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t no-print">
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(invoiceOrder)}
                  className="px-5 py-2 bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>🖨️</span>
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 👁️ DEDICATED ORDER DETAILS MODAL */}
      {detailsOrder && (() => {
        const fields = getOrderFields(detailsOrder);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setDetailsOrder(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
              >
                ✕
              </button>

              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-stone-900">
                    📦 Dedicated Order Page #{fields.orderNumber}
                  </h3>
                  <p className="text-[10px] text-stone-400 font-mono">BST Date: {fields.createdAt}</p>
                </div>
                <select
                  value={fields.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    handleStatusChange(detailsOrder.id, newStatus);
                    setDetailsOrder({ ...detailsOrder, status: newStatus });
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${getStatusBadgeClass(
                    fields.status
                  )}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="on-hold">On Hold</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Profile */}
              <div className="p-3.5 bg-stone-50 rounded-xl space-y-1.5 text-xs border border-stone-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#8A1538] uppercase text-[10px]">Customer CRM Profile</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCustomerInfo(detailsOrder)}
                    className="text-[10px] font-bold text-[#8A1538] underline"
                  >
                    📋 Copy CRM Data
                  </button>
                </div>
                <p className="font-extrabold text-stone-900">{fields.customerName}</p>
                <p className="font-mono font-bold text-stone-600">{fields.customerPhone}</p>
                <p className="text-stone-600">📍 {fields.customerAddress}</p>
              </div>

              {/* Items */}
              <div>
                <span className="font-extrabold text-xs text-stone-800 block mb-1.5">Purchased Items</span>
                <div className="divide-y border border-stone-200 rounded-xl p-3 bg-white space-y-1 text-xs">
                  {(detailsOrder.items || []).map((item) => (
                    <div key={item.id} className="py-1.5 flex justify-between">
                      <div>
                        <p className="font-bold text-stone-800">{item.name}</p>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Qty: {safeNum(item.quantity)} × ৳{safeNum(item.price)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-stone-900">
                        ৳{safeNum(item.quantity) * safeNum(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Merchant Note */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">💬 Merchant Internal Note</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteEditOrder(detailsOrder);
                      setTempNoteText(fields.merchantNote);
                    }}
                    className="text-[10px] text-[#8A1538] font-bold underline"
                  >
                    Edit Note
                  </button>
                </div>
                <p className="text-[#3B3433] italic">
                  {fields.merchantNote || 'No internal note added yet.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceOrder(detailsOrder);
                    setDetailsOrder(null);
                  }}
                  className="px-4 py-2 bg-[#8A1538] text-white font-bold rounded-xl"
                >
                  📄 Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsOrder(null)}
                  className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ✏️ MERCHANT NOTE EDIT MODAL */}
      {noteEditOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNote}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={() => setNoteEditOrder(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b pb-2">
              <h3 className="font-black text-sm text-stone-900">
                💬 Merchant Internal Note (Order #{getOrderFields(noteEditOrder).orderNumber})
              </h3>
              <p className="text-[10px] text-stone-400 font-mono">Add admin comments or delivery instructions</p>
            </div>

            <div>
              <textarea
                rows={3}
                value={tempNoteText}
                onChange={(e) => setTempNoteText(e.target.value)}
                placeholder="e.g. কাস্টমার বিকাশ হাফ পেমেন্ট করেছেন, বিকাল ৪টার পর কল দিয়ে পাঠাতে হবে..."
                className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setNoteEditOrder(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#8A1538] text-white text-xs font-bold rounded-xl shadow"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
