import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp, pgEnum, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", ["Despesa", "Receita"]);
export const fixVarEnum = pgEnum("fix_var", ["Fixo", "Variável"]);
export const category1Enum = pgEnum("category_1", [
  "Receitas", "Moradia", "Mercado", "Compras Online",
  "Transporte", "Saúde", "Lazer", "Viagem", "Roupas",
  "Tecnologia", "Alimentação", "Energia", "Internet",
  "Educação", "Presentes", "Streaming", "Academia",
  "Investimentos", "Outros", "Interno"
]);
export const uploadStatusEnum = pgEnum("upload_status", ["processing", "ready", "duplicate", "error"]);
export const accountTypeEnum = pgEnum("account_type", ["credit_card", "debit_card", "bank_account", "cash"]);
export const transactionSourceEnum = pgEnum("transaction_source", ["Sparkasse", "Amex", "M&M"]);
export type TransactionSource = typeof transactionSourceEnum.enumValues[number];
export const transactionStatusEnum = pgEnum("transaction_status", ["FINAL", "OPEN"]);
export const transactionClassifiedByEnum = pgEnum("transaction_classified_by", ["AUTO_KEYWORDS", "MANUAL", "AI_SUGGESTION"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"), // Legacy plaintext field
  passwordHash: text("password_hash"), // Secure hashed password
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  passwordHash: true,
  email: true,
  googleId: true,
}).partial({ passwordHash: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Settings table (user preferences)
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  autoConfirmHighConfidence: boolean("auto_confirm_high_confidence").notNull().default(false),
  confidenceThreshold: integer("confidence_threshold").notNull().default(80),
  language: text("language").notNull().default("pt-BR"),
  currency: text("currency").notNull().default("EUR"),
  fiscalRegion: text("fiscal_region").notNull().default("Portugal/PT"),
  notifyImportStatus: boolean("notify_import_status").notNull().default(true),
  notifyReviewQueue: boolean("notify_review_queue").notNull().default(true),
  notifyMonthlyReport: boolean("notify_monthly_report").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, { fields: [settings.userId], references: [users.id] }),
}));

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, createdAt: true, updatedAt: true });
export const updateSettingsSchema = insertSettingsSchema.partial();
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = z.infer<typeof updateSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// AI Usage Logs (safe metadata only)
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"),
  featureTag: text("feature_tag").notNull(),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  costEstimateUsd: real("cost_estimate_usd"),
  status: text("status").notNull().default("success"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, { fields: [aiUsageLogs.userId], references: [users.id] }),
}));

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({ id: true, createdAt: true });
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  status: text("status").notNull().default("success"),
  message: text("message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Notifications (in-app only)
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, updatedAt: true });
export const updateNotificationSchema = insertNotificationSchema.partial();
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Accounts table (credit cards, bank accounts, etc.)
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  accountNumber: text("account_number"), // Last 4 digits or identifier
  icon: text("icon").default("credit-card"),
  color: text("color").default("#6366f1"), // Indigo-500
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

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

// Upload Errors table (row-level parsing errors)
export const uploadErrors = pgTable("upload_errors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uploadId: varchar("upload_id").notNull().references(() => uploads.id, { onDelete: "cascade" }),
  rowNumber: integer("row_number").notNull(),
  errorMessage: text("error_message").notNull(),
  rawData: text("raw_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const uploadErrorsRelations = relations(uploadErrors, ({ one }) => ({
  upload: one(uploads, { fields: [uploadErrors.uploadId], references: [uploads.id] }),
}));

export const insertUploadErrorSchema = createInsertSchema(uploadErrors).omit({ id: true, createdAt: true });
export type InsertUploadError = z.infer<typeof insertUploadErrorSchema>;
export type UploadError = typeof uploadErrors.$inferSelect;

