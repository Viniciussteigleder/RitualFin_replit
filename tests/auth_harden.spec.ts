import { test, expect } from '@playwright/test';

test('Auth debug endpoint returns correctly', async ({ request }) => {
  const response = await request.get('/api/auth/debug');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.status).toBe('ok');
  expect(data.diagnostics).toBeDefined();
});

test('Auth route does not immediately error', async ({ request }) => {
  // Accessing the main auth endpoint should not return a 500
  const response = await request.get('/api/auth/session');
  expect(response.status()).toBeLessThan(500);
});
