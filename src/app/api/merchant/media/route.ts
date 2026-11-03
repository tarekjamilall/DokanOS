import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: ফেচ মিডিয়া ও ভিডিও
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const mediaType = searchParams.get('type'); // 'image' or 'video'
    const searchQuery = searchParams.get('query') || '';

    if (!domain) {
      return NextResponse.json(
        { error: 'টেন্যান্ট ডোমেইন (domain) প্যারামিটার আবশ্যক।' },
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

    // 2. Build Query Conditions
    const whereConditions: any[] = [{ tenant: { equals: tenant.id } }];

    if (mediaType && (mediaType === 'image' || mediaType === 'video')) {
      whereConditions.push({ mediaType: { equals: mediaType } });
    }

    if (searchQuery.trim() !== '') {
      whereConditions.push({
        alt: { contains: searchQuery.trim() },
      });
    }

    // 3. Query Media Collection
    const mediaDocs = await payload.find({
      collection: 'media',
      where: {
        and: whereConditions,
      },
      sort: '-createdAt',
      limit: 100,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      media: mediaDocs.docs,
      totalDocs: mediaDocs.totalDocs,
    });
  } catch (error: any) {
    console.error('Media Fetch Error:', error);
    return NextResponse.json(
      { error: 'মিডিয়া গ্যালারি লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// ➕ 2. POST: ডিভাইস থেকে ফাইল আপলোড অথবা ইউটিউব ভিডিও লিংক সেভ
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const payload = await getPayload({ config: configPromise });

    // A. 📁 MULTIPART FORM DATA: আসল ফাইল আপলোড (Device storage)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const domain = (formData.get('domain') as string) || '';
      const alt = (formData.get('alt') as string) || '';
      const caption = (formData.get('caption') as string) || '';

      if (!domain || !file || !alt) {
        return NextResponse.json(
          { error: 'অনুগ্রহ করে ফাইল, Alt Text এবং ডোমেইন তথ্য সঠিকভাবে প্রদান করুন।' },
          { status: 400 }
        );
      }

      // 1. Fetch Tenant & Dynamic Storage Limit
      const tenantQuery = await payload.find({
        collection: 'tenants',
        where: { slug: { equals: domain } },
        overrideAccess: true,
      });

      if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
        return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
      }

      const tenant = tenantQuery.docs[0];
      const maxStorageMB = tenant.subscriptionPlan?.storageLimitMB ?? 500;

      // 2. Dynamic Storage Limit Pre-check
      const existingMedia = await payload.find({
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

      const currentBytes = existingMedia.docs.reduce(
        (sum: number, doc: any) => sum + (Number(doc.fileSize) || 0),
        0
      );
      const fileSizeBytes = file.size;
      const projectedMB = (currentBytes + fileSizeBytes) / (1024 * 1024);

      if (projectedMB > maxStorageMB) {
        return NextResponse.json(
          {
            error: `⚠️ আপনার প্ল্যানের স্টোরেজ সীমা (${maxStorageMB} MB) অতিক্রম করেছে! নতুন ছবি আপলোড করতে স্পেস খালি করুন অথবা প্ল্যান আপগ্রেড করুন।`,
          },
          { status: 400 }
        );
      }

      // 3. Buffer Conversion for Payload Upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const newMedia = await payload.create({
        collection: 'media',
        file: {
          data: buffer,
          name: file.name,
          mimetype: file.type || 'image/jpeg',
          size: file.size,
        },
        data: {
          alt,
          caption: caption || '',
          mediaType: 'image',
          fileSize: file.size,
          mimeType: file.type || 'image/jpeg',
          tenant: tenant.id,
        },
        overrideAccess: true,
      });

      return NextResponse.json({
        success: true,
        media: newMedia,
        message: 'ডিভাইস থেকে ফাইলটি সফলভাবে ক্লাউড স্টোরেজে আপলোড হয়েছে!',
      });
    }

    // B. 🎥 JSON DATA: ইউটিউব / ভিমিও ভিডিও লিংক সেভ
    const body = await request.json();
    const { domain, alt, caption, videoUrl, videoPlatform } = body;

    if (!domain || !alt || !videoUrl) {
      return NextResponse.json(
        { error: 'ডোমেইন, টাইটেল এবং ভিডিও URL প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // ⚡ Payload Upload Collection Bypass for Video Embeds
    const dummyVideoBuffer = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    const newMedia = await payload.create({
      collection: 'media',
      file: {
        data: dummyVideoBuffer,
        name: `video-embed-${Date.now()}.gif`,
        mimetype: 'image/gif',
        size: dummyVideoBuffer.length,
      },
      data: {
        alt,
        caption: caption || '',
        mediaType: 'video',
        videoUrl,
        videoPlatform: videoPlatform || (videoUrl.includes('vimeo') ? 'vimeo' : 'youtube'),
        fileSize: 0, // 0 MB storage count for video links
        tenant: tenant.id,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      media: newMedia,
      message: 'প্রমোশনাল ভিডিও লিংক সফলভাবে যুক্ত করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Media Upload/Save Error:', error);
    return NextResponse.json(
      { error: error.message || 'মিডিয়া আপলোড বা সেভ করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}