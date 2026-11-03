import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// ✏️ 1. PATCH: কুইক এডিট (টাইটেল, দাম, স্টক আপডেট)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, title, price, regularPrice, salePrice, sku, stockQuantity, stockStatus } = body;

    const payload = await getPayload({ config: configPromise });

    const updateData: any = {};
    if (name || title) updateData.title = name || title;
    if (price !== undefined) updateData.price = Number(price);
    if (regularPrice !== undefined) updateData.regularPrice = Number(regularPrice);
    if (salePrice !== undefined) updateData.salePrice = Number(salePrice);
    if (sku !== undefined) updateData.sku = sku;

    if (stockQuantity !== undefined || stockStatus !== undefined) {
      updateData.inventory = {
        manageStock: true,
        stockQuantity: Number(stockQuantity) || 0,
        stockStatus: stockStatus === 'instock' || stockStatus === 'in_stock' ? 'in_stock' : 'out_of_stock',
      };
    }

    const updatedProduct = await payload.update({
      collection: 'products',
      id,
      data: updateData,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'প্রোডাক্ট সফলভাবে আপডেট করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Product Quick Edit Error:', error);
    return NextResponse.json({ error: 'প্রোডাক্ট আপডেট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// 🗑️ 2. DELETE: প্রোডাক্ট স্থায়ীভাবে ডিলিট করা
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config: configPromise });

    await payload.delete({
      collection: 'products',
      id,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      message: 'প্রোডাক্টটি সফলভাবে মুছে ফেলা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Product Delete Error:', error);
    return NextResponse.json({ error: 'প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}