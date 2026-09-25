import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

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
      price,
      salePrice,
      saleStartDate,
      saleEndDate,
      sku,
      manageStock = false,
      stockQuantity = 0,
      stockStatus = 'instock',
      backorders = 'no',
      lowStockThreshold,
      weight,
      dimensions,
      digitalFileUrl,
      externalUrl,
      buttonText,
      attributes = [],
      variations = [],
      upsells = [],
      crosssells = [],
      purchaseNote,
      menuOrder = 0,
      image,
      gallery = [],
      category,
      brand,
      tags = [],
      isFeatured = false,
    } = body;

    if (!domain || !title || !price) {
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

    // 2. Generate Clean Slug Fallback
    const finalSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
      : title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    // 3. Create Product Document
    const newProduct = await payload.create({
      collection: 'products',
      data: {
        title,
        slug: finalSlug,
        shortDescription: shortDescription || '',
        description: description || '',
        productType,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        saleStartDate: saleStartDate || undefined,
        saleEndDate: saleEndDate || undefined,
        sku: sku || undefined,
        manageStock: Boolean(manageStock),
        stockQuantity: Number(stockQuantity) || 0,
        stockStatus,
        backorders,
        lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : undefined,
        weight: weight ? Number(weight) : undefined,
        dimensions: dimensions || undefined,
        digitalFileUrl: digitalFileUrl || undefined,
        externalUrl: externalUrl || undefined,
        buttonText: buttonText || undefined,
        attributes: attributes || [],
        variations: variations || [],
        upsells: upsells || [],
        crosssells: crosssells || [],
        purchaseNote: purchaseNote || '',
        menuOrder: Number(menuOrder) || 0,
        image: image || '',
        gallery: Array.isArray(gallery) ? gallery : gallery ? [gallery] : [],
        category: category || undefined,
        brand: brand || undefined,
        tags: tags || [],
        isFeatured: Boolean(isFeatured),
        tenant: tenant.id,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'উকমার্স প্রোডাক্ট সফলভাবে সেভ করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('WooCommerce Product Add Error:', error);
    return NextResponse.json(
      { error: error.message || 'প্রোডাক্ট সেভ করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
