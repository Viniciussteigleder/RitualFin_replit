/**
 * Rules Engine Unit Tests
 *
 * These tests freeze the expected behavior of the categorization logic.
 * Based on Logic Contract: docs/LOGIC_CONTRACT.md
 *
 * Run with: npx tsx tests/unit/rules-engine.test.ts
 */

import {
  matchRules,
  categorizeTransaction,
  type RuleMatch,
  type CategorizationResult,
  type UserSettings
} from '../../src/lib/rules/engine';

import {
  normalizeForMatch,
  splitKeyExpressions,
  findMatchedExpression,
  evaluateRuleMatch
} from '../../src/lib/rules/classification-utils';

import type { Rule } from '../../src/lib/db/schema';

// Test utilities
function createRule(overrides: Partial<Rule>): Rule {
  return {
    id: 'test-rule-' + Math.random().toString(36).slice(2),
    userId: 'test-user',
    type: 'Despesa',
    fixVar: 'Variável',
    category1: 'Outros',
    category2: null,
    category3: null,
    priority: 500,
    strict: false,
    isSystem: false,
    leafId: null,
    keyWords: null,
    keyWordsNegative: null,
    active: true,
    createdAt: new Date(),
    ...overrides
  } as Rule;
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`ASSERTION FAILED: ${message} - Expected: ${expected}, Got: ${actual}`);
  }
}

// ============================================================================
// TC-001: Same input → Same category (Determinism)
// ============================================================================
function test_TC001_determinism(): void {
  console.log('TC-001: Testing determinism...');

  const rules: Rule[] = [
    createRule({ keyWords: 'NETFLIX;HBO', category1: 'Lazer / Esporte', priority: 600 }),
    createRule({ keyWords: 'AMAZON', category1: 'Compras', priority: 500 }),
  ];

  const descNorm = 'NETFLIX MONTHLY SUBSCRIPTION';

  // Run multiple times
  const results = [
    matchRules(descNorm, rules),
    matchRules(descNorm, rules),
    matchRules(descNorm, rules),
  ];

  // All should be identical
  const firstResult = JSON.stringify(results[0]);
  for (let i = 1; i < results.length; i++) {
    assertEqual(JSON.stringify(results[i]), firstResult, `Run ${i+1} differs from first run`);
  }

  console.log('  ✓ TC-001 passed: Deterministic output');
}

// ============================================================================
// TC-002: Strict rule short-circuits
// ============================================================================
function test_TC002_strict_shortcircuit(): void {
  console.log('TC-002: Testing strict rule short-circuit...');

  const rules: Rule[] = [
    createRule({ keyWords: 'MONTHLY', category1: 'Lazer / Esporte', priority: 500, strict: false }),
    createRule({ keyWords: 'NETFLIX', category1: 'Interno', priority: 400, strict: true }), // Lower priority but strict
  ];

  const descNorm = 'NETFLIX MONTHLY';
  const result = matchRules(descNorm, rules);

  // Strict rule should win even with lower priority
  assertEqual(result.appliedRule?.category1, 'Interno', 'Strict rule should be applied');
  assertEqual(result.confidence, 100, 'Strict rule should have 100% confidence');
  assertEqual(result.needsReview, false, 'Strict rule should not need review');

  console.log('  ✓ TC-002 passed: Strict rule short-circuits correctly');
}

// ============================================================================
// TC-003: Higher priority wins
// ============================================================================
function test_TC003_priority_order(): void {
  console.log('TC-003: Testing priority order...');

  const rules: Rule[] = [
    createRule({ id: 'low-prio', keyWords: 'REWE', category1: 'Outros', priority: 400 }),
    createRule({ id: 'high-prio', keyWords: 'REWE', category1: 'Mercados', priority: 800 }),
    createRule({ id: 'med-prio', keyWords: 'REWE', category1: 'Compras', priority: 600 }),
  ];

  const descNorm = 'REWE SUPERMARKET';
  const result = matchRules(descNorm, rules);

  assertEqual(result.appliedRule?.ruleId, 'high-prio', 'Highest priority rule should be applied');
  assertEqual(result.appliedRule?.category1, 'Mercados', 'Category from highest priority');

  console.log('  ✓ TC-003 passed: Higher priority wins');
}

