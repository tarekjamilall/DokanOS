import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function POST(request: Request) {
  try {
    const { domain, searchQuery } = await request.json();

    if (!domain || !searchQuery) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে আপনার অর্ডার আইডি বা মোবাইল নাম্বার দিন' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config: configPromise });

    // 1. Fetch Tenant
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: {
        slug: { equals: domain },
      },
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];
    const cleanQuery = searchQuery.trim();

    // 2. Search Orders by Order Number OR Phone Number
    const ordersQuery = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { tenant: { equals: tenant.id } },
          {
            or: [
              { orderNumber: { equals: cleanQuery } },
              { customerPhone: { equals: cleanQuery } },
            ],
          },
        ],
      },
      sort: '-createdAt',
      limit: 10,
    });

    if (!ordersQuery.docs || ordersQuery.docs.length === 0) {
      return NextResponse.json(
        { error: 'আপনার দেওয়া তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি। মোবাইল নম্বর বা অর্ডার আইডি পুনরায় চেক করুন।' },
        { status: 404 }
      );
    }

    // Return sanitized tracking docs
    const trackedOrders = ordersQuery.docs.map((ord: any) => ({
      orderNumber: ord.orderNumber,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      deliveryAddress: ord.deliveryAddress,
      orderStatus: ord.orderStatus,
      grandTotal: ord.grandTotal,
      paymentMethod: ord.paymentMethod,
      courierName: ord.courierName,
      trackingCode: ord.trackingCode,
      createdAt: ord.createdAt,
      items: ord.items || [],
    }));

    return NextResponse.json({
      success: true,
      orders: trackedOrders,
    });
  } catch (error: any) {
    console.error('Track Order API Error:', error);
    return NextResponse.json(
      { error: 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
