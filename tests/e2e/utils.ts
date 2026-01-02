import type { Page, Route } from "@playwright/test";

export type ApiOverrides = {
  settings?: Record<string, any>;
  dashboard?: Record<string, any>;
  transactions?: any[];
  accounts?: any[];
  uploads?: any[];
  uploadPreview?: Record<string, any>;
  uploadProcess?: Record<string, any>;
  dataImportsPreview?: Record<string, any>;
  rules?: any[];
  onTransactionUpdate?: (payload: any) => void;
  onSettingsUpdate?: (payload: any) => void;
};

const nowIso = () => new Date().toISOString();

const defaultSettings = () => ({
  id: "settings-1",
  userId: "demo",
  autoConfirmHighConfidence: false,
  confidenceThreshold: 80,
  language: "pt-BR",
  currency: "EUR",
  fiscalRegion: "BR",
  notifyImportStatus: true,
  notifyReviewQueue: true,
  notifyMonthlyReport: true,
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const defaultDashboard = () => ({
  spentByCategory: [],
  totalSpent: 0,
  totalIncome: 0,
  pendingReviewCount: 0,
  fixedExpenses: 0,
  variableExpenses: 0,
  month: "2026-01",
});

const defaultUploadPreview = () => ({
  success: true,
  format: "miles_and_more",
  rows: [],
  meta: {
    delimiter: ";",
    dateFormat: "dd.MM.yy",
    headersFound: ["bookingDate", "amount", "descRaw"],
  },
});

const defaultUploadProcess = () => ({
  success: true,
  uploadId: "upload-1",
  rowsTotal: 10,
  rowsImported: 10,
  duplicates: 0,
  monthAffected: "2026-01",
});

const defaultDataImportPreview = () => ({
  success: true,
  importId: "import-1",
  rowsTotal: 5,
  rowsValid: 5,
  detectedEncoding: "utf-8",
  detectedDelimiter: ";",
  headerFound: ["category1", "keywords"],
  diff: {
    newLeavesCount: 0,
    removedLeavesCount: 0,
    updatedRulesCount: 0,
    updatedRulesSample: [],
  },
  previewRows: [],
  requiresRemap: false,
});

const fulfillJson = (route: Route, payload: any, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(payload),
  });

const safePostData = (route: Route) => {
  try {
    return route.request().postDataJSON();
  } catch {
    return null;
  }
};

export async function mockApi(page: Page, overrides: ApiOverrides = {}) {
  const settings = { ...defaultSettings(), ...overrides.settings };
  const dashboard = { ...defaultDashboard(), ...overrides.dashboard };
  const transactions = overrides.transactions ?? [];
  const accounts = overrides.accounts ?? [];
  const uploads = overrides.uploads ?? [];
  const rules = overrides.rules ?? [];
  const uploadPreview = { ...defaultUploadPreview(), ...overrides.uploadPreview };
  const uploadProcess = { ...defaultUploadProcess(), ...overrides.uploadProcess };
  const dataImportsPreview = { ...defaultDataImportPreview(), ...overrides.dataImportsPreview };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method().toUpperCase();
    const apiIndex = url.pathname.indexOf("/api");
    const path = apiIndex >= 0 ? url.pathname.slice(apiIndex + 4) : url.pathname;

    if (method === "POST" && path === "/auth/login") {
      return fulfillJson(route, { success: true, user: { id: "demo", username: "demo" } });
    }

    if (method === "GET" && path === "/auth/me") {
      return fulfillJson(route, { id: "demo", username: "demo" });
    }

    if (path === "/settings" && method === "GET") {
      return fulfillJson(route, settings);
    }

    if (path === "/settings" && method === "PATCH") {
      const payload = safePostData(route) || {};
      overrides.onSettingsUpdate?.(payload);
      return fulfillJson(route, { ...settings, ...payload, updatedAt: nowIso() });
    }

    if (path === "/dashboard" && method === "GET") {
      return fulfillJson(route, dashboard);
    }

    if (path === "/transactions" && method === "GET") {
      return fulfillJson(route, transactions);
    }

    if (path.startsWith("/transactions/") && method === "PATCH") {
      const payload = safePostData(route) || {};
      overrides.onTransactionUpdate?.(payload);
      return fulfillJson(route, { ...payload, id: path.split("/").pop() });
    }

    if (path === "/uploads" && method === "GET") {
      return fulfillJson(route, uploads);
    }

    if (path === "/uploads/last-by-account" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/calendar-events" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/imports/preview" && method === "POST") {
      return fulfillJson(route, uploadPreview);
    }

    if (path === "/uploads/process" && method === "POST") {
      return fulfillJson(route, uploadProcess);
    }

    if (path === "/data-imports/preview" && method === "POST") {
      return fulfillJson(route, dataImportsPreview);
    }

    if (path.startsWith("/data-imports/last") && method === "GET") {
      return fulfillJson(route, null);
    }

    if (path === "/classification/review-queue" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/classification/leaves" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/classification/rules" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/rules" && method === "GET") {
      return fulfillJson(route, rules);
    }

    if (path === "/accounts" && method === "GET") {
      return fulfillJson(route, accounts);
    }

    if (path === "/budgets" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/goals" && method === "GET") {
      return fulfillJson(route, { goals: [] });
    }

    if (path === "/rituals" && method === "GET") {
      return fulfillJson(route, { rituals: [] });
    }

    if (path === "/merchant-icons" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/merchant-descriptions" && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path.startsWith("/merchant-descriptions/") && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path.startsWith("/audit-logs") && method === "GET") {
      return fulfillJson(route, []);
    }

    if (path === "/version" && method === "GET") {
      return fulfillJson(route, {
        service: "ritualfin-api",
        gitSha: "local",
        buildTime: nowIso(),
        env: "test",
      });
    }

    if (path === "/health" && method === "GET") {
      return fulfillJson(route, {
        status: "ok",
        timestamp: nowIso(),
        database: "ok",
        version: "local",
      });
    }

    return fulfillJson(route, { success: true });
  });
}

export async function dismissOnboarding(page: Page) {
  const skip = page.getByRole("button", { name: "Pular introdução" });
  try {
    await skip.waitFor({ state: "visible", timeout: 2000 });
    await skip.click();
    await skip.waitFor({ state: "hidden" });
  } catch {
    // no onboarding dialog
  }
}
