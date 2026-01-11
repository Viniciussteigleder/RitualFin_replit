"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
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

    // Get transactions
    const txList = transactionIds
      ? await db.query.transactions.findMany({
          where: and(
            eq(transactions.userId, session.user.id),
            inArray(transactions.id, transactionIds)
          ),
          orderBy: (tx, { desc }) => [desc(tx.paymentDate)],
        })
      : await db.query.transactions.findMany({
          where: eq(transactions.userId, session.user.id),
          orderBy: (tx, { desc }) => [desc(tx.paymentDate)],
        });

    if (txList.length === 0) {
      return error("Nenhuma transação para exportar");
    }

    // Generate CSV
    const headers = [
      "Data",
      "Descrição",
      "Valor",
      "Categoria L1",
      "Categoria L2",
      "Categoria L3",
      "Tipo",
      "Fixo/Variável",
      "Origem",
      "Status",  
    ];

    const rows = txList.map((tx) => [
      new Date(tx.paymentDate).toLocaleDateString("pt-PT"),
      tx.aliasDesc || tx.descNorm || tx.descRaw,
      tx.amount.toString(),
      tx.category1 || "",
      tx.category2 || "",
      tx.category3 || "",
      tx.type || "",
      tx.fixVar || "",
      tx.source || "",
      tx.needsReview ? "Revisar" : "Confirmado",
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
