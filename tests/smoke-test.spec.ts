import { test, expect } from '@playwright/test';

test('app loads without runtime errors', async ({ page }) => {
  // Navigate to login
  await page.goto('/login');
  
  // Check for runtime errors
  const bodyText = await page.textContent('body');
  
  if (bodyText?.includes('Runtime Error') || bodyText?.includes('does not exist')) {
    throw new Error('Runtime error detected on page');
  }
  
  // Verify login form is present
  await expect(page.locator('input[name="email"]')).toBeVisible();
  console.log('✅ Login page loads successfully');
  
  // Try signup flow
  const randomId = Math.random().toString(36).substring(7);
  await page.goto('/signup');
  await page.fill('input[name="username"]', `test_${randomId}`);
  await page.fill('input[name="email"]', `test_${randomId}@example.com`);
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  
  // Check for errors
  const finalBody = await page.textContent('body');
  if (finalBody?.includes('display does not exist')) {
    throw new Error('Schema error still present!');
  }
  
  console.log('✅ No schema errors detected');
});
