import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { transactions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

interface MismatchIssue {
  transactionId: number;
  keyDesc: string;
  amount: number;
  date: string;
  source: string;
  issue: string;
  severity: "critical" | "high" | "medium";
}

/**
 * GET /api/admin/diagnose-keydesc - Diagnose key_desc data integrity issues
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const issues: MismatchIssue[] = [];

    // 1. Find GEHALT transactions that are expenses (should be income)
    const gehaltExpenses = await db.execute(sql`
      SELECT id, key_desc, amount, payment_date, source
      FROM transactions
      WHERE user_id = ${userId}
      AND LOWER(key_desc) LIKE '%gehalt%'
      AND amount < 0
    `);

    for (const tx of gehaltExpenses.rows as any[]) {
      issues.push({
        transactionId: tx.id,
        keyDesc: (tx.key_desc || "").substring(0, 100),
        amount: tx.amount,
        date: tx.payment_date?.toISOString?.()?.split("T")[0] || String(tx.payment_date),
        source: tx.source || "unknown",
        issue: "GEHALT (salary) is negative - should be income",
        severity: "critical"
      });
    }

    // 2. Find transactions where keyDesc contains a date pattern (column shift)
    const datePatternIssues = await db.execute(sql`
      SELECT id, key_desc, amount, payment_date, source
      FROM transactions
      WHERE user_id = ${userId}
      AND (key_desc ~ '^\d{2}\.\d{2}\.\d{2,4}'
           OR key_desc ~ ' -- \d{2}\.\d{2}\.\d{2,4} -- ')
    `);

    for (const tx of datePatternIssues.rows as any[]) {
      issues.push({
        transactionId: tx.id,
        keyDesc: (tx.key_desc || "").substring(0, 100),
        amount: tx.amount,
        date: tx.payment_date?.toISOString?.()?.split("T")[0] || String(tx.payment_date),
        source: tx.source || "unknown",
        issue: "keyDesc contains date pattern - possible column shift",
        severity: "critical"
      });
    }

    // 3. Find transactions where amount in keyDesc doesn't match actual amount
    const allSparkasse = await db.execute(sql`
      SELECT id, key_desc, amount, payment_date
      FROM transactions
      WHERE user_id = ${userId}
      AND source = 'Sparkasse'
      AND key_desc IS NOT NULL
    `);

    for (const tx of allSparkasse.rows as any[]) {
      const keyDesc = tx.key_desc || "";
      const amount = Math.abs(tx.amount || 0);

      // Look for 4-digit numbers in keyDesc
      const numbersInKeyDesc = keyDesc.match(/\b\d{4,}\b/g) || [];
      for (const numStr of numbersInKeyDesc) {
        const num = parseFloat(numStr);
        // If it looks like an amount (e.g., "Order 2500") but doesn't match
        if (num >= 100 && num <= 100000) {
          const diff = Math.abs(num - amount);
          if (diff > 10 && diff / amount > 0.05) {
            issues.push({
              transactionId: tx.id,
              keyDesc: keyDesc.substring(0, 100),
              amount: tx.amount,
              date: tx.payment_date?.toISOString?.()?.split("T")[0] || String(tx.payment_date),
              source: "Sparkasse",
              issue: `keyDesc mentions "${numStr}" but amount is ${amount.toFixed(2)}`,
              severity: "high"
            });
            break;
          }
        }
      }
    }

    // Summary
    const critical = issues.filter(i => i.severity === "critical");
    const high = issues.filter(i => i.severity === "high");
    const medium = issues.filter(i => i.severity === "medium");

    return NextResponse.json({
      success: true,
      summary: {
        totalIssues: issues.length,
        critical: critical.length,
        high: high.length,
        medium: medium.length
      },
      issues: issues.slice(0, 50), // Limit response size
      recommendation: critical.length > 0
        ? "CRITICAL: Column shift detected. Re-validate CSV files before re-importing."
        : high.length > 0
          ? "HIGH: Potential data mismatches found. Review affected transactions."
          : "No significant issues detected."
    });

  } catch (error: any) {
    console.error("Diagnose failed:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
