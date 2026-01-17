#!/usr/bin/env npx tsx
/**
 * Performance Regression Gate Script
 *
 * This script verifies that the application meets defined performance budgets.
 * Run this before merging PRs to prevent performance regressions.
 *
 * Usage:
 *   npx tsx scripts/perf-check.ts
 *   npm run perf-check (if added to package.json)
 *
 * Exit codes:
 *   0 - All checks pass
 *   1 - Performance budget exceeded
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

// Performance budgets (in bytes unless noted)
const BUDGETS = {
  // Total client JS budget
  totalClientJS: 3 * 1024 * 1024, // 3MB uncompressed

  // Largest single chunk budget
  largestChunk: 500 * 1024, // 500KB

  // Total build output budget
  totalBuildSize: 50 * 1024 * 1024, // 50MB

  // Number of client chunks
  maxClientChunks: 100,

  // Build time budget (seconds)
  maxBuildTime: 60,
};

interface CheckResult {
  name: string;
  actual: number;
  budget: number;
  unit: string;
  passed: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDirSize(dir: string): number {
  let size = 0;
  if (!existsSync(dir)) return 0;

  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      size += getDirSize(filePath);
    } else {
      size += stat.size;
    }
  }
  return size;
}

function getJSFilesInDir(dir: string, pattern: RegExp = /\.js$/): { path: string; size: number }[] {
  const results: { path: string; size: number }[] = [];
  if (!existsSync(dir)) return results;

  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...getJSFilesInDir(filePath, pattern));
    } else if (pattern.test(file)) {
      results.push({ path: filePath, size: stat.size });
    }
  }
  return results;
}

async function runChecks(): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const nextDir = join(process.cwd(), '.next');

  // Check if .next exists (build required)
  if (!existsSync(nextDir)) {
    console.log('⚠️  No .next folder found. Running build first...\n');
    try {
      const startTime = Date.now();
      execSync('npm run build', { stdio: 'inherit' });
      const buildTime = (Date.now() - startTime) / 1000;

      results.push({
        name: 'Build Time',
        actual: buildTime,
        budget: BUDGETS.maxBuildTime,
        unit: 's',
        passed: buildTime <= BUDGETS.maxBuildTime,
      });
    } catch {
      console.error('❌ Build failed');
      process.exit(1);
    }
  }

  // Check 1: Total build size
  const totalBuildSize = getDirSize(nextDir);
  results.push({
    name: 'Total Build Size',
    actual: totalBuildSize,
    budget: BUDGETS.totalBuildSize,
    unit: 'bytes',
    passed: totalBuildSize <= BUDGETS.totalBuildSize,
  });

  // Check 2: Total client JS
  const clientChunksDir = join(nextDir, 'static', 'chunks');
  const clientJSFiles = getJSFilesInDir(clientChunksDir);
  const totalClientJS = clientJSFiles.reduce((sum, f) => sum + f.size, 0);
  results.push({
    name: 'Total Client JS',
    actual: totalClientJS,
    budget: BUDGETS.totalClientJS,
    unit: 'bytes',
    passed: totalClientJS <= BUDGETS.totalClientJS,
  });

  // Check 3: Largest single chunk
  const largestChunk = clientJSFiles.reduce((max, f) => Math.max(max, f.size), 0);
  results.push({
    name: 'Largest Client Chunk',
    actual: largestChunk,
    budget: BUDGETS.largestChunk,
    unit: 'bytes',
    passed: largestChunk <= BUDGETS.largestChunk,
  });

  // Check 4: Number of client chunks
  results.push({
    name: 'Client Chunk Count',
    actual: clientJSFiles.length,
    budget: BUDGETS.maxClientChunks,
    unit: 'chunks',
    passed: clientJSFiles.length <= BUDGETS.maxClientChunks,
  });

  return results;
}

function printResults(results: CheckResult[]): void {
  console.log('\n📊 Performance Check Results\n');
  console.log('─'.repeat(60));

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const actualFormatted = result.unit === 'bytes'
      ? formatBytes(result.actual)
      : `${result.actual.toFixed(1)} ${result.unit}`;
    const budgetFormatted = result.unit === 'bytes'
      ? formatBytes(result.budget)
      : `${result.budget} ${result.unit}`;

    console.log(`${status} ${result.name}`);
    console.log(`   Actual: ${actualFormatted} | Budget: ${budgetFormatted}`);
    console.log('');
  }

  console.log('─'.repeat(60));
}

function printLargestChunks(count: number = 10): void {
  const clientChunksDir = join(process.cwd(), '.next', 'static', 'chunks');
  const files = getJSFilesInDir(clientChunksDir)
    .sort((a, b) => b.size - a.size)
    .slice(0, count);

  console.log(`\n📦 Top ${count} Largest Client Chunks:\n`);
  for (const file of files) {
    const name = file.path.split('/').pop() || file.path;
    console.log(`   ${formatBytes(file.size).padStart(10)} │ ${name}`);
  }
  console.log('');
}

async function main(): Promise<void> {
  console.log('🔍 Running Performance Checks...\n');

  const results = await runChecks();
  printResults(results);
  printLargestChunks(10);

  const failed = results.filter(r => !r.passed);

  if (failed.length > 0) {
    console.log('❌ Performance budget exceeded for:');
    for (const f of failed) {
      console.log(`   - ${f.name}`);
    }
    console.log('\nPlease optimize before merging.\n');
    process.exit(1);
  } else {
    console.log('✅ All performance checks passed!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error running perf check:', err);
  process.exit(1);
});
