
import { db } from "../src/lib/db";
import { accounts, transactions, accountBalanceSnapshots, ingestionBatches, calendarEvents, ingestionItems, rules, transactionEvidenceLink } from "../src/lib/db/schema";
import { count, eq, sql, and, like } from "drizzle-orm";

async function main() {
  const accountCount = await db.select({ count: count() }).from(accounts);
  const transactionCount = await db.select({ count: count() }).from(transactions);
  const snapshotCount = await db.select({ count: count() }).from(accountBalanceSnapshots);
  const batchCount = await db.select({ count: count() }).from(ingestionBatches);
  const calendarEventCount = await db.select({ count: count() }).from(calendarEvents);

  console.log({
    accountCount: accountCount[0].count,
    transactionCount: transactionCount[0].count,
    snapshotCount: snapshotCount[0].count,
    batchCount: batchCount[0].count,
    calendarEventCount: calendarEventCount[0].count,
  });

  // Check Recurring
  const recurringCount = await db.select({ count: count() })
    .from(transactions)
    .where(eq(transactions.recurringFlag, true));

  console.log("Recurring Transactions:", recurringCount[0].count);

  process.exit(0);
}

main().catch(console.error);
