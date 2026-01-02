import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

test("AUTH-01 demo login redirects to dashboard", async ({ page }) => {
  await mockApi(page);
  await page.goto("/login");
  await page.getByTestId("btn-google-login").click();
  await page.waitForURL("**/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
});
