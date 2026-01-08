
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp, pgEnum, date, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
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
  "Investimentos", "Outros", "Interno", "Assinaturas", "Compras",
  "Doações", "Esportes", "Finanças", "Férias", "Mobilidade",
  "Pets", "Telefone", "Trabalho", "Transferências", "Vendas"
]);
export const uploadStatusEnum = pgEnum("upload_status", ["processing", "ready", "duplicate", "error"]);
export const accountTypeEnum = pgEnum("account_type", ["credit_card", "debit_card", "bank_account", "cash"]);
export const transactionSourceEnum = pgEnum("transaction_source", ["Sparkasse", "Amex", "M&M"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["FINAL", "OPEN"]);
export const transactionClassifiedByEnum = pgEnum("transaction_classified_by", ["AUTO_KEYWORDS", "MANUAL", "AI_SUGGESTION"]);
export const ingestionSourceTypeEnum = pgEnum("ingestion_source_type", ["csv", "screenshot"]);
export const ingestionBatchStatusEnum = pgEnum("ingestion_batch_status", ["processing", "preview", "committed", "rolled_back", "error"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"), // Auth.js standard
  username: text("username").unique(), // Changed to nullable
  passwordHash: text("password_hash"), // Secure hashed password
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }), // Auth.js standard
  image: text("image"), // Auth.js standard
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

// Accounts table
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  accountNumber: text("account_number"),
  icon: text("icon").default("credit-card"),
  color: text("color").default("#6366f1"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// --- Auth.js (NextAuth) Tables ---

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<"oauth" | "oidc" | "email">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: uniqueIndex("oauth_accounts_provider_provider_account_id_idx").on(
      account.provider,
      account.providerAccountId
    ),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: uniqueIndex("verification_tokens_identifier_token_idx").on(
      verificationToken.identifier,
      verificationToken.token
    ),
  })
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: uniqueIndex("authenticators_user_id_credential_id_idx").on(
      authenticator.userId,
      authenticator.credentialID
    ),
  })
);

// --- Evidence-First Ingestion Tables (NEW) ---

// Ingestion Batches: Represents a single upload event (CSV or Screenshot)
export const ingestionBatches = pgTable("ingestion_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sourceType: ingestionSourceTypeEnum("source_type").notNull(),
  status: ingestionBatchStatusEnum("status").notNull().default("processing"),
  filename: text("filename"),
  diagnosticsJson: jsonb("diagnostics_json"), // Stores header info, row counts, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ingestionBatchesRelations = relations(ingestionBatches, ({ one, many }) => ({
  user: one(users, { fields: [ingestionBatches.userId], references: [users.id] }),
  items: many(ingestionItems),
}));

// Ingestion Items: Individual rows/records extracted from a batch
export const ingestionItems = pgTable("ingestion_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull().references(() => ingestionBatches.id, { onDelete: "cascade" }),
  rawPayload: jsonb("raw_payload").notNull(), // Original CSV row or OCR text block
  parsedPayload: jsonb("parsed_payload"), // Normalized candidate data (dates parsed, etc)
  itemFingerprint: text("item_fingerprint").notNull(), // Hash for deduplication
  status: text("status").notNull().default("pending"), // pending, imported, error
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  fingerprintIdx: index("ingestion_items_fingerprint_idx").on(table.itemFingerprint),
}));

export const ingestionItemsRelations = relations(ingestionItems, ({ one }) => ({
  batch: one(ingestionBatches, { fields: [ingestionItems.batchId], references: [ingestionBatches.id] }),
}));

