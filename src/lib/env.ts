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
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * 
 * @throws {z.ZodError} if validation fails
 */
export const env: Env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:\n');
      
      error.errors.forEach((err) => {
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
