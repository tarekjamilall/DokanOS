import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function POST(request: Request) {
  try {
    const { domain, mediaId, mediaIds } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'টেন্যান্ট ডোমেইন (domain) প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
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

    // 2. Determine Single or Bulk Deletion
    const idsToDelete: string[] = mediaIds && Array.isArray(mediaIds) ? mediaIds : mediaId ? [mediaId] : [];

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে মুছে ফেলার জন্য অন্তত একটি মিডিয়া সিলেক্ট করুন।' },
        { status: 400 }
      );
    }

    // 3. Delete Docs matching IDs
    let deletedCount = 0;
    for (const id of idsToDelete) {
      try {
        await payload.delete({
          collection: 'media',
          id,
          overrideAccess: true,
        });
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete media doc ID: ${id}`, err);
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} টি ফাইল সফলভাবে মুছে ফেলা হয়েছে!`,
    });
  } catch (error: any) {
    console.error('Media Delete Error:', error);
    return NextResponse.json(
      { error: 'মিডিয়া ডিলিট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
