"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems, transactions, rules, accounts, aliasAssets, sourceCsvSparkasse, sourceCsvMm, sourceCsvAmex, transactionEvidenceLink } from "@/lib/db/schema";
import { parseIngestionFile } from "@/lib/ingest";
import { generateFingerprint } from "@/lib/ingest/fingerprint";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { categorizeTransaction, AI_SEED_RULES, matchAlias } from "@/lib/rules/engine";

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

// Core function for scripting/internal use
export async function uploadIngestionFileCore(userId: string, buffer: Buffer, filename: string) {
  // 1. Create Ingestion Batch
  const [batch] = await db.insert(ingestionBatches).values({
    userId,
    filename,
    status: "processing",
    sourceType: "csv",
  }).returning();

  // import { sourceCsvSparkasse, sourceCsvMm, sourceCsvAmex } from "@/lib/db/schema"; <-- MOVED TO TOP


  try {
    // 2. Parse File
    const result = await parseIngestionFile(buffer, filename, userId);

    if (!result.success) {
      await db.update(ingestionBatches)
        .set({ status: "error", diagnosticsJson: { errors: result.errors } as any })
        .where(eq(ingestionBatches.id, batch.id));
      return { error: result.errors.join(", ") };
    }

    // 3. Process Items & Deduplicate with Source CSV Tables
    if (result.transactions.length === 0) {
      await db.update(ingestionBatches)
        .set({
          status: "preview",
          diagnosticsJson: {
            rowsTotal: result.rowsTotal,
            newCount: 0,
            duplicates: 0,
            diagnostics: result.diagnostics
          } as any
        })
        .where(eq(ingestionBatches.id, batch.id));

      return { success: true, batchId: batch.id, newItems: 0, duplicates: 0 };
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
      
        const isUnique = !existingUniqueFingerprints.has(fingerprint);

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
        rawPayload: tx,
        parsedPayload: tx,
        status: isUnique ? "pending" : "duplicate", // Mark status based on uniqueness
        source: result.format || "unknown"
      }).returning();
      
      // Insert into Source CSV Table
      const commonFields = {
          userId,
          batchId: batch.id,
          ingestionItemId: item.id,
          rowFingerprint: fingerprint,
          key: tx.key,
          keyDesc: tx.keyDesc || tx.description,
          uniqueRow: isUnique,
          importedAt: new Date()
      };

        if (result.format === "sparkasse") {
          await txDb.insert(sourceCsvSparkasse).values({
              ...commonFields,
              auftragskonto: tx.auftragskonto,
              buchungstag: tx.buchungstag ? new Date(tx.buchungstag) : null,
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
              betrag: parseEuropeanNumber(tx.betrag),
              waehrung: tx.waehrung,
              info: tx.info
          });
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
           });
        } else if (result.format === "amex") {
           await txDb.insert(sourceCsvAmex).values({
              ...commonFields,
              datum: tx.datum ? new Date(tx.datum) : null,
              beschreibung: tx.beschreibung,
              betrag: parseEuropeanNumber(tx.betrag),
              karteninhaber: tx.karteninhaber,
              kartennummer: tx.kartennummer,
              referenz: tx.referenz,
              ort: tx.ort,
              staat: tx.staat
           });
        }
      }

      await txDb.update(ingestionBatches)
        .set({
          status: "preview",
          diagnosticsJson: {
            rowsTotal: result.rowsTotal,
            newCount,
            duplicates: dupCount,
            diagnostics: result.diagnostics
          } as any
        })
        .where(eq(ingestionBatches.id, batch.id));

      return { dupCount, newCount };
    });

    return { success: true, batchId: batch.id, newItems: counts.newCount, duplicates: counts.dupCount };

  } catch (error: any) {
    console.error("Ingestion error:", error);
    await db.update(ingestionBatches)
      .set({ status: "error", diagnosticsJson: { errors: [error.message] } as any })
      .where(eq(ingestionBatches.id, batch.id));
    return { error: "Internal server error during processing" };
  }
}

