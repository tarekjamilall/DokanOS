// src/lib/cache/revalidate.ts
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * মার্চেন্ট ডাটা আপডেট হলে কাস্টমার স্টোরফ্রন্ট ক্যাশ ক্লিয়ার করার হেলপার
 */
export async function revalidateTenantStorefront(domain: string) {
  try {
    // ১. নির্দিষ্ট টেন্যান্ট ডোমেইনের রাউট ক্যাশ ক্লিয়ার
    revalidatePath(`/${domain}`, 'layout');
    revalidatePath(`/${domain}/shop`, 'page');
    
    // ২. নেক্সট জেএস ডাটা টেগ ক্লিয়ার
    revalidateTag(`tenant-${domain}`);
    
    console.log(`[Cache Revalidated] Successfully cleared cache for domain: ${domain}`);
  } catch (error) {
    console.error(`[Cache Revalidation Error] Failed for domain: ${domain}`, error);
  }
}
