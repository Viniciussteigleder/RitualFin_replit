
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp, pgEnum, date, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const transactionTypeEnum = pgEnum("transaction_type", ["Despesa", "Receita"]);
export const fixVarEnum = pgEnum("fix_var", ["Fixo", "Variável"]);
export const category1Enum = pgEnum("category_1", [
  "Alimentação",
  "Mercados", 
  "Renda Extra",
  "Outros",
  "Lazer / Esporte",
  "Compras",
  "Financiamento",
  "Interno",
  "Transporte",
  "Moradia",
  "Saúde",
  "Trabalho"
]);
export const uploadStatusEnum = pgEnum("upload_status", ["processing", "ready", "duplicate", "error"]);
export const accountTypeEnum = pgEnum("account_type", ["credit_card", "debit_card", "bank_account", "cash"]);
export const transactionSourceEnum = pgEnum("transaction_source", ["Sparkasse", "Amex", "M&M"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["FINAL", "OPEN"]);
export const transactionClassifiedByEnum = pgEnum("transaction_classified_by", ["AUTO_KEYWORDS", "MANUAL", "AI_SUGGESTION"]);
export const ingestionSourceTypeEnum = pgEnum("ingestion_source_type", ["csv", "screenshot"]);
export const ingestionBatchStatusEnum = pgEnum("ingestion_batch_status", ["processing", "preview", "committed", "rolled_back", "error"]);

// NEW ENUMS for V1 Redesign
export const postingStatusEnum = pgEnum("posting_status", ["pending", "posted"]);
export const processingStatusEnum = pgEnum("processing_status", ["provisional", "enriched", "reconciled", "void"]);
export const snapshotSourceTypeEnum = pgEnum("snapshot_source_type", ["print", "csv", "manual"]);

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
  institution: text("institution"), // NEW
  type: accountTypeEnum("type").notNull(),
  accountType: text("account_type"), // NEW
  currencyDefault: text("currency_default").default("EUR"), // NEW
  externalRefIban: text("external_ref_iban"), // NEW
  externalRefLast4: text("external_ref_last4"), // NEW
  accountNumber: text("account_number"),
  icon: text("icon").default("credit-card"),
  color: text("color").default("#6366f1"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userInstitutionIdx: index("accounts_user_institution_idx").on(table.userId, table.institution),
  userIbanIdx: index("accounts_user_iban_idx").on(table.userId, table.externalRefIban),
  userLast4Idx: index("accounts_user_last4_idx").on(table.userId, table.externalRefLast4),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  balanceSnapshots: many(accountBalanceSnapshots),
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

// --- Evidence Ingestion Tables ---

export const ingestionBatches = pgTable("ingestion_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").references(() => accounts.id), // NEW
  sourceType: ingestionSourceTypeEnum("source_type").notNull(),
  status: ingestionBatchStatusEnum("status").notNull().default("processing"),
  filename: text("filename"),
  importedAt: timestamp("imported_at").notNull().defaultNow(), // NEW
  sourceSystem: text("source_system"), // NEW
  sourceFormat: text("source_format"), // NEW
  detectedAccountId: varchar("detected_account_id"), // NEW
  detectionConfidence: integer("detection_confidence"), // NEW
  detectionReasons: jsonb("detection_reasons"), // NEW
  diagnosticsJson: jsonb("diagnostics_json"), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ingestionBatchesRelations = relations(ingestionBatches, ({ one, many }) => ({
  user: one(users, { fields: [ingestionBatches.userId], references: [users.id] }),
  items: many(ingestionItems),
  account: one(accounts, { fields: [ingestionBatches.accountId], references: [accounts.id] }),
}));

export const ingestionItems = pgTable("ingestion_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull().references(() => ingestionBatches.id, { onDelete: "cascade" }),
  rawPayload: jsonb("raw_payload").notNull(), 
  parsedPayload: jsonb("parsed_payload"), 
  itemFingerprint: text("item_fingerprint").notNull(), 
  status: text("status").notNull().default("pending"), 
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  fingerprintIdx: index("ingestion_items_fingerprint_idx").on(table.itemFingerprint),
}));

export const ingestionItemsRelations = relations(ingestionItems, ({ one }) => ({
  batch: one(ingestionBatches, { fields: [ingestionItems.batchId], references: [ingestionBatches.id] }),
}));

export const attachments = pgTable("attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  batchId: varchar("batch_id").references(() => ingestionBatches.id), 
  storageKey: text("storage_key").notNull(), 
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  ocrStatus: text("ocr_status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ocrExtractions = pgTable("ocr_extractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attachmentId: varchar("attachment_id").notNull().references(() => attachments.id, { onDelete: "cascade" }),
  textRaw: text("text_raw"),
  blocksJson: jsonb("blocks_json"), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactionEvidenceLink = pgTable("transaction_evidence_link", {
  transactionId: varchar("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  ingestionItemId: varchar("ingestion_item_id").notNull().references(() => ingestionItems.id, { onDelete: "cascade" }),
  matchConfidence: integer("match_confidence"),
  isPrimary: boolean("is_primary").notNull().default(true), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: uniqueIndex("transaction_evidence_link_pk").on(table.transactionId, table.ingestionItemId),
}));

// --- Rules & Taxonomy ---

export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  // Removed: ruleKey, name, keywords as requested
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
}, (table) => ({
  // Removed index on ruleKey
}));

