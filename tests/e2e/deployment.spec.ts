import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

test("DEP-05 version endpoints return metadata", async ({ page }) => {
  await mockApi(page);
  await page.route("**/version.json", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ gitSha: "local", buildTime: new Date().toISOString() }),
    });
  });

  await page.goto("/dashboard");

  const apiVersion = await page.evaluate(async () => {
    const res = await fetch("/api/version");
    return res.json();
  });
  expect(apiVersion).toMatchObject({ service: "ritualfin-api" });

  const frontendVersion = await page.evaluate(async () => {
    const res = await fetch("/version.json");
    return res.json();
  });
  expect(frontendVersion.gitSha).toBe("local");
});
