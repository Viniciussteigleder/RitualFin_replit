import { test, expect } from "@playwright/test";
import { dismissOnboarding, mockApi } from "./utils";

test("AI-UI-01 AI assistant modal opens and responds", async ({ page }) => {
  await mockApi(page);
  await page.goto("/dashboard");
  await dismissOnboarding(page);

  await page.getByRole("button", { name: "Assistente IA" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Ações Rápidas")).toBeVisible();

  await page.getByRole("button", { name: "Análise deste mês" }).click({ force: true });
  await expect(page.getByText("Backend em desenvolvimento")).toBeVisible();

  await page.getByRole("button", { name: "Fechar" }).click();
  await expect(page.getByText("Ações Rápidas")).toBeHidden();
});
