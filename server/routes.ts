import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRuleSchema, insertGoalSchema, insertCategoryGoalSchema, insertRitualSchema } from "@shared/schema";
import { z } from "zod";
import { parseCSV, type ParsedTransaction } from "./csv-parser";
import { categorizeTransaction, suggestKeyword, AI_SEED_RULES } from "./rules-engine";
import OpenAI from "openai";
import { logger } from "./logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ===== AUTH / USER =====
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      let user = await storage.getUserByUsername(username || "demo");
      
      if (!user) {
        user = await storage.createUser({ username: username || "demo", password: password || "demo" });
      }
      
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", async (_req: Request, res: Response) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      res.json({ id: user.id, username: user.username });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== UPLOADS =====
  app.get("/api/uploads", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      const uploads = await storage.getUploads(user.id);
      res.json(uploads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process CSV upload
  app.post("/api/uploads/process", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }

      const { filename, csvContent } = req.body;

      logger.info("upload_start", {
        userId: user.id,
        filename: filename || "upload.csv",
        contentLength: csvContent?.length || 0
      });

      if (!csvContent) {
        logger.warn("upload_missing_content", { userId: user.id, filename });
        return res.status(400).json({ error: "CSV content is required" });
      }

      // Create upload record
      const upload = await storage.createUpload({
        userId: user.id,
        filename: filename || "upload.csv",
        status: "processing",
        rowsTotal: 0,
        rowsImported: 0,
      });

      // Parse CSV
      const parseResult = parseCSV(csvContent);
      
      if (!parseResult.success) {
        logger.error("upload_parse_failed", {
          userId: user.id,
          uploadId: upload.id,
          filename,
          format: parseResult.format,
          errorsCount: parseResult.errors.length,
          errors: parseResult.errors
        });

        await storage.updateUpload(upload.id, {
          status: "error",
          errorMessage: parseResult.errors.join("; "),
          rowsTotal: parseResult.rowsTotal,
          rowsImported: 0
        });
        return res.status(400).json({
          success: false,
          uploadId: upload.id,
          errors: parseResult.errors
        });
      }

      // Get rules for categorization
      const rules = await storage.getRules(user.id);
      
      // Process each transaction
      let importedCount = 0;
      let duplicateCount = 0;
      const errors: string[] = [];

      for (const parsed of parseResult.transactions) {
        // Check for duplicates by key
        const existing = await storage.getTransactionByKey(parsed.key);
        if (existing) {
          duplicateCount++;
          continue;
        }

        // Categorize using rules with confidence level
        const categorization = categorizeTransaction(parsed.descNorm, rules);
        const keyword = suggestKeyword(parsed.descNorm);

        try {
          await storage.createTransaction({
            userId: user.id,
            paymentDate: parsed.paymentDate,
            accountSource: parsed.accountSource,
            descRaw: parsed.descRaw,
            descNorm: parsed.descNorm,
            amount: parsed.amount,
            currency: parsed.currency,
            foreignAmount: parsed.foreignAmount,
            foreignCurrency: parsed.foreignCurrency,
            exchangeRate: parsed.exchangeRate,
            key: parsed.key,
            uploadId: upload.id,
            suggestedKeyword: keyword,
            ...categorization
          });
          importedCount++;
        } catch (err: any) {
          const errorMsg = `Failed to import: ${parsed.descRaw.slice(0, 50)}`;
          errors.push(errorMsg);
          logger.warn("upload_transaction_failed", {
            userId: user.id,
            uploadId: upload.id,
            accountSource: parsed.accountSource,
            error: err.message
          });
        }
      }

      // Update upload status
      const finalStatus = duplicateCount === parseResult.transactions.length ? "duplicate" : "ready";
      await storage.updateUpload(upload.id, {
        status: finalStatus,
        rowsTotal: parseResult.rowsTotal,
        rowsImported: importedCount,
        monthAffected: parseResult.monthAffected,
        errorMessage: errors.length > 0 ? errors.join("; ") : undefined
      });

      const duration = Date.now() - startTime;

      logger.info("upload_complete", {
        userId: user.id,
        uploadId: upload.id,
        filename,
        format: parseResult.format,
        status: finalStatus,
        rowsTotal: parseResult.rowsTotal,
        rowsImported: importedCount,
        duplicates: duplicateCount,
        storageErrorsCount: errors.length,
        monthAffected: parseResult.monthAffected,
        durationMs: duration
      });

      res.json({
        success: true,
        uploadId: upload.id,
        rowsTotal: parseResult.rowsTotal,
        rowsImported: importedCount,
        duplicates: duplicateCount,
        monthAffected: parseResult.monthAffected,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error: any) {
      logger.error("upload_server_error", {
        error: error.message,
        stack: error.stack?.split('\n')[0]
      });
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TRANSACTIONS =====
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      
      const month = req.query.month as string | undefined;
      const transactions = await storage.getTransactions(user.id, month);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/confirm-queue", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      
      const transactions = await storage.getTransactionsByNeedsReview(user.id);
      
      // Add keyword suggestion for each
      const withSuggestions = transactions.map(tx => ({
        ...tx,
        suggestedKeyword: suggestKeyword(tx.descNorm)
      }));
      
      res.json(withSuggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await storage.updateTransaction(id, data);
      if (!updated) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk confirm with optional rule creation
  app.post("/api/transactions/confirm", async (req: Request, res: Response) => {
    try {
      const { ids, createRule, keyword, type, fixVar, category1, category2, excludeFromBudget } = req.body;
      
      if (!ids || ids.length === 0) {
        return res.status(400).json({ error: "No transaction IDs provided" });
      }

      const updateData: any = { needsReview: false };
      if (type) updateData.type = type;
      if (fixVar) updateData.fixVar = fixVar;
      if (category1) updateData.category1 = category1;
      if (category2 !== undefined) updateData.category2 = category2;
      if (excludeFromBudget !== undefined) updateData.excludeFromBudget = excludeFromBudget;
      if (category1 === "Interno") {
        updateData.internalTransfer = true;
        updateData.excludeFromBudget = true;
      }

      await storage.bulkUpdateTransactions(ids, updateData);

      // Create rule if requested
      let createdRule = null;
      if (createRule && keyword && type && fixVar && category1) {
        let user = await storage.getUserByUsername("demo");
        if (user) {
          createdRule = await storage.createRule({
            userId: user.id,
            name: keyword,
            keywords: keyword,
            type,
            fixVar,
            category1,
            category2
          });

          // Update transactions with the new rule ID
          await storage.bulkUpdateTransactions(ids, { ruleIdApplied: createdRule.id });
        }
      }

      res.json({ 
        success: true, 
        count: ids.length,
        ruleCreated: createdRule ? true : false,
        ruleId: createdRule?.id
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== RULES =====
  app.get("/api/rules", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      
      const rules = await storage.getRules(user.id);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rules", async (req: Request, res: Response) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      
      const ruleData = insertRuleSchema.parse({ ...req.body, userId: user.id });
      const rule = await storage.createRule(ruleData);
      res.json(rule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Seed AI-powered rules
  app.post("/api/rules/seed", async (_req: Request, res: Response) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      
      let count = 0;
      for (const seedRule of AI_SEED_RULES) {
        await storage.createRule({
          ...seedRule,
          userId: null
        });
        count++;
      }
      
      res.json({ success: true, count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Re-apply ALL rules to pending transactions
  app.post("/api/rules/reapply-all", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });

      const rules = await storage.getRules(user.id);
      const transactions = await storage.getTransactionsByNeedsReview(user.id);
      
      let categorizedCount = 0;
      let stillPendingCount = 0;

      for (const tx of transactions) {
        const result = categorizeTransaction(tx.descNorm, rules);
        
        if (result.confidence && result.confidence > 0) {
          await storage.updateTransaction(tx.id, {
            ...result,
            needsReview: result.confidence < 80
          });
          if (result.confidence >= 80) {
            categorizedCount++;
          } else {
            stillPendingCount++;
          }
        } else {
          stillPendingCount++;
        }
      }

      res.json({ 
        success: true, 
        total: transactions.length,
        categorized: categorizedCount,
        stillPending: stillPendingCount
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Apply rules to existing transactions
  app.post("/api/rules/:id/apply", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const rule = await storage.getRule(id);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }

      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get unreviewed transactions
      const transactions = await storage.getTransactionsByNeedsReview(user.id);
      
      const keywords = rule.keywords.split(";").map(k => k.toLowerCase().trim());
      let appliedCount = 0;

      for (const tx of transactions) {
        const descNorm = tx.descNorm.toLowerCase();
        const matches = keywords.some(k => descNorm.includes(k));
        
        if (matches) {
          await storage.updateTransaction(tx.id, {
            type: rule.type,
            fixVar: rule.fixVar,
            category1: rule.category1,
            category2: rule.category2,
            needsReview: false,
            ruleIdApplied: rule.id,
            internalTransfer: rule.category1 === "Interno",
            excludeFromBudget: rule.category1 === "Interno"
          });
          appliedCount++;
        }
      }

      res.json({ success: true, appliedCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/rules/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRule(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/rules/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteRule(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== DASHBOARD =====
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.json({
          spentByCategory: [],
          totalSpent: 0,
          totalIncome: 0,
          pendingReviewCount: 0,
          fixedExpenses: 0,
          variableExpenses: 0,
          month: req.query.month || new Date().toISOString().slice(0, 7),
        });
      }
      
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const data = await storage.getDashboardData(user.id, month);
      res.json({ ...data, month });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== BUDGETS =====
  app.get("/api/budgets", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const budgets = await storage.getBudgets(user.id, month);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }

      const budget = await storage.createBudget({
        ...req.body,
        userId: user.id
      });
      res.json(budget);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      const updated = await storage.updateBudget(id, user.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/budgets/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const { id } = req.params;
      await storage.deleteBudget(id, user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== GOALS =====
  app.get("/api/goals", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "INFO",
          endpoint: `${req.method} ${req.path}`,
          userId: "none",
          action: "get_goals_no_user",
          metadata: {}
        }));
        return res.json({ goals: [] });
      }

      const month = req.query.month as string | undefined;

      // Validate month format if provided
      if (month && !/^\d{4}-\d{2}$/.test(month)) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "validation_failed",
          metadata: { error: "Invalid month format", month }
        }));
        return res.status(400).json({ error: `Invalid month format. Expected YYYY-MM, got '${month}'` });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_goals",
        metadata: { month }
      }));

      const goals = await storage.getGoals(user.id, month);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_goals_success",
        metadata: { goalsCount: goals.length },
        duration: Date.now() - startTime
      }));

      res.json({ goals });
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/goals", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "create_goal",
        metadata: { month: req.body.month }
      }));

      // Validate request body
      const validatedData = insertGoalSchema.parse({
        ...req.body,
        userId: user.id
      });

      // Check for duplicate (goal already exists for this month)
      const existing = await storage.getGoals(user.id, validatedData.month);
      if (existing.length > 0) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "duplicate_goal",
          metadata: { month: validatedData.month }
        }));
        return res.status(409).json({ error: `Goal already exists for month ${validatedData.month}` });
      }

      const goal = await storage.createGoal(validatedData);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "create_goal_success",
        metadata: { goalId: goal.id, month: goal.month },
        duration: Date.now() - startTime
      }));

      res.status(201).json(goal);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: "unknown",
          action: "validation_failed",
          metadata: { errors: error.errors }
        }));
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/goals/:id", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const goalId = req.params.id;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "update_goal",
        metadata: { goalId }
      }));

      // Validate partial update
      const updateSchema = insertGoalSchema.partial().omit({ userId: true });
      const validatedData = updateSchema.parse(req.body);

      const updated = await storage.updateGoal(goalId, user.id, validatedData);

      if (!updated) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "goal_not_found",
          metadata: { goalId }
        }));
        return res.status(404).json({ error: "Goal not found" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "update_goal_success",
        metadata: { goalId },
        duration: Date.now() - startTime
      }));

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const goalId = req.params.id;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "delete_goal",
        metadata: { goalId }
      }));

      const result = await storage.deleteGoal(goalId, user.id);

      if (!result.success) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "goal_not_found",
          metadata: { goalId }
        }));
        return res.status(404).json({ error: "Goal not found" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "delete_goal_success",
        metadata: {
          goalId,
          deletedCategoryGoalsCount: result.deletedCategoryGoalsCount
        },
        duration: Date.now() - startTime
      }));

      res.json({
        success: true,
        deletedGoalId: goalId,
        deletedCategoryGoalsCount: result.deletedCategoryGoalsCount
      });
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/goals/:goalId/categories", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json({ categoryGoals: [] });

      const goalId = req.params.goalId;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_category_goals",
        metadata: { goalId }
      }));

      // Verify goal exists and belongs to user
      const goal = await storage.getGoalById(goalId, user.id);
      if (!goal) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "goal_not_found",
          metadata: { goalId }
        }));
        return res.status(404).json({ error: "Goal not found" });
      }

      const categoryGoals = await storage.getCategoryGoals(goalId);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_category_goals_success",
        metadata: { goalId, categoryGoalsCount: categoryGoals.length },
        duration: Date.now() - startTime
      }));

      res.json({ categoryGoals });
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/goals/:goalId/categories", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }

      const goalId = req.params.goalId;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "create_category_goal",
        metadata: { goalId, category1: req.body.category1 }
      }));

      // Verify goal exists and belongs to user
      const goal = await storage.getGoalById(goalId, user.id);
      if (!goal) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "goal_not_found",
          metadata: { goalId }
        }));
        return res.status(404).json({ error: "Parent goal not found" });
      }

      // Validate request body
      const validatedData = insertCategoryGoalSchema.parse({
        ...req.body,
        goalId
      });

      // Calculate historical spending if not provided
      let previousMonthSpent = validatedData.previousMonthSpent ?? null;
      let averageSpent = validatedData.averageSpent ?? null;

      if (previousMonthSpent === null || averageSpent === null) {
        const historical = await storage.calculateHistoricalSpending(
          user.id,
          goal.month,
          validatedData.category1
        );
        previousMonthSpent = historical.previousMonthSpent;
        averageSpent = historical.averageSpent;
      }

      const categoryGoal = await storage.upsertCategoryGoal(goalId, {
        ...validatedData,
        previousMonthSpent,
        averageSpent
      });

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "create_category_goal_success",
        metadata: {
          goalId,
          categoryGoalId: categoryGoal.id,
          category1: categoryGoal.category1
        },
        duration: Date.now() - startTime
      }));

      res.status(201).json(categoryGoal);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: "unknown",
          action: "validation_failed",
          metadata: { errors: error.errors }
        }));
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/category-goals/:id", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const categoryGoalId = req.params.id;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "delete_category_goal",
        metadata: { categoryGoalId }
      }));

      // Verify category goal exists
      const existing = await storage.getCategoryGoal(categoryGoalId);
      if (!existing) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "category_goal_not_found",
          metadata: { categoryGoalId }
        }));
        return res.status(404).json({ error: "Category goal not found" });
      }

      await storage.deleteCategoryGoal(categoryGoalId);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "delete_category_goal_success",
        metadata: { categoryGoalId },
        duration: Date.now() - startTime
      }));

      res.json({
        success: true,
        deletedCategoryGoalId: categoryGoalId
      });
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/goals/:id/progress", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const goalId = req.params.id;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_goal_progress",
        metadata: { goalId }
      }));

      const progressData = await storage.getGoalProgress(goalId, user.id);

      if (!progressData) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "goal_not_found",
          metadata: { goalId }
        }));
        return res.status(404).json({ error: "Goal not found" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_goal_progress_success",
        metadata: {
          goalId,
          categoriesCount: progressData.progress.categories.length,
          totalTarget: progressData.progress.totalTarget,
          totalActualSpent: progressData.progress.totalActualSpent
        },
        duration: Date.now() - startTime
      }));

      res.json(progressData);
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  // ===== CALENDAR EVENTS =====
  app.get("/api/calendar-events", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      
      const events = await storage.getCalendarEvents(user.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/calendar-events/:id", async (req: Request, res: Response) => {
    try {
      const event = await storage.getCalendarEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Evento nao encontrado" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/calendar-events", async (req: Request, res: Response) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      
      const event = await storage.createCalendarEvent({
        ...req.body,
        userId: user.id
      });
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/calendar-events/:id", async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateCalendarEvent(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Evento nao encontrado" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/calendar-events/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteCalendarEvent(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/calendar-events/:id/occurrences", async (req: Request, res: Response) => {
    try {
      const occurrences = await storage.getEventOccurrences(req.params.id);
      res.json(occurrences);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/event-occurrences", async (req: Request, res: Response) => {
    try {
      const occurrence = await storage.createEventOccurrence(req.body);
      res.status(201).json(occurrence);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/event-occurrences/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateEventOccurrence(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Occurrence not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== RITUALS =====
  app.get("/api/rituals", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "INFO",
          endpoint: `${req.method} ${req.path}`,
          userId: "none",
          action: "get_rituals_no_user",
          metadata: {}
        }));
        return res.json({ rituals: [] });
      }

      const type = req.query.type as string | undefined;
      const period = req.query.period as string | undefined;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_rituals",
        metadata: { type, period }
      }));

      const rituals = await storage.getRituals(user.id, type, period);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "get_rituals_success",
        metadata: { ritualsCount: rituals.length },
        duration: Date.now() - startTime
      }));

      res.json({ rituals });
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rituals", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "create_ritual",
        metadata: { type: req.body.type, period: req.body.period }
      }));

      // Validate request body
      const validatedData = insertRitualSchema.parse({
        ...req.body,
        userId: user.id
      });

      const ritual = await storage.createRitual(validatedData);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "create_ritual_success",
        metadata: { ritualId: ritual.id, type: ritual.type, period: ritual.period },
        duration: Date.now() - startTime
      }));

      res.status(201).json(ritual);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: "unknown",
          action: "validation_failed",
          metadata: { errors: error.errors }
        }));
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/rituals/:id", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const ritualId = req.params.id;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "update_ritual",
        metadata: { ritualId }
      }));

      // Validate partial update
      const updateSchema = insertRitualSchema.partial().omit({ userId: true });
      const validatedData = updateSchema.parse(req.body);

      const updated = await storage.updateRitual(ritualId, user.id, validatedData);

      if (!updated) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "ritual_not_found",
          metadata: { ritualId }
        }));
        return res.status(404).json({ error: "Ritual not found" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "update_ritual_success",
        metadata: { ritualId },
        duration: Date.now() - startTime
      }));

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/rituals/:id", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const ritualId = req.params.id;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "delete_ritual",
        metadata: { ritualId }
      }));

      // Verify ritual exists
      const existing = await storage.getRitualById(ritualId, user.id);
      if (!existing) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "ritual_not_found",
          metadata: { ritualId }
        }));
        return res.status(404).json({ error: "Ritual not found" });
      }

      await storage.deleteRitual(ritualId, user.id);

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "delete_ritual_success",
        metadata: { ritualId },
        duration: Date.now() - startTime
      }));

      res.json({ success: true, deletedRitualId: ritualId });
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/rituals/:id/complete", async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const ritualId = req.params.id;
      const { notes } = req.body;

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "complete_ritual",
        metadata: { ritualId, hasNotes: !!notes }
      }));

      const completed = await storage.completeRitual(ritualId, user.id, notes);

      if (!completed) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "WARN",
          endpoint: `${req.method} ${req.path}`,
          userId: user.id,
          action: "ritual_not_found",
          metadata: { ritualId }
        }));
        return res.status(404).json({ error: "Ritual not found" });
      }

      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        endpoint: `${req.method} ${req.path}`,
        userId: user.id,
        action: "complete_ritual_success",
        metadata: { ritualId },
        duration: Date.now() - startTime
      }));

      res.json(completed);
    } catch (error: any) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        endpoint: `${req.method} ${req.path}`,
        userId: "unknown",
        action: "database_error",
        error: error.message
      }));
      res.status(500).json({ error: error.message });
    }
  });

  // ===== AI KEYWORD ANALYSIS =====
  app.post("/api/ai/analyze-keywords", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      // Get all uncategorized transactions
      const uncategorized = await storage.getUncategorizedTransactions(user.id);
      
      if (uncategorized.length === 0) {
        return res.json({ suggestions: [], message: "Nenhuma transação pendente de categorização" });
      }

      // Group by suggested keyword
      const grouped: Record<string, { count: number; total: number; samples: string[] }> = {};
      for (const tx of uncategorized) {
        const keyword = tx.suggestedKeyword || suggestKeyword(tx.descNorm);
        if (!grouped[keyword]) {
          grouped[keyword] = { count: 0, total: 0, samples: [] };
        }
        grouped[keyword].count++;
        grouped[keyword].total += Math.abs(tx.amount);
        if (grouped[keyword].samples.length < 3) {
          grouped[keyword].samples.push(tx.descRaw);
        }
      }

      // Get AI suggestions for all keywords
      const keywordList = Object.entries(grouped)
        .filter(([_, data]) => data.count >= 1)
        .map(([keyword, data]) => ({
          keyword,
          count: data.count,
          total: data.total,
          samples: data.samples
        }));

      const categories = ["Moradia", "Mercado", "Compras Online", "Transporte", "Saúde", "Lazer", "Receitas", "Interno", "Outros"];

      const systemPrompt = `Você é um assistente financeiro especializado em categorização de transações bancárias.
Analise a lista de palavras-chave e exemplos de transações e sugira a categoria mais adequada para cada uma.

Categorias disponíveis: ${categories.join(", ")}

Para cada palavra-chave, retorne um JSON com:
- keyword: a palavra-chave
- suggestedCategory: a categoria sugerida
- suggestedType: "Despesa" ou "Receita"
- suggestedFixVar: "Fixo" ou "Variável"
- confidence: número de 0 a 100 indicando sua confiança
- reason: explicação breve em português

Retorne APENAS um array JSON válido, sem markdown ou texto adicional.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(keywordList, null, 2) }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content || "[]";
      let suggestions = [];
      try {
        suggestions = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
      } catch (e) {
        console.error("Failed to parse AI response:", content);
        suggestions = keywordList.map(k => ({
          keyword: k.keyword,
          suggestedCategory: "Outros",
          suggestedType: "Despesa",
          suggestedFixVar: "Variável",
          confidence: 50,
          reason: "Sugestão automática"
        }));
      }

      // Merge with transaction counts
      const enriched = suggestions.map((s: any) => {
        const data = grouped[s.keyword];
        return {
          ...s,
          count: data?.count || 0,
          total: data?.total || 0,
          samples: data?.samples || []
        };
      });

      res.json({ suggestions: enriched, total: uncategorized.length });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Apply AI suggestions as rules
  app.post("/api/ai/apply-suggestions", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const { suggestions } = req.body;
      if (!suggestions || !Array.isArray(suggestions)) {
        return res.status(400).json({ error: "Sugestões inválidas" });
      }

      const created = [];
      const updated = [];

      for (const s of suggestions) {
        // Create rule
        const rule = await storage.createRule({
          userId: user.id,
          name: `AI: ${s.keyword}`,
          keywords: s.keyword.toLowerCase(),
          type: s.suggestedType || "Despesa",
          fixVar: s.suggestedFixVar || "Variável",
          category1: s.suggestedCategory || "Outros",
          category2: null,
          priority: 600,
          strict: false,
          isSystem: false
        });
        created.push(rule);

        // Apply to matching transactions
        const transactions = await storage.getTransactionsByKeyword(user.id, s.keyword.toLowerCase());
        for (const tx of transactions) {
          if (tx.needsReview && !tx.manualOverride) {
            await storage.updateTransaction(tx.id, {
              type: s.suggestedType || "Despesa",
              fixVar: s.suggestedFixVar || "Variável",
              category1: s.suggestedCategory || "Outros",
              needsReview: false,
              confidence: s.confidence || 80,
              ruleIdApplied: rule.id
            });
            updated.push(tx.id);
          }
        }
      }

      res.json({ 
        success: true, 
        rulesCreated: created.length, 
        transactionsUpdated: updated.length 
      });
    } catch (error: any) {
      console.error("Apply suggestions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
