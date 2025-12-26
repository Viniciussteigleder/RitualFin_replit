import { Transaction, UploadRecord, MonthlyBudget } from "./types";
import { addDays, format, subDays } from "date-fns";

// Mock Uploads
export const MOCK_UPLOADS: UploadRecord[] = [
  {
    id: 'u-1',
    filename: '2025_01_Transactions.csv',
    status: 'ready',
    rows_total: 45,
    rows_imported: 45,
    month_affected: '2025-01',
    created_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'u-2',
    filename: '2025_02_Partial.csv',
    status: 'error',
    rows_total: 0,
    rows_imported: 0,
    month_affected: '2025-02',
    created_at: subDays(new Date(), 0).toISOString(),
    error_message: 'Colunas obrigatórias faltando: "Processed on"',
  },
  {
    id: 'u-3',
    filename: 'duplicate_check.csv',
    status: 'duplicate',
    rows_total: 12,
    rows_imported: 0,
    month_affected: '2025-01',
    created_at: subDays(new Date(), 5).toISOString(),
  }
];

// Mock Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    payment_date: '2025-01-15',
    imported_at: '2025-01-16T10:00:00Z',
    account_source: 'M&M',
    desc_raw: 'REWE Sagl -- Card Payment',
    desc_norm: 'rewe sagl card payment',
    amount: -45.50,
    currency: 'EUR',
    key: 'k1',
    type: 'Despesa',
    fix_var: 'Variável',
    category_1: 'Mercado',
    manual_override: false,
    internal_transfer: false,
    exclude_from_budget: false,
    needs_review: false,
    status_display: 'Processed'
  },
  {
    id: 't-2',
    payment_date: '2025-01-16',
    imported_at: '2025-01-16T10:00:00Z',
    account_source: 'M&M',
    desc_raw: 'Netflix Subscription',
    desc_norm: 'netflix subscription',
    amount: -12.99,
    currency: 'EUR',
    key: 'k2',
    type: 'Despesa',
    fix_var: 'Fixo',
    category_1: 'Lazer',
    manual_override: false,
    internal_transfer: false,
    exclude_from_budget: false,
    needs_review: false,
    status_display: 'Processed'
  },
  {
    id: 't-3',
    payment_date: '2025-01-20',
    imported_at: '2025-01-21T10:00:00Z',
    account_source: 'M&M',
    desc_raw: 'Unknown Merchant 123',
    desc_norm: 'unknown merchant 123',
    amount: -89.00,
    currency: 'EUR',
    key: 'k3',
    type: null,
    fix_var: null,
    category_1: null,
    manual_override: false,
    internal_transfer: false,
    exclude_from_budget: false,
    needs_review: true,
    status_display: 'Pending'
  },
  {
    id: 't-4',
    payment_date: '2025-01-22',
    imported_at: '2025-01-22T10:00:00Z',
    account_source: 'M&M',
    desc_raw: 'ATM Withdrawal Berlin',
    desc_norm: 'atm withdrawal berlin',
    amount: -200.00,
    currency: 'EUR',
    key: 'k4',
    type: 'Despesa',
    fix_var: 'Variável',
    category_1: 'Outros',
    category_2: 'Saque',
    manual_override: false,
    internal_transfer: false,
    exclude_from_budget: true,
    needs_review: false,
    status_display: 'Processed'
  },
  {
    id: 't-5',
    payment_date: '2025-01-25',
    imported_at: '2025-01-26T10:00:00Z',
    account_source: 'M&M',
    desc_raw: 'Amazon DE Marketplace',
    desc_norm: 'amazon de marketplace',
    amount: -34.20,
    currency: 'EUR',
    key: 'k5',
    type: 'Despesa',
    fix_var: 'Variável',
    category_1: 'Compras Online',
    manual_override: false,
    internal_transfer: false,
    exclude_from_budget: false,
    needs_review: true, // Needs confirmation
    status_display: 'Processed'
  }
];

export const MOCK_BUDGET: MonthlyBudget = {
  month: '2025-01',
  spent_so_far: 1450.50,
  remaining: 549.50,
  total_budget: 2000.00,
  expected_fixed_remaining: 150.00,
  variable_run_rate: 45.00,
  projection: 2150.00 // Projected overspend
};
