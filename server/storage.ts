import { 
  users, uploads, transactions, rules, budgets, calendarEvents, eventOccurrences, goals, categoryGoals, rituals,
  type User, type InsertUser,
  type Upload, type InsertUpload,
  type Transaction, type InsertTransaction,
  type Rule, type InsertRule,
  type Budget, type InsertBudget,
  type CalendarEvent, type InsertCalendarEvent,
  type EventOccurrence, type InsertEventOccurrence,
  type Goal, type InsertGoal,
  type CategoryGoal, type InsertCategoryGoal,
  type Ritual, type InsertRitual
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, gte, lt, or, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Uploads
  getUploads(userId: string): Promise<Upload[]>;
  getUpload(id: string): Promise<Upload | undefined>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined>;
  
  // Transactions
  getTransactions(userId: string, month?: string): Promise<Transaction[]>;
  getTransactionsByNeedsReview(userId: string): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByKey(key: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction | undefined>;
  bulkUpdateTransactions(ids: string[], data: Partial<Transaction>): Promise<void>;
  
  // Rules
  getRules(userId: string): Promise<Rule[]>;
  getRule(id: string): Promise<Rule | undefined>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, data: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<void>;
  
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

  async getTransactionByKey(key: string): Promise<Transaction | undefined> {
    const [tx] = await db.select().from(transactions).where(eq(transactions.key, key));
    return tx || undefined;
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

    const spentByCategory: Record<string, number> = {};
    let totalSpent = 0;
    let totalIncome = 0;
    let pendingReviewCount = 0;
    let fixedExpenses = 0;
    let variableExpenses = 0;

    for (const tx of txs) {
      if (tx.needsReview) pendingReviewCount++;
      if (tx.excludeFromBudget || tx.internalTransfer) continue;

      if (tx.amount < 0) {
        const absAmount = Math.abs(tx.amount);
        totalSpent += absAmount;
        const cat = tx.category1 || "Outros";
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
}

export const storage = new DatabaseStorage();
