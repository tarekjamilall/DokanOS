import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function POST(request: Request) {
  try {
    const {
      domain,
      code,
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      expirationDate,
    } = await request.json();

    if (!domain || !code || !discountValue) {
      return NextResponse.json(
        { error: 'কুপন কোড, ডিসকাউন্টের পরিমাণ ও ডোমেইন আবশ্যক।' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config: configPromise });

    // 1. Find Tenant
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // 2. Create Coupon Doc
    const newCoupon = await payload.create({
      collection: 'coupons',
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
        tenant: tenant.id,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      coupon: newCoupon,
      message: 'কুপন সফলভাবে তৈরি হয়েছে!',
    });
  } catch (error: any) {
    console.error('Merchant Coupon Creation Error:', error);
    return NextResponse.json(
      { error: 'কুপন তৈরি করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
