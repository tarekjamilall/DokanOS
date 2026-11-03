import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const range = searchParams.get('range') || '30d';

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন প্যারামিটার আবশ্যক।' }, { status: 400 });
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

    // 2. Fetch Orders for Tenant
    const ordersQuery = await payload.find({
      collection: 'orders',
      where: { tenant: { equals: tenant.id } },
      limit: 500,
      overrideAccess: true,
    });

    const orders = ordersQuery.docs || [];

    // 3. Date Range Filtering
    const now = new Date();
    let startDate = new Date();
    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      // Default 30d
      startDate.setDate(now.getDate() - 30);
    }

    const filteredOrders = orders.filter((ord: any) => {
      const createdAt = new Date(ord.createdAt || ord.date || Date.now());
      return createdAt >= startDate;
    });

    // 4. Key Metrics Calculations
    let totalGMV = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    const paymentBreakdown = {
      COD: 0,
      bKash: 0,
      Nagad: 0,
      Card: 0,
    };

    const statusCounts: Record<string, number> = {
      pending: 0,
      processing: 0,
      'on-hold': 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0,
    };

    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};

    filteredOrders.forEach((ord: any) => {
      const amount = Number(ord.total || ord.amount || ord.grandTotal || 0);
      totalGMV += amount;

      const status = ord.status || 'pending';
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }

      if (status === 'completed') completedOrders += 1;
      if (status === 'cancelled') cancelledOrders += 1;

      // Payment Breakdown
      const pm = (ord.paymentMethod || 'COD') as keyof typeof paymentBreakdown;
      if (paymentBreakdown[pm] !== undefined) {
        paymentBreakdown[pm] += amount;
      } else {
        paymentBreakdown.COD += amount;
      }

      // Items Best Seller Aggregation
      if (Array.isArray(ord.items)) {
        ord.items.forEach((item: any) => {
          const pName = item.name || 'Unknown Product';
          const pQty = Number(item.quantity || 1);
          const pPrice = Number(item.price || 0);

          if (!productSalesMap[pName]) {
            productSalesMap[pName] = { name: pName, qty: 0, revenue: 0 };
          }
          productSalesMap[pName].qty += pQty;
          productSalesMap[pName].revenue += pQty * pPrice;
        });
      }
    });

    const totalOrdersCount = filteredOrders.length;
    const aov = totalOrdersCount > 0 ? Math.round(totalGMV / totalOrdersCount) : 0;
    const deliverySuccessRate =
      totalOrdersCount > 0 ? Math.round((completedOrders / totalOrdersCount) * 100) : 0;

    // Top 5 Products
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      range,
      metrics: {
        totalGMV,
        totalOrdersCount,
        aov,
        completedOrders,
        cancelledOrders,
        deliverySuccessRate,
      },
      statusCounts,
      paymentBreakdown,
      topProducts,
    });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'অ্যানালিটিক্স ডাটা প্রসেস করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}