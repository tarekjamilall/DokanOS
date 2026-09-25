'use client';

import React, { useState } from 'react';
import { parseCSVToProducts } from './csvEngine';

type ProductCsvModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedProducts: any[]) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
};

export default function ProductCsvModal({
  isOpen,
  onClose,
  onImportSuccess,
  showToast,
}: ProductCsvModalProps) {
  const [selectedCsvFile, setSelectedCsvFile] = useState<File | null>(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        setSelectedCsvFile(file);
        showToast(`Selected file: ${file.name}`, 'info');
      } else {
        showToast('Please drop a valid .csv file', 'error');
      }
    }
  };

  const handleProcessFileImport = () => {
    if (!selectedCsvFile) return showToast('Please select a CSV file', 'error');

    setIsProcessingCsv(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const products = parseCSVToProducts(text);

        if (products.length > 0) {
          onImportSuccess(products);
          setSelectedCsvFile(null);
          onClose();
          showToast(`🎉 ${products.length} products imported successfully with full details!`, 'success');
        } else {
          showToast('Could not parse valid product rows from CSV', 'error');
        }
      } catch (err) {
        showToast('Failed to process CSV file', 'error');
      } finally {
        setIsProcessingCsv(false);
      }
    };

    reader.readAsText(selectedCsvFile, 'UTF-8');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>

        <div className="border-b pb-2">
          <h3 className="font-black text-sm text-stone-900">📥 Import Products via CSV File</h3>
          <p className="text-[10px] text-stone-400 font-mono">Header-mapped & Excel UTF-8 Compatible</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
            isDragOver ? 'border-[#8A1538] bg-rose-50' : 'border-stone-300 bg-stone-50/50'
          }`}
        >
          <input
            type="file"
            id="csvFileInput"
            accept=".csv"
            onChange={(e) => setSelectedCsvFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label htmlFor="csvFileInput" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 bg-rose-50 text-[#8A1538] rounded-2xl flex items-center justify-center text-xl mx-auto border border-rose-200">
              📄
            </div>
            {selectedCsvFile ? (
              <div>
                <p className="font-extrabold text-xs text-stone-900">{selectedCsvFile.name}</p>
                <p className="text-[10px] text-stone-400 font-mono">{(selectedCsvFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-extrabold text-xs text-stone-800">Click to Browse CSV File or Drag & Drop</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Supports WooCommerce & Standard Formats (.csv)</p>
              </div>
            )}
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedCsvFile || isProcessingCsv}
            onClick={handleProcessFileImport}
            className="px-5 py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-40"
          >
            {isProcessingCsv ? 'Processing CSV...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
