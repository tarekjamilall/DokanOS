import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: ব্র্যান্ডস ফেচ করা
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন প্যারামিটার আবশ্যক' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // Note: If you have a separate brands collection or store brands in products/taxonomies
    return NextResponse.json({
      success: true,
      brands: [],
    });
  } catch (error: any) {
    console.error('Brand Fetch Error:', error);
    return NextResponse.json({ error: 'ব্র্যান্ড লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST: নতুন ব্র্যান্ড সেভ করা
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, name, slug, website, description, logo, isFeatured } = body;

    if (!domain || !name) {
      return NextResponse.json({ error: 'ব্র্যান্ডের নাম ও ডোমেইন আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    return NextResponse.json({
      success: true,
      brand: {
        id: `brand-${Date.now()}`,
        name: name.trim(),
        slug: finalSlug,
        website: website || '',
        description: description || '',
        logo: logo || '',
        isFeatured: Boolean(isFeatured),
        productCount: 0,
      },
      message: '🎉 ব্র্যান্ড সফলভাবে তৈরি করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Brand Create Error:', error);
    return NextResponse.json({ error: 'ব্র্যান্ড সেভ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}