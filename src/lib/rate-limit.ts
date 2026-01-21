/**
 * Rate limiting utilities using Upstash Redis
 * Prevents brute force attacks on authentication endpoints
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiter for authentication endpoints
 * 5 requests per 10 seconds per IP
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

/**
 * Rate limiter for API endpoints
 * 20 requests per 10 seconds per IP
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '10 s'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null;

/**
 * Rate limiter for file uploads
 * 3 uploads per minute per user
 */
export const uploadRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 m'),
      analytics: true,
      prefix: 'ratelimit:upload',
    })
  : null;

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If no Redis configured, allow all requests (development)
  if (!limiter) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 10000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}
