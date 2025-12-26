
export type TransactionType = 'Despesa' | 'Receita';
export type FixVar = 'Fixo' | 'Variável';

export type Category1 = 
  | 'Receitas'
  | 'Moradia'
  | 'Mercado'
  | 'Compras Online'
  | 'Transporte'
  | 'Saúde'
  | 'Lazer'
  | 'Outros'
  | 'Interno';

export interface Transaction {
  id: string;
  payment_date: string; // ISO Date
  imported_at: string;
  account_source: 'M&M';
  desc_raw: string;
  desc_norm: string;
  amount: number;
  currency: 'EUR';
  key: string;
  
  // Categorization
  type: TransactionType | null;
  fix_var: FixVar | null;
  category_1: Category1 | null;
  category_2?: string | null;
  
  // Flags
  manual_override: boolean;
  internal_transfer: boolean;
  exclude_from_budget: boolean;
  needs_review: boolean;
  rule_id_applied?: string | null;
  
  // Display helpers
  status_display?: 'Processed' | 'Pending';
}

export interface UploadRecord {
  id: string;
  filename: string;
  status: 'processing' | 'ready' | 'duplicate' | 'error';
  rows_total: number;
  rows_imported: number;
  month_affected: string; // YYYY-MM
  created_at: string;
  error_message?: string;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  spent_so_far: number;
  remaining: number;
  total_budget: number;
  expected_fixed_remaining: number;
  variable_run_rate: number; // Daily average
  projection: number;
}
