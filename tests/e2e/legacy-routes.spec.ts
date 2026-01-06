import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

test("LEG-01 legacy routes load", async ({ page }) => {
  await mockApi(page);

  await page.goto("/confirm");
  await expect(page.getByRole("heading", { name: "Fila de Confirmação" })).toBeVisible();

  await page.goto("/rules");
  await expect(page.getByRole("button", { name: "Nova Regra" })).toBeVisible();

  await page.goto("/ai-keywords");
  await expect(page.getByRole("button", { name: "Analisar Transações" })).toBeVisible();

  await page.goto("/merchant-dictionary");
  await expect(page.getByRole("heading", { name: "Dicionário de Comerciantes" })).toBeVisible();
});
