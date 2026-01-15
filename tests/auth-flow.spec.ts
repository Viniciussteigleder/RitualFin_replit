import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('should load login page and show Google sign-in button', async ({ page }) => {
    await page.goto('/login');
    
    // Check that the login page loaded
    await expect(page).toHaveTitle(/RitualFin/i);
    
    // Check for the Google sign-in button
    const googleButton = page.getByRole('button', { name: /continue with google/i });
    await expect(googleButton).toBeVisible();
    
    // Check for email/password form
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test('should redirect to login when accessing protected route while logged out', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/transactions');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('health endpoint should return OK status', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.status()).toBe(200);
    const data = await response?.json();
    expect(data.status).toBe('ok');
  });
});

test.describe('Application Health', () => {
  test('homepage should load', async ({ page }) => {
    await page.goto('/');
    
    // Should either show the app or redirect to login
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    expect(url).toMatch(/\/(login|$)/);
  });

  test('should have no console errors on login page', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Filter out known/acceptable errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404') &&
      !err.includes("upgrade-insecure-requests") // CSP report-only warning
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
