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
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.error || "Request failed");
  }
  
  return res.json();
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
    createdAt: string;
    updatedAt: string;
  }>("/settings"),
  update: (data: { autoConfirmHighConfidence?: boolean; confidenceThreshold?: number }) =>
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
  process: (filename: string, csvContent: string) =>
    fetchApi<{
      success: boolean;
      uploadId: string;
      rowsTotal: number;
      rowsImported: number;
      duplicates: number;
      monthAffected: string;
      errors?: string[];
    }>("/uploads/process", {
      method: "POST",
      body: JSON.stringify({ filename, csvContent }),
    }),
};

// Transactions
export const transactionsApi = {
  list: (month?: string) => fetchApi<any[]>(`/transactions${month ? `?month=${month}` : ""}`),
  confirmQueue: () => fetchApi<any[]>("/transactions/confirm-queue"),
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