export const rulesRelations = relations(rules, ({ one }) => ({
  user: one(users, { fields: [rules.userId], references: [users.id] }),
}));

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

// Transactions table (EXTENDED)
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  paymentDate: timestamp("payment_date", { mode: "date" }).notNull(), 
  bookingDate: date("booking_date", { mode: "date" }), 
  eventDate: timestamp("event_date", { mode: "date" }), // NEW
  postingDate: timestamp("posting_date", { mode: "date" }), // NEW
  valueDate: timestamp("value_date", { mode: "date" }), // NEW
  eventTimeText: text("event_time_text"), // NEW
  postingStatus: postingStatusEnum("posting_status").default("posted"), // NEW
  processingStatus: processingStatusEnum("processing_status").default("provisional"), // NEW
  externalRef: text("external_ref"), // NEW
  enrichedAt: timestamp("enriched_at"), // NEW
  importedAt: timestamp("imported_at").notNull().defaultNow(),
  // display: column removed (duplicate)
  // Removed: accountId
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
  uploadId: varchar("upload_id"), 
  confidence: integer("confidence"),
  suggestedKeyword: text("suggested_keyword"),
  display: text("display").notNull().default("yes"),
  conflictFlag: boolean("conflict_flag").notNull().default(false),
  classificationCandidates: jsonb("classification_candidates"),
}, (table) => ({
  uniqueKeyPerUser: uniqueIndex("transactions_unique_key_per_user").on(table.userId, table.key),
  // Removed indices dependent on accountId
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  rule: one(rules, { fields: [transactions.ruleIdApplied], references: [rules.id] }),
  // Removed account relation
  leaf: one(taxonomyLeaf, { fields: [transactions.leafId], references: [taxonomyLeaf.leafId] }),
  evidenceLinks: many(transactionEvidenceLink),
}));

// --- NEW TABLES FOR V1 REDESIGN ---

// Print Sessions: Grouping screenshots by capture event
export const printSessions = pgTable("print_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").references(() => accounts.id),
  batchId: varchar("batch_id").references(() => ingestionBatches.id),
  sourceApp: text("source_app"), // Sparkasse, etc.
  capturedAt: timestamp("captured_at"),
  asOfDate: date("as_of_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Print Line Items: Extracted transaction candidates from prints
export const printLineItems = pgTable("print_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").references(() => accounts.id),
  printSessionId: varchar("print_session_id").references(() => printSessions.id),
  ingestionItemId: varchar("ingestion_item_id").references(() => ingestionItems.id),
  section: text("section"), // posted | pending
  eventDate: timestamp("event_date"),
  eventTimeText: text("event_time_text"),
  merchantLine1: text("merchant_line_1"),
  subText: text("sub_text"),
  amount: real("amount"),
  currency: text("currency").default("EUR"),
  fingerprint: text("fingerprint").notNull(),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Account Balance Snapshots: True balances from any source
export const accountBalanceSnapshots = pgTable("account_balance_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  asOfDate: timestamp("as_of_date").notNull(),
  balanceType: text("balance_type"), // current, available, statement
  amount: real("amount").notNull(),
  unit: text("unit").default("EUR"),
  sourceType: snapshotSourceTypeEnum("source_type").notNull(),
  ingestionItemId: varchar("ingestion_item_id"),
  attachmentId: varchar("attachment_id").references(() => attachments.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Typed Source CSV Staging Tables
export const sourceCsvSparkasse = pgTable("source_csv_sparkasse", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").references(() => accounts.id),
  batchId: varchar("batch_id").references(() => ingestionBatches.id),
  ingestionItemId: varchar("ingestion_item_id").references(() => ingestionItems.id),
  // Columns matching Sparkasse CSV
  auftragskonto: text("auftragskonto"),
  buchungstag: date("buchungstag", { mode: "date" }),
  valutadatum: date("valutadatum", { mode: "date" }),
  buchungstext: text("buchungstext"),
  verwendungszweck: text("verwendungszweck"),
  glaeubigerId: text("glaeubiger_id"),
  mandatsreferenz: text("mandatsreferenz"),
  kundenreferenz: text("kundenreferenz"),
  sammlerreferenz: text("sammlerreferenz"),
  lastschrifteinreicherId: text("lastschrifteinreicher_id"),
  idEndToEnd: text("id_end_to_end"),
  beguenstigterZahlungspflichtiger: text("beguenstigter_zahlungspflichtiger"),
  iban: text("iban"),
  bic: text("bic"),
  betrag: real("betrag"),
  waehrung: text("waehrung"),
  info: text("info"),
  rowFingerprint: text("row_fingerprint").notNull(),
  key: text("key"),
  keyDesc: text("key_desc"),
  uniqueRow: boolean("unique_row").default(false), // NEW
  importedAt: timestamp("imported_at").notNull().defaultNow(),
}, (table) => ({
  accBookingIdx: index("sparkasse_acc_booking_idx").on(table.accountId, table.buchungstag),
  accAmtIdx: index("sparkasse_acc_amt_idx").on(table.accountId, table.betrag),
  uniqueKey: uniqueIndex("sparkasse_user_key_idx").on(table.userId, table.key),
}));

export const sourceCsvMm = pgTable("source_csv_mm", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").references(() => accounts.id),
  batchId: varchar("batch_id").references(() => ingestionBatches.id),
  ingestionItemId: varchar("ingestion_item_id").references(() => ingestionItems.id),
  // Columns matching M&M
  authorisedOn: date("authorised_on", { mode: "date" }),
  processedOn: date("processed_on", { mode: "date" }),
  paymentType: text("payment_type"),
  status: text("status"),
  amount: real("amount"),
  currency: text("currency"),
  description: text("description"),
  rowFingerprint: text("row_fingerprint").notNull(),
  key: text("key"),
  keyDesc: text("key_desc"),
  uniqueRow: boolean("unique_row").default(false), // NEW
  importedAt: timestamp("imported_at").notNull().defaultNow(),
}, (table) => ({
  accProcessedIdx: index("mm_acc_processed_idx").on(table.accountId, table.processedOn),
  accAmtIdx: index("mm_acc_amt_idx").on(table.accountId, table.amount),
  uniqueKey: uniqueIndex("mm_user_key_idx").on(table.userId, table.key),
}));

export const sourceCsvAmex = pgTable("source_csv_amex", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").references(() => accounts.id),
  batchId: varchar("batch_id").references(() => ingestionBatches.id),
  ingestionItemId: varchar("ingestion_item_id").references(() => ingestionItems.id),
  // Columns matching Amex
  datum: date("datum", { mode: "date" }),
  beschreibung: text("beschreibung"),
  betrag: real("betrag"),
  karteninhaber: text("karteninhaber"),
  kartennummer: text("kartennummer"),
  referenz: text("referenz"),
  ort: text("ort"),
  staat: text("staat"),
  rowFingerprint: text("row_fingerprint").notNull(),
  key: text("key"),
  keyDesc: text("key_desc"),
  uniqueRow: boolean("unique_row").default(false), // NEW
  importedAt: timestamp("imported_at").notNull().defaultNow(),
}, (table) => ({
  accDatumIdx: index("amex_acc_datum_idx").on(table.accountId, table.datum),
  accAmtIdx: index("amex_acc_amt_idx").on(table.accountId, table.betrag),
  uniqueKey: uniqueIndex("amex_user_key_idx").on(table.userId, table.key),
}));

