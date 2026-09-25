import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import Link from 'next/link';
import DynamicPageClient from './DynamicPageClient';

type Props = {
  params: Promise<{
    domain: string;
    slug: string;
  }>;
};

export default async function CustomDynamicPage({ params }: Props) {
  const { domain, slug } = await params;
  const payload = await getPayload({ config: configPromise });

  let pageData: any = null;
  let tenant: any = null;

  try {
    // 1. Fetch Tenant
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: {
        slug: { equals: domain },
      },
      overrideAccess: true,
    });

    if (tenantQuery.docs && tenantQuery.docs.length > 0) {
      tenant = tenantQuery.docs[0];

      // 2. Fetch Page Doc by Slug & Tenant
      const pageQuery = await payload.find({
        collection: 'pages',
        where: {
          tenant: { equals: tenant.id },
          slug: { equals: slug },
        },
        overrideAccess: true,
      });

      if (pageQuery.docs && pageQuery.docs.length > 0) {
        pageData = pageQuery.docs[0];
      }
    }
  } catch (error) {
    console.error('Error fetching dynamic page blocks:', error);
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">পেজটি পাওয়া যায়নি! (404)</h2>
        <p className="text-slate-500 text-sm mb-4">
          খোঁজা ইউআরএল: <code className="bg-slate-200 px-2 py-1 rounded text-xs font-mono">/{slug}</code> (Tenant Domain: {domain})
        </p>
        <div className="text-xs text-amber-800 bg-amber-50 p-4 rounded-2xl border border-amber-200 max-w-md mb-6 text-left space-y-1">
          <p className="font-bold">💡 দ্রুত সমাধানের চেক-লিষ্ট:</p>
          <p>১. <strong><code>http://localhost:3000/admin</code></strong> এ গিয়ে <strong>Pages</strong> খুলুন।</p>
          <p>২. আপনার তৈরি করা পেজটি ওপেন করে ডানপাশের সাইডবারে <strong>"Merchant Store"</strong> ড্রপডাউনে আপনার দোকানটি সিলেক্ট করা আছে কিনা নিশ্চিত করুন।</p>
          <p>৩. ফাইলটি Save করুন এবং সার্ভার <code>Ctrl + C</code> চেপে আবার <code>npm run dev</code> দিন।</p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow hover:bg-indigo-700 transition"
        >
          ← হোমপেজে যান
        </Link>
      </div>
    );
  }

  return (
    <DynamicPageClient
      domain={domain}
      storeName={tenant?.name || domain.toUpperCase()}
      primaryColor={tenant?.primaryColor || '#4f46e5'}
      brandLogo={tenant?.brandLogo || ''}
      pageData={pageData}
    />
  );
}
