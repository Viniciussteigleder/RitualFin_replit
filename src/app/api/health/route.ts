import { NextResponse } from "next/server";

// Build metadata injected at build time via environment variables
const BUILD_METADATA = {
  commitSha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "local",
  commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || "unknown",
  branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || "unknown",
  buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  nodeVersion: process.version,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
};

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    build: {
      sha: BUILD_METADATA.commitSha.slice(0, 7),
      shaFull: BUILD_METADATA.commitSha,
      branch: BUILD_METADATA.branch,
      env: BUILD_METADATA.environment,
      node: BUILD_METADATA.nodeVersion,
    },
  });
}

export const runtime = "nodejs";
