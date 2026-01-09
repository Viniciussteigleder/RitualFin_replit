
import { db } from "../src/lib/db";
import { accounts, transactions, accountBalanceSnapshots, ingestionBatches, calendarEvents, ingestionItems, rules, transactionEvidenceLink } from "../src/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";

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

  const totalBalanceRes = await db.select({ total: sql<number>`sum(cast(amount as double precision))` }).from(transactions);
  console.log("Total Balance:", totalBalanceRes[0].total);

  const amexSamples = await db.select().from(transactions).where(eq(transactions.source, "Amex")).limit(5);
  console.log("Amex Samples (Sign check):", amexSamples.map(tx => ({
    desc: tx.descNorm,
    amount: tx.amount,
    date: tx.paymentDate
  })));

  process.exit(0);
}

main().catch(console.error);
