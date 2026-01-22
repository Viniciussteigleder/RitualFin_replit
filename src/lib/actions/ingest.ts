"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems, transactions, rules, aliasAssets, sourceCsvSparkasse, sourceCsvMm, sourceCsvAmex, transactionEvidenceLink } from "@/lib/db/schema";
import { parseIngestionFile } from "@/lib/ingest";
import { generateFingerprint } from "@/lib/ingest/fingerprint";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { categorizeTransaction, AI_SEED_RULES, matchAlias } from "@/lib/rules/engine";
import { ensureOpenCategoryCore } from "@/lib/actions/setup-open";
import { buildLeafHierarchyMaps } from "@/lib/taxonomy/hierarchy";
import { resolveLeafFromMatches } from "@/lib/rules/leaf-resolution";
import { logger } from "@/lib/ingest/logger";
import { rateLimit } from "@/lib/security/rate-limit";
import { createHash } from "node:crypto";

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

function parseDotDateToUtc(dateStr: string): Date | null {
  // Accepts DD.MM.YY or DD.MM.YYYY
  const trimmed = (dateStr || "").trim();
  if (!trimmed) return null;
  const parts = trimmed.split(".");
  if (parts.length !== 3) return null;
  const [dayStr, monthStr, yearStr] = parts;
  const day = Number.parseInt(dayStr, 10);
  const month = Number.parseInt(monthStr, 10);
  let year = Number.parseInt(yearStr, 10);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (yearStr.length === 2) year += 2000;
  return new Date(Date.UTC(year, month - 1, day));
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function sha256Hex(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

// Core function for scripting/internal use
export async function uploadIngestionFileCore(userId: string, buffer: Buffer, filename: string): Promise<UploadIngestionResult> {
  const fileHashSha256 = sha256Hex(buffer);
  const fileSizeBytes = buffer.length;
  const parserVersion = "v1";
  const normalizationVersion = "v1";

  // 1. Create Ingestion Batch
  const [batch] = await db.insert(ingestionBatches).values({
    userId,
    filename,
    status: "processing",
    sourceType: "csv",
    fileHashSha256,
    fileSizeBytes,
    parserVersion,
    normalizationVersion,
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

    await db.update(ingestionBatches)
      .set({
        status: "processing",
        sourceFormat: result.format ?? null,
        diagnosticsJson: {
          stage: "parsed",
          rowsTotal: result.rowsTotal,
          format: result.format,
          diagnostics: result.diagnostics,
          meta: result.meta
        } as any
      })
      .where(eq(ingestionBatches.id, batch.id));

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

      const prepared = txWithFingerprint.map(({ tx, fingerprint }) => {
        const isUniqueRow = !seenFingerprints.has(fingerprint);
        if (isUniqueRow) seenFingerprints.add(fingerprint);

        if (isUniqueRow) newCount++;
        else dupCount++;

        return { tx, fingerprint, isUnique: isUniqueRow };
      });

      const itemValues = prepared.map(({ tx, fingerprint, isUnique }, idx) => {
        const parsedPayload = txForDb(tx);
        const rawColumnsJson = (tx as any)?.metadata && typeof (tx as any)?.metadata === "object" ? (tx as any).metadata : null;
        const rawPayload = rawColumnsJson ?? parsedPayload;
        const rawRowHash = sha256Hex(stableStringify(rawPayload));
        return {
          batchId: batch.id,
          rowIndex: idx + 1,
          itemFingerprint: fingerprint,
          rawPayload,
          rawColumnsJson,
          rawRowHash,
          parsedPayload,
          status: isUnique ? "pending" : "duplicate",
          source: result.format || "unknown",
        };
      });

      // Insert ingestion items in bulk for speed (serverless runtime).
      const insertedItems = await txDb
        .insert(ingestionItems)
        .values(itemValues)
        .returning({ id: ingestionItems.id });

      const commonFieldsByIdx = prepared.map(({ tx, fingerprint, isUnique }, idx) => {
        const inserted = insertedItems[idx];
        return {
          idx,
          tx,
          fingerprint,
          isUnique,
          ingestionItemId: inserted?.id,
          base: {
            userId,
            batchId: batch.id,
            ingestionItemId: inserted?.id,
            rowFingerprint: fingerprint,
            key: fingerprint,
            keyDesc: tx.keyDesc || tx.description,
            uniqueRow: isUnique,
            importedAt: new Date(),
          },
        };
      }).filter((r) => !!r.ingestionItemId);

      // Insert into Source CSV Table (bulk + idempotent).
      if (result.format === "sparkasse") {
        const rows = commonFieldsByIdx.map(({ tx, base }) => ({
          ...base,
          auftragskonto: tx.auftragskonto,
          buchungstag: (tx.date instanceof Date ? tx.date : (parseDotDateToUtc(tx.buchungstag ?? "") ?? null)) as any,
          valutadatum: parseDotDateToUtc(tx.valutadatum ?? "") as any,
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
          info: tx.info,
        }));

        for (const part of chunk(rows, 400)) {
          await txDb.insert(sourceCsvSparkasse).values(part).onConflictDoNothing();
        }
      } else if (result.format === "miles_and_more") {
        const rows = commonFieldsByIdx.map(({ tx, base }) => ({
          ...base,
          authorisedOn: (tx.authorisedOn ? new Date(tx.authorisedOn) : (tx.date instanceof Date ? tx.date : null)) as any,
          processedOn: (tx.processedOn ? new Date(tx.processedOn) : null) as any,
          paymentType: tx.paymentType,
          status: tx.status,
          amount: tx.amount || 0,
          currency: tx.currency,
          description: tx.description,
        }));

        for (const part of chunk(rows, 400)) {
          await txDb.insert(sourceCsvMm).values(part).onConflictDoNothing();
        }
      } else if (result.format === "amex") {
        const rows = commonFieldsByIdx.map(({ tx, base }) => ({
          ...base,
          datum: (tx.datum ? new Date(tx.datum) : (tx.date instanceof Date ? tx.date : null)) as any,
          beschreibung: tx.beschreibung ?? tx.description,
          betrag: parseEuropeanNumber(tx.betrag ?? tx.amount),
          karteninhaber: tx.karteninhaber,
          kartennummer: tx.kartennummer,
          referenz: tx.referenz,
          ort: tx.ort,
          staat: tx.staat,
        }));

        for (const part of chunk(rows, 400)) {
          await txDb.insert(sourceCsvAmex).values(part).onConflictDoNothing();
        }
      }

      await txDb.update(ingestionBatches)
        .set({
          status: "preview",
          sourceFormat: result.format ?? null,
          encoding: result.meta?.encoding ?? null,
          delimiter: result.meta?.delimiter ?? null,
          parserVersion,
          normalizationVersion,
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

  // Rate Limiting: 25 uploads per 10 minutes
  const ratelimitResult = await rateLimit(session.user.id, "upload-file", { limit: 25, windowMs: 10 * 60 * 1000 });
  if (!ratelimitResult.success) {
    return { 
      success: false, 
      code: "RATE_LIMITED", 
      error: `Muitas tentativas. Tente novamente em ${Math.ceil((ratelimitResult.reset - Date.now()) / 60000)} minutos.` 
    };
  }

  const file = formData.get("file") as File;

  if (!file || file.size === 0) return { success: false, code: "NO_FILE", error: "O arquivo selecionado está vazio ou não foi fornecido." };
  
  // Basic validation for CSV or Image
  const isCSV = file.name.toLowerCase().endsWith('.csv');
  const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  
  if (!isCSV && !isImage) {
    return { success: false, code: "INVALID_TYPE", error: "Tipo de arquivo inválido. Use CSV para extratos ou JPG/PNG para fotos." };
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { success: false, code: "FILE_TOO_LARGE", error: "O arquivo é grande demais (máximo 10MB)." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name;

  const result = await uploadIngestionFileCore(session.user.id, buffer, filename);
  
  if (result.success) {
      revalidatePath("/uploads");
      revalidatePath(`/imports/${result.batchId}/preview`);
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

// NOTE: We intentionally do not use AI to auto-classify transactions.


// Core function for scripting/internal use
export async function commitBatchCore(userId: string, batchId: string) {
    const batch = await db.query.ingestionBatches.findFirst({
        where: eq(ingestionBatches.id, batchId),
        with: { items: true }
    });

    if (!batch) return { error: "Batch not found" };
    if (batch.status === "committed") return { error: "Batch already imported" };

    // Fetch user rules and aliases
    const userRules = await db.query.rules.findMany({
        where: eq(rules.userId, userId)
    });

    const userAliases = await db.query.aliasAssets.findMany({
        where: eq(aliasAssets.userId, userId)
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

    const rulesVersion = sha256Hex(stableStringify(
      effectiveRules
        .map((r: any) => ({
          id: r.id,
          active: !!r.active,
          strict: !!r.strict,
          priority: Number(r.priority ?? 0),
          type: r.type ?? null,
          fixVar: r.fixVar ?? null,
          category1: r.category1 ?? null,
          category2: r.category2 ?? null,
          category3: (r as any).category3 ?? null,
          leafId: r.leafId ?? null,
          keyWords: r.keyWords ?? null,
          keyWordsNegative: r.keyWordsNegative ?? null,
          isSystem: !!r.isSystem,
        }))
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    ));

    const taxonomyRows = await db.execute(sql`
      SELECT
        tl.leaf_id,
        tl.nivel_3_pt,
        t2.level_2_id,
        t2.nivel_2_pt,
        t1.level_1_id,
        t1.nivel_1_pt,
        ac.app_cat_id,
        ac.name AS app_category_name
      FROM taxonomy_leaf tl
      JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
      JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
      LEFT JOIN app_category_leaf acl ON acl.leaf_id = tl.leaf_id AND acl.user_id = ${userId}
      LEFT JOIN app_category ac ON ac.app_cat_id = acl.app_cat_id
      WHERE tl.user_id = ${userId}
      ORDER BY tl.leaf_id ASC
    `);
    const taxonomyVersion = sha256Hex(stableStringify(taxonomyRows.rows));

    await db.update(ingestionBatches)
      .set({
        rulesVersion,
        taxonomyVersion,
      })
      .where(eq(ingestionBatches.id, batch.id));

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
        // M2 Fix: Enable auto-confirm for high-confidence matches (priority >= 700 = 85%+ confidence)
        const categorization = categorizeTransaction(keyDesc, effectiveRules, {
            autoConfirmHighConfidence: true,
            confidenceThreshold: 80
        });
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

        // 3. Account Linking (Existing Heuristic)
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
        const rawRowHash = (item as any).rawRowHash ?? sha256Hex(stableStringify((item as any).rawPayload ?? (item as any).parsedPayload ?? {}));

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
            uploadId: batch.id,
            ingestionItemId: item.id,
            rawRowHash,
            parserVersion: batch.parserVersion ?? null,
            normalizationVersion: batch.normalizationVersion ?? null,
            rulesVersion,
            taxonomyVersion,
            source: (["Sparkasse", "Amex", "M&M"].includes(data.source) ? data.source : null) as any,
            key: data.key || item.itemFingerprint, 
            leafId: resolution.leafId,
            confidence: resolution.confidence,
            suggestedKeyword: null,
            matchedKeyword: resolution.matchedKeyword,
            classifiedBy: "AUTO_KEYWORDS" as "AUTO_KEYWORDS",
            appCategoryId: appCategoryId,
            appCategoryName: appCategoryName,
            display: display, 
            internalTransfer: isInterno,
            excludeFromBudget: isInterno,
            conflictFlag: resolution.status === "CONFLICT",
            classificationCandidates: resolution.status === "CONFLICT" ? resolution.candidates : null
        };

        // Insert Transaction + evidence link (raw-data-first provenance)
        const inserted = await db.insert(transactions).values(newTx).onConflictDoNothing().returning({ id: transactions.id });
        const txId =
          inserted[0]?.id ??
          (await db.query.transactions.findFirst({
            where: and(eq(transactions.userId, userId), eq(transactions.key, newTx.key)),
            columns: { id: true },
          }))?.id;

        if (txId) {
          await db
            .insert(transactionEvidenceLink)
            .values({
              transactionId: txId,
              ingestionItemId: item.id,
              matchConfidence: 100,
              isPrimary: true,
            })
            .onConflictDoNothing();
        }

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

export async function rollbackBatchCore(userId: string, batchId: string) {
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

    return { success: true, rolledBackCount: txIds.length };
}

export async function rollbackBatch(batchId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const result = await rollbackBatchCore(session.user.id, batchId);

    if (result.success) {
        revalidatePath("/uploads");
        revalidatePath("/transactions");
    }
    return result;
}
