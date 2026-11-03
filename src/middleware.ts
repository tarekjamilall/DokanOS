import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';

  // ১. প্রজেক্টের রুট ডোমেইন
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // ২. সিস্টেমের অভ্যন্তরীণ রুট, এডমিন প্যানেল, এপিআই এবং স্ট্যাটিক এসেট বাইপাস
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ৩. `www.` বাদ দিয়ে ক্লিন হোস্টনাম বের করা
  let currentHost = hostname.replace(/^www\./, '');
  if (currentHost.includes(rootDomain)) {
    currentHost = currentHost.replace(`.${rootDomain}`, '').replace(`:${url.port}`, '');
  } else {
    currentHost = currentHost.replace(`:${url.port}`, '');
  }

  // ৪. যদি মূল প্ল্যাটফর্ম ডোমেইন বা লোকালহোস্টে ব্রাউজ করা হয়
  if (
    currentHost === rootDomain ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1'
  ) {
    return NextResponse.next();
  }

  // ৫. সাবডোমেইন বা কাস্টম ডোমেইনের ক্ষেত্রে ডাইনামিক রাউট `/[domain]/...`-এ রিরাইট
  return NextResponse.rewrite(
    new URL(`/${currentHost}${url.pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};