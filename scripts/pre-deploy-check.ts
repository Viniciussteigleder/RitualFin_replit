#!/usr/bin/env npx tsx

/**
 * Pre-Deployment Check Script
 * 
 * Runs comprehensive checks before deployment to ensure:
 * - Code quality (TypeScript, linting)
 * - Build success
 * - Test coverage
 * - Database parity (if accessible)
 * 
 * Usage: npx tsx scripts/pre-deploy-check.ts
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: Critical checks failed
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface Check {
  name: string;
  command: string;
  critical: boolean;
  description: string;
}

const checks: Check[] = [
  {
    name: 'TypeScript Compilation',
    command: 'npm run check',
    critical: true,
    description: 'Ensures no TypeScript errors',
  },
  {
    name: 'Production Build',
    command: 'npm run build',
    critical: true,
    description: 'Verifies Next.js build succeeds',
  },
  {
    name: 'Rules Engine Unit Tests',
    command: 'npx tsx tests/unit/rules-engine.test.ts',
    critical: true,
    description: 'Validates core business logic',
  },
  {
    name: 'Database Parity Check',
    command: 'npx tsx scripts/verify-db-parity.ts',
    critical: false,
    description: 'Compares DB with Excel Oracle (requires network)',
  },
];

interface CheckResult {
  name: string;
  passed: boolean;
  critical: boolean;
  output?: string;
  error?: string;
  duration: number;
}

function runCheck(check: Check): CheckResult {
  const startTime = Date.now();
  
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Running: ${check.name}`);
    console.log(`   ${check.description}`);
    console.log(`${'='.repeat(60)}\n`);

    const output = execSync(check.command, {
      stdio: 'inherit',
      encoding: 'utf-8',
    });

    const duration = Date.now() - startTime;

    console.log(`\n✅ ${check.name} PASSED (${duration}ms)\n`);

    return {
      name: check.name,
      passed: true,
      critical: check.critical,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    console.error(`\n❌ ${check.name} FAILED (${duration}ms)\n`);

    return {
      name: check.name,
      passed: false,
      critical: check.critical,
      error: error.message,
      duration,
    };
  }
}

function generateReport(results: CheckResult[]): void {
  console.log('\n\n');
  console.log('='.repeat(60));
  console.log('📊 PRE-DEPLOYMENT CHECK REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  const passed = results.filter((r) => r.passed);
  const failed = results.filter((r) => !r.passed);
  const criticalFailed = failed.filter((r) => r.critical);

  console.log('Summary:');
  console.log(`  Total Checks: ${results.length}`);
  console.log(`  ✅ Passed: ${passed.length}`);
  console.log(`  ❌ Failed: ${failed.length}`);
  console.log(`  🚨 Critical Failed: ${criticalFailed.length}`);
  console.log('');

  if (failed.length > 0) {
    console.log('Failed Checks:');
    failed.forEach((result) => {
      const icon = result.critical ? '🚨' : '⚠️';
      console.log(`  ${icon} ${result.name} ${result.critical ? '(CRITICAL)' : '(WARNING)'}`);
    });
    console.log('');
  }

  console.log('Detailed Results:');
  console.log('');
  console.log('| Check | Status | Duration | Critical |');
  console.log('|-------|--------|----------|----------|');
  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const critical = result.critical ? 'Yes' : 'No';
    console.log(`| ${result.name} | ${status} | ${result.duration}ms | ${critical} |`);
  });
  console.log('');

  // Verdict
  if (criticalFailed.length > 0) {
    console.log('='.repeat(60));
    console.log('🚨 VERDICT: DO NOT DEPLOY');
    console.log('='.repeat(60));
    console.log('');
    console.log('Critical checks failed. Fix the following before deploying:');
    criticalFailed.forEach((result) => {
      console.log(`  • ${result.name}`);
    });
    console.log('');
  } else if (failed.length > 0) {
    console.log('='.repeat(60));
    console.log('⚠️  VERDICT: PROCEED WITH CAUTION');
    console.log('='.repeat(60));
    console.log('');
    console.log('Non-critical checks failed. Review before deploying:');
    failed.forEach((result) => {
      console.log(`  • ${result.name}`);
    });
    console.log('');
  } else {
    console.log('='.repeat(60));
    console.log('✅ VERDICT: SAFE TO DEPLOY');
    console.log('='.repeat(60));
    console.log('');
    console.log('All checks passed. Deployment is approved.');
    console.log('');
  }

  // Save report
  const reportPath = path.join(process.cwd(), 'docs', 'pre-deploy-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    verdict: criticalFailed.length > 0 ? 'FAIL' : failed.length > 0 ? 'WARNING' : 'PASS',
    summary: {
      total: results.length,
      passed: passed.length,
      failed: failed.length,
      criticalFailed: criticalFailed.length,
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log('');
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║           PRE-DEPLOYMENT CHECK SUITE                       ║');
  console.log('║           RitualFin Next.js Application                    ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const results: CheckResult[] = [];

  for (const check of checks) {
    const result = runCheck(check);
    results.push(result);

    // Stop on critical failure (optional - can be removed to run all checks)
    // if (!result.passed && result.critical) {
    //   console.error('\n🚨 Critical check failed. Stopping further checks.\n');
    //   break;
    // }
  }

  generateReport(results);

  // Exit with appropriate code
  const criticalFailed = results.filter((r) => !r.passed && r.critical);
  process.exit(criticalFailed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('❌ Pre-deployment check script failed:', error);
  process.exit(1);
});
