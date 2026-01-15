import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Ingestion Flow', () => {
  test.setTimeout(120_000);
  test.beforeEach(async ({ page }) => {
    // Basic signup to ensure we have a session
    const randomId = Math.random().toString(36).substring(7);
    await page.goto('/signup');
    await page.fill('input[name="username"]', `ingest_${randomId}`);
    await page.fill('input[name="email"]', `ingest_${randomId}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('uploads'), { timeout: 20000 });
  });

  test('upload CSV, preview, commit and rollback', async ({ page }) => {
    await page.goto('/uploads');
    
    // Upload file
    const filePath = path.resolve('tests/fixtures/sparkasse_mock.csv');
    await page.waitForSelector('[data-testid="csv-file-input"]', { state: 'attached' });
    await page.setInputFiles('[data-testid="csv-file-input"]', filePath);

    await expect(page.getByRole('button', { name: /process & import/i })).toBeVisible({ timeout: 60000 });
    
    // Commit
    await page.click('button:has-text("Process & Import")', { timeout: 20000 });
    
    // Should show rollback action after commit
    await expect(page.getByRole('button', { name: /rollback/i })).toBeVisible({ timeout: 90000 });
    
    // Verify in transactions
    await page.goto('/transactions');
    await expect(page.getByText('REWE')).toBeVisible({ timeout: 20000 });

    // Rollback
    await page.goto('/uploads');
    await page.click('button:has-text("Rollback")');
    
    // Verify removed from transactions
    await page.goto('/transactions');
    await expect(page.getByText('REWE')).not.toBeVisible({ timeout: 20000 });
  });
});
