// src/lib/tenant/checkLimits.ts
import { Payload } from 'payload';

export type LimitCheckResult = {
  allowed: boolean;
  message?: string;
  currentCount: number;
  maxLimit: number;
};

/**
 * টেন্যান্টের সাবস্ক্রিপশন প্ল্যান অনুযায়ী প্রোডাক্ট লিমিট পার হয়েছে কিনা তা যাচাই করার হেলপার
 */
export async function checkTenantProductLimit(
  payload: Payload,
  tenantId: string
): Promise<LimitCheckResult> {
  try {
    // ১. টেন্যান্ট ডাটা ফেচ করা
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
      overrideAccess: true,
    });

    if (!tenant) {
      return { allowed: false, message: 'টেন্যান্ট স্টোর খুঁজে পাওয়া যায়নি!', currentCount: 0, maxLimit: 0 };
    }

    // ২. প্ল্যান অনুযায়ী সর্বোচ্চ এলাউড প্রোডাক্ট সংখ্যা (ডিফল্ট Starter: 50)
    const maxLimit = tenant.subscriptionPlan?.maxProducts ?? 50;

    // ৩. বর্তমানে উক্ত টেন্যান্টের কতটি প্রোডাক্ট আছে তা কাউন্ট করা
    const existingProducts = await payload.count({
      collection: 'products',
      where: {
        tenant: { equals: tenantId },
      },
      overrideAccess: true,
    });

    const currentCount = existingProducts.totalDocs;

    if (currentCount >= maxLimit) {
      return {
        allowed: false,
        message: `⚠️ আপনার সাবস্ক্রিপশন প্ল্যানের প্রোডাক্ট লিমিট (${maxLimit}টি) পূর্ণ হয়ে গেছে! নতুন প্রোডাক্ট যুক্ত করতে অনুগ্রহ করে প্যাকেজ আপগ্রেড করুন।`,
        currentCount,
        maxLimit,
      };
    }

    return { allowed: true, currentCount, maxLimit };
  } catch (error: any) {
    console.error('Error checking tenant product limit:', error);
    // এরর হলে সেফটির জন্য এলাউ রাখা
    return { allowed: true, currentCount: 0, maxLimit: 999 };
  }
}
