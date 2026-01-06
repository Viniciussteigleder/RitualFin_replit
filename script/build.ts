import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp, writeFile } from "fs/promises";
import { execSync } from "node:child_process";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "bcryptjs",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-google-oauth20",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  const buildTime = new Date().toISOString();
  const gitSha =
    process.env.GIT_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.RENDER_GIT_COMMIT ||
    process.env.RENDER_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    (() => {
      try {
        return execSync("git rev-parse --short=12 HEAD").toString().trim();
      } catch {
        return "unknown";
      }
    })();

  console.log("building client...");
  await viteBuild();

  await writeFile(
    "dist/public/version.json",
    JSON.stringify({ gitSha, buildTime }, null, 2),
    "utf-8",
  );

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.GIT_SHA": JSON.stringify(gitSha),
      "process.env.BUILD_TIME": JSON.stringify(buildTime),
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  await cp("server/seed-data", "dist/seed-data", { recursive: true });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
