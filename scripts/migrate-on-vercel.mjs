import { spawnSync } from "node:child_process";

const shouldMigrate =
  process.env.RUN_DB_MIGRATIONS === "1" ||
  process.env.RUN_DB_MIGRATIONS === "true" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

if (!shouldMigrate) {
  console.log("[db] Skipping migrations (not Vercel; set RUN_DB_MIGRATIONS=1 to force).");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.warn("[db] Skipping migrations (DATABASE_URL not set).");
  process.exit(0);
}

console.log("[db] Running drizzle migrations...");
const res = spawnSync("npx", ["drizzle-kit", "migrate"], {
  stdio: "inherit",
  env: process.env,
});

if (res.status !== 0) {
  process.exit(res.status ?? 1);
}