// ============================================================================
// TC-004: Negative keywords exclude
// ============================================================================
function test_TC004_negative_keywords(): void {
  console.log('TC-004: Testing negative keywords...');

  const ruleWithNegative = createRule({
    keyWords: 'AMAZON',
    keyWordsNegative: 'PRIME',
    category1: 'Compras',
    priority: 600
  });

  const ruleWithoutNegative = createRule({
    keyWords: 'AMAZON',
    category1: 'Lazer / Esporte',
    priority: 500
  });

  // Test with negative match - should skip first rule
  const resultWithNegative = evaluateRuleMatch('AMAZON PRIME VIDEO', ruleWithNegative);
  assertEqual(resultWithNegative.isMatch, false, 'Rule with matching negative should not match');

  // Test without negative match - should match
  const resultWithoutNegative = evaluateRuleMatch('AMAZON MARKETPLACE', ruleWithNegative);
  assertEqual(resultWithoutNegative.isMatch, true, 'Rule without matching negative should match');

  console.log('  ✓ TC-004 passed: Negative keywords exclude correctly');
}

// ============================================================================
// TC-005: Interno auto-flags
// ============================================================================
function test_TC005_interno_autoflags(): void {
  console.log('TC-005: Testing Interno auto-flagging...');

  const rules: Rule[] = [
    createRule({ keyWords: 'ZAHLUNG ERHALTEN', category1: 'Interno', priority: 1000, strict: true }),
  ];

  const descNorm = 'AMERICAN EXPRESS ZAHLUNG ERHALTEN';
  const result = categorizeTransaction(descNorm, rules);

  assertEqual(result.category1, 'Interno', 'Category should be Interno');
  assertEqual(result.internalTransfer, true, 'internalTransfer should be true');
  assertEqual(result.excludeFromBudget, true, 'excludeFromBudget should be true');

  console.log('  ✓ TC-005 passed: Interno auto-flags correctly');
}

// ============================================================================
// TC-006: Manual override preserved (implementation note - tested at commit level)
// ============================================================================
function test_TC006_manual_override(): void {
  console.log('TC-006: Manual override preservation...');
  console.log('  ⚠ Note: Full test requires database integration');
  console.log('  ✓ TC-006 skipped: Tested at integration level');
}

// ============================================================================
// TC-007: Conflict detection
// ============================================================================
function test_TC007_conflict_detection(): void {
  console.log('TC-007: Testing conflict detection...');

  const rules: Rule[] = [
    createRule({ id: 'rule-a', keyWords: 'EDEKA', category1: 'Mercados', priority: 600 }),
    createRule({ id: 'rule-b', keyWords: 'EDEKA', category1: 'Alimentação', priority: 600 }), // Same priority
  ];

  const descNorm = 'EDEKA SUPERMARKET';
  const result = matchRules(descNorm, rules);

  assert(result.matches.length > 1, 'Should have multiple matches');
  assertEqual(result.needsReview, true, 'Conflict should trigger review');

  console.log('  ✓ TC-007 passed: Conflict detection works');
}

// ============================================================================
// TC-008: Confidence threshold
// ============================================================================
function test_TC008_confidence_threshold(): void {
  console.log('TC-008: Testing confidence threshold...');

  const rules: Rule[] = [
    createRule({ keyWords: 'LIDL', category1: 'Mercados', priority: 800, isSystem: true }),
  ];

  const settingsAutoConfirm: UserSettings = {
    autoConfirmHighConfidence: true,
    confidenceThreshold: 80
  };

  const settingsNoAutoConfirm: UserSettings = {
    autoConfirmHighConfidence: false,
    confidenceThreshold: 80
  };

  const descNorm = 'LIDL SUPERMARKET';

  // With auto-confirm enabled
  const resultAuto = matchRules(descNorm, rules, settingsAutoConfirm);
  assertEqual(resultAuto.needsReview, false, 'High confidence + autoConfirm should not need review');

  // With auto-confirm disabled
  const resultManual = matchRules(descNorm, rules, settingsNoAutoConfirm);
  assertEqual(resultManual.needsReview, true, 'Without autoConfirm should need review');

  console.log('  ✓ TC-008 passed: Confidence threshold respected');
}

