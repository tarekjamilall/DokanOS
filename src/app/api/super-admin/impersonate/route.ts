import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export async function POST(request: Request) {
  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'টেন্যান্ট ডোমেইন আবশ্যক।' }, { status: 400 });
    }

    const payload = await getPayload({ config: configPromise });

    // 1. Find Tenant Store
    const tenantQuery = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: domain } },
      overrideAccess: true,
    });

    if (!tenantQuery.docs || tenantQuery.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant store not found' }, { status: 404 });
    }

    const tenant = tenantQuery.docs[0];

    // 2. Generate Impersonation Session Redirect
    const redirectUrl = `http://${domain}.localhost:3000/dashboard?impersonated=true`;

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      message: `🔑 ${tenant.name} স্টোরে ইম্পারসোনেটেড লগইন সফল হয়েছে!`,
    });

    // Set 1-hour Impersonation Session Cookie
    response.cookies.set('super_admin_impersonating', domain, {
      httpOnly: true,
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Impersonation Error:', error);
    return NextResponse.json(
      { error: 'ইম্পারসোনেটেড লগইন প্রসেস করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}