"use server";

import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { and, gte, lte, eq, desc, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";
import { AnalyticsFilters } from "@/lib/actions/analytics";

export async function exportFullDataset(filters: AnalyticsFilters) {
  try {
    const conditions = [];

    // Apply same filters as analytics
    if (filters.startDate) conditions.push(gte(transactions.paymentDate, filters.startDate));
    if (filters.endDate) conditions.push(lte(transactions.paymentDate, filters.endDate));
    if (filters.accountId && filters.accountId !== "all") conditions.push(eq(transactions.source as any, filters.accountId)); // Force cast for enum
    if (filters.type && filters.type !== "all") {
        if (filters.type === "Receita") conditions.push(gte(transactions.amount, 0)); // Using number 0
        else if (filters.type === "Despesa") conditions.push(lte(transactions.amount, 0));
        // Fallback for English literals if passed
        else if (filters.type === "income") conditions.push(gte(transactions.amount, 0));
        else if (filters.type === "expense") conditions.push(lte(transactions.amount, 0));
    }
    
    // Category Drilldown filters
    if (filters.category) conditions.push(eq(transactions.category1 as any, filters.category));
    if (filters.level1) conditions.push(eq(transactions.category2, filters.level1));
    if (filters.level2) conditions.push(eq(transactions.category3, filters.level2));

    const data = await db.select({
        Data: transactions.paymentDate,
        Valor: transactions.amount,
        Descricao: transactions.descNorm, // Using normalized description
        Categoria: transactions.category1,
        Subcategoria: transactions.category2,
        Detalhe: transactions.category3,
        Conta: transactions.source,
        User: transactions.userId
    })
    .from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.paymentDate));

    // Convert to Worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");

    // Convert to Buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    
    // Return Base64 to client
    return { 
        success: true, 
        data: buf.toString('base64'), 
        filename: `RitualFin_Export_${new Date().toISOString().split('T')[0]}.xlsx` 
    };

  } catch (error) {
    console.error("Export Error:", error);
    return { success: false, error: "Falha na exportação" };
  }
}
