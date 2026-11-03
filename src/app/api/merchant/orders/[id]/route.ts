import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// ✏️ PATCH: অর্ডার স্ট্যাটাস, মার্চেন্ট নোট এবং কুরিয়ার ট্র্যাকিং আপডেট
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Promise টাইপ
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, merchantNote, courierName, trackingCode, paymentStatus } = body;

    const payload = await getPayload({ config: configPromise });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (merchantNote !== undefined) updateData.merchantNote = merchantNote;
    if (courierName) updateData.courierName = courierName;
    if (trackingCode) updateData.trackingCode = trackingCode;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await payload.update({
      collection: 'orders',
      id,
      data: updateData,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: '🎉 অর্ডার স্ট্যাটাস ও নোট সফলভাবে আপডেট করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Order Update Error:', error);
    return NextResponse.json(
      { error: error.message || 'অর্ডার আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}