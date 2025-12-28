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
export const accountTypeEnum = pgEnum("account_type", ["credit_card", "debit_card", "bank_account", "cash"]);

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

// Settings table (user preferences)
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  autoConfirmHighConfidence: boolean("auto_confirm_high_confidence").notNull().default(false),
  confidenceThreshold: integer("confidence_threshold").notNull().default(80),
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
  category3: text("category_3"),
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
  accountSource: text("account_source").notNull().default("M&M"), // Legacy field, kept for compatibility
  accountId: varchar("account_id").references(() => accounts.id), // New structured account reference
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
  category3: text("category_3"),
  manualOverride: boolean("manual_override").notNull().default(false),
  internalTransfer: boolean("internal_transfer").notNull().default(false),
  excludeFromBudget: boolean("exclude_from_budget").notNull().default(false),
  needsReview: boolean("needs_review").notNull().default(true),
  ruleIdApplied: varchar("rule_id_applied").references(() => rules.id),
  uploadId: varchar("upload_id").references(() => uploads.id),
  confidence: integer("confidence"),
  suggestedKeyword: text("suggested_keyword"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  upload: one(uploads, { fields: [transactions.uploadId], references: [uploads.id] }),
  rule: one(rules, { fields: [transactions.ruleIdApplied], references: [rules.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
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
