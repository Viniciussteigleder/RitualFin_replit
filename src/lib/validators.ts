import { z } from 'zod';

/**
 * Shared validation schemas and result types for server actions
 */

// ============================================================================
// Result Types
// ============================================================================

export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; errorId?: string; code?: string };

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function error(message: string, errorId?: string, code?: string): Result<never> {
  return { success: false, error: message, errorId, code };
}

// ============================================================================
// Transaction Schemas
// ============================================================================

export const TransactionUpdateSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
  category1: z.string().min(1, 'Category 1 is required'),
  category2: z.string().optional(),
  category3: z.string().optional(),
});

export const TransactionConfirmSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
});

export const TransactionDeleteSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
});

export const BulkConfirmSchema = z.object({
  threshold: z.number().min(0).max(100).default(80),
});

// ============================================================================
// Rule Schemas
// ============================================================================

export const RuleCreateSchema = z.object({
  keyWords: z.string().min(1, 'Keywords are required'),
  keyWordsNegative: z.string().optional(),
  category1: z.string().min(1, 'Category 1 is required'),
  category2: z.string().optional(),
  category3: z.string().optional(),
  type: z.enum(['Despesa', 'Receita']),
  fixVar: z.enum(['Fixo', 'Variável']),
  priority: z.number().int().min(0).max(1000).default(500),
  strict: z.boolean().default(false),
  active: z.boolean().default(true),
  leafId: z.string().optional(),
});

export const RuleUpdateSchema = RuleCreateSchema.partial().extend({
  id: z.string().uuid('Invalid rule ID'),
});

export const RuleDeleteSchema = z.object({
  id: z.string().uuid('Invalid rule ID'),
});

// ============================================================================
// Ingestion Schemas
// ============================================================================

export const FileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['csv', 'screenshot']),
  source: z.enum(['sparkasse', 'amex', 'miles_more', 'other']),
});

export const BatchCommitSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID'),
});

// ============================================================================
// Account Schemas
// ============================================================================

export const AccountCreateSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment']),
  currency: z.string().length(3, 'Currency must be 3-letter code').default('EUR'),
  initialBalance: z.number().default(0),
});

// ============================================================================
// Settings Schemas
// ============================================================================

export const UserSettingsSchema = z.object({
  autoConfirmHighConfidence: z.boolean().default(true),
  confidenceThreshold: z.number().min(0).max(100).default(80),
  defaultCurrency: z.string().length(3).default('EUR'),
  locale: z.enum(['pt-PT', 'pt-BR', 'en-US', 'de-DE']).default('pt-PT'),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate input with Zod schema
 * Returns parsed data or throws AppError
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }
  
  return result.data;
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .slice(0, 1000); // Limit length
}
