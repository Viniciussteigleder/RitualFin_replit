import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Check DATABASE_URL is set (required for production)
// Export flag for graceful degradation in health checks
export const isDatabaseConfigured = !!process.env.DATABASE_URL;

if (!isDatabaseConfigured) {
  console.warn(
    "⚠️  DATABASE_URL not set. Database operations will fail. This is only acceptable for build/smoke tests.",
  );
}

// Create pool and drizzle instance (will fail on actual DB operations if URL is missing)
export const pool = isDatabaseConfigured
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // Force IPv4 to avoid ENETUNREACH errors on Render
      // Render's network doesn't support IPv6 egress
      family: 4,
      // SSL configuration for Supabase
      ssl: {
        rejectUnauthorized: true
      },
      // Connection pool settings for reliability
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection cannot be established
      // Retry configuration
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null as any;
