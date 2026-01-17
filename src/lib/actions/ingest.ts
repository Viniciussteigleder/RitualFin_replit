"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems, transactions, rules, accounts, aliasAssets, sourceCsvSparkasse, sourceCsvMm, sourceCsvAmex, transactionEvidenceLink } from "@/lib/db/schema";
import { parseIngestionFile } from "@/lib/ingest";
import { generateFingerprint } from "@/lib/ingest/fingerprint";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { categorizeTransaction, AI_SEED_RULES, matchAlias } from "@/lib/rules/engine";
import { ensureOpenCategoryCore } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps } from "@/lib/taxonomy/hierarchy";
import { resolveLeafFromMatches } from "@/lib/rules/leaf-resolution";
import { logger } from "@/lib/ingest/logger";

type UploadIngestionResult =
  | {
      success: true;
      batchId: string;
      newItems: number;
      duplicates: number;
      format?: string;
      warnings?: string[];
    }
  | {
      success: false;
      error: string;
      code?: string;
      batchId?: string;
      details?: any;
    };

function parseEuropeanNumber(input: unknown): number {
  if (typeof input === "number") return input;
  if (typeof input !== "string") return 0;

  const raw = input.trim();
  if (!raw) return 0;

  // Normalize common currency formatting: spaces, currency symbols, non-breaking spaces.
  let normalized = raw.replace(/\s|\u00A0/g, "");
  normalized = normalized.replace(/[€$£]/g, "");

  const hasDot = normalized.includes(".");
  const hasComma = normalized.includes(",");

  // If both separators exist, assume dot is thousands separator and comma is decimal separator.
  if (hasDot && hasComma) {
    normalized = normalized.replace(/\./g, "").replace(/,/g, ".");
  } else if (hasComma && !hasDot) {
    normalized = normalized.replace(/,/g, ".");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    return (error as any).message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function txForDb(tx: any) {
  const safe: any = { ...tx };
  for (const key of Object.keys(safe)) {
    const val = safe[key];
    if (val instanceof Date) safe[key] = val.toISOString();
  }
  if (tx?.date instanceof Date) safe.date = tx.date.toISOString();
  if (tx?.paymentDate instanceof Date) safe.paymentDate = tx.paymentDate.toISOString();
  if (tx?.bookingDate instanceof Date) safe.bookingDate = tx.bookingDate.toISOString();
  return safe;
}

// Core function for scripting/internal use
export async function uploadIngestionFileCore(userId: string, buffer: Buffer, filename: string): Promise<UploadIngestionResult> {
  // 1. Create Ingestion Batch
  const [batch] = await db.insert(ingestionBatches).values({
    userId,
    filename,
    status: "processing",
    sourceType: "csv",
  }).returning();

  // import { sourceCsvSparkasse, sourceCsvMm, sourceCsvAmex } from "@/lib/db/schema"; <-- MOVED TO TOP


  try {
    logger.info("ingest.upload.start", { userId, batchId: batch.id, filename });
    // 2. Parse File
    const result = await parseIngestionFile(buffer, filename, userId);

    if (!result.success) {
      const rawError = result.errors.join(", ");
      const friendly =
        rawError.includes("Unknown CSV format")
          ? "Formato de CSV não reconhecido. Verifique se o arquivo foi exportado como CSV e se é de Amex, Miles & More ou Sparkasse."
          : rawError;
      await db.update(ingestionBatches)
        .set({
          status: "error",
          sourceFormat: result.format ?? null,
          diagnosticsJson: { errors: result.errors, format: result.format, diagnostics: result.diagnostics, meta: result.meta } as any
        })
        .where(eq(ingestionBatches.id, batch.id));
      logger.warn("ingest.parse.failed", { userId, batchId: batch.id, errors: result.errors, format: result.format });
      return {
        success: false,
        code: "PARSE_FAILED",
        batchId: batch.id,
        error: friendly,
        details: { diagnostics: result.diagnostics, meta: result.meta, format: result.format },
      };
    }

    // 3. Process Items & Deduplicate with Source CSV Tables
    if (result.transactions.length === 0) {
      await db.update(ingestionBatches)
        .set({
          status: "error",
          sourceFormat: result.format ?? null,
          diagnosticsJson: {
            rowsTotal: result.rowsTotal,
            newCount: 0,
            duplicates: 0,
            format: result.format,
            errors: ["No transactions detected after parsing. Check delimiter/encoding, or export as CSV."],
            diagnostics: result.diagnostics,
            meta: result.meta
          } as any
        })
        .where(eq(ingestionBatches.id, batch.id));

      logger.warn("ingest.parse.zero_transactions", { userId, batchId: batch.id, format: result.format });
      return {
        success: false,
        code: "NO_TRANSACTIONS",
        batchId: batch.id,
        error: "Nenhuma transação encontrada no arquivo. Verifique se o CSV está no formato correto (delimiter e encoding).",
        details: { diagnostics: result.diagnostics, meta: result.meta, format: result.format },
      };
    }

    const txWithFingerprint = result.transactions.map((tx) => ({ tx, fingerprint: generateFingerprint(tx) }));
    const fingerprints = txWithFingerprint.map((t) => t.fingerprint);
    let existingUniqueFingerprints = new Set<string>();
    if (result.format === "sparkasse") {
      const existing = await db.query.sourceCsvSparkasse.findMany({
        where: (t, { and, eq }) => and(eq(t.userId, userId), inArray(t.rowFingerprint, fingerprints), eq(t.uniqueRow, true)),
        columns: { rowFingerprint: true },
      });
      existingUniqueFingerprints = new Set(existing.map((row) => row.rowFingerprint));
    } else if (result.format === "miles_and_more") {
      const existing = await db.query.sourceCsvMm.findMany({
        where: (t, { and, eq }) => and(eq(t.userId, userId), inArray(t.rowFingerprint, fingerprints), eq(t.uniqueRow, true)),
        columns: { rowFingerprint: true },
      });
      existingUniqueFingerprints = new Set(existing.map((row) => row.rowFingerprint));
    } else if (result.format === "amex") {
      const existing = await db.query.sourceCsvAmex.findMany({
        where: (t, { and, eq }) => and(eq(t.userId, userId), inArray(t.rowFingerprint, fingerprints), eq(t.uniqueRow, true)),
        columns: { rowFingerprint: true },
      });
      existingUniqueFingerprints = new Set(existing.map((row) => row.rowFingerprint));
    }

    const counts = await db.transaction(async (txDb) => {
      let dupCount = 0;
      let newCount = 0;
      const seenFingerprints = new Set(existingUniqueFingerprints);

      for (const { tx, fingerprint } of txWithFingerprint) {

      // Check for existing item with unique_row = true in the specific source table
      // We check ACROSS ALL BATCHES for this user/account to find global duplicates
      // But we need to know which table to query.
      // Assuming uploadIngestionFileCore handles known formats.
      
      // Determine uniqueness
      // Query source table for existing fingerprint with uniqueRow=true
      // Note: This is an expensive loop. Ideally done in bulk or using `onConflict`.
      // For now, we query. 
      // Actually, we can just insert and let the periodic cleanup or batch commit handle it? 
      // Plan said: "Check if fingerprint exists in source_csv_{type} with unique_row = true"
      
      // We'll trust the plan. 
      // Use existing `db.query` is hard with dynamic table selection without raw SQL or 'any'.
      // Lets use a helper or switch.
      
        const isUnique = !seenFingerprints.has(fingerprint);
        if (isUnique) seenFingerprints.add(fingerprint);

        if (!isUnique) {
          dupCount++;
        } else {
          newCount++;
        }

      // Create Ingestion Item (Parent)
      // Note: We still use ingestionItems as a handle, but data lives in source_csv_* too?
      // Schema says source_csv_* references ingestionItems. So we must create item first.
        const [item] = await txDb.insert(ingestionItems).values({
        batchId: batch.id,
        itemFingerprint: fingerprint,
        rawPayload: txForDb(tx),
        parsedPayload: txForDb(tx),
        status: isUnique ? "pending" : "duplicate", // Mark status based on uniqueness
        source: result.format || "unknown"
      }).returning();
      
      // Insert into Source CSV Table
      const commonFields = {
          userId,
          batchId: batch.id,
          ingestionItemId: item.id,
          rowFingerprint: fingerprint,
          key: fingerprint,
          keyDesc: tx.keyDesc || tx.description,
          uniqueRow: isUnique,
          importedAt: new Date()
      };

        if (result.format === "sparkasse") {
          await txDb.insert(sourceCsvSparkasse).values({
              ...commonFields,
              auftragskonto: tx.auftragskonto,
              buchungstag: (tx.buchungstag ? new Date(tx.buchungstag) : (tx.date instanceof Date ? tx.date : null)) as any,
              valutadatum: tx.valutadatum ? new Date(tx.valutadatum) : null,
              buchungstext: tx.buchungstext,
              verwendungszweck: tx.verwendungszweck,
              glaeubigerId: tx.glaeubigerId,
              mandatsreferenz: tx.mandatsreferenz,
              kundenreferenz: tx.kundenreferenz,
              sammlerreferenz: tx.sammlerreferenz,
              lastschrifteinreicherId: tx.lastschrifteinreicherId,
              idEndToEnd: tx.idEndToEnd,
              beguenstigterZahlungspflichtiger: tx.beguenstigterZahlungspflichtiger,
              iban: tx.iban,
              bic: tx.bic,
              betrag: parseEuropeanNumber(tx.betrag ?? tx.amount),
              waehrung: tx.waehrung ?? tx.currency,
              info: tx.info
          }).onConflictDoNothing();
        } else if (result.format === "miles_and_more") {
           await txDb.insert(sourceCsvMm).values({
              ...commonFields,
              authorisedOn: tx.authorisedOn ? new Date(tx.authorisedOn) : null,
              processedOn: tx.processedOn ? new Date(tx.processedOn) : null,
              paymentType: tx.paymentType,
              status: tx.status,
              amount: tx.amount || 0, // tx.amount is usually already parsed to number
              currency: tx.currency,
              description: tx.description
           }).onConflictDoNothing();
        } else if (result.format === "amex") {
           await txDb.insert(sourceCsvAmex).values({
              ...commonFields,
              datum: (tx.datum ? new Date(tx.datum) : (tx.date instanceof Date ? tx.date : null)) as any,
              beschreibung: tx.beschreibung ?? tx.description,
              betrag: parseEuropeanNumber(tx.betrag ?? tx.amount),
              karteninhaber: tx.karteninhaber,
              kartennummer: tx.kartennummer,
              referenz: tx.referenz,
              ort: tx.ort,
              staat: tx.staat
           }).onConflictDoNothing();
        }
      }

      await txDb.update(ingestionBatches)
        .set({
          status: "preview",
          sourceFormat: result.format ?? null,
          diagnosticsJson: {
            rowsTotal: result.rowsTotal,
            newCount,
            duplicates: dupCount,
            format: result.format,
            diagnostics: result.diagnostics,
            meta: result.meta
          } as any
        })
        .where(eq(ingestionBatches.id, batch.id));

      return { dupCount, newCount };
    });

    logger.info("ingest.upload.success", { userId, batchId: batch.id, newItems: counts.newCount, duplicates: counts.dupCount, format: result.format });
    return { success: true, batchId: batch.id, newItems: counts.newCount, duplicates: counts.dupCount, format: result.format };

  } catch (error: any) {
    const message = getErrorMessage(error);
    logger.error("ingest.upload.exception", { userId, batchId: batch.id }, message);
    await db.update(ingestionBatches)
      .set({ status: "error", diagnosticsJson: { errors: [message] } as any })
      .where(eq(ingestionBatches.id, batch.id));
    return { success: false, code: "INTERNAL", batchId: batch.id, error: message || "Internal server error during processing" };
  }
}

export async function uploadIngestionFile(formData: FormData): Promise<UploadIngestionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, code: "UNAUTHORIZED", error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, code: "NO_FILE", error: "No file provided" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name;

  const result = await uploadIngestionFileCore(session.user.id, buffer, filename);
  
  if (result.success) {
      revalidatePath("/uploads");
  }
  return result;
}

export async function getIngestionBatches() {
    const session = await auth();
    if (!session?.user?.id) return [];

  return await db.query.ingestionBatches.findMany({
        where: eq(ingestionBatches.userId, session.user.id),
        orderBy: (batches, { desc }) => [desc(batches.createdAt)],
        with: {
            items: true 
        }
    });
}

import { getAICategorization } from "@/lib/ai/openai";
import { getTaxonomyTreeCore } from "./taxonomy";


// Core function for scripting/internal use
export async function commitBatchCore(userId: string, batchId: string) {
    const batch = await db.query.ingestionBatches.findFirst({
        where: eq(ingestionBatches.id, batchId),
        with: { items: true }
    });

    if (!batch) return { error: "Batch not found" };
    if (batch.status === "committed") return { error: "Batch already imported" };

    // Fetch user rules, aliases, and accounts
    const userRules = await db.query.rules.findMany({
        where: eq(rules.userId, userId)
    });

    const userAliases = await db.query.aliasAssets.findMany({
        where: eq(aliasAssets.userId, userId)
    });

    const userAccounts = await db.query.accounts.findMany({
        where: eq(accounts.userId, userId)
    });

    // Map seed rules to Rule interface
    const seedRules = AI_SEED_RULES.map((r, i) => ({
      ...r,
      id: `seed-${i}`,
      userId: userId, 
      active: true,
      createdAt: new Date(),
      keyWords: r.keyWords, // Updated from keywords
      keyWordsNegative: null,
      leafId: null,
      category2: r.category2 || null,
      category3: (r as any).category3 || null
    } as any));

    const effectiveRules = [...userRules, ...seedRules];
    
    const taxonomy = await getTaxonomyTreeCore(userId);
    const taxonomyContext = JSON.stringify(taxonomy);

    let importedCount = 0;

    const ensured = await ensureOpenCategoryCore(userId);
    if (!ensured.success || !ensured.openLeafId) return { error: ensured.error || "Failed to ensure OPEN taxonomy" };

    const { byLeafId: taxonomyByLeafId, byPathKey: taxonomyByPathKey } = await buildLeafHierarchyMaps(userId);
    const openLeafId = ensured.openLeafId;
    const openHierarchy = taxonomyByLeafId.get(openLeafId);
    if (!openHierarchy) return { error: "OPEN leaf exists but was not found in taxonomy lookup" };

    for (const item of batch.items) {
        // Skip duplicates or already imported
        if (item.status === "imported" || item.status === "duplicate") continue;

        const data = item.parsedPayload as any;
        const keyDesc = data.keyDesc || data.descNorm || data.description;
        
        // 1. Alias Matching
        const aliasMatch = matchAlias(keyDesc, userAliases);

        // 2. Deterministic Rule Categorization
        let categorization = categorizeTransaction(keyDesc, effectiveRules);
        let aiResult = null;
        let resolution = resolveLeafFromMatches({
            matches: (categorization as any).matches,
            openLeafId,
            taxonomyByLeafId,
            taxonomyByPathKey,
            confidence: categorization.confidence ?? 0,
            needsReview: categorization.needsReview ?? true,
            ruleIdApplied: (categorization as any).ruleIdApplied ?? null,
            matchedKeyword: (categorization as any).matchedKeyword ?? null,
        });

        // 3. AI Fallback (only if no rules match - and leafId is OPEN)
        if (resolution.status === "OPEN" && process.env.OPENAI_API_KEY) {
             aiResult = await getAICategorization(keyDesc, taxonomyContext);
             if (aiResult && aiResult.confidence > 0.7) {
                  // If AI found a leaf, use it
                  if (aiResult.suggested_leaf_id) {
                      const maybeHierarchy = taxonomyByLeafId.get(aiResult.suggested_leaf_id);
                      if (maybeHierarchy) {
                        resolution = {
                          status: "MATCHED",
                          leafId: aiResult.suggested_leaf_id,
                          needsReview: aiResult.confidence < 0.9,
                          confidence: Math.round(aiResult.confidence * 100),
                          ruleIdApplied: null,
                          matchedKeyword: null,
                          candidates: [],
                        };
                      }
                  }
             }
        }

        // 4. Account Linking (Existing Heuristic)
        let accountId = null; // Removed from schema, but logic might still use it to find 'accountSource'?
        // Wait, I removed accountId from transactions table. 
        // User said "delete account_id -> no need".
        // So we don't need to link to 'accounts' table anymore?
        // Or we just don't store the FK?
        // We still have 'accountSource'.

        // Display Logic
        // "add columns display... set 'no' for internal_transfer=true"
        // "if category_2 = Karlsruhe, then set display = Casa Karlsruhe"
        // "else display='yes' (rule: display all cases not set as 'no')"
        
        const hierarchy = taxonomyByLeafId.get(resolution.leafId) ?? openHierarchy;
        const category1 = hierarchy.category1;
        const category2 = hierarchy.category2;
        const category3 = hierarchy.category3;
        const appCategoryId = hierarchy.appCategoryId;
        const appCategoryName = hierarchy.appCategoryName ?? "OPEN";

        const isInterno = category1 === "Interno";
        let display = "yes";
        if (isInterno) {
            display = "no";
        } else if (category2 === "Karlsruhe") {
            display = "Casa Karlsruhe";
        }

        const amountNum = Number.parseFloat(data.amount);

        // Prepare Transaction
        const newTx = {
            userId: userId,
            // accountId: accountId, // REMOVED
            paymentDate: new Date(data.paymentDate || data.date),
            bookingDate: data.bookingDate ? new Date(data.bookingDate) : null,
            descRaw: data.descRaw || data.description || "No Description",
            descNorm: keyDesc, 
            keyDesc: keyDesc, 
            aliasDesc: aliasMatch ? aliasMatch.aliasDesc : null,
            amount: amountNum,
            currency: data.currency || "EUR",
            category1: category1 as any,
            category2: category2,
            category3: category3,
            needsReview: resolution.needsReview,
            manualOverride: false,
            type: ((hierarchy.typeDefault as any) || (categorization.type as any) || (amountNum < 0 ? "Despesa" : "Receita")) as any,
            fixVar: ((hierarchy.fixVarDefault as any) || (categorization.fixVar as any) || "Variável") as any,
            ruleIdApplied: resolution.ruleIdApplied && !resolution.ruleIdApplied.startsWith("seed-") ? resolution.ruleIdApplied : null,
            source: (["Sparkasse", "Amex", "M&M"].includes(data.source) ? data.source : null) as any,
            key: data.key || item.itemFingerprint, 
            leafId: resolution.leafId,
            confidence: resolution.confidence,
            suggestedKeyword: aiResult?.rationale || null,
            matchedKeyword: resolution.matchedKeyword,
            classifiedBy: (aiResult ? "AI_SUGGESTION" : "AUTO_KEYWORDS") as "AI_SUGGESTION" | "AUTO_KEYWORDS",
            appCategoryId: appCategoryId,
            appCategoryName: appCategoryName,
            display: display, 
            internalTransfer: isInterno,
            excludeFromBudget: isInterno,
            conflictFlag: resolution.status === "CONFLICT",
            classificationCandidates: resolution.status === "CONFLICT" ? resolution.candidates : null
        };

        // Insert Transaction
        await db.insert(transactions).values(newTx).onConflictDoNothing();

        // Update Item Status
        await db.update(ingestionItems)
            .set({ status: "imported" })
            .where(eq(ingestionItems.id, item.id));

        importedCount++;
    }

    // Update Batch Status
    await db.update(ingestionBatches)
        .set({ status: "committed" })
        .where(eq(ingestionBatches.id, batch.id));

    return { success: true, importedCount };
}

export async function commitBatch(batchId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const result = await commitBatchCore(session.user.id, batchId);

    if (result.success) {
        revalidatePath("/uploads");
        revalidatePath("/transactions");
        revalidatePath("/");
    }
    return result;
}

export async function rollbackBatch(batchId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const batch = await db.query.ingestionBatches.findFirst({
        where: eq(ingestionBatches.id, batchId),
        with: { items: true }
    });

    if (!batch) return { error: "Batch not found" };
    if (batch.status !== "committed") return { error: "Batch is not in imported state" };

    // 1. Find Transaction IDs linked to this batch's items
    const itemIds = batch.items.map(i => i.id);
    if (itemIds.length === 0) return { success: true, message: "No items to rollback" };

    const links = await db.select({ txId: transactionEvidenceLink.transactionId })
        .from(transactionEvidenceLink)
        .where(inArray(transactionEvidenceLink.ingestionItemId, itemIds));

    const txIds = links.map(l => l.txId);

    // 2. Delete Transactions (this will cascade delete links usually, but let's be safe)
    if (txIds.length > 0) {
        await db.delete(transactions).where(inArray(transactions.id, txIds));
    }

    // 3. Reset Item Status
    await db.update(ingestionItems)
        .set({ status: "pending" })
        .where(inArray(ingestionItems.id, itemIds));

    // 4. Reset Batch Status
    await db.update(ingestionBatches)
        .set({ status: "preview" }) // Ready to be committed again
        .where(eq(ingestionBatches.id, batch.id));

    revalidatePath("/uploads");
    revalidatePath("/transactions");
    return { success: true, rolledBackCount: txIds.length };
}
