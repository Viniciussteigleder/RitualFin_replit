import { test, expect } from '@playwright/test';

test('Auth debug endpoint is not exposed in production', async ({ request }) => {
  const response = await request.get('/api/auth/debug');
  expect(response.status()).toBe(404);
});

test('Auth route does not immediately error', async ({ request }) => {
  // Accessing the main auth endpoint should not return a 500
  const response = await request.get('/api/auth/session');
  expect(response.status()).toBeLessThan(500);
});
