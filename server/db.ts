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

// Create pool with DATABASE_URL
// Note: bootstrap.cjs pre-resolves the hostname to IPv4 before server starts
export const pool = isDatabaseConfigured
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      // SSL configuration for Supabase
      ssl: {
        rejectUnauthorized: true
      },
      // Connection pool settings for reliability
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null as any;
