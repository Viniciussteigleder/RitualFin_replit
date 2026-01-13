import { z } from 'zod';

/**
 * Environment Variable Validation
 *
 * Validates required environment variables at application startup.
 * Fails fast with clear error messages if configuration is invalid.
 *
 * Usage: Import this file in app/layout.tsx or middleware.ts
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'DATABASE_URL must be a PostgreSQL connection string')
    .describe('Neon PostgreSQL connection string'),

  // Authentication
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters for security')
    .describe('Auth.js secret key'),

  AUTH_GOOGLE_ID: z
    .string()
    .min(1, 'AUTH_GOOGLE_ID is required for Google OAuth')
    .describe('Google OAuth Client ID'),

  AUTH_GOOGLE_SECRET: z
    .string()
    .min(1, 'AUTH_GOOGLE_SECRET is required for Google OAuth')
    .describe('Google OAuth Client Secret'),

  // Optional - Auto-set by Vercel or Next.js
  AUTH_URL: z
    .string()
    .url()
    .optional()
    .describe('Canonical application URL'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('Node environment'),

  // Optional - Feature flags
  ANALYZE: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .describe('Enable bundle analyzer'),

  // Optional - AI
  OPENAI_API_KEY: z
    .string()
    .optional()
    .describe('OpenAI API key for AI features'),
});

export type Env = z.infer<typeof envSchema>;

// Check if we're in build phase (env vars might not be available)
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Validated environment variables
 *
 * During build phase, returns partial env to prevent build failures.
 * At runtime, throws if required env vars are missing.
 */
export const env: Env = (() => {
  // During build, use defaults to prevent failure
  if (isBuildPhase) {
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder',
      AUTH_SECRET: process.env.AUTH_SECRET || 'placeholder-secret-for-build-phase-only-32chars',
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || 'placeholder',
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || 'placeholder',
      AUTH_URL: process.env.AUTH_URL,
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      ANALYZE: process.env.ANALYZE === 'true',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    } as Env;
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:\n');

      error.issues.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });

      console.error('\n📋 Required environment variables:');
      console.error('  - DATABASE_URL (PostgreSQL connection string)');
      console.error('  - AUTH_SECRET (min 32 characters)');
      console.error('  - AUTH_GOOGLE_ID');
      console.error('  - AUTH_GOOGLE_SECRET');
      console.error('\n💡 See .env.example for reference');

      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
})();

/**
 * Redacted environment for logging
 * Safe to log without exposing secrets
 */
export const redactedEnv = {
  DATABASE_URL: env.DATABASE_URL ? `postgresql://***@${new URL(env.DATABASE_URL).host}/***` : undefined,
  AUTH_SECRET: env.AUTH_SECRET ? '***' + env.AUTH_SECRET.slice(-4) : undefined,
  AUTH_GOOGLE_ID: env.AUTH_GOOGLE_ID ? env.AUTH_GOOGLE_ID.slice(0, 10) + '***' : undefined,
  AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET ? '***' : undefined,
  AUTH_URL: env.AUTH_URL,
  NODE_ENV: env.NODE_ENV,
};

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';
