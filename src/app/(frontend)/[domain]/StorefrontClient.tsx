'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/navigation/Navbar';
import Footer from '@/components/storefront/navigation/Footer';

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
  const router = useRouter();
  const primaryColor = tenant?.primaryColor || '#8A1538';

  // Inject Meta Pixel dynamically if configured
  useEffect(() => {
    if (tenant?.metaPixelId) {
      const pixelId = tenant.metaPixelId;
      if (!window.document.getElementById(`fb-pixel-${pixelId}`)) {
        const script = document.createElement('script');
        script.id = `fb-pixel-${pixelId}`;
        script.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e);
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        document.head.appendChild(script);
      }
    }
  }, [tenant?.metaPixelId]);

  const handleBuyNow = (productId: string) => {
    router.push(`/checkout?product=${productId}&qty=1`);
  };

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

        {/* 📦 Products & Categories Showcase */}
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Categories Bar */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Link
                href={`/${domain}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-[#8A1538] text-white'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                সব ক্যাটাগরি
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/${domain}?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeCategory === cat.slug
                      ? 'bg-[#8A1538] text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <div>
            <h2 className="text-base font-extrabold text-stone-900 mb-4">
              🛍️ আমাদের প্রডাক্ট কালেকশন ({products.length})
            </h2>

            {products.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-2">
                <span className="text-3xl">📦</span>
                <p className="text-xs font-bold text-stone-600">কোনো প্রডাক্ট পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between p-3 space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="h-40 rounded-xl bg-stone-100 overflow-hidden relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={
                              typeof product.images[0].image === 'string'
                                ? product.images[0].image
                                : product.images[0].image?.url
                            }
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 font-mono text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-stone-900 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-[#8A1538]">
                          ৳ {product.price}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-[10px] text-stone-400 line-through font-mono">
                            ৳ {product.compareAtPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuyNow(product.id)}
                      className="w-full py-2 bg-[#8A1538] hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                    >
                      অর্ডার করুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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