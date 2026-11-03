import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: টেন্যান্টের কুপন তালিকা লোড
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

    const tenant = tenantQuery.docs[0];

    const couponsDoc = await payload.find({
      collection: 'coupons',
      where: { tenant: { equals: tenant.id } },
      limit: 100,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      coupons: couponsDoc.docs,
    });
  } catch (error: any) {
    console.error('Coupons Fetch Error:', error);
    return NextResponse.json({ error: 'কুপন লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST: নতুন কুপন সেভ করা (Step 116 & 119)
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
        { error: 'কুপন কোড, ডিসকাউন্টের পরিমাণ ও টেন্যান্ট ডোমেইন আবশ্যক।' },
        { status: 400 }
      );
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
    const upperCode = code.toUpperCase().trim();

    // Check duplicate code
    const existingCoupon = await payload.find({
      collection: 'coupons',
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          { code: { equals: upperCode } },
        ],
      },
      overrideAccess: true,
    });

    if (existingCoupon.docs && existingCoupon.docs.length > 0) {
      return NextResponse.json(
        { error: 'এই কোডটির একটি কুপন ইতিমধ্যেই ডাটাবেসে রয়েছে!' },
        { status: 400 }
      );
    }

    // Create Coupon Document in Payload MongoDB
    const newCoupon = await payload.create({
      collection: 'coupons',
      data: {
        code: upperCode,
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
      message: '🎉 কুপন সফলভাবে ডাটাবেসে তৈরি হয়েছে!',
    });
  } catch (error: any) {
    console.error('Merchant Coupon Creation Error:', error);
    return NextResponse.json(
      { error: error.message || 'কুপন তৈরি করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

// 🗑️ 3. DELETE: কুপন ডিলিট করা
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'কুপন আইডি আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    await payload.delete({
      collection: 'coupons',
      id,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      message: 'কুপন সফলভাবে মুছে ফেলা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Coupon Delete Error:', error);
    return NextResponse.json({ error: 'কুপন ডিলিট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}