// Attachments: Stores references to uploaded files (especially screenshots)
export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchId: varchar("batch_id").references(() => ingestionBatches.id), // Link to batch if related
  storageKey: text("storage_key").notNull(), // Path in object storage (R2/S3)
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  ocrStatus: text("ocr_status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// OCR Extractions: Stores the raw text blocks from Vision API
export const ocrExtractions = pgTable("ocr_extractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attachmentId: varchar("attachment_id").notNull().references(() => attachments.id, { onDelete: "cascade" }),
  textRaw: text("text_raw"),
  blocksJson: jsonb("blocks_json"), // Structured blocks/lines from API
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transaction Evidence Link: Links a canonical Transaction to its source Evidence(s)
export const transactionEvidenceLink = pgTable("transaction_evidence_link", {
  transactionId: varchar("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  ingestionItemId: varchar("ingestion_item_id").notNull().references(() => ingestionItems.id, { onDelete: "cascade" }),
  matchConfidence: integer("match_confidence"),
  isPrimary: boolean("is_primary").notNull().default(true), // Which source is the "truth"
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: uniqueIndex("transaction_evidence_link_pk").on(table.transactionId, table.ingestionItemId),
}));

// --- End New Tables ---

// Rules table
export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name"),
  keywords: text("keywords"), // Legacy field
  type: transactionTypeEnum("type"),
  fixVar: fixVarEnum("fix_var"),
  category1: category1Enum("category_1"),
  category2: text("category_2"),
  category3: text("category_3"),
  priority: integer("priority").notNull().default(500),
  strict: boolean("strict").notNull().default(false),
  isSystem: boolean("is_system").notNull().default(false),
  leafId: varchar("leaf_id"),
  keyWords: text("key_words"),
  keyWordsNegative: text("key_words_negative"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rulesRelations = relations(rules, ({ one }) => ({
  user: one(users, { fields: [rules.userId], references: [users.id] }),
}));

// Taxonomy tables (Level 1, 2, Leaf)
export const taxonomyLevel1 = pgTable("taxonomy_level_1", {
  level1Id: varchar("level_1_id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nivel1Pt: text("nivel_1_pt").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

export const taxonomyLevel1Relations = relations(taxonomyLevel1, ({ many }) => ({
  level2s: many(taxonomyLevel2),
}));

export const taxonomyLevel2Relations = relations(taxonomyLevel2, ({ one, many }) => ({
  level1: one(taxonomyLevel1, { fields: [taxonomyLevel2.level1Id], references: [taxonomyLevel1.level1Id] }),
  leaves: many(taxonomyLeaf),
}));

export const taxonomyLeafRelations = relations(taxonomyLeaf, ({ one }) => ({
  level2: one(taxonomyLevel2, { fields: [taxonomyLeaf.level2Id], references: [taxonomyLevel2.level2Id] }),
}));

// App Category (UI Layer)
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

export const appCategoryLeaf = pgTable("app_category_leaf", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appCatId: varchar("app_cat_id").notNull().references(() => appCategory.appCatId, { onDelete: "cascade" }),
  leafId: varchar("leaf_id").notNull().references(() => taxonomyLeaf.leafId, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentDate: timestamp("payment_date", { mode: "date" }).notNull(),
  bookingDate: date("booking_date", { mode: "date" }),
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  accountSource: text("account_source").notNull().default("M&M"), // Legacy
  accountId: varchar("account_id").references(() => accounts.id),
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
  // Deprecated: uploadId link replaced by transactionEvidenceLink
  uploadId: varchar("upload_id"), 
  confidence: integer("confidence"),
  suggestedKeyword: text("suggested_keyword"),
}, (table) => ({
  uniqueKeyPerUser: uniqueIndex("transactions_unique_key_per_user").on(table.userId, table.key),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  rule: one(rules, { fields: [transactions.ruleIdApplied], references: [rules.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  leaf: one(taxonomyLeaf, { fields: [transactions.leafId], references: [taxonomyLeaf.leafId] }),
  // New relation
  evidenceLinks: many(transactionEvidenceLink),
}));

// Legacy Uploads table (kept for backward compatibility during migration)
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

// Relationships for evidence link
export const transactionEvidenceLinkRelations = relations(transactionEvidenceLink, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionEvidenceLink.transactionId], references: [transactions.id] }),
  ingestionItem: one(ingestionItems, { fields: [transactionEvidenceLink.ingestionItemId], references: [ingestionItems.id] }),
}));

// Other legacy tables (simplified port)
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: text("month").notNull(),
  category1: category1Enum("category_1").notNull(),
  amount: real("amount").notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  category1: category1Enum("category_1").notNull(),
  category2: text("category_2"),
  recurrence: text("recurrence").notNull().default("none"),
  nextDueDate: timestamp("next_due_date").notNull(),
  accountId: varchar("account_id").references(() => accounts.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: text("month").notNull(),
  estimatedIncome: real("estimated_income").notNull().default(0),
  totalPlanned: real("total_planned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoryGoals = pgTable("category_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull().references(() => goals.id),
  category1: category1Enum("category_1").notNull(),
  targetAmount: real("target_amount").notNull(),
});

export const rituals = pgTable("rituals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  period: text("period").notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
// Alias Assets table
export const aliasAssets = pgTable("alias_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  aliasDesc: text("alias_desc").notNull(),
  keyWordsAlias: text("key_words_alias"),
  logoUrl: text("logo_url"),
  localLogoPath: text("local_logo_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
export type IngestionBatch = typeof ingestionBatches.$inferSelect;
export type IngestionItem = typeof ingestionItems.$inferSelect;
export type AliasAssets = typeof aliasAssets.$inferSelect;
