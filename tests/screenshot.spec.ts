import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Screenshot Ingestion', () => {
  test.setTimeout(120_000);
  test.beforeEach(async ({ page }) => {
    // Basic signup to ensure we have a session
    const randomId = Math.random().toString(36).substring(7);
    await page.goto('/signup');
    await page.fill('input[name="username"]', `scr_${randomId}`);
    await page.fill('input[name="email"]', `scr_${randomId}@example.com`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Sign Up")');
    await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('uploads'), { timeout: 20000 });
  });

  test('upload screenshot with mocked OCR and verify enrichment', async ({ page }) => {
    await page.goto('/uploads');
    
    // Switch to screenshot tab
    await page.click('button:has-text("Evidência")');
    // Inject mock OCR text
    await page.evaluate(() => {
        (window as any).__MOCK_OCR_TEXT__ = "Date: 01.01.2024\nAmount: 123.45 EUR\nMerchant: Starbucks Coffee";
    });

    // Upload file
    const filePath = path.resolve('tests/fixtures/dummy_receipt.png');
    await page.setInputFiles('#screenshot', filePath);
    
    await page.click('[data-testid="upload-screenshot-btn"]');
    
    // Should show success
    const message = page.locator("form").getByText(/Screenshot uploaded and parsed successfully!|Error:|Failed to run OCR\\./);
    await expect(message).toBeVisible({ timeout: 60000 });
    await expect(message).toContainText("Screenshot uploaded and parsed successfully!");
    
    // Verify in transactions
    await page.goto('/transactions');
    await expect(page.getByText(/Nenhuma transação encontrada/i)).toHaveCount(0);
  });
});
