"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems, transactions, rules, accounts, aliasAssets } from "@/lib/db/schema";
import { parseIngestionFile } from "@/lib/ingest";
import { generateFingerprint } from "@/lib/ingest/fingerprint";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { categorizeTransaction, AI_SEED_RULES } from "@/lib/rules/engine";

// Core function for scripting/internal use
export async function uploadIngestionFileCore(userId: string, buffer: Buffer, filename: string) {
  // 1. Create Ingestion Batch
  const [batch] = await db.insert(ingestionBatches).values({
    userId,
    filename,
    status: "processing",
    sourceType: "csv", 
  }).returning();

  try {
    // 2. Parse File
    const result = await parseIngestionFile(buffer, filename, userId);

    if (!result.success) {
      await db.update(ingestionBatches)
        .set({ status: "error", diagnosticsJson: { errors: result.errors } as any })
        .where(eq(ingestionBatches.id, batch.id));
      return { error: result.errors.join(", ") };
    }

    // 3. Process Items & Deduplicate
    let dupCount = 0;
    let newCount = 0;

    for (const tx of result.transactions) {
      const fingerprint = generateFingerprint(tx);

      // Check for existing item with same fingerprint
      const existing = await db.query.ingestionItems.findFirst({
        where: (items, { eq }) => eq(items.itemFingerprint, fingerprint)
      });

      if (existing) {
        dupCount++;
        continue;
      }

      await db.insert(ingestionItems).values({
        batchId: batch.id,
        itemFingerprint: fingerprint,
        rawPayload: tx,
        parsedPayload: tx,
        status: "pending",
        source: result.format || "unknown"
      });
      newCount++;
    }

    // 4. Update Batch Status
    await db.update(ingestionBatches)
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

    return { success: true, batchId: batch.id, newItems: newCount, duplicates: dupCount };

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
import { matchAlias } from "@/lib/rules/engine";

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
      ruleKey: `SEED-${r.name}`,
      active: true,
      createdAt: new Date(),
      keyWords: r.keywords,
      keywords: r.keywords,
      keyWordsNegative: null,
      leafId: null,
      category2: r.category2 || null,
      category3: null
    } as any));

    const effectiveRules = [...userRules, ...seedRules];
    
    const taxonomy = await getTaxonomyTreeCore(userId);
    const taxonomyContext = JSON.stringify(taxonomy);

    let importedCount = 0;

    for (const item of batch.items) {
        if (item.status === "imported") continue;

        const data = item.parsedPayload as any;
        const keyDesc = data.keyDesc || data.descNorm || data.description; // Rich description
        
        // 1. Alias Matching
        const aliasMatch = matchAlias(keyDesc, userAliases);

        // 2. Deterministic Rule Categorization (using Rich KeyDesc)
        let categorization = categorizeTransaction(keyDesc, effectiveRules);
        let aiResult = null;

        // 3. AI Fallback (only if no rules match)
        if (!categorization.ruleIdApplied && process.env.OPENAI_API_KEY) {
            aiResult = await getAICategorization(keyDesc, taxonomyContext);
            if (aiResult && aiResult.confidence > 0.7) {
                // Map AI result to categorization structure
                categorization = {
                    ...categorization,
                    leafId: aiResult.suggested_leaf_id,
                    confidence: Math.round(aiResult.confidence * 100),
                    needsReview: aiResult.confidence < 0.9,
                    category1: (aiResult.extracted_merchants?.[0] || categorization.category1 || "Outros") as any, // Fallback
                    suggestedKeyword: aiResult.rationale
                };
            }
        }

        // 4. Account Linking (Heuristic)
        let accountId = batch.accountId;
        if (!accountId) {
             const source = (data.source || "Unknown").toLowerCase();
             const sourceKeywords: Record<string, string[]> = {
                "amex": ["american express", "amex"],
                "m&m": ["miles", "more", "lufthansa", "m&m"],
                "sparkasse": ["sparkasse"]
             };
             const keywords = sourceKeywords[source] || [source];
             
             const matchedAccount = userAccounts.find(acc => {
                const accName = acc.name.toLowerCase();
                const institution = (acc.institution || "").toLowerCase();
                return keywords.some(k => accName.includes(k) || institution.includes(k));
             });
             
             if (matchedAccount) accountId = matchedAccount.id;
        }

        // Prepare Transaction
        const newTx = {
            userId: userId,
            accountId: accountId, 
            accountSource: data.accountSource || batch.sourceType || "Unknown",
            paymentDate: new Date(data.paymentDate || data.date),
            bookingDate: data.bookingDate ? new Date(data.bookingDate) : null,
            descRaw: data.descRaw || data.description || "No Description",
            descNorm: keyDesc, // Storing Rich KeyDesc
            keyDesc: keyDesc, 
            aliasDesc: aliasMatch ? aliasMatch.aliasDesc : null,
            amount: parseFloat(data.amount),
            currency: data.currency || "EUR",
            category1: (categorization.category1 || "Outros") as any,
            category2: categorization.category2,
            category3: categorization.category3,
            needsReview: categorization.needsReview,
            manualOverride: false,
            type: (categorization.type || (data.amount < 0 ? "Despesa" : "Receita")) as any,
            fixVar: (categorization.fixVar || "Variável") as any,
            ruleIdApplied: categorization.ruleIdApplied && !categorization.ruleIdApplied.startsWith("seed-") ? categorization.ruleIdApplied : null,
            source: (["Sparkasse", "Amex", "M&M"].includes(data.source) ? data.source : null) as any,
            key: data.key || item.itemFingerprint, // Use Readable Key if available
            leafId: categorization.leafId,
            confidence: categorization.confidence,
            suggestedKeyword: categorization.suggestedKeyword || aiResult?.rationale
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

import { transactionEvidenceLink } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

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
