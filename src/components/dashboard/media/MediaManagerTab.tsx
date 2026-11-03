'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

type MediaManagerTabProps = {
  domain?: string;
};

export default function MediaManagerTab({ domain = '' }: MediaManagerTabProps) {
  const activeDomain = domain || 'test-4';

  // Sub-Tab State
  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'videos'>('images');
  
  // Dynamic Storage Usage State (Zero Hardcoded)
  const [storageData, setStorageData] = useState<{
    usedStorageMB: number;
    maxStorageMB: number;
    percentage: number;
  }>({
    usedStorageMB: 0,
    maxStorageMB: 500,
    percentage: 0,
  });

  // Media Data & Loading
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels State
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedMediaForSEO, setSelectedMediaForSEO] = useState<any | null>(null);

  // 📁 Real Device File Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  // 🎥 Video Link Form State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🔄 Fetch Dynamic Storage Usage
  const fetchStorageUsage = useCallback(async () => {
    try {
      const res = await fetch(`/api/merchant/media/storage-usage?domain=${activeDomain}`);
      if (res.ok) {
        const data = await res.json();
        setStorageData({
          usedStorageMB: data.usedStorageMB || 0,
          maxStorageMB: data.maxStorageMB || 500,
          percentage: data.percentage || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load storage usage:', err);
    }
  }, [activeDomain]);

  // 🔄 Fetch Media List
  const fetchMediaList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/merchant/media?domain=${activeDomain}&type=${
          activeMediaTab === 'images' ? 'image' : 'video'
        }&query=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  }, [activeDomain, activeMediaTab, searchQuery]);

  useEffect(() => {
    fetchStorageUsage();
    fetchMediaList();
  }, [fetchStorageUsage, fetchMediaList]);

  // 📂 File Selection Change Handler
  const handleFileChange = (file: File | null) => {
    setErrorMessage(null);
    if (!file) {
      setSelectedFile(null);
      setFilePreviewUrl(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('⚠️ ফাইল সাইজ ১০ MB এর চেয়ে বেশি হওয়া যাবে না।');
      return;
    }

    setSelectedFile(file);
    setFilePreviewUrl(URL.createObjectURL(file));
    if (!newImageAlt) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setNewImageAlt(nameWithoutExt.replace(/[-_]/g, ' '));
    }
  };

  // 📤 Upload Real File (FormData POST)
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('অনুগ্রহ করে কম্পিউটার বা মোবাইল থেকে একটি ছবি সিলেক্ট করুন।');
      return;
    }

    if (!newImageAlt.trim()) {
      setErrorMessage('অনুগ্রহ করে ছবির Alt Text (নাম) প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('domain', activeDomain);
      formData.append('alt', newImageAlt);
      formData.append('caption', newImageCaption);

      const res = await fetch('/api/merchant/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsImageUploadOpen(false);
        setSelectedFile(null);
        setFilePreviewUrl(null);
        setNewImageAlt('');
        setNewImageCaption('');
        fetchMediaList();
        fetchStorageUsage();
      } else {
        setErrorMessage(data.error || 'ফাইল আপলোড করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক সমস্যা! অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  // 🎥 Save Video Link
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!videoUrl.trim() || !videoTitle.trim()) {
      setErrorMessage('ভিডিও টাইটেল এবং URL আবশ্যক।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/merchant/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: activeDomain,
          mediaType: 'video',
          alt: videoTitle,
          videoUrl,
          videoPlatform: videoUrl.includes('vimeo') ? 'vimeo' : 'youtube',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsVideoModalOpen(false);
        setVideoTitle('');
        setVideoUrl('');
        fetchMediaList();
      } else {
        setErrorMessage(data.error || 'ভিডিও লিংক সেভ করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      setErrorMessage('নেটওয়ার্ক সমস্যা!');
    } finally {
      setSubmitting(false);
    }
  };

  // 🗑️ Delete Media Doc & Free Up Space
  const handleDeleteMedia = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ফাইলটি স্থায়ীভাবে মুছে ফেলতে চান? এটি মুছে ফেললে ক্লাউড স্টোরেজ স্পেস খালি হবে।')) return;

    try {
      const res = await fetch('/api/merchant/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: activeDomain,
          mediaId: id,
        }),
      });

      if (res.ok) {
        if (selectedMediaForSEO?.id === id) setSelectedMediaForSEO(null);
        fetchMediaList();
        fetchStorageUsage();
      } else {
        alert('ডিলিট করতে ব্যর্থ হয়েছে!');
      }
    } catch (err) {
      alert('নেটওয়ার্ক এরর!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 📊 ১. ডাইনামিক স্টোরেজ ইউসেজ বার ও অ্যাকশন বাটন */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>🖼️</span>
              <span>ক্লাউড মিডিয়া এসেট গ্যালারি (Cloudflare R2 Storage)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              আপনার ই-কমার্স স্টোরের অরিজিনাল প্রোডাক্ট ছবি ও ভিডিওসমূহ ক্লাউড স্টোরেজে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsVideoModalOpen(true);
              }}
              className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-stone-300"
            >
              <span>🎥</span>
              <span>ভিডিও লিংক যুক্ত করুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsImageUploadOpen(true);
              }}
              className="bg-[#8A1538] hover:bg-rose-900 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <span>📁</span>
              <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
            </button>
          </div>
        </div>

        {/* Dynamic Storage Usage Bar */}
        <div className="space-y-2 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span>💾</span>
              <span>লাইভ স্টোরেজ ব্যবহার (Storage Meter):</span>
            </span>
            <span className="font-mono text-[#8A1538]">
              {storageData.usedStorageMB} MB / {storageData.maxStorageMB} MB ({storageData.percentage}%)
            </span>
          </div>
          
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                storageData.percentage > 85 ? 'bg-rose-600' : 'bg-[#8A1538]'
              }`}
              style={{ width: `${storageData.percentage}%` }}
            />
          </div>

          {storageData.percentage > 85 && (
            <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <span>⚠️</span>
              <span>আপনার স্টোরেজ কোটা প্রায় শেষ! নতুন ছবি আপলোড করতে অপ্রয়োজনীয় ছবি মুছে ফেলুন অথবা প্যাকেজ আপগ্রেড করুন।</span>
            </p>
          )}
        </div>
      </div>

      {/* 🔀 ২. মিডিয়া টাইপ সাব-ট্যাব */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 bg-stone-200/60 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveMediaTab('images')}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeMediaTab === 'images'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📷 ইমেজ গ্যালারি
            </button>

            <button
              onClick={() => setActiveMediaTab('videos')}
              className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
                activeMediaTab === 'videos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎬 ভিডিও লিংকস
            </button>
          </div>

          <input
            type="text"
            placeholder="ফাইল নাম বা টাইটেল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs font-medium px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#8A1538] w-full sm:w-64"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">
            মিডিয়া লোড হচ্ছে...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400 space-y-1">
            <p>কোনো মিডিয়া ফাইল পাওয়া যায়নি!</p>
            <p className="text-[11px] font-normal text-slate-400">উপরের বাটন চেপে ডিভাইস থেকে ছবি আপলোড অথবা ভিডিও লিংক যুক্ত করুন।</p>
          </div>
        ) : (
          <div className="p-6">
            {activeMediaTab === 'images' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaList.map((media) => {
                  const mediaImageUrl = media.url || (media.filename ? `/media/${media.filename}` : '');
                  return (
                    <div
                      key={media.id}
                      className="group bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-all relative flex flex-col"
                    >
                      <div className="aspect-square bg-stone-200 relative overflow-hidden">
                        <img
                          src={mediaImageUrl}
                          alt={media.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                          {media.fileSize ? `${(media.fileSize / (1024 * 1024)).toFixed(2)} MB` : '0 MB'}
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-[11px] font-bold text-slate-800 truncate" title={media.alt}>
                          {media.alt}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                          <button
                            type="button"
                            onClick={() => setSelectedMediaForSEO({ ...media, resolvedUrl: mediaImageUrl })}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            ⚙️ SEO
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(media.id)}
                            className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 p-1 rounded"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {mediaList.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-black text-lg shrink-0">
                        ▶
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">
                          {video.alt}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{video.videoUrl}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-stone-100">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-lg"
                      >
                        🔗 প্লে করুন
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(video.id)}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded-lg"
                      >
                        🗑️ ডিলিট
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 📁 3. REAL DEVICE FILE UPLOAD MODAL */}
      {isImageUploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">📁 ডিভাইস থেকে ছবি আপলোড করুন</h3>
              <button
                onClick={() => {
                  setIsImageUploadOpen(false);
                  setSelectedFile(null);
                  setFilePreviewUrl(null);
                }}
                className="text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadImage} className="p-6 space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {errorMessage}
                </div>
              )}

              {/* Drag and Drop / File Input Picker Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-stone-300 hover:border-[#8A1538] rounded-2xl p-6 text-center bg-stone-50/50 hover:bg-rose-50/20 transition cursor-pointer space-y-2 relative"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                {filePreviewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={filePreviewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl mx-auto border border-stone-200 shadow-xs"
                    />
                    <p className="text-xs font-bold text-slate-900 truncate">{selectedFile?.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      সাইজ: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : '0'} MB
                    </p>
                    <span className="text-[10px] text-[#8A1538] font-bold underline block">
                      অন্য ছবি পছন্দ করুন
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl block">☁️</span>
                    <p className="text-xs font-extrabold text-slate-800">
                      কম্পিউটার/মোবাইল থেকে ছবি টেনে আনুন অথবা <span className="text-[#8A1538] underline">ব্রাউজ করে সিলেক্ট করুন</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      সাপোর্টেড ফরম্যাট: WebP, PNG, JPG (সর্বোচ্চ ১০ MB)
                    </p>
                  </>
                )}
              </div>

              {/* Alt Text Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  ছবি বা প্রোডাক্ট নাম / Alt Text <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রিমিয়াম হাফ সিল্ক শাড়ি"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#8A1538]"
                />
              </div>

              {/* Caption Optional Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">ক্যাপশন / বিবরণী (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: সামনের ভিউ"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#8A1538]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsImageUploadOpen(false);
                    setSelectedFile(null);
                    setFilePreviewUrl(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-stone-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="px-5 py-2 text-xs font-extrabold text-white bg-[#8A1538] hover:bg-rose-900 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'ক্লাউড স্টোরেজে আপলোড হচ্ছে...' : 'আপলোড শুরু করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎬 4. YOUTUBE / VIMEO VIDEO LINK MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">🎥 ইউটিউব/ভিমিও ভিডিও লিংক যুক্ত করুন</h3>
              <button onClick={() => setIsVideoModalOpen(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-5 space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">ভিডিও টাইটেল *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফেব্রিক রিভিউ ভিডিও"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#8A1538]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">ইউটিউব / ভিমিও URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#8A1538]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => setIsVideoModalOpen(false)} className="px-4 py-2 text-xs font-bold text-stone-600">বাতিল</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-extrabold text-white bg-[#8A1538] rounded-xl shadow-md">
                  {submitting ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚙️ 5. IMAGE SEO & PUBLIC CDN URL SIDE PANEL */}
      {selectedMediaForSEO && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-stone-200 shadow-2xl z-50 p-5 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-xs font-extrabold text-slate-900">⚙️ ছবি এসইও (SEO) ও সিডিএন তথ্য</h3>
            <button onClick={() => setSelectedMediaForSEO(null)} className="text-stone-400 font-bold">✕</button>
          </div>

          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
            <img src={selectedMediaForSEO.resolvedUrl || selectedMediaForSEO.url} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-3 text-xs font-medium">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alt Text (SEO)</label>
              <input type="text" readOnly defaultValue={selectedMediaForSEO.alt} className="w-full px-3 py-2 border rounded-xl bg-stone-50" />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Public CDN URL</label>
              <input type="text" readOnly defaultValue={selectedMediaForSEO.resolvedUrl || selectedMediaForSEO.url} className="w-full px-3 py-2 border rounded-xl bg-stone-50 font-mono text-[10px]" />
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(selectedMediaForSEO.resolvedUrl || selectedMediaForSEO.url || '');
                alert('Public CDN URL কপি হয়েছে!');
              }}
              className="w-full py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-center border border-indigo-200 hover:bg-indigo-100 transition"
            >
              📋 Public CDN URL কপি করুন
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
