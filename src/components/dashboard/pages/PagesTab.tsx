'use client';

import React, { useState, useEffect } from 'react';
import BlockPageBuilder from './BlockPageBuilder';

export type PageDoc = {
  id: string;
  title: string;
  slug: string;
  content?: string;
  isSystem?: boolean;
  status: 'published' | 'draft';
  updatedAt?: string;
};

type PagesTabProps = {
  initialPages?: PageDoc[];
  domain?: string;
};

export default function PagesTab({ initialPages = [], domain = '' }: PagesTabProps) {
  const [pages, setPages] = useState<PageDoc[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBuildingPage, setIsBuildingPage] = useState(false);

  // Sync Prop Changes
  useEffect(() => {
    if (initialPages) {
      setPages(initialPages);
    }
  }, [initialPages]);

  // If Block Builder Mode is active, show Visual Builder Screen
  if (isBuildingPage) {
    return (
      <BlockPageBuilder
        domain={domain}
        onBack={() => setIsBuildingPage(false)}
        onSaveSuccess={() => setIsBuildingPage(false)}
      />
    );
  }

  // Toggle Published / Draft Status
  const handleToggleStatus = async (page: PageDoc) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/merchant/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Page status error:', err);
    }
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-[#3B3433]">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">📄 Storefront Custom & Legal Pages</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
              PAGES ENGINE
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Auto-generated Legal Policies & Dynamic Landing Pages
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsBuildingPage(true)}
          className="px-4 py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
        >
          <span>➕</span>
          <span>নতুন ল্যান্ডিং পেজ তৈরি করুন</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title or slug..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
          />
          <span className="absolute left-3 top-2 text-stone-400 text-xs">🔍</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 bg-white cursor-pointer"
        >
          <option value="all">All Page Status</option>
          <option value="published">🟢 Published</option>
          <option value="draft">⚪ Draft</option>
        </select>
      </div>

      {/* Pages Directory Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1E1D1E] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Page Title</th>
                <th className="p-3.5">URL Permalink</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 font-medium text-stone-700">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 font-bold">
                    No pages match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-3.5 font-extrabold text-stone-900 text-xs">
                      {page.title}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#8A1538] font-bold">
                      /{page.slug}
                    </td>
                    <td className="p-3.5">
                      {page.isSystem ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded border border-amber-200">
                          🔒 System Legal
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded border border-blue-200">
                          🚀 Landing Page
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(page)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer transition ${
                          page.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {page.status === 'published' ? '🟢 Published' : '⚪ Draft'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <a
                        href={`http://${domain || 'test-4'}.localhost:3000/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold rounded-lg text-[10px] transition inline-block"
                      >
                        👁️ View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}