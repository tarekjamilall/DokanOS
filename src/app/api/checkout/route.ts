import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function POST(request: Request) {
  try {
    const {
      domain,
      productId,
      quantity = 1,
      customerName,
      customerPhone,
      deliveryAddress,
      shippingZone,
      customerNote,
      couponCode,
      paymentMethod = 'cod',
      transactionId,
    } = await request.json();

    if (!domain || !productId || !customerName || !customerPhone || !deliveryAddress) {
      return NextResponse.json(
        { error: 'প্রয়োজনীয় তথ্যগুলো সঠিকভাবে পূরণ করুন।' },
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

    // 2. Fetch Product
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      overrideAccess: true,
    });

    if (!product) {
      return NextResponse.json({ error: 'প্রোডাক্টটি পাওয়া যায়নি' }, { status: 404 });
    }

    const unitPrice = product.salePrice || product.price || 0;
    const subtotal = unitPrice * quantity;
    const shippingCharge = shippingZone === 'inside-dhaka' ? 60 : 120;

    // 3. Coupon Validation
    let discountAmount = 0;
    if (couponCode && couponCode.trim() !== '') {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const couponQuery = await payload.find({
        collection: 'coupons',
        where: {
          and: [
            { tenant: { equals: tenant.id } },
            { code: { equals: cleanCoupon } },
          ],
        },
        overrideAccess: true,
      });

      if (couponQuery.docs && couponQuery.docs.length > 0) {
        const coupon = couponQuery.docs[0];

        // Check Expiry Date
        const now = new Date();
        const expiry = coupon.expirationDate ? new Date(coupon.expirationDate) : null;

        if (expiry && now > expiry) {
          return NextResponse.json({ error: 'কুপন কোডের মেয়াদ শেষ হয়ে গেছে!' }, { status: 400 });
        }

        // Check Min Order Amount
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
          return NextResponse.json(
            { error: `এই কুপন ব্যবহার করতে সর্বনিম্ন ৳${coupon.minOrderAmount}-এর অর্ডার করতে হবে।` },
            { status: 400 }
          );
        }

        // Calculate Discount
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * (coupon.discountValue || 0)) / 100);
        } else if (coupon.discountType === 'fixed') {
          discountAmount = coupon.discountValue || 0;
        }
      } else {
        return NextResponse.json({ error: 'ভুল বা অকার্যকর কুপন কোড!' }, { status: 400 });
      }
    }

    const grandTotal = Math.max(0, subtotal + shippingCharge - discountAmount);
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Create Order Doc
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        tenant: tenant.id,
        customerName,
        customerPhone,
        deliveryAddress,
        shippingZone,
        shippingCharge,
        customerNote: customerNote || '',
        items: [
          {
            product: product.id,
            quantity,
            unitPrice,
          },
        ],
        subtotal,
        discountAmount,
        grandTotal,
        paymentMethod,
        transactionId: transactionId || '',
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'pending_verification',
        orderStatus: 'pending',
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      grandTotal,
      discountAmount,
      message: 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json(
      { error: 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
