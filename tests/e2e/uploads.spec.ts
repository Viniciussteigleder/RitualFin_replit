import { test, expect } from "@playwright/test";
import { mockApi } from "./utils";

const sampleCsv = "attached_assets/2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv";

test("UP-01 upload preview renders for CSV", async ({ page }) => {
  await mockApi(page);
  await page.goto("/uploads");

  await page.locator("input[type=\"file\"][accept=\".csv\"]").first().setInputFiles(sampleCsv);

  await expect(page.getByText("Pré-visualização & Importação")).toBeVisible();
  await expect(page.getByText("miles_and_more").first()).toBeVisible();
});

test("UP-02 re-upload shows duplicates summary", async ({ page }) => {
  await mockApi(page, {
    uploadProcess: {
      success: true,
      uploadId: "upload-dup-1",
      rowsTotal: 10,
      rowsImported: 0,
      duplicates: 3,
      monthAffected: "2026-01",
    },
  });
  await page.goto("/uploads");

  await page.locator("input[type=\"file\"][accept=\".csv\"]").first().setInputFiles(sampleCsv);
  await expect(page.getByText("Pré-visualização & Importação")).toBeVisible();

  await page.getByText("Confirmo que revisei a pré-visualização e desejo importar.").click();
  await page.getByRole("button", { name: "Importar" }).click();

  await expect(page.getByText("Resumo da importação")).toBeVisible();
  await expect(page.getByText("Duplicadas")).toBeVisible();
});
