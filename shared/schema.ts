import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", ["Despesa", "Receita"]);
export const fixVarEnum = pgEnum("fix_var", ["Fixo", "Variável"]);
export const category1Enum = pgEnum("category_1", [
  "Receitas", "Moradia", "Mercado", "Compras Online", 
  "Transporte", "Saúde", "Lazer", "Outros", "Interno"
]);
export const uploadStatusEnum = pgEnum("upload_status", ["processing", "ready", "duplicate", "error"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Uploads table
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  status: uploadStatusEnum("status").notNull().default("processing"),
  rowsTotal: integer("rows_total").notNull().default(0),
  rowsImported: integer("rows_imported").notNull().default(0),
  monthAffected: text("month_affected"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const uploadsRelations = relations(uploads, ({ one }) => ({
  user: one(users, { fields: [uploads.userId], references: [users.id] }),
}));

export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true });
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

// Rules table (keyword mapping with AI-powered categorization)
// Declared before transactions so transactionsRelations can reference it
export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  keywords: text("keywords").notNull(),
  type: transactionTypeEnum("type").notNull(),
  fixVar: fixVarEnum("fix_var").notNull(),
  category1: category1Enum("category_1").notNull(),
  category2: text("category_2"),
  priority: integer("priority").notNull().default(500),
  strict: boolean("strict").notNull().default(false),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rulesRelations = relations(rules, ({ one }) => ({
  user: one(users, { fields: [rules.userId], references: [users.id] }),
}));

export const insertRuleSchema = createInsertSchema(rules).omit({ id: true, createdAt: true });
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Rule = typeof rules.$inferSelect;

// Transactions table (ledger canonico)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentDate: timestamp("payment_date").notNull(),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  accountSource: text("account_source").notNull().default("M&M"),
  descRaw: text("desc_raw").notNull(),
  descNorm: text("desc_norm").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  foreignAmount: real("foreign_amount"),
  foreignCurrency: text("foreign_currency"),
  exchangeRate: real("exchange_rate"),
  key: text("key").notNull().unique(),
  type: transactionTypeEnum("type"),
  fixVar: fixVarEnum("fix_var"),
  category1: category1Enum("category_1"),
  category2: text("category_2"),
  manualOverride: boolean("manual_override").notNull().default(false),
  internalTransfer: boolean("internal_transfer").notNull().default(false),
  excludeFromBudget: boolean("exclude_from_budget").notNull().default(false),
  needsReview: boolean("needs_review").notNull().default(true),
  ruleIdApplied: varchar("rule_id_applied"),
  uploadId: varchar("upload_id").references(() => uploads.id),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  upload: one(uploads, { fields: [transactions.uploadId], references: [uploads.id] }),
  rule: one(rules, { fields: [transactions.ruleIdApplied], references: [rules.id] }),
}));

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, importedAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Budgets table
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: text("month").notNull(),
  category1: category1Enum("category_1").notNull(),
  amount: real("amount").notNull(),
});

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
}));

export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
