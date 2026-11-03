import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: টেন্যান্টের সকল পেজ ফেচ করা
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন প্যারামিটার আবশ্যক।' }, { status: 400 });
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

    const pagesQuery = await payload.find({
      collection: 'pages',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      pages: pagesQuery.docs,
    });
  } catch (error: any) {
    console.error('Pages Fetch Error:', error);
    return NextResponse.json({ error: 'পেজ লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST / PATCH: পেজ তৈরি বা স্ট্যাটাস আপডেট
export async function POST(request: Request) {
  try {
    const { domain, id, title, slug, content, status } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন আবশ্যক।' }, { status: 400 });
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

    if (id) {
      // Update existing page
      const updatedPage = await payload.update({
        collection: 'pages',
        id,
        data: {
          title,
          slug,
          content,
          status,
        },
        overrideAccess: true,
      });

      return NextResponse.json({
        success: true,
        page: updatedPage,
        message: '🎉 পেজ সফলভাবে আপডেট করা হয়েছে!',
      });
    } else {
      // Create new custom page
      const newPage = await payload.create({
        collection: 'pages',
        data: {
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          content: content || '',
          status: status || 'published',
          tenant: tenant.id,
        },
        overrideAccess: true,
      });

      return NextResponse.json({
        success: true,
        page: newPage,
        message: '🎉 নতুন পেজ ডাটাবেসে সেভ হয়েছে!',
      });
    }
  } catch (error: any) {
    console.error('Page Operation Error:', error);
    return NextResponse.json({ error: 'পেজ প্রসেস করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}