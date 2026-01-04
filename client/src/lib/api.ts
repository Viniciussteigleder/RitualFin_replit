import { queryClient } from "./queryClient";

/**
 * PRODUCTION API BASE URL RESOLVER
 * - Production: Uses VITE_API_URL environment variable (set in Vercel)
 * - Development: Uses relative "/api" (proxied by Vite dev server)
 * - Robust: Handles trailing slashes and /api suffix edge cases
 */
function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL;

  // Development fallback: relative URL (proxied by Vite)
  if (!envUrl) {
    return "/api";
  }

  // Production: construct full backend URL
  // Remove trailing slash if present
  const baseUrl = envUrl.replace(/\/+$/, "");

  // Avoid double /api if user accidentally set it in env var
  if (baseUrl.endsWith("/api")) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
}

const API_BASE = getApiBase();

// Debug log in development (removed in production build)
if (import.meta.env.DEV) {
  console.log("[RitualFin API] Base URL:", API_BASE);
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}: ${res.statusText}` }));

    // Create detailed error message
    let errorMessage = errorData.message || errorData.error || `HTTP ${res.status}: ${res.statusText}`;

    // Add technical details in dev mode
    if (import.meta.env.DEV && errorData.details) {
      errorMessage += `\n\nDetalhes técnicos:\n${JSON.stringify(errorData.details, null, 2)}`;
    }

    const error: any = new Error(errorMessage);
    error.status = res.status;
    error.statusText = res.statusText;
    error.details = errorData;
    throw error;
  }

  return res.json();
}

async function fetchBlob(endpoint: string, options?: RequestInit): Promise<Blob> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.error || "Request failed");
  }

  return res.blob();
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    fetchApi<{ success: boolean; user: { id: string; username: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => fetchApi<{ id: string; username: string }>("/auth/me"),
};

// Settings
export const settingsApi = {
  get: () => fetchApi<{
    id: string;
    userId: string;
    autoConfirmHighConfidence: boolean;
    confidenceThreshold: number;
    language?: string | null;
    currency?: string | null;
    fiscalRegion?: string | null;
    notifyImportStatus?: boolean | null;
    notifyReviewQueue?: boolean | null;
    notifyMonthlyReport?: boolean | null;
    createdAt: string;
    updatedAt: string;
  }>("/settings"),
  update: (data: {
    autoConfirmHighConfidence?: boolean;
    confidenceThreshold?: number;
    language?: string;
    currency?: string;
    fiscalRegion?: string;
    notifyImportStatus?: boolean;
    notifyReviewQueue?: boolean;
    notifyMonthlyReport?: boolean;
  }) =>
    fetchApi<any>("/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Accounts
export const accountsApi = {
  list: () => fetchApi<any[]>("/accounts"),
  get: (id: string) => fetchApi<any>(`/accounts/${id}`),
  create: (data: any) =>
    fetchApi<any>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/accounts/${id}`, {
      method: "DELETE",
    }),
};

