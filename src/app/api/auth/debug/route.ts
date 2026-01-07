import { NextResponse } from "next/server";

export async function GET() {
  const envStatus = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_URL: !!process.env.AUTH_URL,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
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
