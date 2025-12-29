import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must be set. Did you forget to provision a database?");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Disable prepared statements for Supabase Transaction Pooler compatibility
  // PgBouncer in transaction mode doesn't support prepared statements
});
export const db = drizzle(pool, { schema });
