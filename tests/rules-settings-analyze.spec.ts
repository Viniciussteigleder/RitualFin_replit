import { test, expect } from "@playwright/test";

test("Analyze /settings/rules UI (grouping + collapse)", async ({ page }) => {
  const randomId = Math.random().toString(36).slice(2);
  const email = `pw_${randomId}@example.com`;
  const username = `pw_${randomId}`;
  const password = "Password123!";

  await page.goto("/signup");
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => url.pathname === "/" || url.pathname.startsWith("/uploads") || url.pathname.startsWith("/dashboard"), {
    timeout: 30000,
  });

  await page.goto("/settings/rules");
  await expect(page.getByRole("heading", { name: /motor de regras/i })).toBeVisible();

  await page.waitForLoadState("networkidle");

  // Should never show "Sem App Category" buckets; default bucket is OPEN.
  await expect(page.locator("body")).not.toContainText(/Sem App Category/i);

  // Group controls
  const collapseBtn = page.getByRole("button", { name: /recolher grupos/i });
  const expandBtn = page.getByRole("button", { name: /expandir grupos/i });
  await expect(collapseBtn).toBeVisible();
  await expect(expandBtn).toBeVisible();

  // Collapse should hide rule cards (there may be 0 rules for new user; this still should not error).
  await collapseBtn.click();
  await page.waitForTimeout(300);

  // Expand back.
  await expandBtn.click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: "playwright-report/analyze-settings-rules-local.png", fullPage: true });
});
