import { z } from "zod";

// ==================== FILE UPLOAD VALIDATION ====================

export const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((f) => f.size <= 10_000_000, {
      message: "Ficheiro muito grande. Tamanho máximo: 10MB",
    })
    .refine(
      (f) => [
        "text/csv",
        "application/vnd.ms-excel",
        "application/csv",
        "text/plain"
      ].includes(f.type),
      {
        message: "Formato inválido. Use ficheiros CSV (.csv)",
      }
    ),
});

// ==================== TRANSACTION VALIDATION ====================

export const TransactionUpdateSchema = z.object({
  category1: z.string().optional(),
  category2: z.string().optional(),
  category3: z.string().optional(),
  aliasDesc: z.string().optional(),
  needsReview: z.boolean().optional(),
  manualOverride: z.boolean().optional(),
});

export const TransactionConfirmSchema = z.object({
  transactionId: z.string().uuid("ID de transação inválido"),
});

export const TransactionDeleteSchema = z.object({
  transactionId: z.string().uuid("ID de transação inválido"),
});

// ==================== RULE VALIDATION ====================

export const RuleCreateSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo (máx 100 caracteres)"),
  keywords: z.string()
    .min(1, "Palavras-chave são obrigatórias")
    .max(500, "Palavras-chave muito longas"),
  category1: z.string()
    .min(1, "Categoria é obrigatória"),
  category2: z.string().optional(),
  category3: z.string().optional(),
  type: z.enum(["Despesa", "Receita"]),
  fixVar: z.enum(["Fixo", "Variável"]),
  priority: z.number().int().min(0).max(1000).optional(),
  strict: z.boolean().optional(),
});

export const RuleSimulateSchema = z.object({
  keyword: z.string()
    .min(1, "Palavra-chave é obrigatória")
    .max(100, "Palavra-chave muito longa"),
});

// ==================== CALENDAR EVENT VALIDATION ====================

export const CalendarEventCreateSchema = z.object({
  name: z.string()
    .min(1, "Nome do evento é obrigatório")
    .max(200, "Nome muito longo"),
  amount: z.number()
    .positive("Valor deve ser positivo"),
  category1: z.string()
    .min(1, "Categoria é obrigatória"),
  category2: z.string().optional(),
  recurrence: z.enum(["none", "weekly", "monthly", "yearly"]),
  nextDueDate: z.coerce.date(),
  accountId: z.string().uuid().optional(),
});

// ==================== ACCOUNT VALIDATION ====================

export const AccountCreateSchema = z.object({
  name: z.string()
    .min(1, "Nome da conta é obrigatório")
    .max(100, "Nome muito longo"),
  institution: z.string().optional(),
  type: z.enum(["credit_card", "debit_card", "bank_account", "cash"]),
  accountNumber: z.string().optional(),
  currencyDefault: z.string().default("EUR"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida").optional(),
  icon: z.string().optional(),
});

// ==================== BUDGET VALIDATION ====================

export const BudgetCreateSchema = z.object({
  month: z.string()
    .regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (use YYYY-MM)"),
  category1: z.string()
    .min(1, "Categoria é obrigatória"),
  amount: z.number()
    .positive("Valor deve ser positivo"),
});

// ==================== ALIAS VALIDATION ====================

export const AliasCreateSchema = z.object({
  aliasDesc: z.string()
    .min(1, "Nome do alias é obrigatório")
    .max(200, "Nome muito longo"),
  keyWordsAlias: z.string()
    .min(1, "Palavras-chave são obrigatórias"),
  logoUrl: z.string().url("URL inválida").optional(),
  priority: z.number().int().min(0).max(1000).optional(),
});

// ==================== SETTINGS VALIDATION ====================

export const SettingsUpdateSchema = z.object({
  autoConfirmHighConfidence: z.boolean().optional(),
  confidenceThreshold: z.number().int().min(0).max(100).optional(),
  language: z.enum(["pt-PT", "pt-BR", "en-US"]).optional(),
  currency: z.string().default("EUR").optional(),
  fiscalRegion: z.string().optional(),
  notifyImportStatus: z.boolean().optional(),
  notifyReviewQueue: z.boolean().optional(),
  notifyMonthlyReport: z.boolean().optional(),
});

// ==================== RESULT TYPE ====================

/**
 * Standard result type for server actions
 * Use this for consistent error handling across the app
 */
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper to create success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper to create error result
 */
export function error<E = string>(error: E): Result<never, E> {
  return { success: false, error };
}
