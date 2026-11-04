import React from 'react';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import StorefrontClient from './StorefrontClient';

type Props = {
  params: Promise<{
    domain: string;
  }>;
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function TenantStorefrontPage({ params, searchParams }: Props) {
  const { domain } = await params;
  const { category } = await searchParams;
  const payload = await getPayload({ config: configPromise });

  let tenant: any = null;
  let products: any[] = [];
  let categories: any[] = [];

  // 🔍 ১. টেন্যান্ট ডাটাবেসে আছে কিনা খোঁজা
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
    console.error('Error fetching tenant:', error);
  }

  // 🔒 ২. ডাটাবেসে নিবন্ধিত টেন্যান্ট না থাকলে 404
  if (!tenant) {
    return notFound();
  }

  // 🔒 ৩. টেন্যান্ট একাউন্ট সাসপেন্ডেড হলে স্টোর বন্ধ দেখাবে
  if (tenant.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans p-4">
        <div className="max-w-md text-center space-y-3 bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
          <span className="text-4xl">⚠️</span>
          <h1 className="text-lg font-black text-stone-900">স্টোরটি সাময়িকভাবে স্থগিত আছে</h1>
          <p className="text-xs text-stone-500">
            এই দোকানটির সেবা সাময়িকভাবে বন্ধ রাখা হয়েছে। দোকান মালিককে প্ল্যাটফর্ম অ্যাডমিনের সাথে যোগাযোগ করার অনুরোধ করা হচ্ছে।
          </p>
        </div>
      </div>
    );
  }

  // 📦 ৪. নিবন্ধিত টেন্যান্টের ক্যাটাগরি ও প্রোডাক্ট লোড করা
  try {
    const catQuery = await payload.find({
      collection: 'categories',
      where: {
        tenant: { equals: tenant.id },
      },
      overrideAccess: true,
    });
    categories = catQuery.docs;

    const productWhere: any = {
      tenant: { equals: tenant.id },
    };

    if (category && category !== 'all') {
      const selectedCat = categories.find((c: any) => c.slug === category);
      if (selectedCat) {
        productWhere.category = { equals: selectedCat.id };
      }
    }

    const productQuery = await payload.find({
      collection: 'products',
      where: productWhere,
      depth: 2,
      overrideAccess: true,
    });
    products = productQuery.docs;
  } catch (error) {
    console.error('Error fetching storefront categories/products:', error);
  }

  const storeName = tenant?.name || domain.toUpperCase();

  return (
    <StorefrontClient
      domain={domain}
      storeName={storeName}
      tenant={tenant}
      products={products}
      categories={categories}
      activeCategory={category || 'all'}
    />
  );
}