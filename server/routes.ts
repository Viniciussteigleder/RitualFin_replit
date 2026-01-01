import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRuleSchema, insertGoalSchema, insertCategoryGoalSchema, insertRitualSchema, type MerchantMetadata, type UpdateNotification, keyDescMap, aliasAssets, transactions } from "@shared/schema";
import { z } from "zod";
import * as XLSX from "xlsx";
import { parseCSV, previewCSV } from "./csv-parser";
import { categorizeTransaction, suggestKeyword, AI_SEED_RULES, classifyByKeyDesc } from "./rules-engine";
import { evaluateAliasMatch } from "./classification-utils";
import { downloadLogoForAlias } from "./logo-downloader";
import { updateRecurringGroups } from "./recurrence";
import OpenAI from "openai";
import { logger } from "./logger";
import { withOpenAIUsage } from "./ai-usage";
import { sql, eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "./db";
import fs from "node:fs/promises";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

function readWorkbookFromBase64(base64: string) {
  const buffer = Buffer.from(base64, "base64");
  return XLSX.read(buffer, { type: "buffer" });
}

function sheetToRows(sheet?: XLSX.Sheet) {
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint (required for deployment monitoring)
  app.get("/api/health", async (_req: Request, res: Response) => {
    // If database is not configured, return degraded status
    if (!isDatabaseConfigured) {
      return res.status(200).json({
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "not_configured",
        version: "1.0.0",
        warning: "DATABASE_URL not set - smoke test mode",
      });
    }

    // Normal health check with database ping
    try {
      await db.execute(sql`SELECT 1`);
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        version: "1.0.0",
      });
    } catch (_error: any) {
      logger.error("health_check_failed", { database: "disconnected" });
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed",
      });
    }
  });

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

  // ===== SETTINGS =====
  app.get("/api/settings", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });

      let userSettings = await storage.getSettings(user.id);

      // Create default settings if they don't exist
      if (!userSettings) {
        userSettings = await storage.createSettings({ userId: user.id });
      }

      res.json(userSettings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/settings", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });

      const updated = await storage.updateSettings(user.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Settings not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== NOTIFICATIONS =====
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const limitParam = req.query.limit ? Number(req.query.limit) : undefined;
      const limit = Number.isFinite(limitParam) && limitParam ? Math.min(Math.max(limitParam, 1), 200) : 200;
      const notifications = await storage.getNotifications(user.id, limit);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }

      if (!req.body.title || !req.body.message) {
        return res.status(400).json({ error: "Title and message are required" });
      }

      const notification = await storage.createNotification({
        userId: user.id,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || "info",
        isRead: Boolean(req.body.isRead),
      });
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const updateData: UpdateNotification = {};
      if (req.body.title !== undefined) updateData.title = req.body.title;
      if (req.body.message !== undefined) updateData.message = req.body.message;
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.isRead !== undefined) updateData.isRead = req.body.isRead;

      const updated = await storage.updateNotification(req.params.id, user.id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      await storage.deleteNotification(req.params.id, user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== ACCOUNTS =====
  app.get("/api/accounts", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      const accounts = await storage.getAccounts(user.id);
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounts", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const accountData = {
        userId: user.id,
        name: req.body.name,
        type: req.body.type,
        accountNumber: req.body.accountNumber || null,
        icon: req.body.icon || "credit-card",
        color: req.body.color || "#6366f1",
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const updateData: any = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.accountNumber !== undefined) updateData.accountNumber = req.body.accountNumber;
      if (req.body.icon !== undefined) updateData.icon = req.body.icon;
      if (req.body.color !== undefined) updateData.color = req.body.color;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

      const updated = await storage.updateAccount(req.params.id, user.id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      await storage.archiveAccount(req.params.id, user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/accounts/:id/balance", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Verify account exists and belongs to user
      const account = await storage.getAccount(req.params.id);
      if (!account || account.userId !== user.id) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Parse optional date filters
      const options: { startDate?: Date; endDate?: Date } = {};
      if (req.query.startDate) {
        options.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        options.endDate = new Date(req.query.endDate as string);
      }

      const balance = await storage.getAccountBalance(user.id, req.params.id, options);
      res.json(balance);
    } catch (error: any) {
      console.error("Error fetching account balance:", error);
      res.status(500).json({ error: "Failed to calculate balance" });
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

  // Get last upload status by account (Sparkasse, Amex, Miles & More)
  app.get("/api/uploads/last-by-account", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const uploads = await storage.getUploads(user.id);

      // Group by account type (detected from CSV format)
      const byAccount: Record<string, any> = {};

      for (const upload of uploads) {
        // Detect account from filename patterns
        let accountType = "unknown";
        const filename = upload.filename.toLowerCase();

        if (filename.includes("sparkasse") || filename.includes("umsatz")) {
          accountType = "sparkasse";
        } else if (filename.includes("amex") || filename.includes("activity")) {
          accountType = "amex";
        } else if (filename.includes("miles") || filename.includes("transactions_list")) {
          accountType = "miles-more";
        }

        // Keep the most recent upload for each account
        if (!byAccount[accountType] || new Date(upload.createdAt) > new Date(byAccount[accountType].createdAt)) {
          byAccount[accountType] = upload;
        }
      }

      // Get the latest transaction date for each account to show "imported through"
      const accountsWithLatestDate = await Promise.all(
        Object.entries(byAccount).map(async ([accountType, upload]) => {
          // Get transactions from this upload
          const allTransactions = await storage.getTransactions(user.id);
          const uploadTransactions = allTransactions.filter((t: any) => t.uploadId === upload.id);

          // Find latest payment date
          let importedThrough = null;
          if (uploadTransactions.length > 0) {
            const latestDate = uploadTransactions.reduce((latest: Date, t: any) => {
              const txDate = new Date(t.paymentDate);
              return txDate > latest ? txDate : latest;
            }, new Date(0));
            importedThrough = latestDate.toISOString().split('T')[0];
          }

          return {
            accountType,
            lastUploadDate: upload.createdAt,
            importedThrough,
            rowsImported: upload.rowsImported,
            status: upload.status
          };
        })
      );

      res.json(accountsWithLatestDate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Process CSV upload
  app.post("/api/imports/preview", async (req: Request, res: Response) => {
    try {
      const { filename, csvContent, encoding } = req.body;
      if (!csvContent) {
        return res.status(400).json({ error: "CSV content is required" });
      }

      logger.info("import_preview_start", {
        filename: filename || "upload.csv",
        contentLength: csvContent?.length || 0,
        encoding
      });

      const preview = previewCSV(csvContent, { encoding });
      res.json(preview);
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

      const { filename, csvContent, encoding } = req.body;

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
      const parseResult = parseCSV(csvContent, { encoding });
      
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

        // Save parse errors to database
        for (const errorStr of parseResult.errors) {
          const match = errorStr.match(/^Linha (\d+): (.+)$/);
          if (match) {
            const rowNumber = parseInt(match[1], 10);
            const errorMessage = match[2];
            await storage.createUploadError({
              uploadId: upload.id,
              rowNumber,
              errorMessage,
              rawData: null
            });
          } else {
            // General error without row number
            await storage.createUploadError({
              uploadId: upload.id,
              rowNumber: 0,
              errorMessage: errorStr,
              rawData: null
            });
          }
        }

        return res.status(400).json({
          success: false,
          uploadId: upload.id,
          errors: parseResult.errors
        });
      }

      // Get rules and settings for categorization
      const rules = await storage.getRules(user.id);
      const aliasAssets = await storage.getAliasAssets(user.id);
      let userSettings = await storage.getSettings(user.id);

      // Create default settings if they don't exist
      if (!userSettings) {
        userSettings = await storage.createSettings({ userId: user.id });
      }

      // Build accountSource -> accountId mapping
      const accountMap = new Map<string, string>();
      const uniqueAccountSources = Array.from(new Set(parseResult.transactions.map(t => t.accountSource)));

      for (const accountSource of uniqueAccountSources) {
        // Parse accountSource to determine account metadata
        let accountName: string;
        let accountType: "credit_card" | "debit_card" | "bank_account" | "cash";
        let accountNumber: string | null = null;
        let icon: string;
        let color: string;

        // Pattern 1: "Amex - Name (1234)"
        const amexMatch = accountSource.match(/Amex - (.+?) \((\d+)\)/i);
        if (amexMatch) {
          const [, name, lastDigits] = amexMatch;
          accountName = `Amex - ${name}`;
          accountType = "credit_card";
          accountNumber = lastDigits;
          icon = "credit-card";
          color = "#3b82f6"; // Blue
        }
        // Pattern 2: "Sparkasse - 1234"
        else if (accountSource.match(/Sparkasse - (\d+)/i)) {
          const sparkasseMatch = accountSource.match(/Sparkasse - (\d+)/i);
          const lastDigits = sparkasseMatch![1];
          accountName = `Sparkasse (${lastDigits})`;
          accountType = "bank_account";
          accountNumber = lastDigits;
          icon = "landmark";
          color = "#ef4444"; // Red
        }
        // Pattern 3: "M&M" or "Miles & More..."
        else if (accountSource.toLowerCase().includes("miles") || accountSource.toLowerCase().includes("m&m")) {
          const cardMatch = accountSource.match(/(\d{4}X*\d{4})/);
          const lastDigits = cardMatch ? cardMatch[1].replace(/X/g, "").slice(-4) : null;
          accountName = lastDigits ? `Miles & More (${lastDigits})` : "Miles & More";
          accountType = "credit_card";
          accountNumber = lastDigits;
          icon = "plane";
          color = "#8b5cf6"; // Purple
        }
        // Default: Unknown account
        else {
          accountName = accountSource.length > 30 ? accountSource.substring(0, 30) + "..." : accountSource;
          accountType = "credit_card";
          accountNumber = null;
          icon = "credit-card";
          color = "#6b7280"; // Gray
        }

        // Check if account already exists by name
        const existingAccounts = await storage.getAccounts(user.id);
        const existingAccount = existingAccounts.find(a => a.name === accountName);

        if (existingAccount) {
          accountMap.set(accountSource, existingAccount.id);
        } else {
          // Create new account
          const newAccount = await storage.createAccount({
            userId: user.id,
            name: accountName,
            type: accountType,
            accountNumber,
            icon,
            color,
            isActive: true
          });
          accountMap.set(accountSource, newAccount.id);
        }
      }

      // Process each transaction
      let importedCount = 0;
      let duplicateCount = 0;
      let autoClassifiedCount = 0;
      let openCount = 0;
      const importedKeyDescs = new Set<string>();
      const errors: string[] = [];

      for (const parsed of parseResult.transactions) {
        // Check for duplicates by key
        const existing = await storage.getTransactionByKey(user.id, parsed.key);
        if (existing) {
          duplicateCount++;
          continue;
        }
        const ruleMatch = classifyByKeyDesc(parsed.keyDesc, rules);
        const needsReview = !ruleMatch.leafId;
        const status = needsReview ? "OPEN" : "FINAL";
        const classifiedBy = ruleMatch.leafId ? "AUTO_KEYWORDS" : undefined;
        if (needsReview) {
          openCount++;
        } else {
          autoClassifiedCount++;
        }

        let aliasDesc: string | undefined;
        const existingMapping = await storage.getKeyDescMapping(user.id, parsed.keyDesc);
        if (existingMapping?.aliasDesc) {
          aliasDesc = existingMapping.aliasDesc;
        } else {
          for (const alias of aliasAssets) {
            const match = evaluateAliasMatch(parsed.keyDesc, alias);
            if (match.isMatch) {
              aliasDesc = alias.aliasDesc;
              break;
            }
          }
        }

        await storage.upsertKeyDescMapping({
          userId: user.id,
          keyDesc: parsed.keyDesc,
          simpleDesc: parsed.simpleDesc,
          aliasDesc: aliasDesc ?? existingMapping?.aliasDesc ?? null
        });

        if (aliasDesc && (!existingMapping?.aliasDesc || existingMapping.aliasDesc !== aliasDesc)) {
          await storage.updateTransactionsAliasByKeyDesc(user.id, parsed.keyDesc, aliasDesc);
        }

        const keyword = suggestKeyword(parsed.keyDesc);

        try {
          await storage.createTransaction({
            userId: user.id,
            paymentDate: parsed.paymentDate,
            bookingDate: parsed.bookingDate.toISOString().split("T")[0],
            accountSource: parsed.accountSource,
            accountId: accountMap.get(parsed.accountSource),
            descRaw: parsed.descRaw,
            descNorm: parsed.descNorm,
            rawDescription: parsed.rawDescription,
            normalizedDescription: parsed.descNorm,
            amount: parsed.amount,
            currency: parsed.currency,
            foreignAmount: parsed.foreignAmount,
            foreignCurrency: parsed.foreignCurrency,
            exchangeRate: parsed.exchangeRate,
            key: parsed.key,
            source: parsed.source,
            keyDesc: parsed.keyDesc,
            simpleDesc: parsed.simpleDesc,
            aliasDesc: aliasDesc,
            leafId: ruleMatch.leafId,
            classifiedBy: classifiedBy as any,
            status: status as any,
            recurringFlag: false,
            uploadId: upload.id,
            suggestedKeyword: keyword,
            needsReview,
            ruleIdApplied: ruleMatch.ruleId
          });

          importedCount++;
          importedKeyDescs.add(parsed.keyDesc);
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

      // Save parse errors to database (row-level errors from CSV parsing)
      if (parseResult.errors.length > 0) {
        for (const errorStr of parseResult.errors) {
          const match = errorStr.match(/^Linha (\d+): (.+)$/);
          if (match) {
            const rowNumber = parseInt(match[1], 10);
            const errorMessage = match[2];
            await storage.createUploadError({
              uploadId: upload.id,
              rowNumber,
              errorMessage,
              rawData: null
            });
          }
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

      if (importedKeyDescs.size > 0) {
        await updateRecurringGroups(storage, user.id, Array.from(importedKeyDescs));
      }

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
        autoClassified: autoClassifiedCount,
        openCount,
        meta: parseResult.meta,
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

  // Get errors for a specific upload
  app.get("/api/uploads/:id/errors", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Verify upload exists and belongs to user
      const upload = await storage.getUpload(req.params.id);
      if (!upload || upload.userId !== user.id) {
        return res.status(404).json({ error: "Upload not found" });
      }

      const errors = await storage.getUploadErrors(req.params.id);
      res.json({
        uploadId: req.params.id,
        errors,
        count: errors.length
      });
    } catch (error: any) {
      console.error("Error fetching upload errors:", error);
      res.status(500).json({ error: "Failed to retrieve errors" });
    }
  });

  // ===== CLASSIFICATION & DATA =====
  app.get("/api/classification/export", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const [levels1, levels2, leaves, appCats, appLeafs, rules] = await Promise.all([
        storage.getTaxonomyLevel1(user.id),
        storage.getTaxonomyLevel2(user.id),
        storage.getTaxonomyLeaf(user.id),
        storage.getAppCategories(user.id),
        storage.getAppCategoryLeaf(user.id),
        storage.getRules(user.id)
      ]);

      const level1ById = new Map(levels1.map(l => [l.level1Id, l]));
      const level2ById = new Map(levels2.map(l => [l.level2Id, l]));
      const appCatById = new Map(appCats.map(c => [c.appCatId, c]));
      const appCatByLeaf = new Map(appLeafs.map(l => [l.leafId, appCatById.get(l.appCatId)?.name || ""]));
      const ruleByLeaf = new Map(rules.filter(r => r.leafId).map(r => [r.leafId as string, r]));

      const rows = leaves.map(leaf => {
        const level2 = level2ById.get(leaf.level2Id);
        const level1 = level2 ? level1ById.get(level2.level1Id) : undefined;
        const rule = ruleByLeaf.get(leaf.leafId);
        return {
          "App classificação": appCatByLeaf.get(leaf.leafId) || "",
          "Nivel_1_PT": level1?.nivel1Pt || "",
          "Nivel_2_PT": level2?.nivel2Pt || "",
          "Nivel_3_PT": leaf.nivel3Pt || "",
          "Key_words": rule?.keyWords || "",
          "Key_words_negative": rule?.keyWordsNegative || "",
          "Receita/Despesa": leaf.receitaDespesaDefault || level2?.receitaDespesaDefault || "",
          "Fixo/Variável": leaf.fixoVariavelDefault || level2?.fixoVariavelDefault || "",
          "Recorrente": leaf.recorrenteDefault || level2?.recorrenteDefault || ""
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Categorias");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=ritualfin_categorias.xlsx");
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/classification/import/preview", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { fileBase64 } = req.body;
      if (!fileBase64) return res.status(400).json({ error: "Arquivo Excel obrigatorio" });

      const workbook = readWorkbookFromBase64(fileBase64);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = sheetToRows(sheet);

      const requiredColumns = [
        "App classificação", "Nivel_1_PT", "Nivel_2_PT", "Nivel_3_PT",
        "Key_words", "Key_words_negative", "Receita/Despesa", "Fixo/Variável", "Recorrente"
      ];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const missingColumns = requiredColumns.filter(c => !columns.includes(c));
      if (missingColumns.length > 0) {
        return res.status(400).json({ error: `Colunas faltando: ${missingColumns.join(", ")}` });
      }

      const incomingAppCats = Array.from(new Set(rows.map(r => String(r["App classificação"] || "").trim()).filter(Boolean)));
      const existingAppCats = (await storage.getAppCategories(user.id)).map(c => c.name);

      const requiresRemap = incomingAppCats.sort().join("|") !== existingAppCats.sort().join("|");

      res.json({
        rows: rows.length,
        appCategories: incomingAppCats.length,
        rules: rows.filter(r => String(r["Key_words"] || "").trim().length > 0).length,
        requiresRemap
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/classification/import/apply", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { fileBase64, confirmRemap } = req.body;
      if (!fileBase64) return res.status(400).json({ error: "Arquivo Excel obrigatorio" });

      const workbook = readWorkbookFromBase64(fileBase64);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = sheetToRows(sheet);

      const incomingAppCats = Array.from(new Set(rows.map(r => String(r["App classificação"] || "").trim()).filter(Boolean)));
      const existingAppCats = (await storage.getAppCategories(user.id)).map(c => c.name);
      const requiresRemap = incomingAppCats.sort().join("|") !== existingAppCats.sort().join("|");
      if (requiresRemap && !confirmRemap) {
        return res.status(400).json({ error: "Mudanca de categorias requer confirmacao", requiresRemap: true });
      }

      await storage.deleteTaxonomyForUser(user.id);

      const appCatMap = new Map<string, string>();
      let orderIndex = 0;
      for (const name of incomingAppCats) {
        const created = await storage.createAppCategory({
          userId: user.id,
          name,
          active: true,
          orderIndex: orderIndex++
        });
        appCatMap.set(name, created.appCatId);
      }

      const level1Map = new Map<string, string>();
      const level2Map = new Map<string, string>();
      const leafMap = new Map<string, string>();

      for (const row of rows) {
        const nivel1 = String(row["Nivel_1_PT"] || "").trim();
        const nivel2 = String(row["Nivel_2_PT"] || "").trim();
        const nivel3 = String(row["Nivel_3_PT"] || "").trim();
        const appCat = String(row["App classificação"] || "").trim();
        if (!nivel1 || !nivel2 || !nivel3) continue;

        if (!level1Map.has(nivel1)) {
          const created = await storage.createTaxonomyLevel1({
            userId: user.id,
            nivel1Pt: nivel1
          });
          level1Map.set(nivel1, created.level1Id);
        }

        const level1Id = level1Map.get(nivel1)!;
        const level2Key = `${nivel1}__${nivel2}`;
        if (!level2Map.has(level2Key)) {
          const created = await storage.createTaxonomyLevel2({
            userId: user.id,
            level1Id,
            nivel2Pt: nivel2,
            recorrenteDefault: String(row["Recorrente"] || "").trim() || null,
            fixoVariavelDefault: String(row["Fixo/Variável"] || "").trim() || null,
            receitaDespesaDefault: String(row["Receita/Despesa"] || "").trim() || null
          });
          level2Map.set(level2Key, created.level2Id);
        }

        const level2Id = level2Map.get(level2Key)!;
        const leafKey = `${level2Key}__${nivel3}`;
        if (!leafMap.has(leafKey)) {
          const created = await storage.createTaxonomyLeaf({
            userId: user.id,
            level2Id,
            nivel3Pt: nivel3,
            recorrenteDefault: String(row["Recorrente"] || "").trim() || null,
            fixoVariavelDefault: String(row["Fixo/Variável"] || "").trim() || null,
            receitaDespesaDefault: String(row["Receita/Despesa"] || "").trim() || null
          });
          leafMap.set(leafKey, created.leafId);
        }

        const leafId = leafMap.get(leafKey)!;
        const keyWords = String(row["Key_words"] || "").trim();
        const keyWordsNegative = String(row["Key_words_negative"] || "").trim();
        if (keyWords.length > 0) {
          await storage.createRule({
            userId: user.id,
            leafId,
            keyWords,
            keyWordsNegative: keyWordsNegative || null,
            active: true
          });
        }

        if (appCat && appCatMap.has(appCat)) {
          await storage.createAppCategoryLeaf({
            userId: user.id,
            appCatId: appCatMap.get(appCat)!,
            leafId
          });
        }
      }

      res.json({ success: true, rows: rows.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/classification/rule-test", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { keyDesc } = req.body;
      if (!keyDesc) return res.status(400).json({ error: "key_desc obrigatorio" });

      const rules = await storage.getRules(user.id);
      const match = classifyByKeyDesc(keyDesc, rules);

      res.json(match);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/classification/leaves", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const leaves = await storage.getTaxonomyLeaf(user.id);
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/classification/rules", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const rules = await storage.getRules(user.id);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/classification/review-queue", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const transactions = await storage.getTransactionsWithMerchantAlias(user.id);
      const open = transactions.filter(tx => tx.status === "OPEN" || tx.needsReview);
      res.json(open);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/classification/review/assign", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const schema = z.object({
        transactionId: z.string(),
        leafId: z.string(),
        ruleId: z.string().optional(),
        newExpression: z.string().optional(),
        createRule: z.boolean().optional()
      });
      const data = schema.parse(req.body);

      if (data.createRule && data.newExpression) {
        await storage.createRule({
          userId: user.id,
          leafId: data.leafId,
          keyWords: data.newExpression,
          active: true
        });
      } else if (data.ruleId && data.newExpression) {
        const rule = await storage.getRule(data.ruleId);
        if (rule) {
          const updatedKeywords = rule.keyWords
            ? `${rule.keyWords};${data.newExpression}`
            : data.newExpression;
          await storage.updateRule(rule.id, { keyWords: updatedKeywords });
        }
      }

      const updated = await storage.updateTransaction(data.transactionId, {
        leafId: data.leafId,
        classifiedBy: "MANUAL",
        status: "FINAL",
        needsReview: false
      } as any);

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/aliases/export", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const [keyDescRows, aliasRows] = await Promise.all([
        storage.getKeyDescMap(user.id),
        storage.getAliasAssets(user.id)
      ]);

      const wsKeyDesc = XLSX.utils.json_to_sheet(
        keyDescRows.map(row => ({
          key_desc: row.keyDesc,
          simple_desc: row.simpleDesc,
          alias_desc: row.aliasDesc || ""
        }))
      );
      const wsAlias = XLSX.utils.json_to_sheet(
        aliasRows.map(row => ({
          alias_desc: row.aliasDesc,
          key_words_alias: row.keyWordsAlias,
          url_logo_internet: row.urlLogoInternet || "",
          logo_local_path: row.logoLocalPath || ""
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsKeyDesc, "key_desc_map");
      XLSX.utils.book_append_sheet(wb, wsAlias, "alias_assets");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=ritualfin_aliases.xlsx");
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/aliases/import/preview", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { fileBase64 } = req.body;
      if (!fileBase64) return res.status(400).json({ error: "Arquivo Excel obrigatorio" });

      const workbook = readWorkbookFromBase64(fileBase64);
      const sheetKeyDesc = workbook.Sheets[workbook.SheetNames[0]];
      const sheetAlias = workbook.Sheets[workbook.SheetNames[1]];
      const keyDescRows = sheetToRows(sheetKeyDesc || {});
      const aliasRows = sheetToRows(sheetAlias || {});

      res.json({
        keyDescRows: keyDescRows.length,
        aliasRows: aliasRows.length
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/aliases/import/apply", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { fileBase64 } = req.body;
      if (!fileBase64) return res.status(400).json({ error: "Arquivo Excel obrigatorio" });

      const workbook = readWorkbookFromBase64(fileBase64);
      const sheetKeyDesc = workbook.Sheets[workbook.SheetNames[0]];
      const sheetAlias = workbook.Sheets[workbook.SheetNames[1]];
      const keyDescRows = sheetToRows(sheetKeyDesc || {});
      const aliasRows = sheetToRows(sheetAlias || {});

      for (const row of keyDescRows) {
        const keyDesc = String(row["key_desc"] || row["keyDesc"] || row["key_desc "] || "").trim();
        const simpleDesc = String(row["simple_desc"] || row["simpleDesc"] || "").trim();
        const aliasDesc = String(row["alias_desc"] || row["aliasDesc"] || "").trim();
        if (!keyDesc) continue;

        await storage.upsertKeyDescMapping({
          userId: user.id,
          keyDesc,
          simpleDesc: simpleDesc || keyDesc,
          aliasDesc: aliasDesc || null
        });
        if (aliasDesc) {
          await storage.updateTransactionsAliasByKeyDesc(user.id, keyDesc, aliasDesc);
        }
      }

      for (const row of aliasRows) {
        const aliasDesc = String(row["alias_desc"] || row["Alias_Desc"] || "").trim();
        const keyWordsAlias = String(row["key_words_alias"] || row["Key_words_alias"] || "").trim();
        const urlLogoInternet = String(row["url_logo_internet"] || row["URL_icon_internet"] || "").trim();
        if (!aliasDesc) continue;

        await storage.upsertAliasAsset({
          userId: user.id,
          aliasDesc,
          keyWordsAlias: keyWordsAlias || "",
          urlLogoInternet: urlLogoInternet || null
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/aliases/test", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { keyDesc } = req.body;
      if (!keyDesc) return res.status(400).json({ error: "key_desc obrigatorio" });

      const aliases = await storage.getAliasAssets(user.id);
      for (const alias of aliases) {
        const match = evaluateAliasMatch(keyDesc, alias);
        if (match.isMatch) {
          return res.json({ aliasDesc: alias.aliasDesc, matched: match.matched });
        }
      }

      res.json({ aliasDesc: null });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/aliases/refresh-logos", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      const { force } = req.body || {};
      const aliases = await storage.getAliasAssets(user.id);
      const targets = aliases.filter(a => a.urlLogoInternet && (force || !a.logoLocalPath));

      const results: Array<{ aliasDesc: string; status: string; error?: string }> = [];
      for (const alias of targets) {
        try {
          const stored = await downloadLogoForAlias({
            userId: user.id,
            aliasDesc: alias.aliasDesc,
            url: alias.urlLogoInternet as string
          });

          await storage.updateAliasAsset(user.id, alias.aliasDesc, {
            logoLocalPath: stored.logoLocalPath,
            logoMimeType: stored.logoMimeType,
            logoUpdatedAt: new Date()
          });

          results.push({ aliasDesc: alias.aliasDesc, status: "ok" });
        } catch (err: any) {
          results.push({ aliasDesc: alias.aliasDesc, status: "error", error: err.message });
        }
      }

      res.json({ total: targets.length, results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings/reset", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "User not found" });

      await db.delete(transactions).where(eq(transactions.userId, user.id));
      await db.delete(keyDescMap).where(eq(keyDescMap.userId, user.id));
      await db.delete(aliasAssets).where(eq(aliasAssets.userId, user.id));
      await storage.deleteTaxonomyForUser(user.id);

      const categoriasCsv = await fs.readFile("server/seed-data/categorias.csv");
      const aliasCsv = await fs.readFile("server/seed-data/alias_desc.csv");

      const catWb = XLSX.read(categoriasCsv, { type: "buffer" });
      const aliasWb = XLSX.read(aliasCsv, { type: "buffer" });

      const catRows = sheetToRows(catWb.Sheets[catWb.SheetNames[0]]);
      const aliasRows = sheetToRows(aliasWb.Sheets[aliasWb.SheetNames[0]]);

      const appCats = Array.from(new Set(catRows.map(r => String(r["App classificação"] || "").trim()).filter(Boolean)));
      const appCatMap = new Map<string, string>();
      let orderIndex = 0;
      for (const name of appCats) {
        const created = await storage.createAppCategory({
          userId: user.id,
          name,
          active: true,
          orderIndex: orderIndex++
        });
        appCatMap.set(name, created.appCatId);
      }

      const level1Map = new Map<string, string>();
      const level2Map = new Map<string, string>();
      const leafMap = new Map<string, string>();

      for (const row of catRows) {
        const nivel1 = String(row["Nivel_1_PT"] || "").trim();
        const nivel2 = String(row["Nivel_2_PT"] || "").trim();
        const nivel3 = String(row["Nivel_3_PT"] || "").trim();
        const appCat = String(row["App classificação"] || "").trim();
        if (!nivel1 || !nivel2 || !nivel3) continue;

        if (!level1Map.has(nivel1)) {
          const created = await storage.createTaxonomyLevel1({ userId: user.id, nivel1Pt: nivel1 });
          level1Map.set(nivel1, created.level1Id);
        }

        const level1Id = level1Map.get(nivel1)!;
        const level2Key = `${nivel1}__${nivel2}`;
        if (!level2Map.has(level2Key)) {
          const created = await storage.createTaxonomyLevel2({
            userId: user.id,
            level1Id,
            nivel2Pt: nivel2,
            recorrenteDefault: String(row["Recorrente"] || "").trim() || null,
            fixoVariavelDefault: String(row["Fixo/Variável"] || "").trim() || null,
            receitaDespesaDefault: String(row["Receita/Despesa"] || "").trim() || null
          });
          level2Map.set(level2Key, created.level2Id);
        }

        const level2Id = level2Map.get(level2Key)!;
        const leafKey = `${level2Key}__${nivel3}`;
        if (!leafMap.has(leafKey)) {
          const created = await storage.createTaxonomyLeaf({
            userId: user.id,
            level2Id,
            nivel3Pt: nivel3,
            recorrenteDefault: String(row["Recorrente"] || "").trim() || null,
            fixoVariavelDefault: String(row["Fixo/Variável"] || "").trim() || null,
            receitaDespesaDefault: String(row["Receita/Despesa"] || "").trim() || null
          });
          leafMap.set(leafKey, created.leafId);
        }

        const leafId = leafMap.get(leafKey)!;
        const keyWords = String(row["Key_words"] || "").trim();
        const keyWordsNegative = String(row["Key_words_negative"] || "").trim();
        if (keyWords.length > 0) {
          await storage.createRule({
            userId: user.id,
            leafId,
            keyWords,
            keyWordsNegative: keyWordsNegative || null,
            active: true
          });
        }

        if (appCat && appCatMap.has(appCat)) {
          await storage.createAppCategoryLeaf({
            userId: user.id,
            appCatId: appCatMap.get(appCat)!,
            leafId
          });
        }
      }

      for (const row of aliasRows) {
        const aliasDesc = String(row["Alias_Desc"] || row["alias_desc"] || "").trim();
        const keyWordsAlias = String(row["Key_words_alias"] || row["key_words_alias"] || "").trim();
        const urlLogoInternet = String(row["URL_icon_internet"] || row["url_logo_internet"] || "").trim();
        if (!aliasDesc) continue;
        await storage.upsertAliasAsset({
          userId: user.id,
          aliasDesc,
          keyWordsAlias: keyWordsAlias || "",
          urlLogoInternet: urlLogoInternet || null
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== MERCHANT METADATA =====
  app.get("/api/merchant-metadata", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const metadata = await storage.getMerchantMetadata(user.id);
      res.json(metadata);
    } catch (error: any) {
      console.error("Error fetching merchant metadata:", error);
      res.status(500).json({ error: "Failed to retrieve metadata" });
    }
  });

  app.post("/api/merchant-metadata", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const { pattern, friendlyName, icon, color } = req.body;

      if (!pattern || !friendlyName || !icon) {
        return res.status(400).json({ error: "pattern, friendlyName, and icon are required" });
      }

      const metadata = await storage.createMerchantMetadata({
        userId: user.id,
        pattern: pattern.toUpperCase(),
        friendlyName,
        icon,
        color: color || "#6366f1"
      });

      res.status(201).json(metadata);
    } catch (error: any) {
      console.error("Error creating merchant metadata:", error);
      res.status(500).json({ error: "Failed to create metadata" });
    }
  });

  app.put("/api/merchant-metadata/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const updateData: Partial<MerchantMetadata> = { updatedAt: new Date() };
      if (req.body.pattern !== undefined) updateData.pattern = req.body.pattern.toUpperCase();
      if (req.body.friendlyName !== undefined) updateData.friendlyName = req.body.friendlyName;
      if (req.body.icon !== undefined) updateData.icon = req.body.icon;
      if (req.body.color !== undefined) updateData.color = req.body.color;

      const updated = await storage.updateMerchantMetadata(req.params.id, user.id, updateData);

      if (!updated) {
        return res.status(404).json({ error: "Metadata not found" });
      }

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating merchant metadata:", error);
      res.status(500).json({ error: "Failed to update metadata" });
    }
  });

  app.delete("/api/merchant-metadata/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      await storage.deleteMerchantMetadata(req.params.id, user.id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting merchant metadata:", error);
      res.status(500).json({ error: "Failed to delete metadata" });
    }
  });

  app.get("/api/merchant-metadata/match", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const { description } = req.query;
      if (!description) {
        return res.status(400).json({ error: "description query parameter is required" });
      }

      const match = await storage.findMerchantMatch(user.id, description as string);
      res.json(match || null);
    } catch (error: any) {
      console.error("Error finding merchant match:", error);
      res.status(500).json({ error: "Failed to find match" });
    }
  });

  // ===== TRANSACTIONS =====
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const month = req.query.month as string | undefined;
      const transactions = await storage.getTransactionsWithMerchantAlias(user.id, month);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/transactions/confirm-queue", async (_req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);
      
      const transactions = await storage.getTransactionsWithMerchantAlias(user.id);
      const needsReview = transactions.filter(tx => tx.status === "OPEN" || tx.needsReview);
      
      // Add keyword suggestion for each
      const withSuggestions = needsReview.map(tx => ({
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
      const { ids, createRule, keyword, type, fixVar, category1, category2, category3, excludeFromBudget } = req.body;

      if (!ids || ids.length === 0) {
        return res.status(400).json({ error: "No transaction IDs provided" });
      }

      // CRITICAL: Manual confirmation sets manualOverride = true (immutable)
      const updateData: any = {
        needsReview: false,
        manualOverride: true  // Prevent future auto-recategorization
      };
      if (type) updateData.type = type;
      if (fixVar) updateData.fixVar = fixVar;
      if (category1) updateData.category1 = category1;
      if (category2 !== undefined) updateData.category2 = category2;
      if (category3 !== undefined) updateData.category3 = category3;
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
            category2,
            category3
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
      let userSettings = await storage.getSettings(user.id);

      // Create default settings if they don't exist
      if (!userSettings) {
        userSettings = await storage.createSettings({ userId: user.id });
      }

      const transactions = await storage.getTransactionsByNeedsReview(user.id);

      let categorizedCount = 0;
      let stillPendingCount = 0;

      for (const tx of transactions) {
        // CRITICAL: Never recategorize transactions with manual override
        if (tx.manualOverride) {
          continue;
        }

        const result = categorizeTransaction(tx.descNorm, rules, {
          autoConfirmHighConfidence: userSettings.autoConfirmHighConfidence,
          confidenceThreshold: userSettings.confidenceThreshold
        });

        if (result.confidence && result.confidence > 0) {
          await storage.updateTransaction(tx.id, result);
          if (!result.needsReview) {
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
      
      if (!rule.keywords || !rule.type || !rule.fixVar || !rule.category1) {
        return res.status(400).json({ error: "Regra incompleta para aplicar" });
      }
      const keywords = rule.keywords.split(";").map(k => k.toLowerCase().trim()).filter(Boolean);
      let appliedCount = 0;

      for (const tx of transactions) {
        // CRITICAL: Never recategorize transactions with manual override
        if (tx.manualOverride) {
          continue;
        }

        const descNorm = tx.descNorm.toLowerCase();
        const matches = keywords.some(k => descNorm.includes(k));

        if (matches) {
          await storage.updateTransaction(tx.id, {
            type: rule.type,
            fixVar: rule.fixVar,
            category1: rule.category1,
            category2: rule.category2,
            category3: rule.category3,
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

  // ===== MERCHANT DICTIONARY =====
  // List merchant descriptions
  app.get("/api/merchant-descriptions", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const { source, search, isManual } = req.query;
      const filters: any = {};

      if (source) filters.source = source as string;
      if (search) filters.search = search as string;
      if (isManual !== undefined) filters.isManual = isManual === 'true';

      const descriptions = await storage.getMerchantDescriptions(user.id, filters);
      res.json(descriptions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create merchant description
  app.post("/api/merchant-descriptions", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });

      const { source, keyDesc, aliasDesc } = req.body;
      const description = await storage.createMerchantDescription({
        userId: user.id,
        source,
        keyDesc,
        aliasDesc,
        isManual: true
      });

      // Auto-create icon record if doesn't exist
      const existingIcon = await storage.getMerchantIcon(user.id, aliasDesc);
      if (!existingIcon) {
        await storage.createMerchantIcon({
          userId: user.id,
          aliasDesc,
          shouldFetchIcon: true
        });
      }

      res.json(description);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update merchant description
  app.patch("/api/merchant-descriptions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { aliasDesc } = req.body;

      const updated = await storage.updateMerchantDescription(id, {
        aliasDesc,
        isManual: true
      });

      if (!updated) {
        return res.status(404).json({ error: "Merchant description not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete merchant description
  app.delete("/api/merchant-descriptions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteMerchantDescription(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export merchant descriptions to Excel
  app.get("/api/merchant-descriptions/export", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const descriptions = await storage.getMerchantDescriptions(user.id);

      // Transform to Excel-friendly format
      const excelData = descriptions.map(d => ({
        'Source': d.source,
        'Key Description': d.keyDesc,
        'Alias': d.aliasDesc,
        'Manual': d.isManual ? 'Yes' : 'No',
        'Created': d.createdAt,
        'Updated': d.updatedAt
      }));

      res.json(excelData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI suggest alias for merchant description
  app.post("/api/merchant-descriptions/ai-suggest", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

      if (!openai) {
        return res.status(503).json({ error: "OpenAI não configurado" });
      }

      const { keyDesc, source } = req.body;

      if (!keyDesc) {
        return res.status(400).json({ error: "keyDesc é obrigatório" });
      }

      const prompt = `Como especialista em finanças alemãs e categorização de transações, sugira um alias curto e claro (máximo 30 caracteres) para este comerciante:

Fonte: ${source || 'Desconhecida'}
Descrição original: ${keyDesc}

O alias deve ser:
- Curto e memorável (máx 30 caracteres)
- Em português brasileiro
- Focado no nome do comerciante principal
- Remover números de referência, datas, IDs
- Manter apenas o essencial para identificação

Retorne APENAS o alias sugerido, sem explicações ou formatação adicional.`;

      const response = await withOpenAIUsage(
        {
          featureTag: "merchant_alias_suggestion",
          model: "gpt-4o-mini",
          userId: user.id,
          extractUsage: (result) => result.usage
        },
        () =>
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 100
          })
      );

      const suggestedAlias = response.choices[0]?.message?.content?.trim() || keyDesc;

      res.json({ suggestedAlias });
    } catch (error: any) {
      logger.error("ai_suggest_alias_error", { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  // List merchant icons
  app.get("/api/merchant-icons", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const { needsFetch, search } = req.query;
      const filters: any = {};

      if (needsFetch !== undefined) filters.needsFetch = needsFetch === 'true';
      if (search) filters.search = search as string;

      const icons = await storage.getMerchantIcons(user.id, filters);
      res.json(icons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update merchant icon
  app.patch("/api/merchant-icons/:aliasDesc", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.status(404).json({ error: "User not found" });

      const { aliasDesc } = req.params;
      const data = req.body;

      const updated = await storage.updateMerchantIcon(user.id, decodeURIComponent(aliasDesc), data);

      if (!updated) {
        return res.status(404).json({ error: "Merchant icon not found" });
      }

      res.json(updated);
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
      const updated = await storage.updateBudget(id, req.body);
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
  app.get("/api/ai/usage", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) return res.json([]);

      const limitParam = req.query.limit ? Number(req.query.limit) : undefined;
      const limit = Number.isFinite(limitParam) && limitParam ? Math.min(Math.max(limitParam, 1), 200) : 100;
      const logs = await storage.getAiUsageLogs(user.id, limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze-keywords", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByUsername("demo");
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      if (!openai) {
        return res.status(503).json({ error: "OpenAI não configurado" });
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

Categorias disponíveis (Nível 1): ${categories.join(", ")}

Para cada palavra-chave, retorne um JSON com categorização em 3 níveis:
- keyword: a palavra-chave
- suggestedCategory: a categoria principal (Nível 1) - obrigatório, deve ser uma das categorias listadas acima
- suggestedCategory2: subcategoria (Nível 2) - opcional, texto livre (ex: "Supermercado", "Restaurante", "Combustível")
- suggestedCategory3: especificação (Nível 3) - opcional, texto livre (ex: "LIDL", "McDonald's", "Shell")
- suggestedType: "Despesa" ou "Receita"
- suggestedFixVar: "Fixo" ou "Variável"
- confidence: número de 0 a 100 indicando sua confiança
- reason: explicação breve em português

Exemplos de categorização em 3 níveis:
- "LIDL" → Nível 1: "Mercado", Nível 2: "Supermercado", Nível 3: "LIDL"
- "STADTWERK" → Nível 1: "Moradia", Nível 2: "Utilidades", Nível 3: "Água/Gás"
- "SHELL" → Nível 1: "Transporte", Nível 2: "Combustível", Nível 3: "Shell"

Retorne APENAS um array JSON válido, sem markdown ou texto adicional.`;

      const response = await withOpenAIUsage(
        {
          featureTag: "keyword_analysis",
          model: "gpt-4o-mini",
          userId: user.id,
          extractUsage: (result) => result.usage
        },
        () =>
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: JSON.stringify(keywordList, null, 2) }
            ],
            temperature: 0.3,
            max_tokens: 4000
          })
      );

      const content = response.choices[0]?.message?.content || "[]";
      let suggestions = [];
      try {
        suggestions = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));
      } catch (e) {
        console.error("Failed to parse AI response:", content);
        suggestions = keywordList.map(k => ({
          keyword: k.keyword,
          suggestedCategory: "Outros",
          suggestedCategory2: null,
          suggestedCategory3: null,
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
          category2: s.suggestedCategory2 || null,
          category3: s.suggestedCategory3 || null,
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
              category2: s.suggestedCategory2 || null,
              category3: s.suggestedCategory3 || null,
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
