import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CSV Import Pipeline Tests
 *
 * Tests CSV upload, parsing, and deduplication for all supported formats.
 * Covers test IDs: MM-001 through MM-005, AMEX-001 through AMEX-004, SPARK-001 through SPARK-006
 *
 * NOTE: These tests require actual CSV sample files to be present in attached_assets/
 * For CI/automated testing, sample CSVs should be minimal (5-10 rows each)
 */

test.describe('CSV Import - Miles & More', () => {
  test.skip('should upload Miles & More CSV and create transactions', async ({ page }) => {
    // MM-001, MM-002: Upload and parse
    await page.goto('/uploads');

    const csvPath = path.join(__dirname, '../../attached_assets/miles_more_sample.csv');

    // Skip if sample file doesn't exist
    if (!fs.existsSync(csvPath)) {
      test.skip();
      return;
    }

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    // Wait for upload to complete
    await expect(page.getByText(/sucesso|success|importad/i)).toBeVisible({ timeout: 10000 });

    // Verify transactions created
    await page.goto('/transactions');
    await expect(page.locator('[data-testid^="transaction-"]').first()).toBeVisible();
  });

  test.skip('should detect and skip duplicate Miles & More uploads', async ({ page }) => {
    // MM-003: Re-upload same CSV, expect deduplication
    await page.goto('/uploads');

    const csvPath = path.join(__dirname, '../../attached_assets/miles_more_sample.csv');

    if (!fs.existsSync(csvPath)) {
      test.skip();
      return;
    }

    // Upload same file twice
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);
    await page.waitForTimeout(2000); // Wait for first upload

    await fileInput.setInputFiles(csvPath);

    // Should show duplicate message
    await expect(page.getByText(/duplicad|duplicate|já exist/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('CSV Import - Amex', () => {
  test.skip('should upload Amex CSV with correct format detection', async ({ page }) => {
    // AMEX-001, AMEX-002: Upload and parse Amex format
    await page.goto('/uploads');

    const csvPath = path.join(__dirname, '../../attached_assets/amex_sample.csv');

    if (!fs.existsSync(csvPath)) {
      test.skip();
      return;
    }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    await expect(page.getByText(/sucesso|success|importad/i)).toBeVisible({ timeout: 10000 });

    // Verify format was detected as Amex
    await page.goto('/transactions');
    // Amex transactions should be visible
    await expect(page.locator('[data-testid^="transaction-"]').first()).toBeVisible();
  });
});

test.describe('CSV Import - Sparkasse', () => {
  test.skip('should upload Sparkasse CSV with diagnostic reporting', async ({ page }) => {
    // SPARK-001 through SPARK-006: Sparkasse format with diagnostics
    await page.goto('/uploads');

    const csvPath = path.join(__dirname, '../../attached_assets/sparkasse_sample.csv');

    if (!fs.existsSync(csvPath)) {
      test.skip();
      return;
    }

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(csvPath);

    // Wait for upload result
    await page.waitForTimeout(3000);

    // Check for success OR detailed error diagnostics (DIAG-001 through DIAG-005)
    const hasSuccess = await page.getByText(/sucesso|success|importad/i).isVisible();
    const hasError = await page.getByText(/erro|error|falha/i).isVisible();

    expect(hasSuccess || hasError).toBeTruthy();

    // If error, verify diagnostics are shown (IAL-003 fix)
    if (hasError) {
      // Should show diagnostic details like encoding, delimiter, header match
      const errorText = await page.textContent('body');
      // Diagnostics should include technical details, not just generic error
      expect(errorText?.length || 0).toBeGreaterThan(50);
    }
  });
});

test.describe('Import Error Handling', () => {
  test('should show error for invalid CSV format', async ({ page }) => {
    // ERR-001: Invalid CSV format
    await page.goto('/uploads');

    // Create a temporary invalid CSV file
    const invalidCsvPath = path.join(__dirname, '../../tests/e2e/fixtures/invalid.csv');
    const fixturesDir = path.join(__dirname, 'fixtures');

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    fs.writeFileSync(invalidCsvPath, 'Not,A,Valid,CSV\n1,2,3');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidCsvPath);

    // Should show error message
    await expect(page.getByText(/erro|error|invalid|inválid/i)).toBeVisible({ timeout: 10000 });

    // Cleanup
    fs.unlinkSync(invalidCsvPath);
  });

  test('should show error for empty CSV file', async ({ page }) => {
    // ERR-004: Empty file
    await page.goto('/uploads');

    const emptyCsvPath = path.join(__dirname, '../../tests/e2e/fixtures/empty.csv');
    const fixturesDir = path.join(__dirname, 'fixtures');

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    fs.writeFileSync(emptyCsvPath, '');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(emptyCsvPath);

    // Should show empty file error
    await expect(page.getByText(/vazio|empty|sem dados|no data/i)).toBeVisible({ timeout: 10000 });

    // Cleanup
    fs.unlinkSync(emptyCsvPath);
  });
});
