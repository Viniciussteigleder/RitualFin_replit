/**
 * Middleware for rate limiting
 * Applied to authentication and sensitive routes
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authRateLimiter, apiRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to auth routes
  if (pathname.startsWith('/api/auth')) {
    const ip = getClientIp(request);
    const result = await checkRateLimit(authRateLimiter, ip);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
    return response;
  }

  // Apply rate limiting to admin API routes
  if (pathname.startsWith('/api/admin')) {
    const ip = getClientIp(request);
    const result = await checkRateLimit(apiRateLimiter, ip);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please slow down',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.reset).toISOString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/admin/:path*',
  ],
};
