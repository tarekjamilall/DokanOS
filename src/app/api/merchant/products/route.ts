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
      type,
      price,
      regularPrice,
      salePrice,
      manageStock = true,
      stockQuantity = 10,
      stockStatus = 'in_stock',
      digitalFileUrl,
      externalUrl,
      attributes,
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
      .replace(/^-+|-+$/g, '');

    // 3. Process & Sanitize Gallery Images (Fixes Image Uri Error)
    const mainImageUrl = image || featuredImage || '';
    const allImages: { url: string }[] = [];

    if (mainImageUrl && typeof mainImageUrl === 'string' && mainImageUrl.trim()) {
      allImages.push({ url: mainImageUrl.trim() });
    }

    if (Array.isArray(galleryImages)) {
      galleryImages.forEach((imgUrl: any) => {
        const urlStr = typeof imgUrl === 'string' ? imgUrl : imgUrl?.url;
        if (urlStr && typeof urlStr === 'string' && urlStr.trim() && urlStr !== mainImageUrl) {
          allImages.push({ url: urlStr.trim() });
        }
      });
    }

    if (allImages.length === 0) {
      allImages.push({ url: '[suspicious link removed]' });
    }

    // 4. Transform Attributes (Fixes 'অ্যাট্রিবিউট অপশনসমূহ' Mismatch Error)
    let formattedAttributes: any[] = [];
    const isVariableProduct = (productType || type) === 'variable';

    if (isVariableProduct && attributes) {
      if (Array.isArray(attributes)) {
        formattedAttributes = attributes;
      } else if (typeof attributes === 'object' && attributes !== null) {
        formattedAttributes = Object.keys(attributes)
          .filter((key) => Array.isArray(attributes[key]) && attributes[key].length > 0)
          .map((key) => ({
            name: key,
            options: attributes[key].map((val: string) => ({ value: val })),
          }));
      }
    }

    // 5. Transform Variations
    let formattedVariations: any[] = [];
    if (isVariableProduct && Array.isArray(variations)) {
      formattedVariations = variations.map((v: any) => ({
        sku: v.sku || '',
        color: v.attributes?.find((a: any) => a.attrName === 'Color' || a.attrName === 'color')?.option || '',
        size: v.attributes?.find((a: any) => a.attrName === 'Size' || a.attrName === 'size')?.option || '',
        price: Number(v.price) || Number(price),
        regularPrice: Number(v.regularPrice || v.price) || Number(price),
        stockQuantity: Number(v.stockQuantity) || 5,
        image: v.image || '',
      }));
    }

    // 6. Create Product Document in Payload CMS
    const newProduct = await payload.create({
      collection: 'products',
      data: {
        title,
        slug: finalSlug || `prod-${Date.now()}`,
        type: isVariableProduct ? 'variable' : 'simple',
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
        attributes: formattedAttributes,
        variations: formattedVariations,
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