
import { NextResponse } from "next/server";

export async function GET() {
  const debugInfo = {
    AUTH_URL: process.env.AUTH_URL || "NOT_SET",
    AUTH_SECRET: process.env.AUTH_SECRET ? "PRESENT (length: " + process.env.AUTH_SECRET.length + ")" : "MISSING",
    GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? "PRESENT" : "MISSING",
    GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? "PRESENT" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || "local",
  };

  return NextResponse.json(debugInfo);
}
