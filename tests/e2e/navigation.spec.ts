import { test, expect } from "@playwright/test";
import { dismissOnboarding, mockApi } from "./utils";

test("NAV-01 sidebar navigation routes", async ({ page }) => {
  await mockApi(page);
  await page.goto("/dashboard");
  await dismissOnboarding(page);

  const nav = page.locator("nav");
  const navItems = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Calendário", url: "/calendar" },
    { name: "Previsão", url: "/forecast" },
    { name: "Transações", url: "/transactions" },
    { name: "Contas", url: "/accounts" },
    { name: "Insights", url: "/insights" },
    { name: "Upload", url: "/uploads" },
    { name: "Lista de Confirmação", url: "/confirm" },
    { name: "Regras", url: "/rules" },
    { name: "AI Keywords", url: "/ai-keywords" },
    { name: "Notificações", url: "/notifications" },
    { name: "Orçamento", url: "/budgets" },
    { name: "Metas", url: "/goals" },
    { name: "Semanal", url: "/rituals?type=weekly" },
    { name: "Mensal", url: "/rituals?type=monthly" },
  ];

  for (const item of navItems) {
    await nav.getByRole("link", { name: item.name }).click();
    await page.waitForURL(`**${item.url}`);
    await expect(page).toHaveURL(new RegExp(item.url.replace("?", "\\?")));
  }

  await page.getByRole("link", { name: "Configurações" }).click();
  await page.waitForURL("**/settings");
  await expect(page).toHaveURL(/\/settings/);
});
