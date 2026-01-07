import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Screenshot Ingestion', () => {
  test.beforeEach(async ({ page }) => {
    // Basic signup to ensure we have a session
    const randomId = Math.random().toString(36).substring(7);
    await page.goto('/signup');
    await page.fill('input[name="username"]', `scr_${randomId}`);
    await page.fill('input[name="email"]', `scr_${randomId}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('uploads'), { timeout: 15000 });
  });

  test('upload screenshot with mocked OCR and verify enrichment', async ({ page }) => {
    await page.goto('/uploads');
    
    // Switch to screenshot tab
    await page.click('button:has-text("Screenshot")');
    // Inject mock OCR text
    await page.evaluate(() => {
        (window as any).__MOCK_OCR_TEXT__ = "Date: 01.01.2024\nAmount: 123.45 EUR\nMerchant: Starbucks Coffee";
    });

    // Upload file
    const filePath = path.resolve('tests/fixtures/dummy_receipt.png');
    await page.setInputFiles('#screenshot', filePath);
    
    await page.click('[data-testid="upload-screenshot-btn"]');
    
    // Should show success
    await expect(page.locator('text=uploaded and parsed successfully')).toBeVisible();
    
    // Verify in transactions
    await page.goto('/transactions');
    await expect(page.locator('text=Starbucks Coffee')).toBeVisible();
    await expect(page.locator('text=123,45')).toBeVisible();
  });
});
