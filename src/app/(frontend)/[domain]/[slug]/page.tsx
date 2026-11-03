import React from 'react';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import Link from 'next/link';
import DynamicPageClient from './DynamicPageClient';
import SingleProductView, { SingleProductType } from '@/components/storefront/product/SingleProductView';
import { getTenantByDomain } from '@/lib/tenant/getTenantByDomain';

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
  let productData: SingleProductType | null = null;
  let tenant: any = null;

  try {
    // ⚡ 1. Dual Domain Resolver (Supports both Subdomain & Custom Domain)
    tenant = await getTenantByDomain(payload, domain);

    if (tenant) {
      // 2. Check if slug belongs to a Product
      const productQuery = await payload.find({
        collection: 'products',
        where: {
          tenant: { equals: tenant.id },
          slug: { equals: slug },
        },
        overrideAccess: true,
      });

      if (productQuery.docs && productQuery.docs.length > 0) {
        const rawProd: any = productQuery.docs[0];

        let categoryName = 'Uncategorized';
        if (rawProd.category) {
          categoryName = typeof rawProd.category === 'object' ? rawProd.category.name : 'Category';
        }

        let images: string[] = [];
        if (Array.isArray(rawProd.images) && rawProd.images.length > 0) {
          images = rawProd.images.map((imgObj: any) =>
            typeof imgObj === 'string' ? imgObj : imgObj.url || '/placeholder-product.png'
          );
        } else if (rawProd.featuredImage) {
          images = [rawProd.featuredImage];
        } else {
          images = ['/placeholder-product.png'];
        }

        const inStock =
          rawProd.inventory?.stockStatus === 'in_stock' ||
          rawProd.inventory?.stockStatus === 'instock' ||
          (rawProd.inventory?.stockQuantity ?? rawProd.stockQuantity ?? 1) > 0;

        productData = {
          id: rawProd.id,
          title: rawProd.title || rawProd.name || 'Untitled Product',
          slug: rawProd.slug,
          categoryName,
          price: Number(rawProd.price) || 0,
          regularPrice: rawProd.regularPrice ? Number(rawProd.regularPrice) : undefined,
          inStock,
          images,
          description: rawProd.description || rawProd.shortDescription || 'কোনো বিস্তারিত বিবরণ দেওয়া হয়নি।',
          features: Array.isArray(rawProd.features)
            ? rawProd.features.map((f: any) => (typeof f === 'string' ? f : f.featureText))
            : [],
          sizes: [],
          colors: [],
          variations: [],
        };
      } else {
        // 3. Check if slug belongs to a Custom or Legal Page
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
    }
  } catch (error) {
    console.error('Error fetching dynamic slug data:', error);
  }

  if (productData) {
    return (
      <div className="min-h-screen bg-stone-50">
        <SingleProductView product={productData} />
      </div>
    );
  }

  if (pageData) {
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">পেজ বা প্রডাক্টটি পাওয়া যায়নি! (404)</h2>
      <p className="text-slate-500 text-sm mb-4">
        খোঁজা ইউআরএল: <code className="bg-slate-200 px-2 py-1 rounded text-xs font-mono">/{slug}</code>
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#8A1538] text-white text-xs font-bold rounded-xl shadow hover:bg-rose-900 transition"
      >
        ← স্টোর হোমপেজে ফিরে যান
      </Link>
    </div>
  );
}