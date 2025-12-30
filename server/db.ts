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
      // Disable prepared statements for Supabase Transaction Pooler compatibility
      // PgBouncer in transaction mode doesn't support prepared statements
    })
  : null;

export const db = pool ? drizzle(pool, { schema }) : null as any;
