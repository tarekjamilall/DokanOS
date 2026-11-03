import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // কুকি রিমুভ করে ইম্পারসোনেশন সেশন বন্ধ করা
    cookieStore.delete('impersonation_token');

    return NextResponse.json({
      success: true,
      message: 'ইম্পারসোনেশন সেশন সমাপ্ত হয়েছে। সুপার এডমিন ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে।',
      redirectUrl: '/super-admin/dashboard',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'সেশন বন্ধ করতে সমস্যা হয়েছে।', error: error.message },
      { status: 500 }
    );
  }
}
