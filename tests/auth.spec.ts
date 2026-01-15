import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders and shows error on missing config', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome to ritualfin/i })).toBeVisible();
    
    // Attempt credentials login with random stuff
    await page.fill('input[name="email"]', 'notfound@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    // Should show error (either "Invalid credentials" or user not found)
    await page.waitForURL(/.*login\?error=.*/);
    await expect(page.locator('body')).toContainText(/Invalid|wrong/i);
  });

  test('signup and login flow', async ({ page }) => {
    const randomId = Math.random().toString(36).substring(7);
    const email = `testuser_${randomId}@example.com`;
    const username = `user_${randomId}`;
    const password = 'Password123!';

    await page.goto('/signup');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL(url => url.pathname === '/' || url.pathname.includes('uploads'), { timeout: 20000 });
    
    // Check if we are logged in by looking for logout or sidebar
    await expect(page.locator('nav').first()).toBeVisible();
  });
});
