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

/**
 * Parse DATABASE_URL and extract components
 * Format: postgresql://user:password@host:port/database?params
 */
function parseDatabaseUrl(url: string): {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  ssl: boolean;
} {
  const parsed = new URL(url);
  return {
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: parseInt(parsed.port || "5432", 10),
    database: parsed.pathname.slice(1), // Remove leading /
    ssl: parsed.searchParams.get("sslmode") === "require" || parsed.searchParams.get("ssl") === "true"
  };
}

/**
 * Create PostgreSQL connection pool with IPv4 enforcement
 * Uses explicit host/port/user/password to bypass connectionString DNS behavior
 *
 * CRITICAL: This function assumes bootstrap.cjs has already resolved the hostname to IPv4
 * and updated DATABASE_URL. If bootstrap didn't run, connections may fail with ENETUNREACH.
 */
function createPool(): pg.Pool | null {
  if (!isDatabaseConfigured) {
    return null;
  }

  try {
    const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL!);

    // Check if bootstrap already resolved to IPv4
    const bootstrapRan = process.env.BOOTSTRAP_IPV4_RESOLVED === "true";
    const isIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(dbConfig.host);

    if (bootstrapRan && isIPv4) {
      console.log(`[DB] ✓ Bootstrap resolved hostname to IPv4: ${dbConfig.host}`);
    } else if (isIPv4) {
      console.log(`[DB] ✓ DATABASE_URL already uses IPv4 address: ${dbConfig.host}`);
    } else {
      console.warn(`[DB] ⚠️  WARNING: Bootstrap did NOT run or failed - using hostname: ${dbConfig.host}`);
      console.warn(`[DB] ⚠️  Connection may fail with ENETUNREACH on Render (IPv6 not supported)`);
      console.warn(`[DB] ⚠️  Ensure Render Start Command is: npm start (not node dist/index.cjs)`);
    }

    // Create pool with explicit configuration
    // This bypasses pg's internal DNS resolution which might prefer IPv6
    const poolConfig: pg.PoolConfig = {
      user: dbConfig.user,
      password: dbConfig.password,
      host: dbConfig.host, // IPv4 address (if bootstrap ran) or hostname (fallback)
      port: dbConfig.port,
      database: dbConfig.database,
      // SSL configuration for Supabase
      // Use rejectUnauthorized: false for two reasons:
      // 1. When connecting to an IPv4 address, the cert is issued for the hostname
      // 2. Supabase uses valid certs but rejectUnauthorized can be too strict
      ssl: dbConfig.ssl ? {
        rejectUnauthorized: false
      } : undefined,
      // Connection pool settings
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    };

    console.log(`[DB] Creating pool: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    console.log(`[DB] SSL enabled: ${!!poolConfig.ssl}`);

    return new Pool(poolConfig);
  } catch (error: any) {
    console.error(`[DB] ✗ CRITICAL: Failed to create database pool: ${error.message}`);
    console.error(`[DB] ✗ Database will be unavailable`);
    return null;
  }
}

// Initialize pool synchronously
// Note: If bootstrap.cjs ran first, DATABASE_URL will contain IPv4 address
// If bootstrap didn't run, this will use the hostname and may fail on Render
export const pool = createPool();

export const db = pool ? drizzle(pool, { schema }) : null as any;

if (pool) {
  console.log(`[DB] ✓ PostgreSQL pool initialized successfully`);
} else if (isDatabaseConfigured) {
  console.error(`[DB] ✗ PostgreSQL pool initialization FAILED despite DATABASE_URL being set`);
}
