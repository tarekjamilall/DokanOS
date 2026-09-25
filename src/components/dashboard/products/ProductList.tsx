'use client';

import React, { useState } from 'react';
import ProductDeleteModal from './ProductDeleteModal';
import ProductCsvModal from './ProductCsvModal';
import ProductQuickEditModal from './ProductQuickEditModal';
import { exportProductsToCSV } from './csvEngine';


export type ProductType = 'simple' | 'variable' | 'digital' | 'external';
export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';

export type Product = {
  id: string;
  numericId?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  sku?: string;
  type?: ProductType | string;
  featuredImage?: string;
  images?: string[] | string;
  shortDescription?: string;
  description?: string;
  weight?: string | number;
  videoUrl?: string;
  regularPrice?: number;
  salePrice?: number;
  price?: number;
  stockStatus?: StockStatus | string;
  stockQuantity?: number;
  categories?: string[];
  tags?: string[];
  brand?: string;
  status?: 'published' | 'draft' | 'trash' | string;
  createdAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
};

type ProductListProps = {
  initialProducts?: Product[];
  categories?: Category[];
  brands?: Brand[];
  onAddNew?: () => void;
  onEditProduct?: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
};

const safeNum = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const formatBSTDate = (rawDate?: string): string => {
  if (!rawDate) return '23 Sep 2026 • 05:30 AM';
  try {
    const dateObj = new Date(rawDate);
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

const normalizeProduct = (p: Product, index: number = 0) => {
  const numericId = p.numericId ?? p.id?.replace(/[^0-9]/g, '') ?? (101 + index);
  const id = p.id || `prod-${numericId}`;
  const name = String(p.name || p.title || 'Untitled Product').trim();
  const sku = String(p.sku || '').trim();
  const type = (p.type || 'simple') as ProductType;
  const regularPrice = safeNum(p.regularPrice ?? p.price);
  const salePrice = p.salePrice !== undefined && p.salePrice !== null ? safeNum(p.salePrice) : undefined;
  const stockQuantity = safeNum(p.stockQuantity);
  const stockStatus = (p.stockStatus || (stockQuantity > 0 ? 'instock' : 'outofstock')) as StockStatus;
  const categories = Array.isArray(p.categories) ? p.categories.filter(Boolean) : ['Uncategorized'];
  const tags = Array.isArray(p.tags) ? p.tags.filter(Boolean) : [];
  const brand = String(p.brand || '').trim();
  const status = p.status || 'published';
  const createdAt = p.createdAt || new Date().toISOString();
  const featuredImage = p.featuredImage || '';

  return {
    ...p,
    id,
    numericId,
    name,
    sku,
    type,
    regularPrice,
    salePrice,
    stockQuantity,
    stockStatus,
    categories,
    tags,
    brand,
    status,
    createdAt,
    featuredImage,
  };
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-101',
    numericId: 101,
    name: 'Ray-Ban Aviator Sunglasses Classic Gold',
    slug: 'ray-ban-aviator-sunglasses-classic-gold',
    sku: 'RB-3025-01',
    type: 'simple',
    featuredImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=150&auto=format&fit=crop&q=80',
    regularPrice: 3500,
    salePrice: 3080,
    stockStatus: 'instock',
    stockQuantity: 25,
    categories: ['Eyewear', 'Fashion Accessories'],
    tags: ['Sunglasses', 'Ray-Ban'],
    brand: 'Ray-Ban',
    status: 'published',
    createdAt: '2026-09-23T05:30:00.000Z',
  },
  {
    id: 'prod-102',
    numericId: 102,
    name: 'Rolex Submariner Watch Gold Edition',
    slug: 'rolex-submariner-watch-gold-edition',
    sku: 'RLX-SUB-2026',
    type: 'variable',
    featuredImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
    regularPrice: 12500,
    salePrice: 11500,
    stockStatus: 'instock',
    stockQuantity: 8,
    categories: ['Watches', 'Luxury'],
    tags: ['Rolex', 'Gold'],
    brand: 'Rolex',
    status: 'published',
    createdAt: '2026-09-22T14:15:00.000Z',
  },
];

export default function ProductList({
  initialProducts = DEFAULT_PRODUCTS,
  categories = [
    { id: 'c1', name: 'Eyewear', slug: 'eyewear' },
    { id: 'c2', name: 'Watches', slug: 'watches' },
  ],
  brands = [
    { id: 'b1', name: 'Ray-Ban', slug: 'ray-ban' },
    { id: 'b2', name: 'Rolex', slug: 'rolex' },
  ],
  onAddNew,
  onEditProduct,
  onViewProduct,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStockStatus, setFilterStockStatus] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals States
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    msg: '',
    type: 'success',
  });

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  // 1, 2, 3. EDIT PRODUCT HANDLER (Image, Title, Edit Button)
  const handleEditProductClick = (product: Product) => {
    if (onEditProduct) {
      onEditProduct(product);
    } else {
      showToast(`Edit trigger for: ${product.name}`, 'info');
    }
  };

  // 5. VIEW PRODUCT HANDLER (Opens Customer Front-End)
  const handleViewProductClick = (product: Product) => {
    if (onViewProduct) {
      onViewProduct(product);
    } else {
      const publicUrl = `/product/${product.slug || product.id}`;
      window.open(publicUrl, '_blank');
    }
  };

  // 4. CONFIRM DELETE ACTION
  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    showToast(`Deleted product #${deletingProduct.numericId}`, 'success');
    setDeletingProduct(null);
  };

  // Checkbox Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleApplyBulkAction = () => {
    if (!bulkAction) return showToast('Please select a bulk action', 'error');
    if (selectedIds.length === 0) return showToast('No products selected', 'error');

    if (bulkAction === 'delete') {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      showToast(`${selectedIds.length} products deleted!`, 'success');
    } else if (bulkAction === 'draft') {
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: 'draft' } : p))
      );
      showToast(`${selectedIds.length} products moved to draft!`, 'success');
    } else if (bulkAction === 'publish') {
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: 'published' } : p))
      );
      showToast(`${selectedIds.length} products published!`, 'success');
    }
    setSelectedIds([]);
    setBulkAction('');
  };

  // Duplicate Product
  const handleDuplicateProduct = (rawProduct: Product) => {
    const product = normalizeProduct(rawProduct);
    const existingNumIds = products.map((p) => safeNum(p.numericId || p.id?.replace(/[^0-9]/g, '')));
    const newNumericId = Math.max(...existingNumIds, 100) + 1;
    const duplicated: Product = {
      ...product,
      id: `prod-${newNumericId}`,
      numericId: newNumericId,
      name: `${product.name} (Copy)`,
      sku: product.sku ? `${product.sku}-COPY` : `SKU-${newNumericId}`,
      createdAt: new Date().toISOString(),
    };
    setProducts([duplicated, ...products]);
    showToast(`Product duplicated as #${newNumericId}!`, 'success');
  };

  // CSV Export
   // CSV Export (Calls Full 20-Column Header-Mapped Engine)
  const handleExportCSV = () => {
    exportProductsToCSV(products);
    showToast('Full Product Catalog CSV exported successfully!', 'success');
  };


  // Filter Calculation
  const filteredProducts = products.filter((rawP, index) => {
    const p = normalizeProduct(rawP, index);
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
    const matchesCategory = filterCategory === 'all' || p.categories.includes(filterCategory);
    const matchesStock = filterStockStatus === 'all' || p.stockStatus === filterStockStatus;
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans text-[#3B3433] relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border text-white ${
              toast.type === 'success'
                ? 'bg-[#8A1538] border-[#8A1538]'
                : toast.type === 'error'
                ? 'bg-rose-700 border-rose-600'
                : 'bg-stone-800 border-stone-700'
            }`}
          >
            <span>{toast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-[#3B3433]">📦 Products Catalog Engine</h2>
            <span className="text-[9px] bg-[#8A1538] text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              INVENTORY
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Manage Products & Inventory
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="px-4 py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              ➕ Add Product
            </button>
          )}

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl border border-stone-200 transition cursor-pointer"
          >
            📥 Import CSV
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-xl border border-stone-200 transition cursor-pointer"
          >
            📤 Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-xl text-xs font-bold bg-white text-stone-700"
            >
              <option value="">Bulk Actions</option>
              <option value="publish">Mark as Published</option>
              <option value="draft">Move to Draft</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              type="button"
              onClick={handleApplyBulkAction}
              className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Apply
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-stone-300 rounded-xl font-bold text-stone-700 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterStockStatus}
              onChange={(e) => {
                setFilterStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-stone-300 rounded-xl font-bold text-stone-700 bg-white"
            >
              <option value="all">All Stock Status</option>
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>

          <div className="relative w-full lg:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#8A1538] focus:outline-none"
            />
            <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs">🔍</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1E1D1E] text-white font-extrabold uppercase text-[10px] tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length}
                    className="rounded border-stone-600 text-[#8A1538]"
                  />
                </th>
                <th className="p-3.5">Product Title & Actions</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Categories</th>
                <th className="p-3.5 text-right">Date Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium text-stone-700">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400 font-bold">
                    No products match your criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((rawP, index) => {
                  const p = normalizeProduct(rawP, index);
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr key={p.id} className={`hover:bg-stone-50 transition ${isSelected ? 'bg-rose-50/30' : ''}`}>
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(p.id)}
                          className="rounded border-stone-300 text-[#8A1538]"
                        />
                      </td>

                      {/* 1, 2, 3, 4, 5. Product Image, Title, Edit, Delete, View Actions */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-3">
                          {/* 1. CLICKABLE PRODUCT IMAGE */}
                          {p.featuredImage ? (
                            <img
                              src={p.featuredImage}
                              alt={p.name}
                              onClick={() => handleEditProductClick(p)}
                              className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition"
                            />
                          ) : (
                            <div
                              onClick={() => handleEditProductClick(p)}
                              className="w-11 h-11 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-center text-stone-400 text-lg shrink-0 cursor-pointer hover:opacity-80 transition"
                            >
                              🖼️
                            </div>
                          )}

                          <div className="space-y-1">
                            {/* 2. CLICKABLE PRODUCT TITLE */}
                            <button
                              type="button"
                              onClick={() => handleEditProductClick(p)}
                              className="font-extrabold text-stone-900 text-xs hover:text-[#8A1538] transition text-left cursor-pointer block"
                            >
                              {p.name}
                            </button>

                            {/* ACTION LINKS */}
                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-500 pt-0.5">
                              <span className="font-mono text-stone-400">ID: #{p.numericId}</span>
                              <span className="text-stone-300">|</span>

                              {/* 3. CLICKABLE EDIT BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleEditProductClick(p)}
                                className="text-blue-600 hover:underline hover:text-blue-800 font-extrabold cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-stone-300">|</span>

                              {/* QUICK EDIT */}
                              <button
                                type="button"
                                onClick={() => setQuickEditProduct(p)}
                                className="text-amber-700 hover:underline cursor-pointer"
                              >
                                Quick Edit
                              </button>
                              <span className="text-stone-300">|</span>

                              {/* 4. CLICKABLE DELETE BUTTON -> OPENS BEAUTIFUL MODAL */}
                              <button
                                type="button"
                                onClick={() => setDeletingProduct(p)}
                                className="text-rose-600 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                              <span className="text-stone-300">|</span>

                              {/* 5. CLICKABLE VIEW BUTTON -> OPENS PUBLIC FRONTEND */}
                              <button
                                type="button"
                                onClick={() => handleViewProductClick(p)}
                                className="text-emerald-700 hover:underline font-extrabold cursor-pointer"
                              >
                                View
                              </button>
                              <span className="text-stone-300">|</span>

                              <button
                                type="button"
                                onClick={() => handleDuplicateProduct(p)}
                                className="text-purple-600 hover:underline cursor-pointer"
                              >
                                Duplicate
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {p.sku ? (
                          <span className="font-mono text-xs font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md border border-stone-200">
                            {p.sku}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {p.stockStatus === 'instock' ? (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            In stock ({p.stockQuantity})
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Out of stock
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-black text-xs font-mono">
                        ৳{p.regularPrice}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {p.categories.map((cat, i) => (
                            <span key={i} className="text-[10px] font-bold bg-stone-100 px-2 py-0.5 rounded border">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-mono text-[10px] text-stone-500 font-bold">
                        {formatBSTDate(p.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-600">
            <span>
              Page {currentPage} of {totalPages} ({filteredProducts.length} items)
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

      {/* 4. BEAUTIFUL CUSTOM DELETE MODAL */}
      <ProductDeleteModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* CSV IMPORT MODAL */}
      <ProductCsvModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={(newProducts) => setProducts((prev) => [...newProducts, ...prev])}
        showToast={showToast}
      />

      {/* QUICK EDIT MODAL */}
      <ProductQuickEditModal
        isOpen={!!quickEditProduct}
        product={quickEditProduct}
        onClose={() => setQuickEditProduct(null)}
        onSave={(updated) => {
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setQuickEditProduct(null);
          showToast('Product updated successfully!', 'success');
        }}
      />
    </div>
  );
}
