import { queryClient } from "./queryClient";

const API_BASE = "/api";

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

// Uploads
export const uploadsApi = {
  list: () => fetchApi<any[]>("/uploads"),
  create: (data: { filename: string; rowsTotal: number; monthAffected: string }) =>
    fetchApi<any>("/uploads", {
      method: "POST",
      body: JSON.stringify(data),
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
    fetchApi<{ success: boolean; count: number }>("/transactions/confirm", {
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
};

// Dashboard
export const dashboardApi = {
  get: (month?: string) =>
    fetchApi<{
      spentByCategory: { category: string; amount: number }[];
      totalSpent: number;
      totalIncome: number;
      pendingReviewCount: number;
      month: string;
    }>(`/dashboard${month ? `?month=${month}` : ""}`),
};

// Budgets
export const budgetsApi = {
  list: (month?: string) => fetchApi<any[]>(`/budgets${month ? `?month=${month}` : ""}`),
};
