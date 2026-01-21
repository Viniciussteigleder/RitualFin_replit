import NextAuth from "next-auth";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { apiRateLimiter, authRateLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);
const authOnly = auth(((_req: any, _event: any) => NextResponse.next()) as any) as unknown as (
  request: NextRequest,
  event: NextFetchEvent
) => ReturnType<typeof NextResponse.next>;

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    const ip = getClientIp(request);
    const result = await checkRateLimit(authRateLimiter, ip);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Please try again later",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.reset).toISOString(),
            "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", result.limit.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(result.reset).toISOString());
    return response;
  }

  if (pathname.startsWith("/api/admin")) {
    const ip = getClientIp(request);
    const result = await checkRateLimit(apiRateLimiter, ip);

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Please slow down",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": new Date(result.reset).toISOString(),
          },
        }
      );
    }

    return NextResponse.next();
  }

  return authOnly(request as any, event);
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: [
    "/api/auth/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};