// Uploads
export const uploadsApi = {
  list: () => fetchApi<any[]>("/uploads"),
  errors: (id: string) => fetchApi<{ uploadId: string; errors: Array<{ rowNumber: number; errorMessage: string }>; count: number }>(`/uploads/${id}/errors`),
  diagnostics: (id: string) => fetchApi<any>(`/uploads/${id}/diagnostics`),
  preview: async (
    filename: string,
    csvContent: string,
    encoding?: string,
    fileBase64?: string,
    fileType?: string,
    importDate?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/imports/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, csvContent, encoding, fileBase64, fileType, importDate }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}: Erro ao gerar pré-visualização` }));

        let errorMessage = errorData.message || errorData.error || `Erro HTTP ${res.status}`;

        // Add backend error details if available
        if (errorData.details) {
          errorMessage += `\n\nDetalhes: ${JSON.stringify(errorData.details, null, 2)}`;
        }

        const error: any = new Error(errorMessage);
        error.status = res.status;
        error.details = errorData;
        throw error;
      }
      return res.json();
    } catch (error) {
      // Network errors (backend down, CORS, timeout)
      if (error instanceof TypeError) {
        const networkError: any = new Error(
          error.message === 'Failed to fetch'
            ? `Não foi possível conectar ao servidor.\n\nVerifique se o backend está rodando.\n\n${import.meta.env.DEV ? `API URL: ${API_BASE}` : 'Servidor indisponível'}`
            : `Erro de rede: ${error.message}`
        );
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },
  process: async (
    filename: string,
    csvContent: string,
    encoding?: string,
    fileBase64?: string,
    fileType?: string,
    importDate?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/uploads/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, csvContent, encoding, fileBase64, fileType, importDate }),
      });
      const payload = await res.json().catch(() => ({
        message: `HTTP ${res.status}: Erro ao processar importação`,
        error: res.statusText
      }));

      if (!res.ok) {
        let errorMessage = payload.message || payload.error || `Erro HTTP ${res.status}`;

        // Add detailed error information
        if (payload.details) {
          errorMessage += `\n\nDetalhes:\n${JSON.stringify(payload.details, null, 2)}`;
        }
        if (payload.diagnostics) {
          errorMessage += `\n\nDiagnóstico:\n${JSON.stringify(payload.diagnostics, null, 2)}`;
        }

        const error: any = new Error(errorMessage);
        error.status = res.status;
        error.details = payload;
        throw error;
      }
      return payload as {
        success: boolean;
        uploadId: string;
        rowsTotal: number;
        rowsImported: number;
        duplicates: number;
        monthAffected: string;
        autoClassified?: number;
        openCount?: number;
        errors?: string[];
        meta?: any;
        diagnostics?: any;
        error?: any;
      };
    } catch (error) {
      // Network errors (backend down, CORS, timeout)
      if (error instanceof TypeError) {
        const networkError: any = new Error(
          error.message === 'Failed to fetch'
            ? `Não foi possível conectar ao servidor.\n\nVerifique se o backend está rodando.\n\n${import.meta.env.DEV ? `API URL: ${API_BASE}` : 'Servidor indisponível'}`
            : `Erro de rede: ${error.message}`
        );
        networkError.status = 0;
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },
};

// Classification & Aliases
export const classificationApi = {
  exportExcel: () => fetchBlob("/classification/export"),
  exportCsv: () => fetchBlob("/classification/export-csv"),
  exportCsvTemplate: () => fetchBlob("/classification/template-csv"),
  previewImport: (fileBase64: string) =>
    fetchApi<any>("/classification/import/preview", {
      method: "POST",
      body: JSON.stringify({ fileBase64 }),
    }),
  applyImport: (fileBase64: string, confirmRemap?: boolean) =>
    fetchApi<any>("/classification/import/apply", {
      method: "POST",
      body: JSON.stringify({ fileBase64, confirmRemap }),
    }),
  ruleTest: (keyDesc: string) =>
    fetchApi<any>("/classification/rule-test", {
      method: "POST",
      body: JSON.stringify({ keyDesc }),
    }),
  listLeaves: () => fetchApi<any[]>("/classification/leaves"),
  listRules: () => fetchApi<any[]>("/classification/rules"),
  appendRuleKeywords: (data: { leafId: string; expressions: string }) =>
    fetchApi<any>("/classification/rules/append", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  appendRuleNegativeKeywords: (data: { leafId: string; expressions: string }) =>
    fetchApi<any>("/classification/rules/append-negative", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  reviewQueue: () => fetchApi<any[]>("/classification/review-queue"),
  assignReview: (data: { transactionId: string; leafId: string; ruleId?: string; newExpression?: string; createRule?: boolean }) =>
    fetchApi<any>("/classification/review/assign", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// AI Keywords
export type AiKeywordSuggestion = {
  keyword: string;
  suggestedCategory: string;
  suggestedCategory2?: string;
  suggestedCategory3?: string;
  suggestedType: "Despesa" | "Receita";
  suggestedFixVar: "Fixo" | "Variável";
  confidence: number;
  reason: string;
  count?: number;
  total?: number;
  samples?: string[];
  leafId?: string;
};

export const aiKeywordsApi = {
  analyze: () =>
    fetchApi<{ suggestions: AiKeywordSuggestion[]; total?: number; message?: string }>(
      "/ai/analyze-keywords",
      { method: "POST", body: JSON.stringify({}) }
    ),
  apply: (suggestions: AiKeywordSuggestion[]) =>
    fetchApi<{ rulesCreated: number; transactionsUpdated: number }>("/ai/apply-suggestions", {
      method: "POST",
      body: JSON.stringify({ suggestions }),
    }),
};

// Categories (shell-only)
export const categoriesApi = {
  list: async () => [] as Array<{ id: string; category1: string; category2: string; category3?: string | null }>,
  create: async (_data: { category1: string; category2: string; category3?: string | null }) => {
    throw new Error("Categorias indisponíveis nesta versão.");
  },
  update: async (_id: string, _data: { category1: string; category2: string; category3?: string | null }) => {
    throw new Error("Categorias indisponíveis nesta versão.");
  },
  delete: async (_id: string) => {
    throw new Error("Categorias indisponíveis nesta versão.");
  },
};

// Merchant metadata
export const merchantMetadataApi = {
  list: () => fetchApi<any[]>("/merchant-metadata"),
  create: (data: { pattern: string; friendlyName: string; icon: string; color: string }) =>
    fetchApi<any>("/merchant-metadata", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { pattern: string; friendlyName: string; icon: string; color: string }) =>
    fetchApi<any>(`/merchant-metadata/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<void>(`/merchant-metadata/${id}`, { method: "DELETE" }),
};

