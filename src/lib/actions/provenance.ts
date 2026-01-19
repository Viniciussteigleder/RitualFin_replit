"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ingestionItems, transactions, transactionEvidenceLink } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

export async function backfillTransactionProvenanceForUser(limit: number = 5000): Promise<{
  success: boolean;
  scanned: number;
  matched: number;
  updated: number;
  linked: number;
  remaining: number;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const candidates = await db
    .select({
      id: transactions.id,
      key: transactions.key,
      uploadId: transactions.uploadId,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), isNull(transactions.ingestionItemId)))
    .limit(limit);

  let matched = 0;
  let updated = 0;
  let linked = 0;

  for (const tx of candidates) {
    if (!tx.uploadId) continue;

    const item = await db.query.ingestionItems.findFirst({
      where: and(eq(ingestionItems.batchId, tx.uploadId), eq(ingestionItems.itemFingerprint, tx.key)),
      columns: { id: true, batchId: true, rawRowHash: true },
    });

    if (!item) continue;
    matched++;

    await db
      .update(transactions)
      .set({
        ingestionItemId: item.id,
        rawRowHash: item.rawRowHash ?? null,
      })
      .where(eq(transactions.id, tx.id));
    updated++;

    const inserted = await db
      .insert(transactionEvidenceLink)
      .values({
        transactionId: tx.id,
        ingestionItemId: item.id,
        matchConfidence: 100,
        isPrimary: true,
      })
      .onConflictDoNothing()
      .returning({ transactionId: transactionEvidenceLink.transactionId });
    if (inserted.length > 0) linked++;
  }

  const remainingRes = await db.execute(sql`
    SELECT COUNT(*)::int AS count
    FROM transactions
    WHERE user_id = ${userId}
      AND ingestion_item_id IS NULL
  `);

  return {
    success: true,
    scanned: candidates.length,
    matched,
    updated,
    linked,
    remaining: (remainingRes.rows[0] as any)?.count ?? 0,
  };
}

export async function getProvenanceCoverageForUser(): Promise<{
  totalTransactions: number;
  withUploadId: number;
  withIngestionItemId: number;
  withEvidenceLink: number;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const res = await db.execute(sql`
    SELECT
      COUNT(*)::int AS total_transactions,
      COUNT(*) FILTER (WHERE upload_id IS NOT NULL)::int AS with_upload_id,
      COUNT(*) FILTER (WHERE ingestion_item_id IS NOT NULL)::int AS with_ingestion_item_id,
      COUNT(DISTINCT tel.transaction_id)::int AS with_evidence_link
    FROM transactions t
    LEFT JOIN transaction_evidence_link tel ON tel.transaction_id = t.id
    WHERE t.user_id = ${userId}
  `);

  const row = res.rows[0] as any;
  return {
    totalTransactions: row?.total_transactions ?? 0,
    withUploadId: row?.with_upload_id ?? 0,
    withIngestionItemId: row?.with_ingestion_item_id ?? 0,
    withEvidenceLink: row?.with_evidence_link ?? 0,
  };
}
