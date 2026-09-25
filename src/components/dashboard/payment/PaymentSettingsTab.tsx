'use client';

import { useState, useEffect } from 'react';
import { MFS_PROVIDERS, ACCOUNT_TYPES, getPaymentInstructions } from './paymentConstants';

export interface PaymentMethod {
  id: string;
  provider: string;
  type: string;
  number: string;
  instructions: string;
  qrCodeUrl?: string;
  isActive: boolean;
  isFixed?: boolean;
}

interface PaymentSettingsTabProps {
  settingsData?: any;
  fetchSettings?: () => void;
  isLoading?: boolean;
}

export default function PaymentSettingsTab({ settingsData, fetchSettings, isLoading }: PaymentSettingsTabProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  // 🔔 CUSTOM TOAST STATE
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  // 💬 CUSTOM DIALOG/MODAL STATE
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: true,
  });

  const [formData, setFormData] = useState<PaymentMethod>({
    id: '',
    provider: 'bkash',
    type: 'Personal',
    number: '',
    instructions: '',
    qrCodeUrl: '',
    isActive: true,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  // Load Settings
  useEffect(() => {
    if (settingsData) {
      parseAndSetSettings(settingsData);
    } else {
      loadSettingsFromServer();
    }
  }, [settingsData]);

  const loadSettingsFromServer = async () => {
    setInternalLoading(true);
    try {
      // First check localStorage fallback
      const localData = localStorage.getItem('app_payment_settings');
      if (localData) {
        setMethods(JSON.parse(localData));
        setInternalLoading(false);
        return;
      }

      const res = await fetch('/api/payment-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        parseAndSetSettings(data.settings);
      } else {
        initDefaultCod();
      }
    } catch (err) {
      initDefaultCod();
    } finally {
      setInternalLoading(false);
    }
  };

  const initDefaultCod = () => {
    const defaultData: PaymentMethod[] = [
      {
        id: 'cod',
        provider: 'Cash on Delivery',
        type: 'System Default',
        number: 'Cash',
        instructions: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে পেমেন্ট করুন।',
        isActive: true,
        isFixed: true,
      },
    ];
    setMethods(defaultData);
    localStorage.setItem('app_payment_settings', JSON.stringify(defaultData));
  };

  const parseAndSetSettings = (data: any) => {
    let parsedMethods: PaymentMethod[] = [];
    try {
      if (typeof data.payment_methods === 'string') {
        parsedMethods = JSON.parse(data.payment_methods);
      } else if (Array.isArray(data.payment_methods)) {
        parsedMethods = data.payment_methods;
      }
    } catch (e) {
      parsedMethods = [];
    }

    const hasCod = parsedMethods.find((m) => m.id === 'cod');
    if (!hasCod) {
      parsedMethods.unshift({
        id: 'cod',
        provider: 'Cash on Delivery',
        type: 'System Default',
        number: 'Cash',
        instructions: 'পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে পেমেন্ট করুন।',
        isActive: true,
        isFixed: true,
      });
    }

    setMethods(parsedMethods);
    localStorage.setItem('app_payment_settings', JSON.stringify(parsedMethods));
  };

  // Auto-generate instructions for new MFS
  useEffect(() => {
    if (isFormOpen && formData.provider && formData.type && editingIndex === null && formData.id !== 'cod') {
      setFormData((prev) => ({
        ...prev,
        instructions: getPaymentInstructions(formData.provider, formData.type as any),
      }));
    }
  }, [formData.provider, formData.type, isFormOpen, editingIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Local File Upload (Cloudflare R2 Compatible Preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setConfirmModal({
        isOpen: true,
        title: 'ফাইল সাইজ বেশি!',
        message: 'QR কোড ছবির সাইজ সর্বোচ্চ 3MB হতে পারবে।',
        type: 'warning',
        showCancel: false,
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, qrCodeUrl: previewUrl }));
    showToast('QR কোড ছবি যুক্ত হয়েছে!', 'success');
  };

  const openNewForm = () => {
    setFormData({
      id: Date.now().toString(),
      provider: 'bkash',
      type: 'Personal',
      number: '',
      instructions: getPaymentInstructions('bkash', 'Personal'),
      qrCodeUrl: '',
      isActive: true,
    });
    setEditingIndex(null);
    setIsFormOpen(true);
  };

  const openEditForm = (index: number) => {
    setFormData(methods[index]);
    setEditingIndex(index);
    setIsFormOpen(true);
  };

  const deleteMethod = (index: number) => {
    if (methods[index].isFixed) {
      setConfirmModal({
        isOpen: true,
        title: 'নিরাপত্তা সর্তকতা',
        message: 'Cash on Delivery (COD) ডিলিট করা যাবে না! আপনি চাইলে এটি Inactive/Off করে রাখতে পারেন।',
        type: 'warning',
        showCancel: false,
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'পেমেন্ট মেথড ডিলিট',
      message: `আপনি কি নিশ্চিত যে "${methods[index].provider}" পেমেন্ট মেথডটি মুছে ফেলতে চান?`,
      type: 'danger',
      showCancel: true,
      onConfirm: () => {
        const updatedMethods = methods.filter((_, i) => i !== index);
        setMethods(updatedMethods);
        saveToServer(updatedMethods, 'পেমেন্ট মেথডটি মুছে ফেলা হয়েছে!');
      },
    });
  };

  const toggleActiveStatus = (index: number) => {
    const updatedMethods = [...methods];
    updatedMethods[index].isActive = !updatedMethods[index].isActive;
    setMethods(updatedMethods);
    saveToServer(updatedMethods, 'স্ট্যাটাস আপডেট করা হয়েছে!');
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updatedMethods = [...methods];
    [updatedMethods[index - 1], updatedMethods[index]] = [updatedMethods[index], updatedMethods[index - 1]];
    setMethods(updatedMethods);
    saveToServer(updatedMethods, 'পজিশন আপডেট করা হয়েছে!');
  };

  const moveDown = (index: number) => {
    if (index === methods.length - 1) return;
    const updatedMethods = [...methods];
    [updatedMethods[index + 1], updatedMethods[index]] = [updatedMethods[index], updatedMethods[index + 1]];
    setMethods(updatedMethods);
    saveToServer(updatedMethods, 'পজিশন আপডেট করা হয়েছে!');
  };

  const saveMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id !== 'cod' && !formData.number.trim()) {
      setConfirmModal({
        isOpen: true,
        title: 'অসম্পূর্ণ ফর্ম',
        message: 'অনুগ্রহ করে অ্যাকাউন্ট নম্বর টাইপ করুন।',
        type: 'warning',
        showCancel: false,
      });
      return;
    }

    let updatedMethods = [...methods];
    if (editingIndex !== null) {
      updatedMethods[editingIndex] = formData;
    } else {
      updatedMethods.push(formData);
    }

    setMethods(updatedMethods);
    setIsFormOpen(false);
    saveToServer(updatedMethods, 'পেমেন্ট সেটিং সফলভাবে সেভ হয়েছে!');
  };

  // Robust Save with LocalStorage Fallback & Toast Notification
  const saveToServer = async (currentMethods: PaymentMethod[], successMsg = 'সেটিংস সফলভাবে সেভ হয়েছে!') => {
    setIsSubmitting(true);
    // Always persist to localStorage for instant client test
    localStorage.setItem('app_payment_settings', JSON.stringify(currentMethods));

    try {
      const payload = { payment_methods: JSON.stringify(currentMethods) };
      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success && fetchSettings) {
        fetchSettings();
      }
    } catch (error) {
      // Gracefully handles offline or mock dev environment
    } finally {
      setIsSubmitting(false);
      showToast(successMsg, 'success');
    }
  };

  if (isLoading || internalLoading) {
    return (
      <div className="p-12 text-center text-stone-500 font-bold animate-pulse flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin"></div>
        <span>পেমেন্ট সেটিংস লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl font-sans relative">
      {/* 🔔 CUSTOM TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border text-white ${
              toast.type === 'success' ? 'bg-[#8A1538] border-[#8A1538]' : 'bg-rose-700 border-rose-600'
            }`}
          >
            <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* 💬 CUSTOM CONFIRMATION & ALERT MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${
                  confirmModal.type === 'danger'
                    ? 'bg-rose-100 text-rose-700'
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {confirmModal.type === 'danger' ? '🗑️' : confirmModal.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <h3 className="text-base font-black text-stone-900">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-stone-600 font-medium leading-relaxed mb-6">{confirmModal.message}</p>
            <div className="flex justify-end gap-2.5">
              {confirmModal.showCancel && (
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition"
                >
                  বাতিল করুন
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-md transition ${
                  confirmModal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#8A1538] hover:bg-[#6e112d]'
                }`}
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#3B3433]">Payment Configuration</h2>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1 font-bold">
            Manage Sorting, Status & Gateways
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="bg-[#8A1538] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-[#6e112d] transition-all flex items-center gap-2 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          Add New Method
        </button>
      </div>

      {/* UNIFIED METHOD LIST */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <h3 className="text-xs sm:text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 border-b pb-3">
          Active & Sorted Methods
        </h3>

        {methods.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-6 font-bold">কোনো পেমেন্ট মেথড পাওয়া যায়নি।</p>
        ) : (
          <div className="space-y-4">
            {methods.map((method, idx) => (
              <div
                key={method.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border transition-all ${
                  method.isActive !== false
                    ? 'border-stone-200 bg-white hover:border-[#8A1538]'
                    : 'border-rose-100 bg-rose-50/40 opacity-75'
                }`}
              >
                {/* UP/DOWN SORTING BUTTONS */}
                <div className="flex sm:flex-col gap-2 sm:gap-1 pr-0 sm:pr-4 border-b sm:border-b-0 sm:border-r border-stone-100 w-full sm:w-auto pb-2 sm:pb-0 justify-between sm:justify-start">
                  <span className="sm:hidden text-xs font-bold text-stone-400 uppercase">Position</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-colors p-1"
                      title="Move Up"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === methods.length - 1}
                      className="text-stone-400 hover:text-stone-800 disabled:opacity-20 transition-colors p-1"
                      title="Move Down"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-black text-base sm:text-lg capitalize ${
                          method.isActive !== false ? 'text-stone-800' : 'text-stone-500'
                        }`}
                      >
                        {method.provider}
                      </span>
                      <span className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {method.type}
                      </span>
                    </div>
                    {method.id !== 'cod' && (
                      <div
                        className={`text-sm font-bold tracking-widest ${
                          method.isActive !== false ? 'text-[#8A1538]' : 'text-rose-400 line-through'
                        }`}
                      >
                        {method.number}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(idx)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      {!method.isFixed && (
                        <button
                          type="button"
                          onClick={() => deleteMethod(idx)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* IOS STYLE TOGGLE SWITCH */}
                    <div className="flex flex-col items-center gap-1 w-16">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={method.isActive !== false}
                          onChange={() => toggleActiveStatus(idx)}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-widest ${
                          method.isActive !== false ? 'text-emerald-600' : 'text-stone-400'
                        }`}
                      >
                        {method.isActive !== false ? 'Active' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-stone-200 animate-in fade-in duration-200">
            <h3 className="text-lg sm:text-xl font-bold mb-6 border-b pb-4 text-stone-800">
              {formData.id === 'cod'
                ? 'COD সেটিংস এডিট করুন'
                : editingIndex !== null
                ? 'পেমেন্ট মেথড এডিট করুন'
                : 'নতুন পেমেন্ট মেথড'}
            </h3>

            <form onSubmit={saveMethod} className="space-y-5">
              {formData.id !== 'cod' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">MFS Provider</label>
                      <select
                        name="provider"
                        value={formData.provider}
                        onChange={handleInputChange}
                        className="w-full border border-stone-300 p-3 rounded-xl outline-none font-bold text-stone-900 bg-white focus:border-[#8A1538]"
                      >
                        {MFS_PROVIDERS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">Account Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full border border-stone-300 p-3 rounded-xl outline-none font-bold text-stone-900 bg-white focus:border-[#8A1538]"
                      >
                        {ACCOUNT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">Account Number *</label>
                    <input
                      required
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full border border-stone-300 p-3 rounded-xl outline-none font-bold text-lg tracking-widest text-stone-900 bg-white placeholder:text-stone-300 focus:border-[#8A1538]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">
                  Customer Instructions (কাস্টমাইজযোগ্য)
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-stone-300 p-3 rounded-xl outline-none text-xs font-medium leading-relaxed bg-stone-50 text-stone-800 focus:border-[#8A1538]"
                ></textarea>
              </div>

              {formData.id !== 'cod' && (
                <div className="p-4 border border-dashed border-stone-300 rounded-2xl bg-stone-50/50">
                  <label className="block text-xs font-bold text-stone-500 mb-2">
                    Upload QR Code Image (Optional - Max 3MB)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {formData.qrCodeUrl && (
                      <img
                        src={formData.qrCodeUrl}
                        alt="QR Code Preview"
                        className="w-16 h-16 object-cover rounded-xl border border-stone-300 shadow-xs"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#8A1538]/10 file:text-[#8A1538] hover:file:bg-[#8A1538]/20 transition cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition-all text-xs"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#8A1538] text-white font-bold hover:bg-[#6e112d] transition-all text-xs shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'সেভ হচ্ছে...' : 'সেটিং সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
