import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PromptShift Offline Maintenance Mode Middleware
 * 
 * Controls whether the public site is offline for scheduled maintenance.
 * Set `IS_MAINTENANCE_MODE = true` to put the site offline.
 * 
 * Whitelisted routes during maintenance:
 * - /bouboule (Secret administrative dashboard)
 * - /_next/* (Next.js assets and chunks)
 * - /assets/* (Static images and icons)
 * - /favicon.ico
 */
export const IS_MAINTENANCE_MODE = false;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Google Search Console Site Verification (serves both root and prefix /sitemap.xml/)
  if (
    pathname === '/google195fa2438b836f4f.html' ||
    pathname === '/sitemap.xml/google195fa2438b836f4f.html'
  ) {
    return new NextResponse('google-site-verification: google195fa2438b836f4f.html\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  if (!IS_MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  // 1. Whitelist static files and Next.js internal assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // 2. Allow access to the secret admin route: /bouboule
  if (pathname.startsWith('/bouboule')) {
    return NextResponse.next();
  }

  // 3. For API routes, return clean 503 JSON response
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      {
        error: 'Service Unavailable',
        code: 'MAINTENANCE_MODE_ACTIVE',
        message: 'PromptShift is temporarily offline for scheduled maintenance and engine updates.',
      },
      {
        status: 503,
        headers: {
          'Retry-After': '3600',
        },
      }
    );
  }

  // 4. For the maintenance page itself, let it render directly
  if (pathname === '/maintenance') {
    return NextResponse.next();
  }

  // 5. Rewrite any other page request to /maintenance with 503 status
  const maintenanceUrl = new URL('/maintenance', request.url);
  const response = NextResponse.rewrite(maintenanceUrl);
  response.headers.set('Retry-After', '3600');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