export const aliasApi = {
  exportExcel: () => fetchBlob("/aliases/export"),
  exportKeyDescCsv: () => fetchBlob("/aliases/key-desc/export-csv"),
  exportKeyDescTemplateCsv: () => fetchBlob("/aliases/key-desc/template-csv"),
  exportAssetsCsv: () => fetchBlob("/aliases/assets/export-csv"),
  exportAssetsTemplateCsv: () => fetchBlob("/aliases/assets/template-csv"),
  exportLogosTemplate: () => fetchBlob("/aliases/logos/template"),
  previewImport: (fileBase64: string) =>
    fetchApi<any>("/aliases/import/preview", {
      method: "POST",
      body: JSON.stringify({ fileBase64 }),
    }),
  applyImport: (fileBase64: string) =>
    fetchApi<any>("/aliases/import/apply", {
      method: "POST",
      body: JSON.stringify({ fileBase64 }),
    }),
  importLogos: (fileBase64: string) =>
    fetchApi<any>("/aliases/logos/import", {
      method: "POST",
      body: JSON.stringify({ fileBase64 }),
    }),
  test: (keyDesc: string) =>
    fetchApi<any>("/aliases/test", {
      method: "POST",
      body: JSON.stringify({ keyDesc }),
    }),
  refreshLogos: (force?: boolean) =>
    fetchApi<any>("/aliases/refresh-logos", {
      method: "POST",
      body: JSON.stringify({ force }),
    }),
};

