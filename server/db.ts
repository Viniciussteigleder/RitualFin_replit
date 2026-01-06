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
 * Detect DB provider from hostname
 */
function getDbProvider(host: string): "render" | "supabase" | "neon" | "local" | "postgres" {
  if (host.includes("render.com")) return "render";
  if (host.includes("supabase.com") || host.includes("supabase.co")) return "supabase";
  if (host.includes("neon.tech")) return "neon";
  if (host.includes("localhost") || host.includes("127.0.0.1")) return "local";
  return "postgres";
}

/**
 * Create PostgreSQL connection pool with optimized settings
 */
function createPool(): pg.Pool | null {
  if (!isDatabaseConfigured) {
    return null;
  }

  try {
    const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL!);
    const provider = getDbProvider(dbConfig.host);
    const bootstrapRan = process.env.BOOTSTRAP_IPV4_RESOLVED === "true";
    const isIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(dbConfig.host);

    console.log(`[DB] Selected provider: ${provider}`);

    if (bootstrapRan && isIPv4) {
      console.log(`[DB] ✓ Bootstrap resolved hostname to IPv4: ${dbConfig.host}`);
    } else if (isIPv4) {
      console.log(`[DB] ✓ DATABASE_URL already uses IPv4 address: ${dbConfig.host}`);
    } else if (process.env.NODE_ENV === "production" && provider === "render") {
      console.warn(`[DB] ⚠️ WARNING: Not using IPv4 yet. On Render, consider using 'npm start' to trigger IPv4 resolution.`);
    }

    // SSL defaults
    let sslConfig: pg.PoolConfig["ssl"] = undefined;
    if (dbConfig.ssl) {
      // For Render and Supabase, we typically need to allow unauthorized certs when connecting via IPv4
      // or using the external connection strings.
      sslConfig = { rejectUnauthorized: false };
    }

    const poolConfig: pg.PoolConfig = {
      user: dbConfig.user,
      password: dbConfig.password,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      ssl: sslConfig,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    };

    console.log(`[DB] Connecting to ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (SSL: ${!!sslConfig})`);

    return new Pool(poolConfig);
  } catch (error: any) {
    console.error(`[DB] ✗ CRITICAL: Failed to create database pool: ${error.message}`);
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
