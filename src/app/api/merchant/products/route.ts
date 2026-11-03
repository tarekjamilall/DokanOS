import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: সার্চ, ফিল্টারিং ও পেজিনেশন সহ প্রোডাক্ট ফেচ করা (Steps 81-85)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

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

    // 2. Build Where Query
    const whereConditions: any[] = [{ tenant: { equals: tenant.id } }];

    if (query.trim()) {
      whereConditions.push({
        title: { contains: query.trim() },
      });
    }

    if (category && category !== 'all') {
      whereConditions.push({
        category: { equals: category },
      });
    }

    if (stockStatus && stockStatus !== 'all') {
      whereConditions.push({
        'inventory.stockStatus': { equals: stockStatus },
      });
    }

    // 3. Query Products with Depth Population
    const productsDoc = await payload.find({
      collection: 'products',
      where: {
        and: whereConditions,
      },
      sort: '-createdAt',
      page,
      limit,
      depth: 2,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      products: productsDoc.docs,
      totalDocs: productsDoc.totalDocs,
      totalPages: productsDoc.totalPages,
      page: productsDoc.page,
    });
  } catch (error: any) {
    console.error('Products Fetch Error:', error);
    return NextResponse.json(
      { error: 'প্রোডাক্ট তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// ➕ 2. POST: নতুন প্রোডাক্ট সেভ করা (Steps 71-75)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      domain,
      title,
      slug,
      shortDescription,
      description,
      productType = 'simple',
      type,
      price,
      regularPrice,
      salePrice,
      manageStock = true,
      stockQuantity = 10,
      stockStatus = 'in_stock',
      digitalFileUrl,
      externalUrl,
      attributes = [],
      variations = [],
      image,
      featuredImage,
      galleryImages = [],
      category,
      brand,
    } = body;

    if (!domain || !title || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'প্রোডাক্ট টাইটেল, মূল্য এবং টেন্যান্ট ডোমেইন আবশ্যক।' },
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

    // 2. Clean ASCII Slug Generation
    const rawSlug = slug || title;
    const finalSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+\$/g, '');

    // 3. Process Gallery Images
    const mainImageUrl = image || featuredImage || '';
    const allImages = [
      ...(mainImageUrl ? [{ url: mainImageUrl }] : []),
      ...(Array.isArray(galleryImages)
        ? galleryImages.map((imgUrl: any) => ({
            url: typeof imgUrl === 'string' ? imgUrl : imgUrl.url,
          }))
        : []),
    ];

    if (allImages.length === 0) {
      allImages.push({ url: 'https://via.placeholder.com/600x600?text=No+Image' });
    }

    // 4. Create Product Document in MongoDB
    const newProduct = await payload.create({
      collection: 'products',
      data: {
        title,
        slug: finalSlug || `prod-${Date.now()}`,
        type: productType || type || 'simple',
        price: Number(price),
        regularPrice: regularPrice ? Number(regularPrice) : Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        description: description || shortDescription || '',
        images: allImages,
        inventory: {
          manageStock: Boolean(manageStock),
          stockQuantity: Number(stockQuantity) || 0,
          stockStatus:
            stockStatus === 'in_stock' || stockStatus === 'instock'
              ? 'in_stock'
              : 'out_of_stock',
        },
        attributes: attributes || [],
        variations: variations || [],
        category: category || undefined,
        brand: brand || undefined,
        digitalFileUrl: digitalFileUrl || undefined,
        externalUrl: externalUrl || undefined,
        tenant: tenant.id,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: '🎉 প্রোডাক্ট সফলভাবে সেভ করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Product Save Error:', error);
    return NextResponse.json(
      { error: error.message || 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}