import { test, expect } from "@playwright/test";

const protectedRoutes = [
  "/",
  "/accounts",
  "/admin/import",
  "/admin/rules",
  "/ai-keywords",
  "/analytics",
  "/budgets",
  "/calendar",
  "/confirm",
  "/diagnose",
  "/goals",
  "/rituals",
  "/rules",
  "/settings",
  "/settings/exclusions",
  "/settings/rules",
  "/settings/taxonomy",
  "/transactions",
  "/uploads",
];

test("Routes: protected screens redirect when logged out", async ({ page }) => {
  test.setTimeout(120_000);
  for (const route of protectedRoutes) {
    const response = await page.goto(route);
    expect((response?.status() ?? 200) < 500).toBeTruthy();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/);
  }
});

test("Routes: authenticated screens load without server errors", async ({ page }) => {
  test.setTimeout(120_000);
  const randomId = Math.random().toString(36).substring(7);
  await page.goto("/signup");
  await page.fill('input[name="username"]', `smoke_${randomId}`);
  await page.fill('input[name="email"]', `smoke_${randomId}@example.com`);
  await page.fill('input[name="password"]', "Password123!");
  await page.click('button:has-text("Sign Up")');
  await page.waitForURL((url) => url.pathname === "/" || url.pathname.includes("uploads"), { timeout: 20000 });

  for (const route of protectedRoutes) {
    const response = await page.goto(route);
    expect((response?.status() ?? 200) < 500).toBeTruthy();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Internal Server Error")).toHaveCount(0);
    await expect(page.locator("text=Application error")).toHaveCount(0);
  }

  const health = await page.request.get("/api/health");
  expect(health.status()).toBe(200);
  const json = await health.json();
  expect(json.status).toBe("ok");
});