// Reconciliation Logging Tables
export const reconciliationRuns = pgTable("reconciliation_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  leftType: text("left_type").notNull(), // provisional
  rightType: text("right_type").notNull(), // enriched
  paramsJson: jsonb("params_json"),
  status: text("status").notNull().default("running"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reconciliationCandidates = pgTable("reconciliation_candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runId: varchar("run_id").notNull().references(() => reconciliationRuns.id, { onDelete: "cascade" }),
  leftTransactionId: varchar("left_transaction_id").notNull(),
  rightTransactionId: varchar("right_transaction_id").notNull(),
  scoreTotal: real("score_total"),
  scoreBreakdown: jsonb("score_breakdown"),
  decision: text("decision"), // auto_accept, pending_review, rejected
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Operational Logs
export const bulkApplyRuns = pgTable("bulk_apply_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // rules_import, aliases_import, reapply_rules, reapply_alias
  paramsJson: jsonb("params_json"),
  summaryJson: jsonb("summary_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Alias Assets (EXTENDED)
export const aliasAssets = pgTable("alias_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  aliasKey: text("alias_key"), // NEW
  aliasDesc: text("alias_desc").notNull(),
  keyWordsAlias: text("key_words_alias"),
  logoUrl: text("logo_url"),
  localLogoPath: text("local_logo_path"),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(500),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userAliasKeyIdx: uniqueIndex("alias_assets_user_alias_key_idx").on(table.userId, table.aliasKey),
}));

// --- LEGACY / OTHER ---

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

// Relations
export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, { fields: [oauthAccounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, { fields: [authenticators.userId], references: [users.id] }),
}));

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

export const goalsRelations = relations(goals, ({ many }) => ({
  categoryGoals: many(categoryGoals),
}));

export const categoryGoalsRelations = relations(categoryGoals, ({ one }) => ({
  goal: one(goals, { fields: [categoryGoals.goalId], references: [goals.id] }),
}));

export const transactionEvidenceLinkRelations = relations(transactionEvidenceLink, ({ one }) => ({
  transaction: one(transactions, { fields: [transactionEvidenceLink.transactionId], references: [transactions.id] }),
  ingestionItem: one(ingestionItems, { fields: [transactionEvidenceLink.ingestionItemId], references: [ingestionItems.id] }),
}));

// Legacy Uploads table 
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

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
export type IngestionBatch = typeof ingestionBatches.$inferSelect;
export type IngestionItem = typeof ingestionItems.$inferSelect;
export type AliasAssets = typeof aliasAssets.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
