import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: টেন্যান্টের পেজ ব্লক সেটিংস লোড করা
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

    const tenant: any = tenantQuery.docs[0];

    // ডিফল্ট ব্লক স্ট্রাকচার (যদি ডাটাবেসে না থাকে)
    const defaultBlocks = [
      { id: 'b1', type: 'hero-banner', title: '1. Hero Banner Showcase', enabled: true },
      { id: 'b2', type: 'category-showcase', title: '2. Category Showcase', enabled: true },
      { id: 'b3', type: 'product-grid', title: '3. Product Display Grid', enabled: true },
      { id: 'b4', type: 'pas-block', title: '4. PAS Problem-Solution Block', enabled: false },
      { id: 'b5', type: 'faq-accordion', title: '5. FAQ Accordion', enabled: true },
      { id: 'b6', type: 'reviews-strip', title: '6. Customer Reviews & Social Proof', enabled: true },
    ];

    return NextResponse.json({
      success: true,
      blocks: tenant.homeBlocks || defaultBlocks,
    });
  } catch (error: any) {
    console.error('Page Blocks Fetch Error:', error);
    return NextResponse.json({ error: 'ব্লক সেটিংস লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST: ড্যাশবোর্ড থেকে পেজ ব্লক সেটিংস সেভ করা
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, blocks } = body;

    if (!domain || !blocks) {
      return NextResponse.json({ error: 'ডোমেইন ও ব্লক ডাটা আবশ্যক।' }, { status: 400 });
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

    const tenant: any = tenantQuery.docs[0];

    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        homeBlocks: blocks,
      } as any, // 👈 TypeScript Build Error সমাধানের জন্য 'as any' টাইপকাস্ট করা হয়েছে
    });

    return NextResponse.json({
      success: true,
      message: '🎉 সেকশন ব্লক লেআউট সফলভাবে আপডেট হয়েছে!',
    });
  } catch (error: any) {
    console.error('Page Blocks Update Error:', error);
    return NextResponse.json({ error: 'ব্লক সেভ করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}