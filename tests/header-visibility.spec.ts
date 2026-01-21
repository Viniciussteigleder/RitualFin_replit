import { test, expect } from '@playwright/test';

test.describe('Header Visibility', () => {
  test('header is visible at mobile viewport (500px)', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.top).toBeLessThan(150); // Header should be near top
    expect(box!.height).toBeGreaterThan(50); // Header should have reasonable height
  });

  test('header is visible at tablet viewport (1000px) - no dead zone', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    // Critical: header top should be ~32px, NOT ~88px (which would indicate 56px gap)
    expect(box!.top).toBeLessThan(60);
    expect(box!.height).toBeGreaterThan(50);

    // Verify no dead zone: element at top-left should NOT be empty space
    const elementAtTop = await page.evaluate(() => {
      const el = document.elementFromPoint(400, 50);
      return el ? el.tagName : null;
    });
    expect(elementAtTop).not.toBeNull();
  });

  test('header is visible at desktop viewport (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.top).toBeLessThan(60);
    expect(box!.height).toBeGreaterThan(50);
  });

  test('header contains "Extrato" text', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header.locator('h1')).toContainText('Extrato');
  });

  test('scroll position remains at 0 after load', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for any delayed scroll jumps

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('no overlay covering header', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');

    // Get header bounding box
    const header = page.locator('header').first();
    const box = await header.boundingBox();
    
    if (box) {
      // Check element at center of header
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      const elementAtCenter = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el ? {
          tagName: el.tagName,
          isHeader: el.closest('header') !== null
        } : null;
      }, { x: centerX, y: centerY });

      expect(elementAtCenter).not.toBeNull();
      expect(elementAtCenter!.isHeader).toBe(true);
    }
  });
});