// ============================================================================
// EC-001: Empty keywords skipped
// ============================================================================
function test_EC001_empty_keywords(): void {
  console.log('EC-001: Testing empty keywords handling...');

  const rules: Rule[] = [
    createRule({ keyWords: '', category1: 'Outros', priority: 600 }), // Empty
    createRule({ keyWords: null, category1: 'Outros', priority: 600 }), // Null
    createRule({ keyWords: 'VALID', category1: 'Mercados', priority: 500 }),
  ];

  const descNorm = 'SOME TRANSACTION';
  const result = matchRules(descNorm, rules);

  // Empty/null rules should be skipped, no match for 'SOME TRANSACTION'
  assertEqual(result.matches.length, 0, 'No matches for unrelated description');

  // But VALID should work
  const resultValid = matchRules('VALID TRANSACTION', rules);
  assertEqual(resultValid.matches.length, 1, 'Valid keyword should match');

  console.log('  ✓ EC-001 passed: Empty keywords handled');
}

// ============================================================================
// EC-002: Special characters preserved
// ============================================================================
function test_EC002_special_characters(): void {
  console.log('EC-002: Testing special characters...');

  const rules: Rule[] = [
    createRule({ keyWords: 'SV Fuerstenfeldbrucker Wasserratten e.V.', category1: 'Lazer / Esporte', priority: 600 }),
  ];

  const descNorm = 'ZAHLUNG AN SV FUERSTENFELDBRUCKER WASSERRATTEN E.V.';
  const result = matchRules(descNorm, rules);

  assertEqual(result.matches.length, 1, 'Should match with special characters');

  console.log('  ✓ EC-002 passed: Special characters work');
}

// ============================================================================
// EC-003: Unicode normalization
// ============================================================================
function test_EC003_unicode_normalization(): void {
  console.log('EC-003: Testing unicode normalization...');

  const normalized1 = normalizeForMatch('Café Prüfung');
  const normalized2 = normalizeForMatch('CAFE PRUFUNG');

  assertEqual(normalized1, normalized2, 'Accented and non-accented should match after normalization');

  console.log('  ✓ EC-003 passed: Unicode normalization works');
}

// ============================================================================
// EC-004: Case insensitivity
// ============================================================================
function test_EC004_case_insensitivity(): void {
  console.log('EC-004: Testing case insensitivity...');

  const rules: Rule[] = [
    createRule({ keyWords: 'netflix', category1: 'Lazer / Esporte', priority: 600 }),
  ];

  const testCases = ['NETFLIX', 'Netflix', 'netflix', 'NeTfLiX'];

  for (const testCase of testCases) {
    const result = matchRules(testCase + ' subscription', rules);
    assertEqual(result.matches.length, 1, `Should match "${testCase}"`);
  }

  console.log('  ✓ EC-004 passed: Case insensitivity works');
}

// ============================================================================
// Run all tests
// ============================================================================
async function runTests(): Promise<void> {
  console.log('\n========================================');
  console.log('Rules Engine Unit Tests');
  console.log('Logic Contract: docs/LOGIC_CONTRACT.md');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    test_TC001_determinism,
    test_TC002_strict_shortcircuit,
    test_TC003_priority_order,
    test_TC004_negative_keywords,
    test_TC005_interno_autoflags,
    test_TC006_manual_override,
    test_TC007_conflict_detection,
    test_TC008_confidence_threshold,
    test_EC001_empty_keywords,
    test_EC002_special_characters,
    test_EC003_unicode_normalization,
    test_EC004_case_insensitivity,
  ];

  for (const test of tests) {
    try {
      test();
      passed++;
    } catch (error) {
      console.error(`  ✗ FAILED: ${(error as Error).message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
