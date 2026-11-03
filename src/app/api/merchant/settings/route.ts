import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: টেন্যান্টের মার্কেটিং ট্র্যাকিং ও এপিআই সেটিংস লোড
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

    const tenant: any = tenantQuery.docs[0];

    return NextResponse.json({
      success: true,
      settings: {
        metaPixelId: tenant.metaPixelId || '',
        facebookCapiToken: tenant.facebookCapiToken || '',
        gtmContainerId: tenant.gtmContainerId || '',
        ga4MeasurementId: tenant.ga4MeasurementId || '',
        apiTokens: tenant.apiTokens || [],
      },
    });
  } catch (error: any) {
    console.error('Settings Fetch Error:', error);
    return NextResponse.json({ error: 'সেটিংস লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST: ট্র্যাকিং পিক্সেল ও এপিআই সেটিংস ডাটাবেসে সেভ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, settings, newApiToken } = body;

    if (!domain) {
      return NextResponse.json({ error: 'ডোমেইন আবশ্যক।' }, { status: 400 });
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

    const tenant: any = tenantQuery.docs[0];

    let updatedTokens = tenant.apiTokens || [];
    if (newApiToken) {
      updatedTokens = [newApiToken, ...updatedTokens];
    }

    const updateData: any = {};
    if (settings) {
      updateData.metaPixelId = settings.metaPixelId;
      updateData.facebookCapiToken = settings.facebookCapiToken;
      updateData.gtmContainerId = settings.gtmContainerId;
      updateData.ga4MeasurementId = settings.ga4MeasurementId;
    }
    if (newApiToken) {
      updateData.apiTokens = updatedTokens;
    }

    const updatedTenant = await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: updateData,
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: '🎉 সেটিংস ডাটাবেসে সফলভাবে সেভ হয়েছে!',
    });
  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json(
      { error: error.message || 'সেটিংস সেভ করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}