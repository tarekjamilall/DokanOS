'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/storefront/navigation/Navbar';
import Footer from '@/components/storefront/navigation/Footer';
import BlockRenderer from '@/components/storefront/BlockRenderer';

type Props = {
  domain: string;
  storeName: string;
  tenant?: any;
  products: any[];
  categories?: any[];
  activeCategory?: string;
};

export default function StorefrontClient({
  domain,
  storeName,
  tenant = {},
  products = [],
  categories = [],
  activeCategory = 'all',
}: Props) {
  const primaryColor = tenant?.primaryColor || '#8A1538';
  const [blocks, setBlocks] = useState<any[]>(tenant?.homeBlocks || []);

  // Fetch Saved Dynamic Page Blocks for Tenant
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch(`/api/merchant/page-blocks?domain=${domain}`);
        const data = await res.json();
        if (res.ok && data.success && data.blocks) {
          setBlocks(data.blocks);
        }
      } catch (err) {
        console.error('Failed to load page blocks:', err);
      }
    };
    if (domain) fetchBlocks();
  }, [domain]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col justify-between">
      <div>
        {/* 🧭 Dynamic Header / Navbar Component */}
        <Navbar
          domain={domain}
          storeName={storeName}
          brandLogo={tenant?.brandLogo || ''}
          primaryColor={primaryColor}
          headerLayout={tenant?.headerLayout || 'layout-1'}
          showAnnouncement={tenant?.showAnnouncement ?? true}
          announcementText={
            tenant?.announcementText ||
            '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি'
          }
          announcementBg={tenant?.announcementBg || '#0f172a'}
          announcementTextColor={tenant?.announcementTextColor || '#ffffff'}
          headerLinks={
            tenant?.headerLinks || [
              { label: 'হোম', url: '/' },
              { label: 'সব প্রোডাক্ট', url: '/#products' },
              { label: 'আমাদের কথা', url: '/about-us' },
              { label: 'যোগাযোগ', url: '/contact-us' },
            ]
          }
          showSearchBar={tenant?.showSearchBar ?? true}
          showCartIcon={tenant?.showCartIcon ?? true}
          helplinePhone={tenant?.helplinePhone || tenant?.whatsappNumber || '01700000000'}
          stickyHeader={tenant?.stickyHeader ?? true}
        />

        {/* 🧩 Dynamic Block-Based Page Renderer Engine */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <BlockRenderer
            blocks={blocks}
            domain={domain}
            storeName={storeName}
            products={products}
            categories={categories}
            activeCategory={activeCategory}
            primaryColor={primaryColor}
          />
        </main>
      </div>

      {/* 📌 Dynamic Footer Component */}
      <Footer
        domain={domain}
        storeName={storeName}
        brandLogo={tenant?.brandLogo || ''}
        primaryColor={primaryColor}
        footerAboutText={
          tenant?.footerAboutText ||
          'আমরা প্রিমিয়াম মানের পণ্য এবং সেরা কাস্টমার সার্ভিস প্রদান করতে প্রতিশ্রুতিবদ্ধ।'
        }
        supportPhone={tenant?.supportPhone || tenant?.helplinePhone || '01700000000'}
        supportEmail={tenant?.supportEmail || 'support@example.com'}
        address={tenant?.address || 'ঢাকা, বাংলাদেশ'}
        copyrightText={tenant?.copyrightText || `© 2026 ${storeName}. All Rights Reserved.`}
        facebookUrl={tenant?.facebookUrl || ''}
        instagramUrl={tenant?.instagramUrl || ''}
        youtubeUrl={tenant?.youtubeUrl || ''}
        showTrustBadges={tenant?.showTrustBadges ?? true}
      />
    </div>
  );
}