// Upload Diagnostics (Sparkasse import debug trail)
export const uploadDiagnostics = pgTable("upload_diagnostics", {
  uploadAttemptId: varchar("upload_attempt_id").primaryKey().default(sql`gen_random_uuid()`),
  uploadId: varchar("upload_id").references(() => uploads.id, { onDelete: "set null" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  source: text("source").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes").notNull(),
  encodingUsed: text("encoding_used"),
  delimiterUsed: text("delimiter_used"),
  headerFound: jsonb("header_found").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  requiredMissing: jsonb("required_missing").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  rowsTotal: integer("rows_total").notNull().default(0),
  rowsPreview: jsonb("rows_preview").$type<Record<string, string>[]>().notNull().default(sql`'[]'::jsonb`),
  stage: text("stage"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"),
  stacktrace: text("stacktrace"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const uploadDiagnosticsRelations = relations(uploadDiagnostics, ({ one }) => ({
  user: one(users, { fields: [uploadDiagnostics.userId], references: [users.id] }),
  upload: one(uploads, { fields: [uploadDiagnostics.uploadId], references: [uploads.id] }),
}));

export const insertUploadDiagnosticsSchema = createInsertSchema(uploadDiagnostics).omit({ createdAt: true });
export type InsertUploadDiagnostics = z.infer<typeof insertUploadDiagnosticsSchema>;
export type UploadDiagnostics = typeof uploadDiagnostics.$inferSelect;

// Import runs (CSV contract imports)
export const importRuns = pgTable("import_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  datasetName: text("dataset_name").notNull(),
  filename: text("filename").notNull(),
  status: text("status").notNull().default("previewed"),
  reasonCodes: jsonb("reason_codes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  errorMessage: text("error_message"),
  detectedEncoding: text("detected_encoding"),
  detectedDelimiter: text("detected_delimiter"),
  headerFound: jsonb("header_found").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  headerDiff: jsonb("header_diff"),
  rowErrorSamples: jsonb("row_error_samples").$type<Record<string, unknown>[]>().notNull().default(sql`'[]'::jsonb`),
  rowsTotal: integer("rows_total").notNull().default(0),
  rowsValid: integer("rows_valid").notNull().default(0),
  canonicalCsv: text("canonical_csv"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at")
});

export const importRunsRelations = relations(importRuns, ({ one }) => ({
  user: one(users, { fields: [importRuns.userId], references: [users.id] })
}));

export const insertImportRunSchema = createInsertSchema(importRuns).omit({ createdAt: true });
export type InsertImportRun = z.infer<typeof insertImportRunSchema>;
export type ImportRun = typeof importRuns.$inferSelect;

// Merchant Metadata table (icon/color/name for merchants)
export const merchantMetadata = pgTable("merchant_metadata", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pattern: text("pattern").notNull(),
  friendlyName: text("friendly_name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").default("#6366f1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const merchantMetadataRelations = relations(merchantMetadata, ({ one }) => ({
  user: one(users, { fields: [merchantMetadata.userId], references: [users.id] }),
}));

export const insertMerchantMetadataSchema = createInsertSchema(merchantMetadata).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMerchantMetadata = z.infer<typeof insertMerchantMetadataSchema>;
export type MerchantMetadata = typeof merchantMetadata.$inferSelect;

// Rules table (keyword mapping with AI-powered categorization)
// Declared before transactions so transactionsRelations can reference it
export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name"),
  keywords: text("keywords"), // Legacy field - NULLABLE
  type: transactionTypeEnum("type"),
  fixVar: fixVarEnum("fix_var"),
  category1: category1Enum("category_1"),
  category2: text("category_2"),
  category3: text("category_3"),
  priority: integer("priority").notNull().default(500),
  strict: boolean("strict").notNull().default(false),
  isSystem: boolean("is_system").notNull().default(false),
  leafId: varchar("leaf_id"),
  keyWords: text("key_words"), // New field - NULLABLE (keywords optional)
  keyWordsNegative: text("key_words_negative"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rulesRelations = relations(rules, ({ one }) => ({
  user: one(users, { fields: [rules.userId], references: [users.id] }),
}));

export const insertRuleSchema = createInsertSchema(rules).omit({ id: true, createdAt: true });
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type Rule = typeof rules.$inferSelect;

// Taxonomy level 1 (Nivel_1_PT)
export const taxonomyLevel1 = pgTable("taxonomy_level_1", {
  level1Id: varchar("level_1_id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nivel1Pt: text("nivel_1_pt").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taxonomyLevel1Relations = relations(taxonomyLevel1, ({ one }) => ({
  user: one(users, { fields: [taxonomyLevel1.userId], references: [users.id] }),
}));

export const insertTaxonomyLevel1Schema = createInsertSchema(taxonomyLevel1).omit({ level1Id: true, createdAt: true, updatedAt: true });
export type InsertTaxonomyLevel1 = z.infer<typeof insertTaxonomyLevel1Schema>;
export type TaxonomyLevel1 = typeof taxonomyLevel1.$inferSelect;

// Taxonomy level 2 (Nivel_2_PT)
export const taxonomyLevel2 = pgTable("taxonomy_level_2", {
  level2Id: varchar("level_2_id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  level1Id: varchar("level_1_id").notNull().references(() => taxonomyLevel1.level1Id, { onDelete: "cascade" }),
  nivel2Pt: text("nivel_2_pt").notNull(),
  recorrenteDefault: text("recorrente_default"),
  fixoVariavelDefault: text("fixo_variavel_default"),
  receitaDespesaDefault: text("receita_despesa_default"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taxonomyLevel2Relations = relations(taxonomyLevel2, ({ one }) => ({
  user: one(users, { fields: [taxonomyLevel2.userId], references: [users.id] }),
  level1: one(taxonomyLevel1, { fields: [taxonomyLevel2.level1Id], references: [taxonomyLevel1.level1Id] }),
}));

export const insertTaxonomyLevel2Schema = createInsertSchema(taxonomyLevel2).omit({ level2Id: true, createdAt: true, updatedAt: true });
export type InsertTaxonomyLevel2 = z.infer<typeof insertTaxonomyLevel2Schema>;
export type TaxonomyLevel2 = typeof taxonomyLevel2.$inferSelect;

// Taxonomy leaf (Nivel_3_PT)
export const taxonomyLeaf = pgTable("taxonomy_leaf", {
  leafId: varchar("leaf_id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  level2Id: varchar("level_2_id").notNull().references(() => taxonomyLevel2.level2Id, { onDelete: "cascade" }),
  nivel3Pt: text("nivel_3_pt").notNull(),
  recorrenteDefault: text("recorrente_default"),
  fixoVariavelDefault: text("fixo_variavel_default"),
  receitaDespesaDefault: text("receita_despesa_default"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taxonomyLeafRelations = relations(taxonomyLeaf, ({ one }) => ({
  user: one(users, { fields: [taxonomyLeaf.userId], references: [users.id] }),
  level2: one(taxonomyLevel2, { fields: [taxonomyLeaf.level2Id], references: [taxonomyLevel2.level2Id] }),
}));

export const insertTaxonomyLeafSchema = createInsertSchema(taxonomyLeaf).omit({ leafId: true, createdAt: true, updatedAt: true });
export type InsertTaxonomyLeaf = z.infer<typeof insertTaxonomyLeafSchema>;
export type TaxonomyLeaf = typeof taxonomyLeaf.$inferSelect;

// App category (UI layer)
export const appCategory = pgTable("app_category", {
  appCatId: varchar("app_cat_id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  versionId: varchar("version_id").notNull().default(sql`gen_random_uuid()`),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appCategoryRelations = relations(appCategory, ({ one }) => ({
  user: one(users, { fields: [appCategory.userId], references: [users.id] }),
}));

export const insertAppCategorySchema = createInsertSchema(appCategory).omit({ appCatId: true, createdAt: true, updatedAt: true });
export type InsertAppCategory = z.infer<typeof insertAppCategorySchema>;
export type AppCategory = typeof appCategory.$inferSelect;

// App category to leaf mapping
export const appCategoryLeaf = pgTable("app_category_leaf", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appCatId: varchar("app_cat_id").notNull().references(() => appCategory.appCatId, { onDelete: "cascade" }),
  leafId: varchar("leaf_id").notNull().references(() => taxonomyLeaf.leafId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appCategoryLeafRelations = relations(appCategoryLeaf, ({ one }) => ({
  user: one(users, { fields: [appCategoryLeaf.userId], references: [users.id] }),
  appCategory: one(appCategory, { fields: [appCategoryLeaf.appCatId], references: [appCategory.appCatId] }),
  leaf: one(taxonomyLeaf, { fields: [appCategoryLeaf.leafId], references: [taxonomyLeaf.leafId] }),
}));

export const insertAppCategoryLeafSchema = createInsertSchema(appCategoryLeaf).omit({ id: true, createdAt: true });
export type InsertAppCategoryLeaf = z.infer<typeof insertAppCategoryLeafSchema>;
export type AppCategoryLeaf = typeof appCategoryLeaf.$inferSelect;

// key_desc map (stable key_desc -> alias)
export const keyDescMap = pgTable("key_desc_map", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  keyDesc: text("key_desc").notNull(),
  simpleDesc: text("simple_desc").notNull(),
  aliasDesc: text("alias_desc"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueKey: sql`UNIQUE (user_id, key_desc)`,
}));

export const keyDescMapRelations = relations(keyDescMap, ({ one }) => ({
  user: one(users, { fields: [keyDescMap.userId], references: [users.id] }),
}));

export const insertKeyDescMapSchema = createInsertSchema(keyDescMap).omit({ createdAt: true, updatedAt: true });
export type InsertKeyDescMap = z.infer<typeof insertKeyDescMapSchema>;
export type KeyDescMap = typeof keyDescMap.$inferSelect;

// alias assets (keywords + logo metadata)
export const aliasAssets = pgTable("alias_assets", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  aliasDesc: text("alias_desc").notNull(),
  keyWordsAlias: text("key_words_alias").notNull(),
  urlIconInternet: text("url_icon_internet"),
  logoLocalPath: text("logo_local_path"),
  logoMimeType: text("logo_mime_type"),
  logoUpdatedAt: timestamp("logo_updated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueAlias: sql`UNIQUE (user_id, alias_desc)`,
}));

export const aliasAssetsRelations = relations(aliasAssets, ({ one }) => ({
  user: one(users, { fields: [aliasAssets.userId], references: [users.id] }),
}));

export const insertAliasAssetsSchema = createInsertSchema(aliasAssets).omit({ createdAt: true, updatedAt: true });
export type InsertAliasAssets = z.infer<typeof insertAliasAssetsSchema>;
export type AliasAssets = typeof aliasAssets.$inferSelect;

// Transactions table (ledger canonico)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentDate: timestamp("payment_date").notNull(),
  bookingDate: date("booking_date"),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  accountSource: text("account_source").notNull().default("M&M"), // Legacy field, kept for compatibility
  accountId: varchar("account_id").references(() => accounts.id), // New structured account reference
  descRaw: text("desc_raw").notNull(),
  descNorm: text("desc_norm").notNull(),
  rawDescription: text("raw_description"),
  normalizedDescription: text("normalized_description"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  foreignAmount: real("foreign_amount"),
  foreignCurrency: text("foreign_currency"),
  exchangeRate: real("exchange_rate"),
  key: text("key").notNull(),
  source: transactionSourceEnum("source"),
  keyDesc: text("key_desc"),
  simpleDesc: text("simple_desc"),
  aliasDesc: text("alias_desc"),
  leafId: varchar("leaf_id"),
  classifiedBy: transactionClassifiedByEnum("classified_by"),
  status: transactionStatusEnum("status"),
  recurringFlag: boolean("recurring_flag").notNull().default(false),
  recurringGroupId: varchar("recurring_group_id"),
  recurringConfidence: real("recurring_confidence"),
  recurringDayOfMonth: integer("recurring_day_of_month"),
  recurringDayWindow: integer("recurring_day_window"),
  type: transactionTypeEnum("type"),
  fixVar: fixVarEnum("fix_var"),
  category1: category1Enum("category_1"),
  category2: text("category_2"),
  category3: text("category_3"),
  manualOverride: boolean("manual_override").notNull().default(false),
  internalTransfer: boolean("internal_transfer").notNull().default(false),
  excludeFromBudget: boolean("exclude_from_budget").notNull().default(false),
  needsReview: boolean("needs_review").notNull().default(true),
  ruleIdApplied: varchar("rule_id_applied").references(() => rules.id),
  uploadId: varchar("upload_id").references(() => uploads.id),
  confidence: integer("confidence"),
  suggestedKeyword: text("suggested_keyword"),
}, (table) => ({
  uniqueKeyPerUser: sql`UNIQUE (user_id, key)`,
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  upload: one(uploads, { fields: [transactions.uploadId], references: [uploads.id] }),
  rule: one(rules, { fields: [transactions.ruleIdApplied], references: [rules.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  leaf: one(taxonomyLeaf, { fields: [transactions.leafId], references: [taxonomyLeaf.leafId] }),
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

// Recurrence enum for calendar events
export const recurrenceEnum = pgEnum("recurrence", ["none", "weekly", "biweekly", "monthly", "yearly"]);

// Calendar Events table
export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  category1: category1Enum("category_1").notNull(),
  category2: text("category_2"),
  recurrence: recurrenceEnum("recurrence").notNull().default("none"),
  nextDueDate: timestamp("next_due_date").notNull(),
  paymentMethod: text("payment_method"),
  accountId: varchar("account_id").references(() => accounts.id), // Which account this recurring payment is from
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, { fields: [calendarEvents.userId], references: [users.id] }),
  account: one(accounts, { fields: [calendarEvents.accountId], references: [accounts.id] }),
}));

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({ id: true, createdAt: true });
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;

// Event Occurrences table (history of payments for recurring events)
export const eventOccurrences = pgTable("event_occurrences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => calendarEvents.id),
  date: timestamp("date").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("pending"),
  transactionId: varchar("transaction_id").references(() => transactions.id),
});

export const eventOccurrencesRelations = relations(eventOccurrences, ({ one }) => ({
  event: one(calendarEvents, { fields: [eventOccurrences.eventId], references: [calendarEvents.id] }),
  transaction: one(transactions, { fields: [eventOccurrences.transactionId], references: [transactions.id] }),
}));

export const insertEventOccurrenceSchema = createInsertSchema(eventOccurrences).omit({ id: true });
export type InsertEventOccurrence = z.infer<typeof insertEventOccurrenceSchema>;
export type EventOccurrence = typeof eventOccurrences.$inferSelect;

// Goals table (financial targets)
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: text("month").notNull(),
  estimatedIncome: real("estimated_income").notNull().default(0),
  totalPlanned: real("total_planned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Category Goals table (budget per category)
export const categoryGoals = pgTable("category_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull().references(() => goals.id),
  category1: category1Enum("category_1").notNull(),
  targetAmount: real("target_amount").notNull(),
  previousMonthSpent: real("previous_month_spent"),
  averageSpent: real("average_spent"),
});

export const categoryGoalsRelations = relations(categoryGoals, ({ one }) => ({
  goal: one(goals, { fields: [categoryGoals.goalId], references: [goals.id] }),
}));

export const insertCategoryGoalSchema = createInsertSchema(categoryGoals).omit({ id: true });
export type InsertCategoryGoal = z.infer<typeof insertCategoryGoalSchema>;
export type CategoryGoal = typeof categoryGoals.$inferSelect;

// Rituals table (weekly/monthly review tracking)
export const rituals = pgTable("rituals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  period: text("period").notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ritualsRelations = relations(rituals, ({ one }) => ({
  user: one(users, { fields: [rituals.userId], references: [users.id] }),
}));

export const insertRitualSchema = createInsertSchema(rituals).omit({ id: true, createdAt: true });
export type InsertRitual = z.infer<typeof insertRitualSchema>;
export type Ritual = typeof rituals.$inferSelect;

// Conversations table (for AI chat features)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversationsRelations = relations(conversations, ({ one }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
}));

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table (for AI chat features)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Merchant Descriptions table (maps source + key_desc to standardized alias_desc)
export const merchantDescriptions = pgTable("merchant_descriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  source: transactionSourceEnum("source").notNull(),
  keyDesc: text("key_desc").notNull(),
  aliasDesc: text("alias_desc").notNull(),
  isManual: boolean("is_manual").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: one mapping per user per source per key_desc
  uniqueMapping: sql`UNIQUE (user_id, source, key_desc)`,
}));

export const merchantDescriptionsRelations = relations(merchantDescriptions, ({ one }) => ({
  user: one(users, { fields: [merchantDescriptions.userId], references: [users.id] }),
}));

export const insertMerchantDescriptionSchema = createInsertSchema(merchantDescriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMerchantDescription = z.infer<typeof insertMerchantDescriptionSchema>;
export type MerchantDescription = typeof merchantDescriptions.$inferSelect;

// Merchant Icons table (manages icon state per alias_desc)
export const merchantIcons = pgTable("merchant_icons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  aliasDesc: text("alias_desc").notNull(),
  shouldFetchIcon: boolean("should_fetch_icon").notNull().default(true),
  iconSourceUrl: text("icon_source_url"),
  iconLocalPath: text("icon_local_path"),
  iconLastCheckedAt: timestamp("icon_last_checked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Unique constraint: one icon record per user per alias_desc
  uniqueAlias: sql`UNIQUE (user_id, alias_desc)`,
}));

export const merchantIconsRelations = relations(merchantIcons, ({ one }) => ({
  user: one(users, { fields: [merchantIcons.userId], references: [users.id] }),
}));

export const insertMerchantIconSchema = createInsertSchema(merchantIcons).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMerchantIcon = z.infer<typeof insertMerchantIconSchema>;
export type MerchantIcon = typeof merchantIcons.$inferSelect;
