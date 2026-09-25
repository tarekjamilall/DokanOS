import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';

  // 1. Root domain definition
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

  // 2. Ignore internal system routes, admin panel, api, and static assets
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 3. Extract current host/subdomain
  let currentHost = hostname;
  if (hostname.includes(rootDomain)) {
    currentHost = hostname.replace(`.${rootDomain}`, '').replace(`:${url.port}`, '');
  } else {
    currentHost = hostname.replace(`:${url.port}`, '');
  }

  // 4. If visiting main root domain (e.g. localhost:3000 or 127.0.0.1)
  if (
    currentHost === rootDomain ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1'
  ) {
    return NextResponse.next();
  }

  // 5. If visiting a Merchant Subdomain (e.g. miyakofashion.localhost:3000)
  // Rewrite directly to dynamic route `/[domain]/...`
  return NextResponse.rewrite(
    new URL(`/${currentHost}${url.pathname}`, request.url)
  );
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
