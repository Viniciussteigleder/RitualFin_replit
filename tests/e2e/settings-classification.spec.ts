import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

test("SET-06 classification import preview", async ({ page }) => {
  await mockApi(page);
  await page.goto("/settings");

  await page.getByRole("button", { name: "Classificação & Dados" }).click();
  const fileInput = page.locator("input[type=\"file\"][accept=\".csv\"]").first();
  await fileInput.setInputFiles("test-new-categories.csv");

  await expect(page.getByText("Pré-visualização concluída")).toBeVisible();
});

test("SET-11 CSV mapping modal opens", async ({ page }) => {
  await mockApi(page);
  await page.goto("/settings");

  await page.getByRole("button", { name: "Integrações" }).click();
  await page.getByRole("button", { name: "Ver mapeamento CSV" }).first().click();

  await expect(page.getByText("Mapeamento CSV · Miles & More")).toBeVisible();
  await expect(page.getByText("Delimitador", { exact: true })).toBeVisible();
});
