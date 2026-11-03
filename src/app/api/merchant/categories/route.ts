import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🇧🇩 Bengali to English / Romanized Slug Generator Helper
function bnToEnSlug(text: string): string {
  if (!text) return '';
  const bnMap: Record<string, string> = {
    'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'ঋ': 'ri',
    'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'v', 'ম': 'm',
    'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
    'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo', 'ৃ': 'ri',
    'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', '্': '',
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };

  let converted = '';
  const str = text.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    converted += bnMap[char] !== undefined ? bnMap[char] : char;
  }
  return converted
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 🔍 1. GET: টেন্যান্টের সকল ক্যাটাগরি ডাটাবেস থেকে ফেচ করা
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'টেন্যান্ট ডোমেইন (domain) প্যারামিটার আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // 1. Fetch Tenant
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // 2. Fetch Categories for Tenant (with depth: 1 for parent population)
    const categoriesDoc = await payload.find({
      collection: 'categories',
      where: { tenant: { equals: tenant.id } },
      limit: 200,
      depth: 1,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      categories: categoriesDoc.docs,
    });
  } catch (error: any) {
    console.error('Category Fetch Error:', error);
    return NextResponse.json({ error: 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST: নতুন ক্যাটাগরি তৈরি ও সেভ করা (Step 95 & 97)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, name, slug, parentId, parent, description } = body;

    if (!domain || !name) {
      return NextResponse.json({ error: 'ক্যাটাগরির নাম ও টেন্যান্ট ডোমেইন আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // 1. Fetch Tenant
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // 2. Slug Generation
    const rawSlug = slug || bnToEnSlug(name);
    const finalSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;

    // 3. Parent Relationship (Payload Categories Schema uses field 'parent')
    const parentRef = parentId || parent || undefined;

    // 4. Create Category Document
    const newCategory = await payload.create({
      collection: 'categories',
      data: {
        name: name.trim(),
        slug: finalSlug,
        parent: parentRef || undefined,
        description: description ? description.trim() : '',
        tenant: tenant.id,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      category: newCategory,
      message: '🎉 ক্যাটাগরি সফলভাবে তৈরি করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Category Create Error:', error);
    return NextResponse.json({ error: error.message || 'ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// 🗑️ 3. DELETE: ক্যাটাগরি স্থায়ীভাবে ডিলিট করা
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ক্যাটাগরি আইডি আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    await payload.delete({
      collection: 'categories',
      id,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Category Delete Error:', error);
    return NextResponse.json({ error: 'ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}