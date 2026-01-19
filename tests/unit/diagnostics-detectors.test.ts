/**
 * Diagnostics detector unit tests
 *
 * Run with: npx tsx tests/unit/diagnostics-detectors.test.ts
 */

import {
  classifyNumberLocale,
  detectNumberLocaleDrift,
  classifyDateFormat,
  detectDateFormatDrift,
  getColumnCount,
  detectReplacementChar,
} from "../../src/lib/diagnostics/detectors";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`ASSERTION FAILED: ${message} - Expected: ${expected}, Got: ${actual}`);
  }
}

function test_number_locale_classification(): void {
  console.log("DET-001: number locale classification...");
  assertEqual(classifyNumberLocale("2.194,14"), "eu", "EU pattern");
  assertEqual(classifyNumberLocale("2,194.14"), "us", "US pattern");
  assertEqual(classifyNumberLocale("2194"), "ambiguous", "No separators");
  assertEqual(classifyNumberLocale(""), "unknown", "Empty");
  console.log("  ✓ DET-001 passed");
}

function test_number_locale_drift(): void {
  console.log("DET-002: number locale drift...");
  const drift = detectNumberLocaleDrift(["2.194,14", "2,194.14", "19,99", "10.00"]);
  assert(drift.drift === true, "Should detect drift");
  assert(drift.eu > 0 && drift.us > 0, "Both EU and US should be present");
  console.log("  ✓ DET-002 passed");
}

function test_date_format_drift(): void {
  console.log("DET-003: date format drift...");
  assertEqual(classifyDateFormat("01.02.24"), "dd.mm.yy", "dd.mm.yy");
  assertEqual(classifyDateFormat("01.02.2024"), "dd.mm.yyyy", "dd.mm.yyyy");
  assertEqual(classifyDateFormat("01/02/2024"), "dd/mm/yyyy", "dd/mm/yyyy");
  assertEqual(classifyDateFormat("2024-02-01"), "yyyy-mm-dd", "yyyy-mm-dd");

  const drift = detectDateFormatDrift(["01.02.2024", "2024-02-01", "03.02.2024"]);
  assert(drift.drift === true, "Should detect drift");
  assert(drift.distinctKnownFormats === 2, "Should have 2 known formats");
  console.log("  ✓ DET-003 passed");
}

function test_raw_helpers(): void {
  console.log("DET-004: raw helpers...");
  assertEqual(getColumnCount({ a: 1, b: 2 }), 2, "column count");
  assert(detectReplacementChar({ a: "ok", b: "bad \uFFFD" }) === true, "replacement char");
  console.log("  ✓ DET-004 passed");
}

function main(): void {
  test_number_locale_classification();
  test_number_locale_drift();
  test_date_format_drift();
  test_raw_helpers();
}

main();

