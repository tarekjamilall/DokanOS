import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: টেন্যান্টের তৈরি সব পেজের তালিকা লোড (Internal Page Picker-এর জন্য)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন প্যারামিটার আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // Find Tenant
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // Fetch Tenant Pages
    const pageQuery = await payload.find({
      collection: 'pages',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      overrideAccess: true,
    });

    // Default System Pages list
    const systemPages = [
      { id: 'sys-home', title: 'হোমপেজ (Home)', slug: '/' },
      { id: 'sys-shop', title: 'সব প্রোডাক্ট ক্যাটালগ (Shop)', slug: '/#products' },
      { id: 'sys-about', title: 'আমাদের কথা (About Us)', slug: '/about-us' },
      { id: 'sys-contact', title: 'যোগাযোগ (Contact Us)', slug: '/contact-us' },
      { id: 'sys-privacy', title: 'প্রাইভেসি পলিসি (Privacy Policy)', slug: '/privacy-policy' },
      { id: 'sys-terms', title: 'সেবার শর্তাবলী (Terms & Conditions)', slug: '/terms-and-conditions' },
      { id: 'sys-return', title: 'রিটার্ন ও রিফান্ড নীতি (Return Policy)', slug: '/return-refund-policy' },
    ];

    const customPages = (pageQuery.docs || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug.startsWith('/') ? p.slug : `/${p.slug}`,
    }));

    // Merge system & custom pages uniquely
    const allPages = [...systemPages, ...customPages];

    return NextResponse.json({
      success: true,
      pages: allPages,
    });
  } catch (error: any) {
    console.error('Fetch Pages Error:', error);
    return NextResponse.json({ error: 'পেজের তালিকা লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}