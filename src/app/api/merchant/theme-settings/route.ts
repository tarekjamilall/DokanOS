import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

// 🔍 1. GET: টেন্যান্টের থিম ও ব্রান্ডিং সেটিংস লোড
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
      themeSettings: {
        brandLogo: tenant.brandLogo || '',
        favicon: tenant.favicon || '',
        primaryColor: tenant.primaryColor || '#8A1538',
        showAnnouncement: tenant.showAnnouncement ?? true,
        announcementText: tenant.announcementText || '🎉 ক্যাশ অন ডেলিভারি (COD) সুবিধা উপলব্ধ | সারা বাংলাদেশে দ্রুত ডেলিভারি',
        announcementBg: tenant.announcementBg || '#0f172a',
        announcementTextColor: tenant.announcementTextColor || '#ffffff',
        headerLinks: tenant.headerLinks || [
          { label: 'হোম', url: '/' },
          { label: 'সব প্রোডাক্ট', url: '/#products' },
          { label: 'আমাদের কথা', url: '/about-us' },
          { label: 'যোগাযোগ', url: '/contact-us' },
        ],
        helplinePhone: tenant.helplinePhone || tenant.whatsappNumber || '01700000000',
        stickyHeader: tenant.stickyHeader ?? true,
        footerAboutText: tenant.footerAboutText || 'আমরা প্রিমিয়াম মানের পণ্য এবং সেরা কাস্টমার সার্ভিস প্রদান করতে প্রতিশ্রুতিবদ্ধ।',
        supportPhone: tenant.supportPhone || '01700000000',
        supportEmail: tenant.supportEmail || 'support@example.com',
        address: tenant.address || 'ঢাকা, বাংলাদেশ',
        copyrightText: tenant.copyrightText || `© 2026 ${tenant.name || domain}. All Rights Reserved.`,
        facebookUrl: tenant.facebookUrl || '',
        instagramUrl: tenant.instagramUrl || '',
        youtubeUrl: tenant.youtubeUrl || '',
        showTrustBadges: tenant.showTrustBadges ?? true,
        customCss: tenant.customCss || '',
        customScripts: tenant.customScripts || '',
      },
    });
  } catch (error: any) {
    console.error('Theme Settings Fetch Error:', error);
    return NextResponse.json({ error: 'থিম সেটিংস লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ➕ 2. POST: থিম কাস্টমাইজেশন ডাটাবেসে সেভ ও পাবলিশ করা (Steps 193-196)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, themeSettings } = body;

    if (!domain || !themeSettings) {
      return NextResponse.json({ error: 'ডোমেইন ও থিম সেটিংস আবশ্যক।' }, { status: 400 });
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

    const updatedTenant = await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        brandLogo: themeSettings.brandLogo,
        favicon: themeSettings.favicon,
        primaryColor: themeSettings.primaryColor,
        showAnnouncement: themeSettings.showAnnouncement,
        announcementText: themeSettings.announcementText,
        announcementBg: themeSettings.announcementBg,
        announcementTextColor: themeSettings.announcementTextColor,
        headerLinks: themeSettings.headerLinks,
        helplinePhone: themeSettings.helplinePhone,
        stickyHeader: themeSettings.stickyHeader,
        footerAboutText: themeSettings.footerAboutText,
        supportPhone: themeSettings.supportPhone,
        supportEmail: themeSettings.supportEmail,
        address: themeSettings.address,
        copyrightText: themeSettings.copyrightText,
        facebookUrl: themeSettings.facebookUrl,
        instagramUrl: themeSettings.instagramUrl,
        youtubeUrl: themeSettings.youtubeUrl,
        showTrustBadges: themeSettings.showTrustBadges,
        customCss: themeSettings.customCss,
        customScripts: themeSettings.customScripts,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      message: '🎉 থিম কাস্টমাইজেশন সফলভাবে সেভ ও পাবলিশ হয়েছে!',
    });
  } catch (error: any) {
    console.error('Theme Settings Update Error:', error);
    return NextResponse.json(
      { error: error.message || 'থিম সেটিংস আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}