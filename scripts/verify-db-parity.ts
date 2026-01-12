/**
 * Database Parity Verification Script
 *
 * Compares Excel Oracle data against the database to identify:
 * - Missing records (Excel -> DB)
 * - Extra records (DB -> Excel)
 * - Field mismatches
 *
 * Usage: DATABASE_URL=... npx tsx scripts/verify-db-parity.ts
 */

import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import {
  taxonomyLevel1,
  taxonomyLevel2,
  taxonomyLeaf,
  rules,
  aliasAssets,
} from '../src/lib/db/schema';
import { sql } from 'drizzle-orm';

const ORACLE_DIR = 'rules/oracle';

interface OracleCategory {
  app_category: string;
  level1_pt: string;
  level2_pt: string;
  level3_pt: string;
  keywords: string[];
  keywords_negative: string[];
  type: 'Despesa' | 'Receita';
  fix_var: 'Fixo' | 'Variável';
  recurring: boolean;
}

interface OracleAlias {
  alias_desc: string;
  keywords: string[];
  icon_url: string;
}

interface ParityIssue {
  type: 'missing_in_db' | 'extra_in_db' | 'mismatch' | 'enum_mismatch';
  table: string;
  key: string;
  expected?: any;
  actual?: any;
  details?: string;
}

function loadOracle() {
  const categoriesPath = path.join(ORACLE_DIR, 'categories.json');
  const aliasesPath = path.join(ORACLE_DIR, 'aliases.json');
  const keywordRulesPath = path.join(ORACLE_DIR, 'keyword-rules.json');
  const aliasMappingPath = path.join(ORACLE_DIR, 'alias-mapping.json');

  return {
    categories: JSON.parse(fs.readFileSync(categoriesPath, 'utf-8')) as OracleCategory[],
    aliases: JSON.parse(fs.readFileSync(aliasesPath, 'utf-8')) as OracleAlias[],
    keywordRules: JSON.parse(fs.readFileSync(keywordRulesPath, 'utf-8')),
    aliasMapping: JSON.parse(fs.readFileSync(aliasMappingPath, 'utf-8')),
  };
}

async function verifyTaxonomy(oracle: { categories: OracleCategory[] }): Promise<ParityIssue[]> {
  const issues: ParityIssue[] = [];

  // Get unique Level 1 values from Oracle
  const oracleL1 = new Set(oracle.categories.map(c => c.level1_pt));

  // DB enum values (hardcoded as they're in schema)
  const dbEnumL1 = new Set([
    'ALIMENTACAO',
    'MERCADOS',
    'RENDA EXTRA',
    'OUTROS',
    'LAZER / ESPORTE',
    'COMPRAS',
    'FINANCIAMENTO',
    'INTERNO',
    'TRANSPORTE',
    'MORADIA',
    'SAUDE',
    'TRABALHO'
  ]);

  // Check for Level 1 categories in Oracle but not in DB enum
  for (const l1 of oracleL1) {
    // Normalize for comparison
    const normalized = l1.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const matchesEnum = Array.from(dbEnumL1).some(e =>
      e.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() === normalized ||
      e.includes(normalized) ||
      normalized.includes(e.replace(' / ', '/').replace('/', ''))
    );

    if (!matchesEnum) {
      issues.push({
        type: 'enum_mismatch',
        table: 'category1_enum',
        key: l1,
        expected: l1,
        actual: null,
        details: `Excel Level 1 "${l1}" has no matching value in DB category1 enum`
      });
    }
  }

  // Check taxonomy tables
  const dbL1 = await db.select().from(taxonomyLevel1);
  const dbL2 = await db.select().from(taxonomyLevel2);
  const dbLeaf = await db.select().from(taxonomyLeaf);

  console.log(`\nDB Taxonomy Status:`);
  console.log(`  Level 1: ${dbL1.length} records`);
  console.log(`  Level 2: ${dbL2.length} records`);
  console.log(`  Leaves: ${dbLeaf.length} records`);

  // Build set of DB Level 1 values (normalized)
  const dbL1Set = new Set(dbL1.map(r =>
    r.nivel1Pt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  ));

  // Check Oracle Level 1 against DB taxonomy_level_1
  for (const l1 of oracleL1) {
    if (!dbL1Set.has(l1)) {
      issues.push({
        type: 'missing_in_db',
        table: 'taxonomy_level_1',
        key: l1,
        expected: l1,
        details: `Excel Level 1 "${l1}" not found in taxonomy_level_1`
      });
    }
  }

  // Check for DB records not in Oracle
  for (const record of dbL1) {
    const normalized = record.nivel1Pt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    if (!oracleL1.has(normalized)) {
      issues.push({
        type: 'extra_in_db',
        table: 'taxonomy_level_1',
        key: record.nivel1Pt,
        actual: record.nivel1Pt,
        details: `DB Level 1 "${record.nivel1Pt}" not found in Excel Oracle`
      });
    }
  }

  return issues;
}

