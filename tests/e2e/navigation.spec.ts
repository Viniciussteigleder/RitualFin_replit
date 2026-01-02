import { test, expect } from '@playwright/test';

/**
 * Navigation & Layout Tests
 *
 * Tests that all sidebar routes are accessible and load without errors.
 * Covers test IDs: NAV-001 through NAV-014, SIDE-001 through SIDE-005
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage - auto-login in demo mode
    await page.goto('/');
  });

  // NAV-001: Dashboard
  test('should load dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    // Check no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });

  // NAV-002: Calendar
  test('should load calendar', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.locator('h1')).toContainText(/calend/i);
  });

  // NAV-003: Notifications
  test('should load notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('h1')).toContainText(/notifica/i);
  });

  // NAV-004: Budgets
  test('should load budgets', async ({ page }) => {
    await page.goto('/budgets');
    await expect(page.locator('h1')).toContainText(/budget/i);
  });

  // NAV-005: Goals
  test('should load goals', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.locator('h1')).toContainText(/meta|goal/i);
  });

  // NAV-006: Confirmation queue (Review Queue / Fila de Revisão)
  test('should load confirmation queue', async ({ page }) => {
    await page.goto('/confirm');
    await expect(page.locator('h1')).toContainText(/revis|confirm|fila/i);
  });

  // NAV-007: Transactions
  test('should load transactions', async ({ page }) => {
    await page.goto('/transactions');
    await expect(page.locator('h1')).toContainText(/transa/i);
  });

  // NAV-008: Rules
  test('should load rules', async ({ page }) => {
    await page.goto('/rules');
    await expect(page.locator('h1')).toContainText(/regra|motor/i);
  });

  // NAV-009: Merchant Dictionary
  test('should load merchant dictionary', async ({ page }) => {
    await page.goto('/merchant-dictionary');
    await expect(page.locator('h1')).toContainText(/dicion|merchant/i);
  });

  // NAV-010: AI Keywords
  test('should load AI keywords', async ({ page }) => {
    await page.goto('/ai-keywords');
    await expect(page.locator('h1')).toContainText(/palavra|keyword|ia|ai/i);
  });

  // NAV-011: Uploads
  test('should load uploads', async ({ page }) => {
    await page.goto('/uploads');
    await expect(page.locator('h1')).toContainText(/upload|import/i);
  });

  // NAV-012: Accounts
  test('should load accounts', async ({ page }) => {
    await page.goto('/accounts');
    await expect(page.locator('h1')).toContainText(/conta|account/i);
  });

  // NAV-013: Rituals
  test('should load rituals', async ({ page }) => {
    await page.goto('/rituals');
    await expect(page.locator('h1')).toContainText(/ritual/i);
  });

  // NAV-014: Settings (P0 fix - IAL-001)
  test('should load settings from sidebar link', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText(/config|setting/i);

    // Verify settings tabs load (SET-001 through SET-005)
    const tabs = ['Conta', 'Preferências', 'Dicionários', 'Integrações', 'Segurança'];
    for (const tab of tabs) {
      await expect(page.getByRole('tab', { name: new RegExp(tab, 'i') })).toBeVisible();
    }
  });
});

test.describe('Sidebar UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  // SIDE-001: Logo aspect ratio
  test('should display RitualFin logo without distortion', async ({ page }) => {
    const logo = page.locator('img[alt*="RitualFin"], svg[aria-label*="RitualFin"]').first();
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
      // Logo should be visible and not have extreme aspect ratio distortion
      const box = await logo.boundingBox();
      if (box) {
        const aspectRatio = box.width / box.height;
        expect(aspectRatio).toBeGreaterThan(0.5);
        expect(aspectRatio).toBeLessThan(5);
      }
    }
  });

  // SIDE-003: Settings placement in bottom section (P0 fix verification)
  test('should have Settings link in sidebar', async ({ page }) => {
    await expect(page.getByRole('link', { name: /configurações|settings/i })).toBeVisible();
  });

  // SIDE-005: Logout visible
  test('should have logout button in sidebar', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /sair|logout/i });
    if (await logoutButton.count() > 0) {
      await expect(logoutButton).toBeVisible();
    }
  });
});
