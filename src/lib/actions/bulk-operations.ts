"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Result, success, error } from "@/lib/validators";

/**
 * Bulk confirm multiple transactions
 */
export async function bulkConfirmTransactions(
  transactionIds: string[]
): Promise<Result<{ updated: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return error("Sessão expirada. Faça login novamente.");
    }

    if (transactionIds.length === 0) {
      return error("Nenhuma transação selecionada");
    }

    if (transactionIds.length > 100) {
      return error("Máximo de 100 transações por vez");
    }

    // Update only transactions belonging to the user
    const result = await db
      .update(transactions)
      .set({ needsReview: false })
      .where(
        and(
          eq(transactions.userId, session.user.id),
          inArray(transactions.id, transactionIds)
        )
      );

    revalidatePath("/transactions");
    revalidatePath("/confirm");
    revalidatePath("/");

    return success({ updated: transactionIds.length });
  } catch (err) {
    console.error("[bulkConfirmTransactions]", err);
    return error("Erro ao confirmar transações. Tente novamente.");
  }
}

/**
 * Bulk delete multiple transactions
 */
export async function bulkDeleteTransactions(
  transactionIds: string[]
): Promise<Result<{ deleted: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return error("Sessão expirada. Faça login novamente.");
    }

    if (transactionIds.length === 0) {
      return error("Nenhuma transação selecionada");
    }

    if (transactionIds.length > 100) {
      return error("Máximo de 100 transações por vez");
    }

    // Delete only transactions belonging to the user
    await db.delete(transactions).where(
      and(
        eq(transactions.userId, session.user.id),
        inArray(transactions.id, transactionIds)
      )
    );

    revalidatePath("/transactions");
    revalidatePath("/");

    return success({ deleted: transactionIds.length });
  } catch (err) {
    console.error("[bulkDeleteTransactions]", err);
    return error("Erro ao eliminar transações. Tente novamente.");
  }
}

/**
 * Bulk update category for multiple transactions
 */
export async function bulkUpdateCategory(
  transactionIds: string[],
  category1: string,
  category2?: string,
  category3?: string
): Promise<Result<{ updated: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return error("Sessão expirada. Faça login novamente.");
    }

    if (transactionIds.length === 0) {
      return error("Nenhuma transação selecionada");
    }

    if (transactionIds.length > 100) {
      return error("Máximo de 100 transações por vez");
    }

    if (!category1) {
      return error("Categoria é obrigatória");
    }

    // Update only transactions belonging to the user
    await db
      .update(transactions)
      .set({
        category1: category1 as any,
        category2,
        category3,
        needsReview: false,
        manualOverride: true,
      })
      .where(
        and(
          eq(transactions.userId, session.user.id),
          inArray(transactions.id, transactionIds)
        )
      );

    revalidatePath("/transactions");
    revalidatePath("/");

    return success({ updated: transactionIds.length });
  } catch (err) {
    console.error("[bulkUpdateCategory]", err);
    return error("Erro ao atualizar categorias. Tente novamente.");
  }
}

/**
 * Export transactions to CSV
 */
export async function exportTransactions(
  transactionIds?: string[]
): Promise<Result<{ csv: string; filename: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return error("Sessão expirada. Faça login novamente.");
    }

    // Use raw SQL to get transactions with taxonomy data
    const txList = await db.execute(sql`
      SELECT 
        t.*,
        COALESCE(t1.nivel_1_pt, 'OPEN') as level_1,
        COALESCE(t2.nivel_2_pt, 'OPEN') as level_2,
        COALESCE(tl.nivel_3_pt, 'OPEN') as level_3,
        COALESCE(t.app_category_name, 'OPEN') as app_category,
        t.matched_keyword
      FROM transactions t
      LEFT JOIN taxonomy_leaf tl ON t.leaf_id = tl.leaf_id
      LEFT JOIN taxonomy_level_2 t2 ON tl.level_2_id = t2.level_2_id
      LEFT JOIN taxonomy_level_1 t1 ON t2.level_1_id = t1.level_1_id
      WHERE t.user_id = ${session.user.id}
      ${transactionIds ? sql`AND t.id = ANY(${transactionIds})` : sql``}
      ORDER BY t.payment_date DESC
    `);

    if (txList.rows.length === 0) {
      return error("Nenhuma transação para exportar");
    }

    // Generate CSV with new columns
    const headers = [
      "Data",
      "Descrição",
      "Key Desc",
      "Valor",
      "Nível 1",
      "Nível 2",
      "Nível 3",
      "App Category",
      "Keyword Matched",
      "Tipo",
      "Fixo/Variável",
      "Origem",
      "Status",
    ];

    const rows = txList.rows.map((tx: any) => [
      new Date(tx.payment_date).toLocaleDateString("pt-PT"),
      tx.alias_desc || tx.desc_norm || tx.desc_raw,
      tx.key_desc || "",
      tx.amount.toString(),
      tx.level_1 || "OPEN",
      tx.level_2 || "OPEN",
      tx.level_3 || "OPEN",
      tx.app_category || "OPEN",
      tx.matched_keyword || "",
      tx.type || "",
      tx.fix_var || "",
      tx.source || "",
      tx.needs_review ? "Revisar" : "Confirmado",
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    const filename = `ritualfin_transacoes_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    return success({ csv: csvContent, filename });
  } catch (err) {
    console.error("[exportTransactions]", err);
    return error("Erro ao exportar transações. Tente novamente.");
  }
}