async function verifyRules(oracle: { keywordRules: any[] }): Promise<ParityIssue[]> {
  const issues: ParityIssue[] = [];

  // Get all rules from DB
  const dbRules = await db.select().from(rules);
  console.log(`\nDB Rules: ${dbRules.length} records`);

  // Build keyword sets
  const oracleKeywords = new Set(oracle.keywordRules.map((r: any) => r.keyword));
  const dbKeywords = new Set<string>();

  for (const rule of dbRules) {
    if (rule.keyWords) {
      const keywords = rule.keyWords.split(';').map((k: string) =>
        k.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
      );
      keywords.forEach((k: string) => dbKeywords.add(k));
    }
  }

  console.log(`Oracle Keywords: ${oracleKeywords.size}`);
  console.log(`DB Keywords: ${dbKeywords.size}`);

  // Check Oracle keywords against DB
  let missingCount = 0;
  for (const kw of oracleKeywords) {
    if (!dbKeywords.has(kw) && kw.length > 0) {
      missingCount++;
      if (missingCount <= 10) { // Only log first 10
        issues.push({
          type: 'missing_in_db',
          table: 'rules',
          key: kw,
          expected: kw,
          details: `Excel keyword "${kw}" not found in any DB rule`
        });
      }
    }
  }

  if (missingCount > 10) {
    issues.push({
      type: 'missing_in_db',
      table: 'rules',
      key: 'summary',
      details: `... and ${missingCount - 10} more missing keywords`
    });
  }

  return issues;
}

