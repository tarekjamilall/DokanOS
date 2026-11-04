import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import MerchantAdminSuite from './MerchantAdminSuite';

type Props = {
  params: Promise<{
    domain: string;
  }>;
};

export default async function MerchantDashboardPage({ params }: Props) {
  const { domain } = await params;
  const payload = await getPayload({ config: configPromise });

  let tenant: any = null;

  // 🔍 ১. টেন্যান্ট ডাটাবেসে আছে কিনা খোঁজা (Subdomain Slug অথবা Custom Domain দিয়ে)
  try {
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: {
        or: [
          { slug: { equals: domain } },
          { customDomain: { equals: domain } },
        ],
      },
      overrideAccess: true,
    });

    if (tenantQuery.docs && tenantQuery.docs.length > 0) {
      tenant = tenantQuery.docs[0];
    }
  } catch (error) {
    console.error('Error fetching tenant for dashboard:', error);
  }

  // 🔒 ২. ডাটাবেসে নিবন্ধিত মার্চেন্ট না থাকলে সরাসরি Next.js 404 পেজে পাঠাবে
  if (!tenant) {
    return notFound();
  }

  // 🔒 ৩. মার্চেন্ট অ্যাকাউন্ট সাসপেন্ডেড থাকলে ড্যাশবোর্ড অ্যাক্সেস বন্ধ দেখাবে
  if (tenant.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans p-4">
        <div className="max-w-md text-center space-y-3 bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
          <span className="text-4xl">⚠️</span>
          <h1 className="text-lg font-black text-stone-900">ড্যাশবোর্ড অ্যাক্সেস স্থগিত আছে</h1>
          <p className="text-xs text-stone-500">
            এই মার্চেন্ট অ্যাকাউন্টটি সাময়িকভাবে বন্ধ রাখা হয়েছে। সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </div>
    );
  }

  let orders: any[] = [];
  let products: any[] = [];
  let categories: any[] = [];
  let coupons: any[] = [];
  let pages: any[] = [];

  // 📦 ৪. নিবন্ধিত মার্চেন্টের ডাটাবেস ডাটা ফেচ করা
  try {
    // 1. Fetch Orders
    const orderQuery = await payload.find({
      collection: 'orders',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      sort: '-createdAt',
      overrideAccess: true,
    });
    orders = orderQuery.docs;

    // 2. Fetch Products (With depth: 2 for category & media details)
    const productQuery = await payload.find({
      collection: 'products',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      sort: '-createdAt',
      depth: 2,
      overrideAccess: true,
    });
    products = productQuery.docs;

    // 3. Fetch Categories
    const catQuery = await payload.find({
      collection: 'categories',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      overrideAccess: true,
    });
    categories = catQuery.docs;

    // 4. Fetch Coupons
    const couponQuery = await payload.find({
      collection: 'coupons',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      overrideAccess: true,
    });
    coupons = couponQuery.docs;

    // 5. Fetch Pages
    const pageQuery = await payload.find({
      collection: 'pages',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      overrideAccess: true,
    });
    pages = pageQuery.docs;
  } catch (error) {
    console.error('Error loading merchant admin suite data:', error);
  }

  return (
    <MerchantAdminSuite
      domain={domain}
      storeName={tenant?.name || 'My Store'}
      brandLogo={tenant?.brandLogo || ''}
      orders={orders}
      products={products}
      categories={categories}
      coupons={coupons}
      pages={pages}
    />
  );
}