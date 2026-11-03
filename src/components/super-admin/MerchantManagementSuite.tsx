'use client';

import React, { useState } from 'react';

type MerchantManagementSuiteProps = {
  tenants?: any[];
};

export default function MerchantManagementSuite({ tenants = [] }: MerchantManagementSuiteProps) {
  const [tenantList, setTenantList] = useState<any[]>(
    tenants.length > 0
      ? tenants
      : [
          {
            id: 't-1',
            name: 'অনলাইন কেয়ার বাজার',
            slug: 'test-4',
            ownerEmail: 'merchant1@example.com',
            plan: 'Pro Plan',
            status: 'active',
            totalGMV: 185000,
          },
          {
            id: 't-2',
            name: 'রয়্যাল ফ্যাশন হাউস',
            slug: 'royal-fashion',
            ownerEmail: 'fashion@example.com',
            plan: 'Starter Plan',
            status: 'active',
            totalGMV: 42000,
          },
        ]
  );

  const [loadingDomain, setLoadingDomain] = useState<string | null>(null);

  // Impersonate Action (Step 213 & 214)
  const handleImpersonate = async (domain: string) => {
    setLoadingDomain(domain);
    try {
      const res = await fetch('/api/super-admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      alert('ইম্পারসোনেশন এরর!');
    } finally {
      setLoadingDomain(null);
    }
  };

  // Toggle Tenant Account Status (Step 212)
  const handleToggleStatus = (tenantId: string) => {
    setTenantList((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' }
          : t
      )
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans text-stone-900">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">👑 Super Admin Platform Control Room</h1>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">
              OWNER SUITE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Multi-tenant SaaS Overview, Tenant Impersonation & Subscription Quota Management
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-2">
          <span>মোট টেন্যান্ট স্টোর:</span>
          <strong className="text-white text-sm font-black">{tenantList.length} টি</strong>
        </div>
      </div>

      {/* Global Tenant Directory Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-4">Store Name & Subdomain</th>
                <th className="p-4">Merchant Email</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Total Sales (GMV)</th>
                <th className="p-4 text-center">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
              {tenantList.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-stone-50 transition">
                  {/* Store Name */}
                  <td className="p-4">
                    <span className="font-extrabold text-stone-900 text-sm block">
                      {tenant.name}
                    </span>
                    <span className="font-mono text-[11px] text-[#8A1538] font-bold">
                      {tenant.slug}.localhost:3000
                    </span>
                  </td>

                  {/* Merchant Email */}
                  <td className="p-4 font-mono text-stone-600 font-bold">
                    {tenant.ownerEmail}
                  </td>

                  {/* Plan */}
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-black rounded-lg border border-amber-200">
                      ⭐ {tenant.plan}
                    </span>
                  </td>

                  {/* GMV */}
                  <td className="p-4 font-black text-stone-900">
                    ৳{tenant.totalGMV.toLocaleString()}
                  </td>

                  {/* Status Toggle */}
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(tenant.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition ${
                        tenant.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {tenant.status === 'active' ? '🟢 Active' : '🔴 Suspended'}
                    </button>
                  </td>

                  {/* Impersonate Button (Step 213 & 214) */}
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      disabled={loadingDomain === tenant.slug}
                      onClick={() => handleImpersonate(tenant.slug)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5 ml-auto"
                    >
                      <span>🔑</span>
                      <span>
                        {loadingDomain === tenant.slug ? 'লগইন হচ্ছে...' : 'Login as Merchant'}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}