async function verifyAliases(oracle: { aliasMapping: any[] }): Promise<ParityIssue[]> {
  const issues: ParityIssue[] = [];

  // Get all aliases from DB
  const dbAliases = await db.select().from(aliasAssets);
  console.log(`\nDB Aliases: ${dbAliases.length} records`);

  // Build keyword sets
  const oracleAliasKeywords = new Set(oracle.aliasMapping.map((a: any) => a.keyword));
  const dbAliasKeywords = new Set<string>();

  for (const alias of dbAliases) {
    if (alias.keyWordsAlias) {
      const keywords = alias.keyWordsAlias.split(';').map((k: string) =>
        k.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
      );
      keywords.forEach((k: string) => dbAliasKeywords.add(k));
    }
  }

  console.log(`Oracle Alias Keywords: ${oracleAliasKeywords.size}`);
  console.log(`DB Alias Keywords: ${dbAliasKeywords.size}`);

  // Check Oracle aliases against DB
  let missingCount = 0;
  for (const kw of oracleAliasKeywords) {
    if (!dbAliasKeywords.has(kw) && kw.length > 0) {
      missingCount++;
      if (missingCount <= 10) {
        issues.push({
          type: 'missing_in_db',
          table: 'alias_assets',
          key: kw,
          expected: kw,
          details: `Excel alias keyword "${kw}" not found in DB`
        });
      }
    }
  }

  if (missingCount > 10) {
    issues.push({
      type: 'missing_in_db',
      table: 'alias_assets',
      key: 'summary',
      details: `... and ${missingCount - 10} more missing alias keywords`
    });
  }

  return issues;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Database Parity Verification');
  console.log('='.repeat(60));

  // Load Oracle data
  console.log('\nLoading Oracle data...');
  const oracle = loadOracle();
  console.log(`  Categories: ${oracle.categories.length}`);
  console.log(`  Aliases: ${oracle.aliases.length}`);
  console.log(`  Keyword Rules: ${oracle.keywordRules.length}`);
  console.log(`  Alias Mapping: ${oracle.aliasMapping.length}`);

  const allIssues: ParityIssue[] = [];

  // Verify taxonomy
  console.log('\n--- Verifying Taxonomy ---');
  const taxonomyIssues = await verifyTaxonomy(oracle);
  allIssues.push(...taxonomyIssues);

  // Verify rules
  console.log('\n--- Verifying Rules ---');
  const rulesIssues = await verifyRules(oracle);
  allIssues.push(...rulesIssues);

  // Verify aliases
  console.log('\n--- Verifying Aliases ---');
  const aliasIssues = await verifyAliases(oracle);
  allIssues.push(...aliasIssues);

  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('PARITY REPORT');
  console.log('='.repeat(60));

  const issuesByType = {
    missing_in_db: allIssues.filter(i => i.type === 'missing_in_db'),
    extra_in_db: allIssues.filter(i => i.type === 'extra_in_db'),
    mismatch: allIssues.filter(i => i.type === 'mismatch'),
    enum_mismatch: allIssues.filter(i => i.type === 'enum_mismatch'),
  };

  console.log(`\nSummary:`);
  console.log(`  Missing in DB: ${issuesByType.missing_in_db.length}`);
  console.log(`  Extra in DB: ${issuesByType.extra_in_db.length}`);
  console.log(`  Mismatches: ${issuesByType.mismatch.length}`);
  console.log(`  Enum Mismatches: ${issuesByType.enum_mismatch.length}`);

  const totalIssues = allIssues.length;
  const verdict = totalIssues === 0 ? 'PASS' : 'FAIL';

  console.log(`\nVerdict: ${verdict}`);
  console.log(`Total Issues: ${totalIssues}`);

  // Write report file
  const report = {
    timestamp: new Date().toISOString(),
    verdict,
    summary: {
      missing_in_db: issuesByType.missing_in_db.length,
      extra_in_db: issuesByType.extra_in_db.length,
      mismatch: issuesByType.mismatch.length,
      enum_mismatch: issuesByType.enum_mismatch.length,
      total: totalIssues,
    },
    issues: allIssues,
  };

  const reportPath = 'docs/rules-parity-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  // Generate markdown report
  const mdReport = generateMarkdownReport(report);
  fs.writeFileSync('docs/rules-parity-report.md', mdReport);
  console.log(`Markdown report: docs/rules-parity-report.md`);

  process.exit(verdict === 'PASS' ? 0 : 1);
}

function generateMarkdownReport(report: any): string {
  const lines: string[] = [
    '# Rules Parity Report',
    '',
    `**Generated**: ${report.timestamp}`,
    `**Verdict**: ${report.verdict}`,
    '',
    '## Summary',
    '',
    '| Issue Type | Count |',
    '|------------|-------|',
    `| Missing in DB | ${report.summary.missing_in_db} |`,
    `| Extra in DB | ${report.summary.extra_in_db} |`,
    `| Field Mismatches | ${report.summary.mismatch} |`,
    `| Enum Mismatches | ${report.summary.enum_mismatch} |`,
    `| **Total** | **${report.summary.total}** |`,
    '',
  ];

  if (report.issues.length > 0) {
    lines.push('## Issues');
    lines.push('');

    // Group by table
    const byTable = new Map<string, typeof report.issues>();
    for (const issue of report.issues) {
      const key = issue.table;
      if (!byTable.has(key)) byTable.set(key, []);
      byTable.get(key)!.push(issue);
    }

    for (const [table, issues] of byTable) {
      lines.push(`### ${table}`);
      lines.push('');
      lines.push('| Type | Key | Details |');
      lines.push('|------|-----|---------|');

      for (const issue of issues.slice(0, 20)) {
        lines.push(`| ${issue.type} | ${issue.key} | ${issue.details || '-'} |`);
      }

      if (issues.length > 20) {
        lines.push(`| ... | ... | ${issues.length - 20} more issues |`);
      }

      lines.push('');
    }
  }

  lines.push('## Resolution Steps');
  lines.push('');
  lines.push('1. Run `npx tsx scripts/parse-rules-xlsx.ts` to regenerate Oracle');
  lines.push('2. Run seed scripts to populate missing DB records');
  lines.push('3. Run this verification again until PASS');
  lines.push('');

  return lines.join('\n');
}

main().catch(console.error);
