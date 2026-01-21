import { spawnSync } from "node:child_process";

const shouldMigrate =
  process.env.RUN_DB_MIGRATIONS === "1" ||
  process.env.RUN_DB_MIGRATIONS === "true" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL === "true";

if (!shouldMigrate) {
  console.log("[db] Skipping schema sync (not Vercel; set RUN_DB_MIGRATIONS=1 to force).");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.warn("[db] Skipping schema sync (DATABASE_URL not set).");
  process.exit(0);
}

// Use drizzle-kit push instead of migrate - push is idempotent and won't fail
// on existing types/tables. Per CLAUDE.md: "This project uses drizzle-kit push
// for schema updates, NOT traditional migrations."
console.log("[db] Running drizzle-kit push (schema sync)...");
const res = spawnSync("npx", ["drizzle-kit", "push", "--force"], {
  stdio: "inherit",
  env: process.env,
});

if (res.status !== 0) {
  process.exit(res.status ?? 1);
}

