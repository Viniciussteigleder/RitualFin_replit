import { db } from "../src/lib/db";
import { transactions, ingestionItems, ingestionBatches } from "../src/lib/db/schema";
import { sql, eq, and, like } from "drizzle-orm";

interface MismatchIssue {
  transactionId: number;
  keyDesc: string;
  amount: number;
  date: string;
  source: string;
  issue: string;
  severity: "critical" | "high" | "medium";
}

async function diagnoseKeyDescMismatches() {
  console.log("=".repeat(60));
  console.log("KEY_DESC INTEGRITY DIAGNOSTIC");
  console.log("=".repeat(60));
  console.log(`Started: ${new Date().toISOString()}\n`);

  const issues: MismatchIssue[] = [];

  // 1. Find transactions where amount doesn't match pattern in keyDesc
  console.log("[1] Checking for amount/keyDesc mismatches...");

  const allTransactions = await db.select({
    id: transactions.id,
    keyDesc: transactions.keyDesc,
    amount: transactions.amount,
    paymentDate: transactions.paymentDate,
    source: transactions.source,
    descRaw: transactions.descRaw,
  }).from(transactions);

  for (const tx of allTransactions) {
    const keyDesc = tx.keyDesc || "";
    const amount = Math.abs(tx.amount || 0);

    // Check if keyDesc contains a number that doesn't match the amount
    const numbersInKeyDesc = keyDesc.match(/\d{3,}/g) || [];
    for (const numStr of numbersInKeyDesc) {
      const num = parseFloat(numStr);
      // If keyDesc contains a large number that's significantly different from amount
      if (num > 100 && Math.abs(num - amount) > 100 && Math.abs(num - amount) / amount > 0.1) {
        // Could be a mismatch - e.g., "Order 2500" but amount is 2194
        issues.push({
          transactionId: tx.id,
          keyDesc: keyDesc.substring(0, 100),
          amount: tx.amount || 0,
          date: tx.paymentDate?.toISOString().split("T")[0] || "unknown",
          source: tx.source || "unknown",
          issue: `keyDesc contains "${numStr}" but amount is ${amount.toFixed(2)}`,
          severity: "high"
        });
        break;
      }
    }
  }

  // 2. Find GEHALT transactions that might be salary
  console.log("[2] Checking GEHALT (salary) transactions...");

  const gehaltTxs = await db.select({
    id: transactions.id,
    keyDesc: transactions.keyDesc,
    amount: transactions.amount,
    paymentDate: transactions.paymentDate,
    source: transactions.source,
    category1: transactions.category1,
  }).from(transactions)
    .where(sql`LOWER(${transactions.keyDesc}) LIKE '%gehalt%'`);

  for (const tx of gehaltTxs) {
    // Salary should typically be income (positive) and > 1000
    if (tx.amount && tx.amount < 0) {
      issues.push({
        transactionId: tx.id,
        keyDesc: (tx.keyDesc || "").substring(0, 100),
        amount: tx.amount,
        date: tx.paymentDate?.toISOString().split("T")[0] || "unknown",
        source: tx.source || "unknown",
        issue: `GEHALT (salary) transaction is negative (expense)`,
        severity: "critical"
      });
    }
    if (tx.category1 !== "Receita" && tx.category1 !== "OPEN") {
      issues.push({
        transactionId: tx.id,
        keyDesc: (tx.keyDesc || "").substring(0, 100),
        amount: tx.amount || 0,
        date: tx.paymentDate?.toISOString().split("T")[0] || "unknown",
        source: tx.source || "unknown",
        issue: `GEHALT transaction categorized as ${tx.category1} instead of Receita`,
        severity: "medium"
      });
    }
  }

  // 3. Find transactions with duplicate dates and similar amounts (column shift indicator)
  console.log("[3] Checking for column shift patterns...");

  const dateGroups = await db.execute(sql`
    SELECT
      payment_date::date as tx_date,
      source,
      COUNT(*) as count,
      ARRAY_AGG(id) as ids,
      ARRAY_AGG(amount) as amounts,
      ARRAY_AGG(SUBSTRING(key_desc, 1, 50)) as key_descs
    FROM transactions
    WHERE source = 'Sparkasse'
    GROUP BY payment_date::date, source
    HAVING COUNT(*) > 1
    ORDER BY payment_date DESC
    LIMIT 20
  `);

  for (const group of dateGroups.rows as any[]) {
    const amounts = group.amounts as number[];
    const keyDescs = group.key_descs as string[];

    // Check if any keyDesc in the group contains another transaction's amount
    for (let i = 0; i < amounts.length; i++) {
      for (let j = 0; j < keyDescs.length; j++) {
        if (i !== j && keyDescs[j]) {
          const amountStr = Math.abs(amounts[i]).toFixed(0);
          if (keyDescs[j].includes(amountStr) && amountStr.length >= 3) {
            issues.push({
              transactionId: group.ids[j],
              keyDesc: keyDescs[j],
              amount: amounts[j],
              date: group.tx_date,
              source: "Sparkasse",
              issue: `keyDesc contains amount (${amountStr}) from another transaction on same date`,
              severity: "critical"
            });
          }
        }
      }
    }
  }

  // 4. Check for transactions where keyDesc looks like a date (column shift)
  console.log("[4] Checking for date patterns in wrong fields...");

  const datePatternTxs = await db.execute(sql`
    SELECT id, key_desc, amount, payment_date, source
    FROM transactions
    WHERE key_desc ~ '^\d{2}\.\d{2}\.\d{2,4}'
    OR key_desc ~ ' -- \d{2}\.\d{2}\.\d{2,4} -- '
  `);

  for (const tx of datePatternTxs.rows as any[]) {
    issues.push({
      transactionId: tx.id,
      keyDesc: (tx.key_desc || "").substring(0, 100),
      amount: tx.amount,
      date: tx.payment_date?.toISOString?.()?.split("T")[0] || String(tx.payment_date),
      source: tx.source || "unknown",
      issue: `keyDesc contains date pattern - possible column shift`,
      severity: "critical"
    });
  }

  // Report
  console.log(`\n${"─".repeat(60)}`);
  console.log("DIAGNOSTIC RESULTS");
  console.log("─".repeat(60));

  if (issues.length === 0) {
    console.log("  No key_desc integrity issues found!");
  } else {
    const critical = issues.filter(i => i.severity === "critical");
    const high = issues.filter(i => i.severity === "high");
    const medium = issues.filter(i => i.severity === "medium");

    console.log(`\n  Total issues: ${issues.length}`);
    console.log(`  Critical: ${critical.length} | High: ${high.length} | Medium: ${medium.length}\n`);

    console.log("CRITICAL ISSUES:");
    for (const issue of critical.slice(0, 10)) {
      console.log(`  [X] Transaction #${issue.transactionId}`);
      console.log(`      Date: ${issue.date} | Amount: ${issue.amount} | Source: ${issue.source}`);
      console.log(`      keyDesc: ${issue.keyDesc}`);
      console.log(`      Issue: ${issue.issue}\n`);
    }

    if (high.length > 0) {
      console.log("\nHIGH SEVERITY ISSUES (first 5):");
      for (const issue of high.slice(0, 5)) {
        console.log(`  [!] Transaction #${issue.transactionId}: ${issue.issue}`);
      }
    }

    if (medium.length > 0) {
      console.log("\nMEDIUM SEVERITY ISSUES (first 5):");
      for (const issue of medium.slice(0, 5)) {
        console.log(`  [~] Transaction #${issue.transactionId}: ${issue.issue}`);
      }
    }
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);

  return { issues, summary: { total: issues.length, critical: issues.filter(i => i.severity === "critical").length } };
}

// Run
diagnoseKeyDescMismatches()
  .then(result => {
    if (result.summary.critical > 0) {
      console.log(`\nRECOMMENDATION: ${result.summary.critical} critical issues found.`);
      console.log("These transactions may have corrupted data from CSV column shifts.");
      console.log("Consider re-importing the affected CSV files after validation.");
    }
    process.exit(result.summary.critical > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error("Diagnostic failed:", err);
    process.exit(1);
  });
