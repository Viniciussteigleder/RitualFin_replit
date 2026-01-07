import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  let db_connectivity = "unknown";
  try {
    // simple pulse check
     await db.execute(sql`SELECT 1`);
     db_connectivity = "ok";
  } catch (e: any) {
     db_connectivity = `fail: ${e.message}`;
  }

  const envStatus = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_URL: !!process.env.AUTH_URL,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    DB_CONNECTIVITY: db_connectivity,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "not set",
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || "not set",
    NODE_ENV: process.env.NODE_ENV,
    resolved_url: process.env.AUTH_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "unknown"),
  };

  return NextResponse.json({
    status: "ok",
    diagnostics: envStatus,
    message: "This endpoint only reports presence of required env variables, not their values.",
    help: "If Google Auth fails with 'Configuration' error, ensure AUTH_TRUST_HOST=true and Redirection URIs match exactly."
  });
}

export const runtime = "nodejs";
