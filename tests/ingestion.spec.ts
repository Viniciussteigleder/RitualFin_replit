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

    // Wait for explicit upload confirmation, then proceed to preview/import
    await expect(page.getByRole('status')).toContainText('Upload confirmado', { timeout: 90000 });
    await page.click('button:has-text("Revisar e importar")', { timeout: 20000 });

    // Commit from preview screen
    await expect(page.getByRole('button', { name: /process & import/i })).toBeVisible({ timeout: 60000 });
    await page.click('button:has-text("Process & Import")', { timeout: 20000 });

    // Server action completion is async from the click perspective; wait until UI reflects committed state.
    const rollbackButton = page.getByRole('button', { name: /rollback/i });
    for (let i = 0; i < 12; i++) {
      if (await rollbackButton.count()) break;
      await page.waitForTimeout(2000);
      await page.reload();
    }
    await expect(rollbackButton).toBeVisible({ timeout: 30000 });

    // Verify in transactions
    await page.goto('/transactions');
    await expect(page.getByText(/REWE/i)).toBeVisible({ timeout: 90000 });

    // Rollback
    await page.goto('/uploads');
    await page.click('button:has-text("Rollback")', { timeout: 90000 });
    
    // Verify removed from transactions
    await page.goto('/transactions');
    await expect(page.getByText('REWE')).not.toBeVisible({ timeout: 20000 });
  });
});
