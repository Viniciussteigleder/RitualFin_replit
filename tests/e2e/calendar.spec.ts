import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

test("CAL-01 calendar month view loads", async ({ page }) => {
  await mockApi(page);
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { name: "Calendário" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Mês" })).toBeVisible();
});
