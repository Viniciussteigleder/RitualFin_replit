import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

test("TX-06 edit transaction sets manualOverride", async ({ page }) => {
  const transaction = {
    id: "tx-1",
    paymentDate: "2026-01-02",
    amount: -25.5,
    currency: "EUR",
    descRaw: "NETFLIX",
    simpleDesc: "NETFLIX",
    keyDesc: "NETFLIX",
    accountId: "acc-1",
    accountSource: "Miles & More",
    category1: "Lazer",
    category2: "",
    category3: "",
    type: "Despesa",
    fixVar: "Variável",
    internalTransfer: false,
    excludeFromBudget: false,
    manualOverride: false,
  };
  const account = { id: "acc-1", name: "Miles & More" };
  let updatePayload: any;

  await mockApi(page, {
    transactions: [transaction],
    accounts: [account],
    onTransactionUpdate: (payload) => {
      updatePayload = payload;
    },
  });

  await page.goto("/transactions");
  await page.getByRole("button", { name: "Editar" }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Salvar" }).click();

  await expect.poll(() => updatePayload?.manualOverride).toBe(true);
});

test("RULE-07 Interno flags are reflected in edit form", async ({ page }) => {
  const transaction = {
    id: "tx-interno-1",
    paymentDate: "2026-01-03",
    amount: -100,
    currency: "EUR",
    descRaw: "TRANSFERENCIA INTERNA",
    simpleDesc: "TRANSFERENCIA INTERNA",
    keyDesc: "TRANSFERENCIA INTERNA",
    accountId: "acc-1",
    accountSource: "Conta",
    category1: "Interno",
    category2: "",
    category3: "",
    type: "Despesa",
    fixVar: "Variável",
    internalTransfer: true,
    excludeFromBudget: true,
    manualOverride: false,
  };
  const account = { id: "acc-1", name: "Conta" };

  await mockApi(page, {
    transactions: [transaction],
    accounts: [account],
  });

  await page.goto("/transactions");
  await page.getByRole("button", { name: "Editar" }).first().click();

  await expect(page.locator("#excludeFromBudget")).toHaveAttribute("data-state", "checked");
  await expect(page.locator("#internalTransfer")).toHaveAttribute("data-state", "checked");
});
