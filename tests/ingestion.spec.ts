import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Ingestion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Basic signup to ensure we have a session
    const randomId = Math.random().toString(36).substring(7);
    await page.goto('/signup');
    await page.fill('input[name="username"]', `ingest_${randomId}`);
    await page.fill('input[name="email"]', `ingest_${randomId}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign Up")');
    try {
        await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('uploads'), { timeout: 15000 });
    } catch (e) {
        console.error("DEBUG (Ingest): Signup timed out. Final URL was:", page.url());
        throw e;
    }
  });

  test('upload CSV, preview, commit and rollback', async ({ page }) => {
    await page.goto('/uploads');
    
    // Upload file
    const filePath = path.resolve('tests/fixtures/sparkasse_mock.csv');
    await page.setInputFiles('#file', filePath);
    
    await page.click('[data-testid="upload-csv-btn"]');
    
    // Preview should appear (wait for it)
    try {
        await page.waitForSelector('text=sparkasse_mock.csv', { timeout: 15000 });
    } catch (e) {
        console.log("DEBUG: Filename not found in BatchList. Current page text:", await page.innerText('body'));
        throw e;
    }
    await expect(page.locator('text=sparkasse_mock.csv')).toBeVisible();
    
    // Commit
    await page.click('button:has-text("Process & Import")');
    
    // Should show committed status
    await expect(page.locator('text=committed')).toBeVisible();
    
    // Verify in transactions
    await page.goto('/transactions');
    await expect(page.locator('text=REWE')).toBeVisible();
    
    // Open drawer
    await page.click('text=REWE');
    await expect(page.locator('text=EVIDENCE')).toBeVisible();
    await expect(page.locator('text=REWE SAGT DANKE')).toBeVisible();
    
    // Close drawer
    await page.keyboard.press('Escape');

    // Rollback
    await page.goto('/uploads');
    await page.click('button:has-text("Rollback")');
    
    // Verify removed from transactions
    await page.goto('/transactions');
    await expect(page.locator('text=REWE')).not.toBeVisible();
  });
});
