"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ingestionBatches, ingestionItems, attachments, ocrExtractions, transactions, transactionEvidenceLink } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { parseOCRText } from "@/lib/ingest/ocr-parser";
import { generateFingerprint } from "@/lib/ingest/fingerprint";
// import { writeFile, mkdir } from "fs/promises"; // REMOVED: Vercel does not support persistent local files
// import { join } from "path";
// import { logger } from "@/lib/ingest/logger";

export async function uploadScreenshot(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  const ocrText = formData.get("ocrText") as string;

  if (!file || !ocrText) return { error: "Missing file or OCR text" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name;

  try {
    // 0. Ensure upload directory exists (Local Storage Simulation)
    // REMOVED: We are now storing in DB 'fileContent' column for Vercel compatibility without S3.
    
    // 1. Create Ingestion Batch
    const [batch] = await db.insert(ingestionBatches).values({
      userId: session.user.id,
      filename,
      status: "processing",
      sourceType: "screenshot",
    }).returning();

    // 2. Parse OCR Text
    const ocrResult = parseOCRText(ocrText);
    
    // 3. Create Ingestion Item -> Transaction -> Evidence
    const now = new Date();
    const txDate = ocrResult.date ?? now;
    const merchant = ocrResult.merchant || "Unknown Merchant";
    const amount = ocrResult.amount || 0;
    const txKey = `OCR-${batch.id}-${Date.now()}`;

    const fingerprintTx = {
      source: "Screenshot",
      key: txKey,
      amount,
      date: txDate,
      description: merchant,
      rawDescription: merchant,
    };

    const txData = {
      source: "Screenshot",
      paymentDate: txDate,
      bookingDate: txDate,
      amount,
      currency: "EUR",
      descRaw: merchant,
      descNorm: merchant.toUpperCase(),
      key: txKey,
      keyDesc: merchant,
      simpleDesc: merchant,
    };

    const fingerprint = generateFingerprint(fingerprintTx as any); 

    const [item] = await db.insert(ingestionItems).values({
        batchId: batch.id,
        itemFingerprint: fingerprint,
        rawPayload: { ocrResult, text: ocrText },
        parsedPayload: txData,
        status: "pending",
        source: "screenshot"
    }).returning();

    // 4. Save Attachment (DB Storage)
    // We insert first to get the ID, then we update the storageKey with the route URL.
    const [attachment] = await db.insert(attachments).values({
        userId: session.user.id,
        batchId: batch.id,
        storageKey: "pending", // Will update below
        mimeType: file.type,
        sizeBytes: file.size,
        fileContent: buffer, // Store binary data in DB
    }).returning();

    // Update storageKey to point to our secure API route
    const publicUrl = `/api/attachments/${attachment.id}`;
    await db.update(attachments)
      .set({ storageKey: publicUrl })
      .where(eq(attachments.id, attachment.id));

    // 5. Save OCR Extraction
    await db.insert(ocrExtractions).values({
        attachmentId: attachment.id,
        textRaw: ocrText,
        blocksJson: ocrResult as any,
    });

    // 6. Create transaction
    const [createdTx] = await db
      .insert(transactions)
      .values({
        userId: session.user.id,
        paymentDate: txDate,
        descRaw: merchant,
        descNorm: merchant.toUpperCase(),
        amount: -Math.abs(amount),
        currency: "EUR",
        key: txKey,
        source: null,
        keyDesc: merchant,
        simpleDesc: merchant,
        type: "Despesa",
        fixVar: "Variável",
        needsReview: true,
      })
      .returning();

    await db.insert(transactionEvidenceLink).values({
      transactionId: createdTx.id,
      ingestionItemId: item.id,
      matchConfidence: Math.round(ocrResult.confidence * 100),
      isPrimary: true,
    });

    // 7. Complete Batch
    await db.update(ingestionBatches)
      .set({ status: "committed" })
      .where(eq(ingestionBatches.id, batch.id));

    revalidatePath("/uploads");
    revalidatePath("/transactions");
    return { success: true, newItemId: item.id };

  } catch (error: any) {
    console.error("Screenshot upload error:", error);
    return { error: error.message || "Failed to process screenshot" };
  }
}