export const dataImportsApi = {
  preview: async (payload: { dataset: string; filename: string; fileBase64: string; confirmRemap?: boolean }) => {
    const res = await fetch(`${API_BASE}/data-imports/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({ message: "Request failed" }));
    if (!res.ok) {
      return data;
    }
    return data;
  },
  confirm: (payload: { importId: string; confirmRemap?: boolean }) =>
    fetchApi<any>("/data-imports/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  last: (dataset: string) => fetchApi<any>(`/data-imports/last?dataset=${encodeURIComponent(dataset)}`),
};

export const importConflictsApi = {
  resolve: (payload: { uploadId: string; action: "keep" | "replace"; duplicateCount?: number }) =>
    fetchApi<any>("/imports/conflicts/resolve", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const resetApi = {
  resetData: () => fetchApi<any>("/settings/reset", { method: "POST" }),
  deleteData: (data: { deleteTransactions?: boolean; deleteCategories?: boolean; deleteAliases?: boolean; deleteAll?: boolean }) =>
    fetchApi<any>("/settings/delete-data", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const auditLogsApi = {
  list: (limit = 200) => fetchApi<any[]>(`/audit-logs?limit=${limit}`),
  exportCsv: () => fetchBlob("/audit-logs/export-csv"),
};

// Transactions
export const transactionsApi = {
  list: (month?: string) => fetchApi<any[]>(`/transactions${month ? `?month=${month}` : ""}`),
  confirmQueue: () => fetchApi<any[]>("/classification/review-queue"),
  update: (id: string, data: any) =>
    fetchApi<any>(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  confirm: (ids: string[], data: any) =>
    fetchApi<{ success: boolean; count: number; ruleCreated?: boolean; ruleId?: string }>("/transactions/confirm", {
      method: "POST",
      body: JSON.stringify({ ids, ...data }),
    }),
};

// Rules
export const rulesApi = {
  list: () => fetchApi<any[]>("/rules"),
  create: (data: any) =>
    fetchApi<any>("/rules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/rules/${id}`, {
      method: "DELETE",
    }),
  apply: (id: string) =>
    fetchApi<{ success: boolean; appliedCount: number }>(`/rules/${id}/apply`, {
      method: "POST",
    }),
  reapplyAll: () =>
    fetchApi<{ success: boolean; total: number; categorized: number; stillPending: number }>("/rules/reapply-all", {
      method: "POST",
    }),
  seed: () =>
    fetchApi<{ success: boolean; count: number }>("/rules/seed", {
      method: "POST",
    }),
};

// Merchant Dictionary
export const merchantDictionaryApi = {
  // Merchant Descriptions
  listDescriptions: (filters?: { source?: string; search?: string; isManual?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.source) params.append("source", filters.source);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.isManual !== undefined) params.append("isManual", String(filters.isManual));
    const query = params.toString();
    return fetchApi<any[]>(`/merchant-descriptions${query ? `?${query}` : ""}`);
  },
  createDescription: (data: { source: string; keyDesc: string; aliasDesc: string }) =>
    fetchApi<any>("/merchant-descriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDescription: (id: string, data: { aliasDesc: string }) =>
    fetchApi<any>(`/merchant-descriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteDescription: (id: string) =>
    fetchApi<{ success: boolean }>(`/merchant-descriptions/${id}`, {
      method: "DELETE",
    }),
  exportDescriptions: () =>
    fetchApi<any[]>("/merchant-descriptions/export"),

  // Merchant Icons
  listIcons: (filters?: { needsFetch?: boolean; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.needsFetch !== undefined) params.append("needsFetch", String(filters.needsFetch));
    if (filters?.search) params.append("search", filters.search);
    const query = params.toString();
    return fetchApi<any[]>(`/merchant-icons${query ? `?${query}` : ""}`);
  },
  updateIcon: (aliasDesc: string, data: Partial<{ shouldFetchIcon: boolean; iconSourceUrl: string; iconLocalPath: string }>) =>
    fetchApi<any>(`/merchant-icons/${encodeURIComponent(aliasDesc)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Dashboard
export const dashboardApi = {
  get: (month?: string) =>
    fetchApi<{
      spentByCategory: { category: string; amount: number }[];
      totalSpent: number;
      totalIncome: number;
      pendingReviewCount: number;
      fixedExpenses: number;
      variableExpenses: number;
      month: string;
    }>(`/dashboard${month ? `?month=${month}` : ""}`),
};

// Budgets
export const budgetsApi = {
  list: (month?: string) => fetchApi<any[]>(`/budgets${month ? `?month=${month}` : ""}`),
  create: (data: { month: string; category1: string; amount: number }) =>
    fetchApi<any>("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { amount?: number }) =>
    fetchApi<any>(`/budgets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/budgets/${id}`, {
      method: "DELETE",
    }),
};

// Goals
export const goalsApi = {
  list: (month?: string) =>
    fetchApi<{
      goals: Array<{
        id: string;
        userId: string;
        month: string;
        estimatedIncome: number;
        totalPlanned: number;
        createdAt: string;
      }>;
    }>(`/goals${month ? `?month=${month}` : ""}`),
  create: (data: { month: string; estimatedIncome: number; totalPlanned: number }) =>
    fetchApi<{
      id: string;
      userId: string;
      month: string;
      estimatedIncome: number;
      totalPlanned: number;
      createdAt: string;
    }>("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { estimatedIncome?: number; totalPlanned?: number }) =>
    fetchApi<any>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean; deletedGoalId: string; deletedCategoryGoalsCount: number }>(
      `/goals/${id}`,
      {
        method: "DELETE",
      }
    ),
  getProgress: (id: string) =>
    fetchApi<{
      goal: {
        id: string;
        month: string;
        estimatedIncome: number;
        totalPlanned: number;
      };
      progress: {
        totalActualSpent: number;
        totalTarget: number;
        remainingBudget: number;
        percentSpent: number;
        categories: Array<{
          category1: string;
          targetAmount: number;
          actualSpent: number;
          remaining: number;
          percentSpent: number;
          status: "under" | "over" | "on-track";
        }>;
      };
    }>(`/goals/${id}/progress`),
};

// Category Goals
export const categoryGoalsApi = {
  list: (goalId: string) =>
    fetchApi<{
      categoryGoals: Array<{
        id: string;
        goalId: string;
        category1: string;
        targetAmount: number;
        previousMonthSpent: number | null;
        averageSpent: number | null;
      }>;
    }>(`/goals/${goalId}/categories`),
  create: (
    goalId: string,
    data: {
      category1: string;
      targetAmount: number;
      previousMonthSpent?: number | null;
      averageSpent?: number | null;
    }
  ) =>
    fetchApi<any>(`/goals/${goalId}/categories`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean; deletedCategoryGoalId: string }>(`/category-goals/${id}`, {
      method: "DELETE",
    }),
};

// Rituals
export const ritualsApi = {
  list: (type?: string, period?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (period) params.append("period", period);
    const query = params.toString();
    return fetchApi<{
      rituals: Array<{
        id: string;
        userId: string;
        type: string;
        period: string;
        completedAt: string | null;
        notes: string | null;
        createdAt: string;
      }>;
    }>(`/rituals${query ? `?${query}` : ""}`);
  },
  create: (data: { type: string; period: string; completedAt?: string | null; notes?: string | null }) =>
    fetchApi<{
      id: string;
      userId: string;
      type: string;
      period: string;
      completedAt: string | null;
      notes: string | null;
      createdAt: string;
    }>("/rituals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { type?: string; period?: string; completedAt?: string | null; notes?: string | null }) =>
    fetchApi<any>(`/rituals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/rituals/${id}`, {
      method: "DELETE",
    }),
  complete: (id: string, notes?: string) =>
    fetchApi<{
      id: string;
      userId: string;
      type: string;
      period: string;
      completedAt: string | null;
      notes: string | null;
      createdAt: string;
    }>(`/rituals/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),
};

// Calendar Events
export const calendarEventsApi = {
  list: () => fetchApi<any[]>("/calendar-events"),
  get: (id: string) => fetchApi<any>(`/calendar-events/${id}`),
  create: (data: any) =>
    fetchApi<any>("/calendar-events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/calendar-events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/calendar-events/${id}`, {
      method: "DELETE",
    }),
};

// Event Occurrences
export const eventOccurrencesApi = {
  list: (eventId: string) =>
    fetchApi<any[]>(`/calendar-events/${eventId}/occurrences`),
  create: (data: { eventId: string; date: string; amount: number; status?: string; transactionId?: string }) =>
    fetchApi<any>("/event-occurrences", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { status?: string; transactionId?: string }) =>
    fetchApi<any>(`/event-occurrences/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
