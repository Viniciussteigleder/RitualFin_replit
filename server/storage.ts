import {
  users, accounts, uploads, uploadErrors, uploadDiagnostics, merchantMetadata, transactions, rules, budgets, calendarEvents, eventOccurrences, goals, categoryGoals, rituals, settings,
  aiUsageLogs, notifications, merchantDescriptions, merchantIcons,
  taxonomyLevel1, taxonomyLevel2, taxonomyLeaf, appCategory, appCategoryLeaf, keyDescMap, aliasAssets,
  type User, type InsertUser,
  type Account, type InsertAccount,
  type Upload, type InsertUpload,
  type UploadError, type InsertUploadError,
  type UploadDiagnostics, type InsertUploadDiagnostics,
  type MerchantMetadata, type InsertMerchantMetadata,
  type Transaction, type InsertTransaction,
  type Rule, type InsertRule,
  type Budget, type InsertBudget,
  type CalendarEvent, type InsertCalendarEvent,
  type EventOccurrence, type InsertEventOccurrence,
  type Goal, type InsertGoal,
  type CategoryGoal, type InsertCategoryGoal,
  type Ritual, type InsertRitual,
  type Settings, type InsertSettings, type UpdateSettings,
  type AiUsageLog, type InsertAiUsageLog,
  type Notification, type InsertNotification, type UpdateNotification,
  type MerchantDescription, type InsertMerchantDescription,
  type MerchantIcon, type InsertMerchantIcon,
  type TaxonomyLevel1, type InsertTaxonomyLevel1,
  type TaxonomyLevel2, type InsertTaxonomyLevel2,
  type TaxonomyLeaf, type InsertTaxonomyLeaf,
  type AppCategory, type InsertAppCategory,
  type AppCategoryLeaf, type InsertAppCategoryLeaf,
  type KeyDescMap, type InsertKeyDescMap,
  type AliasAssets, type InsertAliasAssets
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, gte, lt, or, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Settings
  getSettings(userId: string): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: string, data: UpdateSettings): Promise<Settings | undefined>;

  // AI Usage Logs
  createAiUsageLog(log: InsertAiUsageLog): Promise<AiUsageLog>;
  getAiUsageLogs(userId: string, limit?: number): Promise<AiUsageLog[]>;

  // Notifications
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, userId: string, data: UpdateNotification): Promise<Notification | undefined>;
  deleteNotification(id: string, userId: string): Promise<void>;

  // Accounts
  getAccounts(userId: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, userId: string, data: Partial<Account>): Promise<Account | undefined>;
  archiveAccount(id: string, userId: string): Promise<void>;
  getAccountBalance(userId: string, accountId: string, options?: { startDate?: Date; endDate?: Date }): Promise<{ balance: number; currency: string; transactionCount: number }>;

  // Uploads
  getUploads(userId: string): Promise<Upload[]>;
  getUpload(id: string): Promise<Upload | undefined>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined>;

  // Upload Errors
  createUploadError(error: InsertUploadError): Promise<UploadError>;
  getUploadErrors(uploadId: string): Promise<UploadError[]>;

  // Upload Diagnostics
  createUploadDiagnostics(row: InsertUploadDiagnostics): Promise<UploadDiagnostics>;

  // Merchant Metadata
  getMerchantMetadata(userId: string): Promise<MerchantMetadata[]>;
  getMerchantMetadataById(id: string, userId: string): Promise<MerchantMetadata | undefined>;
  createMerchantMetadata(metadata: InsertMerchantMetadata): Promise<MerchantMetadata>;
  updateMerchantMetadata(id: string, userId: string, data: Partial<MerchantMetadata>): Promise<MerchantMetadata | undefined>;
  deleteMerchantMetadata(id: string, userId: string): Promise<void>;
  findMerchantMatch(userId: string, description: string): Promise<MerchantMetadata | undefined>;

  // Transactions
  getTransactions(userId: string, month?: string): Promise<Transaction[]>;
  getTransactionsWithMerchantAlias(userId: string, month?: string): Promise<(Transaction & { aliasDesc: string | null; logoLocalPath: string | null; appCategory: string | null })[]>;
  getTransactionsByNeedsReview(userId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByKey(userId: string, key: string): Promise<Transaction | undefined>;
  getTransactionsByKeyDesc(userId: string, keyDesc: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction | undefined>;
  bulkUpdateTransactions(ids: string[], data: Partial<Transaction>): Promise<void>;
  getUncategorizedTransactions(userId: string): Promise<Transaction[]>;
  getTransactionsByKeyword(userId: string, keyword: string): Promise<Transaction[]>;
  
  // Rules
  getRules(userId: string): Promise<Rule[]>;
  getRule(id: string): Promise<Rule | undefined>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, data: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<void>;

  // Taxonomy + App Categories
  getTaxonomyLevel1(userId: string): Promise<TaxonomyLevel1[]>;
  getTaxonomyLevel2(userId: string): Promise<TaxonomyLevel2[]>;
  getTaxonomyLeaf(userId: string): Promise<TaxonomyLeaf[]>;
  getAppCategories(userId: string): Promise<AppCategory[]>;
  getAppCategoryLeaf(userId: string): Promise<AppCategoryLeaf[]>;
  createTaxonomyLevel1(row: InsertTaxonomyLevel1): Promise<TaxonomyLevel1>;
  createTaxonomyLevel2(row: InsertTaxonomyLevel2): Promise<TaxonomyLevel2>;
  createTaxonomyLeaf(row: InsertTaxonomyLeaf): Promise<TaxonomyLeaf>;
  createAppCategory(row: InsertAppCategory): Promise<AppCategory>;
  createAppCategoryLeaf(row: InsertAppCategoryLeaf): Promise<AppCategoryLeaf>;
  deleteTaxonomyForUser(userId: string): Promise<void>;

  // Alias + key_desc mapping
  getKeyDescMap(userId: string): Promise<KeyDescMap[]>;
  getKeyDescMapping(userId: string, keyDesc: string): Promise<KeyDescMap | undefined>;
  upsertKeyDescMapping(row: InsertKeyDescMap): Promise<KeyDescMap>;
  updateKeyDescMapping(userId: string, keyDesc: string, data: Partial<KeyDescMap>): Promise<KeyDescMap | undefined>;

  getAliasAssets(userId: string): Promise<AliasAssets[]>;
  getAliasAsset(userId: string, aliasDesc: string): Promise<AliasAssets | undefined>;
  upsertAliasAsset(row: InsertAliasAssets): Promise<AliasAssets>;
  updateAliasAsset(userId: string, aliasDesc: string, data: Partial<AliasAssets>): Promise<AliasAssets | undefined>;
  deleteAliasAsset(userId: string, aliasDesc: string): Promise<void>;
  updateTransactionsAliasByKeyDesc(userId: string, keyDesc: string, aliasDesc: string | null): Promise<void>;
  updateTransactionsByKeyDesc(userId: string, keyDesc: string, data: Partial<Transaction>): Promise<void>;
  
  // Budgets
  getBudgets(userId: string, month: string): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, data: Partial<Budget>): Promise<Budget | undefined>;
  
  // Dashboard aggregations
  getDashboardData(userId: string, month: string): Promise<{
    spentByCategory: { category: string; amount: number }[];
    totalSpent: number;
    totalIncome: number;
    pendingReviewCount: number;
  }>;
  
  // Calendar Events
  getCalendarEvents(userId: string): Promise<CalendarEvent[]>;
  getCalendarEvent(id: string): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<void>;
  
  // Event Occurrences
  getEventOccurrences(eventId: string): Promise<EventOccurrence[]>;
  createEventOccurrence(occurrence: InsertEventOccurrence): Promise<EventOccurrence>;
  updateEventOccurrence(id: string, data: Partial<EventOccurrence>): Promise<EventOccurrence | undefined>;

  // Goals
  getGoals(userId: string, month?: string): Promise<Goal[]>;
  getGoalById(goalId: string, userId: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(goalId: string, userId: string, data: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(goalId: string, userId: string): Promise<{ success: boolean; deletedCategoryGoalsCount: number }>;

  // Category Goals
  getCategoryGoals(goalId: string): Promise<CategoryGoal[]>;
  getCategoryGoal(categoryGoalId: string): Promise<CategoryGoal | undefined>;
  upsertCategoryGoal(goalId: string, data: InsertCategoryGoal): Promise<CategoryGoal>;
  deleteCategoryGoal(categoryGoalId: string): Promise<void>;

  // Progress calculation
  calculateHistoricalSpending(userId: string, month: string, category1: string): Promise<{
    previousMonthSpent: number | null;
    averageSpent: number | null;
  }>;
  getGoalProgress(goalId: string, userId: string): Promise<{
    goal: Goal;
    progress: {
      totalActualSpent: number;
      totalTarget: number;
      remainingBudget: number;
      percentSpent: number;
      categories: Array<{
        category1: string;
        targetAmount: number;
        actualSpent: number;
        remaining: number;
        percentSpent: number;
        status: "under" | "over" | "on-track";
      }>;
    };
  } | null>;

  // Rituals
  getRituals(userId: string, type?: string, period?: string): Promise<Ritual[]>;
  getRitualById(ritualId: string, userId: string): Promise<Ritual | undefined>;
  createRitual(ritual: InsertRitual): Promise<Ritual>;
  updateRitual(ritualId: string, userId: string, data: Partial<Ritual>): Promise<Ritual | undefined>;
  deleteRitual(ritualId: string, userId: string): Promise<void>;
  completeRitual(ritualId: string, userId: string, notes?: string): Promise<Ritual | undefined>;

  // Merchant Descriptions
  getMerchantDescriptions(userId: string, filters?: { source?: string; search?: string; isManual?: boolean }): Promise<MerchantDescription[]>;
  getMerchantDescription(userId: string, source: string, keyDesc: string): Promise<MerchantDescription | undefined>;
  getMerchantDescriptionById(id: string): Promise<MerchantDescription | undefined>;
  createMerchantDescription(description: InsertMerchantDescription): Promise<MerchantDescription>;
  updateMerchantDescription(id: string, data: Partial<MerchantDescription>): Promise<MerchantDescription | undefined>;
  deleteMerchantDescription(id: string): Promise<void>;
  upsertMerchantDescription(userId: string, source: string, keyDesc: string, aliasDesc: string, isManual: boolean): Promise<MerchantDescription>;

  // Merchant Icons
  getMerchantIcons(userId: string, filters?: { needsFetch?: boolean; search?: string }): Promise<MerchantIcon[]>;
  getMerchantIcon(userId: string, aliasDesc: string): Promise<MerchantIcon | undefined>;
  getMerchantIconById(id: string): Promise<MerchantIcon | undefined>;
  createMerchantIcon(icon: InsertMerchantIcon): Promise<MerchantIcon>;
  updateMerchantIcon(userId: string, aliasDesc: string, data: Partial<MerchantIcon>): Promise<MerchantIcon | undefined>;
  deleteMerchantIcon(id: string): Promise<void>;
  upsertMerchantIcon(userId: string, aliasDesc: string, data: Partial<InsertMerchantIcon>): Promise<MerchantIcon>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Settings
  async getSettings(userId: string): Promise<Settings | undefined> {
    const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId));
    return userSettings || undefined;
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const [userSettings] = await db.insert(settings).values(insertSettings).returning();
    return userSettings;
  }

  async updateSettings(userId: string, data: UpdateSettings): Promise<Settings | undefined> {
    const [userSettings] = await db
      .update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.userId, userId))
      .returning();
    return userSettings || undefined;
  }

  // AI Usage Logs
  async createAiUsageLog(log: InsertAiUsageLog): Promise<AiUsageLog> {
    const [created] = await db.insert(aiUsageLogs).values(log).returning();
    return created;
  }

  async getAiUsageLogs(userId: string, limit = 100): Promise<AiUsageLog[]> {
    return db
      .select()
      .from(aiUsageLogs)
      .where(eq(aiUsageLogs.userId, userId))
      .orderBy(desc(aiUsageLogs.createdAt))
      .limit(limit);
  }

  // Notifications
  async getNotifications(userId: string, limit = 200): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async updateNotification(id: string, userId: string, data: UpdateNotification): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // Accounts
  async getAccounts(userId: string): Promise<Account[]> {
    return db.select().from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return db.query.accounts.findFirst({
      where: eq(accounts.id, id)
    });
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [created] = await db.insert(accounts).values(account).returning();
    return created;
  }

  async updateAccount(id: string, userId: string, data: Partial<Account>): Promise<Account | undefined> {
    const [updated] = await db.update(accounts)
      .set(data)
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async archiveAccount(id: string, userId: string): Promise<void> {
    await db.update(accounts)
      .set({ isActive: false })
      .where(and(eq(accounts.id, id), eq(accounts.userId, userId)));
  }

  async getAccountBalance(
    userId: string,
    accountId: string,
    options?: { startDate?: Date; endDate?: Date }
  ): Promise<{ balance: number; currency: string; transactionCount: number }> {
    // Build base query conditions
    const conditions = [
      eq(transactions.userId, userId),
      eq(transactions.accountId, accountId),
      eq(transactions.excludeFromBudget, false)
    ];

    // Add date filters if provided
    if (options?.startDate) {
      conditions.push(gte(transactions.paymentDate, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lt(transactions.paymentDate, options.endDate));
    }

    const result = await db
      .select({
        balance: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        transactionCount: sql<number>`COUNT(*)::int`,
        currency: sql<string>`COALESCE(MAX(${transactions.currency}), 'EUR')`
      })
      .from(transactions)
      .where(and(...conditions));

    return {
      balance: result[0]?.balance ?? 0,
      currency: result[0]?.currency ?? "EUR",
      transactionCount: result[0]?.transactionCount ?? 0
    };
  }

  // Uploads
  async getUploads(userId: string): Promise<Upload[]> {
    return db.select().from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [created] = await db.insert(uploads).values(upload).returning();
    return created;
  }

  async updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined> {
    const [updated] = await db.update(uploads).set(data).where(eq(uploads.id, id)).returning();
    return updated || undefined;
  }

  // Upload Errors
  async createUploadError(error: InsertUploadError): Promise<UploadError> {
    const [created] = await db.insert(uploadErrors).values(error).returning();
    return created;
  }

  async getUploadErrors(uploadId: string): Promise<UploadError[]> {
    return db.select().from(uploadErrors)
      .where(eq(uploadErrors.uploadId, uploadId))
      .orderBy(uploadErrors.rowNumber);
  }

  // Upload Diagnostics
  async createUploadDiagnostics(row: InsertUploadDiagnostics): Promise<UploadDiagnostics> {
    const [created] = await db.insert(uploadDiagnostics).values(row).returning();
    return created;
  }

  // Merchant Metadata
  async getMerchantMetadata(userId: string): Promise<MerchantMetadata[]> {
    return db.select().from(merchantMetadata)
      .where(eq(merchantMetadata.userId, userId))
      .orderBy(desc(merchantMetadata.updatedAt));
  }

  async getMerchantMetadataById(id: string, userId: string): Promise<MerchantMetadata | undefined> {
    const [metadata] = await db.select().from(merchantMetadata)
      .where(and(eq(merchantMetadata.id, id), eq(merchantMetadata.userId, userId)));
    return metadata || undefined;
  }

  async createMerchantMetadata(metadata: InsertMerchantMetadata): Promise<MerchantMetadata> {
    const [created] = await db.insert(merchantMetadata).values(metadata).returning();
    return created;
  }

  async updateMerchantMetadata(id: string, userId: string, data: Partial<MerchantMetadata>): Promise<MerchantMetadata | undefined> {
    const [updated] = await db.update(merchantMetadata)
      .set(data)
      .where(and(eq(merchantMetadata.id, id), eq(merchantMetadata.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteMerchantMetadata(id: string, userId: string): Promise<void> {
    await db.delete(merchantMetadata)
      .where(and(eq(merchantMetadata.id, id), eq(merchantMetadata.userId, userId)));
  }

  async findMerchantMatch(userId: string, description: string): Promise<MerchantMetadata | undefined> {
    const allMetadata = await this.getMerchantMetadata(userId);
    const descUpper = description.toUpperCase();

    for (const meta of allMetadata) {
      if (descUpper.includes(meta.pattern.toUpperCase())) {
        return meta;
      }
    }

    return undefined;
  }

  // Transactions
  async getTransactions(userId: string, month?: string): Promise<Transaction[]> {
    if (month) {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      return db.select().from(transactions)
        .where(and(
          eq(transactions.userId, userId),
          gte(transactions.paymentDate, startDate),
          lt(transactions.paymentDate, endDate)
        ))
        .orderBy(desc(transactions.paymentDate));
    }
    return db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.paymentDate));
  }

  // Get transactions with alias + logo enrichment
  async getTransactionsWithMerchantAlias(userId: string, month?: string): Promise<(Transaction & { aliasDesc: string | null; logoLocalPath: string | null; appCategory: string | null })[]> {
    const txs = await this.getTransactions(userId, month);
    const [keyDescRows, aliasRows, appCats, appLeafs] = await Promise.all([
      this.getKeyDescMap(userId),
      this.getAliasAssets(userId),
      this.getAppCategories(userId),
      this.getAppCategoryLeaf(userId)
    ]);

    const keyDescToAlias = new Map(keyDescRows.map(row => [row.keyDesc, row.aliasDesc || undefined]));
    const aliasToLogo = new Map(aliasRows.map(row => [row.aliasDesc, row.logoLocalPath || undefined]));
    const appCatMap = new Map(appCats.map(cat => [cat.appCatId, cat.name]));
    const leafToApp = new Map(appLeafs.map(link => [link.leafId, appCatMap.get(link.appCatId) || "Em aberto"]));

    return txs.map(tx => {
      const resolvedAlias = tx.aliasDesc || (tx.keyDesc ? keyDescToAlias.get(tx.keyDesc) : undefined);
      const resolvedLogo = resolvedAlias ? aliasToLogo.get(resolvedAlias) : undefined;
      const resolvedCategory = tx.leafId ? leafToApp.get(tx.leafId) : undefined;
      return {
        ...tx,
        category1: (resolvedCategory || tx.category1) as any,
        appCategory: resolvedCategory || null,
        aliasDesc: resolvedAlias ?? null,
        logoLocalPath: resolvedLogo ?? null
      };
    });
  }

  async getTransactionsByNeedsReview(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.needsReview, true)
      ))
      .orderBy(desc(transactions.paymentDate));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.id, id));
    return tx || undefined;
  }

  async getTransactionByKey(userId: string, key: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.key, key)));
    return tx || undefined;
  }

  async getTransactionsByKeyDesc(userId: string, keyDesc: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.keyDesc, keyDesc)))
      .orderBy(desc(transactions.paymentDate));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const [updated] = await db.update(transactions).set(data).where(eq(transactions.id, id)).returning();
    return updated || undefined;
  }

  async bulkUpdateTransactions(ids: string[], data: Partial<Transaction>): Promise<void> {
    for (const id of ids) {
      await db.update(transactions).set(data).where(eq(transactions.id, id));
    }
  }

  // Rules
  async getRules(userId: string): Promise<Rule[]> {
    return db.select().from(rules)
      .where(or(eq(rules.userId, userId), isNull(rules.userId)))
      .orderBy(desc(rules.priority), desc(rules.createdAt));
  }

  async getRule(id: string): Promise<Rule | undefined> {
    const [rule] = await db.select().from(rules).where(eq(rules.id, id));
    return rule || undefined;
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const [created] = await db.insert(rules).values(rule).returning();
    return created;
  }

  async updateRule(id: string, data: Partial<Rule>): Promise<Rule | undefined> {
    const [updated] = await db.update(rules).set(data).where(eq(rules.id, id)).returning();
    return updated || undefined;
  }

  async deleteRule(id: string): Promise<void> {
    await db.delete(rules).where(eq(rules.id, id));
  }

  // Taxonomy + App Categories
  async getTaxonomyLevel1(userId: string): Promise<TaxonomyLevel1[]> {
    return db.select().from(taxonomyLevel1)
      .where(eq(taxonomyLevel1.userId, userId))
      .orderBy(desc(taxonomyLevel1.updatedAt));
  }

  async getTaxonomyLevel2(userId: string): Promise<TaxonomyLevel2[]> {
    return db.select().from(taxonomyLevel2)
      .where(eq(taxonomyLevel2.userId, userId))
      .orderBy(desc(taxonomyLevel2.updatedAt));
  }

  async getTaxonomyLeaf(userId: string): Promise<TaxonomyLeaf[]> {
    return db.select().from(taxonomyLeaf)
      .where(eq(taxonomyLeaf.userId, userId))
      .orderBy(desc(taxonomyLeaf.updatedAt));
  }

  async getAppCategories(userId: string): Promise<AppCategory[]> {
    return db.select().from(appCategory)
      .where(eq(appCategory.userId, userId))
      .orderBy(appCategory.orderIndex);
  }

  async getAppCategoryLeaf(userId: string): Promise<AppCategoryLeaf[]> {
    return db.select().from(appCategoryLeaf)
      .where(eq(appCategoryLeaf.userId, userId));
  }

  async createTaxonomyLevel1(row: InsertTaxonomyLevel1): Promise<TaxonomyLevel1> {
    const [created] = await db.insert(taxonomyLevel1).values(row).returning();
    return created;
  }

  async createTaxonomyLevel2(row: InsertTaxonomyLevel2): Promise<TaxonomyLevel2> {
    const [created] = await db.insert(taxonomyLevel2).values(row).returning();
    return created;
  }

  async createTaxonomyLeaf(row: InsertTaxonomyLeaf): Promise<TaxonomyLeaf> {
    const [created] = await db.insert(taxonomyLeaf).values(row).returning();
    return created;
  }

  async createAppCategory(row: InsertAppCategory): Promise<AppCategory> {
    const [created] = await db.insert(appCategory).values(row).returning();
    return created;
  }

  async createAppCategoryLeaf(row: InsertAppCategoryLeaf): Promise<AppCategoryLeaf> {
    const [created] = await db.insert(appCategoryLeaf).values(row).returning();
    return created;
  }

  async deleteTaxonomyForUser(userId: string): Promise<void> {
    await db.delete(appCategoryLeaf).where(eq(appCategoryLeaf.userId, userId));
    await db.delete(rules).where(eq(rules.userId, userId));
    await db.delete(taxonomyLeaf).where(eq(taxonomyLeaf.userId, userId));
    await db.delete(taxonomyLevel2).where(eq(taxonomyLevel2.userId, userId));
    await db.delete(taxonomyLevel1).where(eq(taxonomyLevel1.userId, userId));
    await db.delete(appCategory).where(eq(appCategory.userId, userId));
  }

  // Alias + key_desc mapping
  async getKeyDescMap(userId: string): Promise<KeyDescMap[]> {
    return db.select().from(keyDescMap)
      .where(eq(keyDescMap.userId, userId))
      .orderBy(desc(keyDescMap.updatedAt));
  }

  async getKeyDescMapping(userId: string, keyDesc: string): Promise<KeyDescMap | undefined> {
    const [row] = await db.select().from(keyDescMap)
      .where(and(eq(keyDescMap.userId, userId), eq(keyDescMap.keyDesc, keyDesc)));
    return row || undefined;
  }

  async upsertKeyDescMapping(row: InsertKeyDescMap): Promise<KeyDescMap> {
    const existing = await this.getKeyDescMapping(row.userId, row.keyDesc);
    if (existing) {
      const [updated] = await db.update(keyDescMap)
        .set({
          simpleDesc: row.simpleDesc,
          aliasDesc: row.aliasDesc ?? existing.aliasDesc,
          updatedAt: new Date()
        })
        .where(and(eq(keyDescMap.userId, row.userId), eq(keyDescMap.keyDesc, row.keyDesc)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(keyDescMap).values(row).returning();
    return created;
  }

  async updateKeyDescMapping(userId: string, keyDesc: string, data: Partial<KeyDescMap>): Promise<KeyDescMap | undefined> {
    const [updated] = await db.update(keyDescMap)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(keyDescMap.userId, userId), eq(keyDescMap.keyDesc, keyDesc)))
      .returning();
    return updated || undefined;
  }

  async getAliasAssets(userId: string): Promise<AliasAssets[]> {
    return db.select().from(aliasAssets)
      .where(eq(aliasAssets.userId, userId))
      .orderBy(desc(aliasAssets.updatedAt));
  }

  async getAliasAsset(userId: string, aliasDesc: string): Promise<AliasAssets | undefined> {
    const [row] = await db.select().from(aliasAssets)
      .where(and(eq(aliasAssets.userId, userId), eq(aliasAssets.aliasDesc, aliasDesc)));
    return row || undefined;
  }

  async upsertAliasAsset(row: InsertAliasAssets): Promise<AliasAssets> {
    const existing = await this.getAliasAsset(row.userId, row.aliasDesc);
    if (existing) {
      const [updated] = await db.update(aliasAssets)
        .set({ ...row, updatedAt: new Date() })
        .where(and(eq(aliasAssets.userId, row.userId), eq(aliasAssets.aliasDesc, row.aliasDesc)))
        .returning();
      return updated;
    }
    const [created] = await db.insert(aliasAssets).values(row).returning();
    return created;
  }

  async updateAliasAsset(userId: string, aliasDesc: string, data: Partial<AliasAssets>): Promise<AliasAssets | undefined> {
    const [updated] = await db.update(aliasAssets)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(aliasAssets.userId, userId), eq(aliasAssets.aliasDesc, aliasDesc)))
      .returning();
    return updated || undefined;
  }

  async deleteAliasAsset(userId: string, aliasDesc: string): Promise<void> {
    await db.delete(aliasAssets)
      .where(and(eq(aliasAssets.userId, userId), eq(aliasAssets.aliasDesc, aliasDesc)));
  }

  async updateTransactionsAliasByKeyDesc(userId: string, keyDesc: string, aliasDesc: string | null): Promise<void> {
    await db.update(transactions)
      .set({ aliasDesc })
      .where(and(eq(transactions.userId, userId), eq(transactions.keyDesc, keyDesc)));
  }

  async updateTransactionsByKeyDesc(userId: string, keyDesc: string, data: Partial<Transaction>): Promise<void> {
    await db.update(transactions)
      .set(data)
      .where(and(eq(transactions.userId, userId), eq(transactions.keyDesc, keyDesc)));
  }

  // Budgets
  async getBudgets(userId: string, month: string): Promise<Budget[]> {
    return db.select().from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.month, month)));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [created] = await db.insert(budgets).values(budget).returning();
    return created;
  }

  async updateBudget(id: string, data: Partial<Budget>): Promise<Budget | undefined> {
    const [updated] = await db.update(budgets).set(data).where(eq(budgets.id, id)).returning();
    return updated || undefined;
  }

  async deleteBudget(id: string, userId: string): Promise<void> {
    await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  }

  // Dashboard aggregations
  async getDashboardData(userId: string, month: string): Promise<{
    spentByCategory: { category: string; amount: number }[];
    totalSpent: number;
    totalIncome: number;
    pendingReviewCount: number;
    fixedExpenses: number;
    variableExpenses: number;
  }> {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const txs = await db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.paymentDate, startDate),
        lt(transactions.paymentDate, endDate)
      ));

    const appCats: AppCategory[] = await db.select().from(appCategory).where(eq(appCategory.userId, userId));
    const appCatMap = new Map<string, string>(appCats.map((cat) => [cat.appCatId, cat.name]));
    const appLeafs: AppCategoryLeaf[] = await db.select().from(appCategoryLeaf).where(eq(appCategoryLeaf.userId, userId));
    const leafToApp = new Map<string, string>(appLeafs.map((link) => [link.leafId, appCatMap.get(link.appCatId) || "Em aberto"]));

    const spentByCategory: Record<string, number> = {};
    let totalSpent = 0;
    let totalIncome = 0;
    let pendingReviewCount = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    for (const tx of txs) {
      if (tx.needsReview || tx.status === "OPEN") pendingReviewCount++;
      if (tx.excludeFromBudget || tx.internalTransfer) continue;

      if (tx.amount < 0) {
        const absAmount = Math.abs(tx.amount);
        totalSpent += absAmount;
        const cat = tx.leafId ? (leafToApp.get(tx.leafId) ?? "Em aberto") : "Em aberto";
        spentByCategory[cat] = (spentByCategory[cat] || 0) + absAmount;
        
        if (tx.fixVar === "Fixo") {
          fixedExpenses += absAmount;
        } else {
          variableExpenses += absAmount;
        }
      } else {
        totalIncome += tx.amount;
      }
    }

    return {
      spentByCategory: Object.entries(spentByCategory).map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount),
      totalSpent,
      totalIncome,
      pendingReviewCount,
      fixedExpenses,
      variableExpenses,
    };
  }

  // Calendar Events
  async getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return db.select().from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(calendarEvents.nextDueDate);
  }

  async getCalendarEvent(id: string): Promise<CalendarEvent | undefined> {
    const [event] = await db.select().from(calendarEvents).where(eq(calendarEvents.id, id));
    return event || undefined;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [created] = await db.insert(calendarEvents).values(event).returning();
    return created;
  }

  async updateCalendarEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const [updated] = await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id)).returning();
    return updated || undefined;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(eventOccurrences).where(eq(eventOccurrences.eventId, id));
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  // Event Occurrences
  async getEventOccurrences(eventId: string): Promise<EventOccurrence[]> {
    return db.select().from(eventOccurrences)
      .where(eq(eventOccurrences.eventId, eventId))
      .orderBy(desc(eventOccurrences.date));
  }

  async createEventOccurrence(occurrence: InsertEventOccurrence): Promise<EventOccurrence> {
    const [created] = await db.insert(eventOccurrences).values(occurrence).returning();
    return created;
  }

  async updateEventOccurrence(id: string, data: Partial<EventOccurrence>): Promise<EventOccurrence | undefined> {
    const [updated] = await db.update(eventOccurrences).set(data).where(eq(eventOccurrences.id, id)).returning();
    return updated || undefined;
  }

  // Get all uncategorized transactions (needsReview = true and no category)
  async getUncategorizedTransactions(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.needsReview, true),
        or(isNull(transactions.category1), eq(transactions.category1, "Outros"))
      ))
      .orderBy(desc(transactions.paymentDate));
  }

  // Get transactions matching a keyword in descNorm
  async getTransactionsByKeyword(userId: string, keyword: string): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        like(transactions.descNorm, `%${keyword}%`)
      ))
      .orderBy(desc(transactions.paymentDate));
  }

  // Goals
  async getGoals(userId: string, month?: string): Promise<Goal[]> {
    if (month) {
      return db.select().from(goals)
        .where(and(eq(goals.userId, userId), eq(goals.month, month)))
        .orderBy(desc(goals.createdAt));
    }
    return db.select().from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async getGoalById(goalId: string, userId: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
    return goal || undefined;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [created] = await db.insert(goals).values(goal).returning();
    return created;
  }

  async updateGoal(goalId: string, userId: string, data: Partial<Goal>): Promise<Goal | undefined> {
    const [updated] = await db.update(goals)
      .set(data)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteGoal(goalId: string, userId: string): Promise<{ success: boolean; deletedCategoryGoalsCount: number }> {
    // First, delete all associated category goals
    const deletedCategoryGoals = await db.delete(categoryGoals)
      .where(eq(categoryGoals.goalId, goalId))
      .returning();

    // Then delete the goal itself
    const [deletedGoal] = await db.delete(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
      .returning();

    return {
      success: !!deletedGoal,
      deletedCategoryGoalsCount: deletedCategoryGoals.length
    };
  }

  // Category Goals
  async getCategoryGoals(goalId: string): Promise<CategoryGoal[]> {
    return db.select().from(categoryGoals)
      .where(eq(categoryGoals.goalId, goalId));
  }

  async getCategoryGoal(categoryGoalId: string): Promise<CategoryGoal | undefined> {
    const [catGoal] = await db.select().from(categoryGoals)
      .where(eq(categoryGoals.id, categoryGoalId));
    return catGoal || undefined;
  }

  async upsertCategoryGoal(goalId: string, data: InsertCategoryGoal): Promise<CategoryGoal> {
    // Check if category goal already exists for this goal + category1
    const [existing] = await db.select().from(categoryGoals)
      .where(and(
        eq(categoryGoals.goalId, goalId),
        eq(categoryGoals.category1, data.category1)
      ));

    if (existing) {
      // Update existing
      const [updated] = await db.update(categoryGoals)
        .set({
          targetAmount: data.targetAmount,
          previousMonthSpent: data.previousMonthSpent ?? existing.previousMonthSpent,
          averageSpent: data.averageSpent ?? existing.averageSpent
        })
        .where(eq(categoryGoals.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new
      const [created] = await db.insert(categoryGoals)
        .values({ ...data, goalId })
        .returning();
      return created;
    }
  }

  async deleteCategoryGoal(categoryGoalId: string): Promise<void> {
    await db.delete(categoryGoals).where(eq(categoryGoals.id, categoryGoalId));
  }

  // Progress calculation helpers
  async calculateHistoricalSpending(userId: string, month: string, category1: string): Promise<{
    previousMonthSpent: number | null;
    averageSpent: number | null;
  }> {
    // Parse the month (YYYY-MM format)
    const [year, monthNum] = month.split('-').map(Number);

    // Calculate previous month
    const prevDate = new Date(year, monthNum - 2, 1); // monthNum - 2 because months are 0-indexed
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    // Get previous month spending
    const prevMonthTxs = await this.getTransactions(userId, prevMonth);
    const previousMonthSpent = prevMonthTxs
      .filter(tx =>
        tx.category1 === category1 &&
        tx.amount < 0 &&
        !tx.excludeFromBudget &&
        !tx.internalTransfer
      )
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Calculate 3-month average
    const months: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(year, monthNum - 1 - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    let totalSpent = 0;
    let monthsWithData = 0;

    for (const m of months) {
      const txs = await this.getTransactions(userId, m);
      const monthSpent = txs
        .filter(tx =>
          tx.category1 === category1 &&
          tx.amount < 0 &&
          !tx.excludeFromBudget &&
          !tx.internalTransfer
        )
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      if (monthSpent > 0) {
        totalSpent += monthSpent;
        monthsWithData++;
      }
    }

    const averageSpent = monthsWithData > 0 ? totalSpent / monthsWithData : null;

    return {
      previousMonthSpent: previousMonthSpent > 0 ? previousMonthSpent : null,
      averageSpent
    };
  }

  async getGoalProgress(goalId: string, userId: string): Promise<{
    goal: Goal;
    progress: {
      totalActualSpent: number;
      totalTarget: number;
      remainingBudget: number;
      percentSpent: number;
      categories: Array<{
        category1: string;
        targetAmount: number;
        actualSpent: number;
        remaining: number;
        percentSpent: number;
        status: "under" | "over" | "on-track";
      }>;
    };
  } | null> {
    // Get the goal
    const goal = await this.getGoalById(goalId, userId);
    if (!goal) return null;

    // Get category goals for this goal
    const catGoals = await this.getCategoryGoals(goalId);

    // Get all transactions for this month
    const monthTxs = await this.getTransactions(userId, goal.month);

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    for (const tx of monthTxs) {
      if (tx.excludeFromBudget || tx.internalTransfer || tx.amount >= 0) continue;

      const cat = tx.category1 || "Outros";
      spendingByCategory[cat] = (spendingByCategory[cat] || 0) + Math.abs(tx.amount);
    }

    // Build category progress
    const categories = catGoals.map(catGoal => {
      const actualSpent = spendingByCategory[catGoal.category1] || 0;
      const remaining = catGoal.targetAmount - actualSpent;
      const percentSpent = catGoal.targetAmount > 0
        ? (actualSpent / catGoal.targetAmount) * 100
        : 0;

      let status: "under" | "over" | "on-track";
      if (percentSpent < 90) {
        status = "under";
      } else if (percentSpent > 110) {
        status = "over";
      } else {
        status = "on-track";
      }

      return {
        category1: catGoal.category1,
        targetAmount: catGoal.targetAmount,
        actualSpent,
        remaining,
        percentSpent,
        status
      };
    });

    // Calculate totals
    const totalTarget = catGoals.reduce((sum, cg) => sum + cg.targetAmount, 0);
    const totalActualSpent = categories.reduce((sum, c) => sum + c.actualSpent, 0);
    const remainingBudget = totalTarget - totalActualSpent;
    const percentSpent = totalTarget > 0 ? (totalActualSpent / totalTarget) * 100 : 0;

    return {
      goal,
      progress: {
        totalActualSpent,
        totalTarget,
        remainingBudget,
        percentSpent,
        categories
      }
    };
  }

  // Rituals
  async getRituals(userId: string, type?: string, period?: string): Promise<Ritual[]> {
    let query = db.select().from(rituals).where(eq(rituals.userId, userId));

    if (type && period) {
      return db.select().from(rituals)
        .where(and(
          eq(rituals.userId, userId),
          eq(rituals.type, type),
          eq(rituals.period, period)
        ))
        .orderBy(desc(rituals.createdAt));
    } else if (type) {
      return db.select().from(rituals)
        .where(and(
          eq(rituals.userId, userId),
          eq(rituals.type, type)
        ))
        .orderBy(desc(rituals.createdAt));
    }

    return db.select().from(rituals)
      .where(eq(rituals.userId, userId))
      .orderBy(desc(rituals.createdAt));
  }

  async getRitualById(ritualId: string, userId: string): Promise<Ritual | undefined> {
    const [ritual] = await db.select().from(rituals)
      .where(and(eq(rituals.id, ritualId), eq(rituals.userId, userId)));
    return ritual || undefined;
  }

  async createRitual(ritual: InsertRitual): Promise<Ritual> {
    const [created] = await db.insert(rituals).values(ritual).returning();
    return created;
  }

  async updateRitual(ritualId: string, userId: string, data: Partial<Ritual>): Promise<Ritual | undefined> {
    const [updated] = await db.update(rituals)
      .set(data)
      .where(and(eq(rituals.id, ritualId), eq(rituals.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteRitual(ritualId: string, userId: string): Promise<void> {
    await db.delete(rituals)
      .where(and(eq(rituals.id, ritualId), eq(rituals.userId, userId)));
  }

  async completeRitual(ritualId: string, userId: string, notes?: string): Promise<Ritual | undefined> {
    const [updated] = await db.update(rituals)
      .set({
        completedAt: new Date(),
        notes: notes || null
      })
      .where(and(eq(rituals.id, ritualId), eq(rituals.userId, userId)))
      .returning();
    return updated || undefined;
  }

  // Merchant Descriptions
  async getMerchantDescriptions(userId: string, filters?: { source?: string; search?: string; isManual?: boolean }): Promise<MerchantDescription[]> {
    let query = db.select().from(merchantDescriptions).where(eq(merchantDescriptions.userId, userId));

    if (filters?.source) {
      query = query.where(and(
        eq(merchantDescriptions.userId, userId),
        eq(merchantDescriptions.source, filters.source as any)
      ));
    }

    if (filters?.isManual !== undefined) {
      query = query.where(and(
        eq(merchantDescriptions.userId, userId),
        eq(merchantDescriptions.isManual, filters.isManual)
      ));
    }

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.where(and(
        eq(merchantDescriptions.userId, userId),
        or(
          like(merchantDescriptions.keyDesc, searchPattern),
          like(merchantDescriptions.aliasDesc, searchPattern)
        )
      ));
    }

    return query.orderBy(desc(merchantDescriptions.updatedAt));
  }

  async getMerchantDescription(userId: string, source: string, keyDesc: string): Promise<MerchantDescription | undefined> {
    const [description] = await db.select().from(merchantDescriptions)
      .where(and(
        eq(merchantDescriptions.userId, userId),
        eq(merchantDescriptions.source, source as any),
        eq(merchantDescriptions.keyDesc, keyDesc)
      ));
    return description || undefined;
  }

  async getMerchantDescriptionById(id: string): Promise<MerchantDescription | undefined> {
    const [description] = await db.select().from(merchantDescriptions)
      .where(eq(merchantDescriptions.id, id));
    return description || undefined;
  }

  async createMerchantDescription(description: InsertMerchantDescription): Promise<MerchantDescription> {
    const [created] = await db.insert(merchantDescriptions).values(description).returning();
    return created;
  }

  async updateMerchantDescription(id: string, data: Partial<MerchantDescription>): Promise<MerchantDescription | undefined> {
    const [updated] = await db.update(merchantDescriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(merchantDescriptions.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMerchantDescription(id: string): Promise<void> {
    await db.delete(merchantDescriptions).where(eq(merchantDescriptions.id, id));
  }

  async upsertMerchantDescription(userId: string, source: string, keyDesc: string, aliasDesc: string, isManual: boolean): Promise<MerchantDescription> {
    const existing = await this.getMerchantDescription(userId, source, keyDesc);

    if (existing) {
      const [updated] = await db.update(merchantDescriptions)
        .set({ aliasDesc, isManual, updatedAt: new Date() })
        .where(eq(merchantDescriptions.id, existing.id))
        .returning();
      return updated;
    }

    return this.createMerchantDescription({ userId, source: source as any, keyDesc, aliasDesc, isManual });
  }

  // Merchant Icons
  async getMerchantIcons(userId: string, filters?: { needsFetch?: boolean; search?: string }): Promise<MerchantIcon[]> {
    let query = db.select().from(merchantIcons).where(eq(merchantIcons.userId, userId));

    if (filters?.needsFetch) {
      query = query.where(and(
        eq(merchantIcons.userId, userId),
        eq(merchantIcons.shouldFetchIcon, true),
        isNull(merchantIcons.iconLocalPath)
      ));
    }

    if (filters?.search) {
      const searchPattern = `%${filters.search}%`;
      query = query.where(and(
        eq(merchantIcons.userId, userId),
        like(merchantIcons.aliasDesc, searchPattern)
      ));
    }

    return query.orderBy(desc(merchantIcons.updatedAt));
  }

  async getMerchantIcon(userId: string, aliasDesc: string): Promise<MerchantIcon | undefined> {
    const [icon] = await db.select().from(merchantIcons)
      .where(and(
        eq(merchantIcons.userId, userId),
        eq(merchantIcons.aliasDesc, aliasDesc)
      ));
    return icon || undefined;
  }

  async getMerchantIconById(id: string): Promise<MerchantIcon | undefined> {
    const [icon] = await db.select().from(merchantIcons)
      .where(eq(merchantIcons.id, id));
    return icon || undefined;
  }

  async createMerchantIcon(icon: InsertMerchantIcon): Promise<MerchantIcon> {
    const [created] = await db.insert(merchantIcons).values(icon).returning();
    return created;
  }

  async updateMerchantIcon(userId: string, aliasDesc: string, data: Partial<MerchantIcon>): Promise<MerchantIcon | undefined> {
    const [updated] = await db.update(merchantIcons)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(merchantIcons.userId, userId),
        eq(merchantIcons.aliasDesc, aliasDesc)
      ))
      .returning();
    return updated || undefined;
  }

  async deleteMerchantIcon(id: string): Promise<void> {
    await db.delete(merchantIcons).where(eq(merchantIcons.id, id));
  }

  async upsertMerchantIcon(userId: string, aliasDesc: string, data: Partial<InsertMerchantIcon>): Promise<MerchantIcon> {
    const existing = await this.getMerchantIcon(userId, aliasDesc);

    if (existing) {
      const [updated] = await db.update(merchantIcons)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(merchantIcons.id, existing.id))
        .returning();
      return updated;
    }

    return this.createMerchantIcon({ userId, aliasDesc, ...data } as InsertMerchantIcon);
  }
}

export const storage = new DatabaseStorage();
