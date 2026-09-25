import React from 'react';
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
  let orders: any[] = [];
  let products: any[] = [];
  let categories: any[] = [];
  let coupons: any[] = [];
  let pages: any[] = [];

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

      // 2. Fetch Orders
      const orderQuery = await payload.find({
        collection: 'orders',
        where: { tenant: { equals: tenant.id } },
        limit: 100,
        sort: '-createdAt',
        overrideAccess: true,
      });
      orders = orderQuery.docs;

      // 3. Fetch Products
      const productQuery = await payload.find({
        collection: 'products',
        where: { tenant: { equals: tenant.id } },
        limit: 100,
        overrideAccess: true,
      });
      products = productQuery.docs;

      // 4. Fetch Categories
      const catQuery = await payload.find({
        collection: 'categories',
        where: { tenant: { equals: tenant.id } },
        limit: 100,
        overrideAccess: true,
      });
      categories = catQuery.docs;

      // 5. Fetch Coupons
      const couponQuery = await payload.find({
        collection: 'coupons',
        where: { tenant: { equals: tenant.id } },
        limit: 100,
        overrideAccess: true,
      });
      coupons = couponQuery.docs;

      // 6. Fetch Pages
      const pageQuery = await payload.find({
        collection: 'pages',
        where: { tenant: { equals: tenant.id } },
        limit: 100,
        overrideAccess: true,
      });
      pages = pageQuery.docs;
    }
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
