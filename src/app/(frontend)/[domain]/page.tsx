import React from 'react';
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

  try {
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: {
        slug: { equals: domain },
      },
    });

    if (tenantQuery.docs && tenantQuery.docs.length > 0) {
      tenant = tenantQuery.docs[0];

      const catQuery = await payload.find({
        collection: 'categories',
        where: {
          tenant: { equals: tenant.id },
        },
      });
      categories = catQuery.docs;

      const productWhere: any = {
        tenant: { equals: tenant.id },
      };

      if (category) {
        const selectedCat = categories.find((c) => c.slug === category);
        if (selectedCat) {
          productWhere.category = { equals: selectedCat.id };
        }
      }

      const productQuery = await payload.find({
        collection: 'products',
        where: productWhere,
      });
      products = productQuery.docs;
    }
  } catch (error) {
    console.error('Error fetching storefront data:', error);
  }

  const storeName = tenant?.name || domain.toUpperCase();

  return (
    <StorefrontClient
      domain={domain}
      storeName={storeName}
      tenantSettings={{
        brandLogo: tenant?.brandLogo || '',
        primaryColor: tenant?.primaryColor || '#4f46e5',
        announcementText:
          tenant?.announcementText ||
          '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | ঢাকার ভেতরে শিপিং ৳৬০, বাইরে ৳১২০',
        whatsappNumber: tenant?.whatsappNumber || '',
        metaPixelId: tenant?.metaPixelId || '',
      }}
      products={products}
      categories={categories}
      activeCategory={category || 'all'}
    />
  );
}