export async function uploadIngestionFile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

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
import { getTaxonomyTree, getTaxonomyTreeCore } from "./taxonomy";


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
      category3: null
    } as any));

    const effectiveRules = [...userRules, ...seedRules];
    
    const taxonomy = await getTaxonomyTreeCore(userId);
    const taxonomyContext = JSON.stringify(taxonomy);

    let importedCount = 0;

    // Pre-fetch taxonomy leaves for mapping
    const taxonomyLeaves = await db.query.taxonomyLeaf.findMany({
        with: {
            level2: {
                with: { level1: true }
            }
        }
    });
    
    // Map leafId to full taxonomy
    const leafMap = new Map();
    taxonomyLeaves.forEach(l => {
        leafMap.set(l.leafId, {
            leaf: l,
            level2: l.level2,
            level1: l.level2.level1
        });
    });

    const openLeafId = taxonomyLeaves.find((leaf) => leaf.nivel3Pt === "OPEN")?.leafId ?? null;

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

        if (!categorization.ruleIdApplied && openLeafId) {
            categorization.leafId = openLeafId;
            categorization.category1 = null as any;
            categorization.category2 = null;
            categorization.category3 = null;
        }

        // Populate Categories from Leaf ID if Rule matched and has leafId
        if (categorization.ruleIdApplied && categorization.leafId) {
             const mapping = leafMap.get(categorization.leafId);
             if (mapping) {
                 categorization.category1 = mapping.level1.nivel1Pt;
                 categorization.category2 = mapping.level2.nivel2Pt;
                 categorization.category3 = mapping.leaf.nivel3Pt;
                 categorization.type = mapping.level2.receitaDespesaDefault as any || categorization.type;
                 categorization.fixVar = mapping.level2.fixoVariavelDefault as any || categorization.fixVar;
             }
        } else if (categorization.ruleIdApplied && !categorization.leafId) {
            // Preserve categories provided by the rule/engine; only fall back leafId if available.
            categorization.leafId = openLeafId;
        }

        // 3. AI Fallback (only if no rules match - and leafId is OPEN)
        if (openLeafId && !categorization.ruleIdApplied && categorization.leafId === openLeafId && process.env.OPENAI_API_KEY) {
             // ... AI logic ...
             // Keeping existing logic but mapping back to leafId if AI returns it
             aiResult = await getAICategorization(keyDesc, taxonomyContext);
             if (aiResult && aiResult.confidence > 0.7) {
                  // If AI found a leaf, use it
                  if (aiResult.suggested_leaf_id) {
                      const mapping = leafMap.get(aiResult.suggested_leaf_id);
                      if (mapping) {
                         categorization.leafId = aiResult.suggested_leaf_id;
                         categorization.category1 = mapping.level1.nivel1Pt;
                         categorization.category2 = mapping.level2.nivel2Pt;
                         categorization.category3 = mapping.leaf.nivel3Pt;
                         categorization.type = mapping.level2.receitaDespesaDefault as any || categorization.type;
                         categorization.fixVar = mapping.level2.fixoVariavelDefault as any || categorization.fixVar;
                         categorization.needsReview = aiResult.confidence < 0.9;
                         categorization.suggestedKeyword = aiResult.rationale;
                         categorization.confidence = Math.round(aiResult.confidence * 100);
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
        
        let display = "yes";
        if (categorization.internalTransfer || categorization.category1 === "Interno") {
            display = "no";
        } else if (categorization.category2 === "Karlsruhe") {
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
            category1: categorization.category1 as any,
            category2: categorization.category2,
            category3: categorization.category3,
            needsReview: categorization.needsReview,
            manualOverride: false,
            type: (categorization.type || (amountNum < 0 ? "Despesa" : "Receita")) as any,
            fixVar: (categorization.fixVar || "Variável") as any,
            ruleIdApplied: categorization.ruleIdApplied && !categorization.ruleIdApplied.startsWith("seed-") ? categorization.ruleIdApplied : null,
            source: (["Sparkasse", "Amex", "M&M"].includes(data.source) ? data.source : null) as any,
            key: data.key || item.itemFingerprint, 
            leafId: categorization.leafId,
            confidence: categorization.confidence,
            suggestedKeyword: categorization.suggestedKeyword || aiResult?.rationale,
            display: display, 
            internalTransfer: categorization.internalTransfer,
            conflictFlag: (categorization as any).matches?.length > 1 && categorization.needsReview,
            classificationCandidates: (categorization as any).matches || null
        };

        // Insert Transaction
        await db.insert(transactions).values([newTx]).onConflictDoNothing();

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
