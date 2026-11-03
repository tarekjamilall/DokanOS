import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন প্যারামিটার আবশ্যক' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // 1. Fetch Tenant & Dynamic Plan Storage Limit
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];
    
    // ⚡ ZERO HARDCODING: Dynamically read maxStorage from Tenant Subscription Plan
    const maxStorageMB = tenant.subscriptionPlan?.maxStorage ?? 500;

    // 2. Aggregate Total File Size from Media Collection
    const mediaDocs = await payload.find({
      collection: 'media',
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { mediaType: { equals: 'image' } },
        ],
      },
      limit: 1000,
      overrideAccess: true,
    });

    const totalSizeBytes = mediaDocs.docs.reduce((sum: number, item: any) => sum + (Number(item.fileSize) || 0), 0);
    const usedStorageMB = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));
    const percentage = Math.min(100, Math.round((usedStorageMB / maxStorageMB) * 100));

    return NextResponse.json({
      success: true,
      usedStorageMB,
      maxStorageMB,
      percentage,
      totalFiles: mediaDocs.totalDocs,
    });
  } catch (error: any) {
    console.error('Storage Usage Error:', error);
    return NextResponse.json({ error: 'স্টোরেজ হিসাব করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
