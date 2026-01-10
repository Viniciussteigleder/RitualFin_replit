
import { db } from "../src/lib/db";
import { accounts, transactions, accountBalanceSnapshots } from "../src/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { addDays, format, startOfDay } from "date-fns";

async function main() {
    console.log("Starting snapshot population...");

    const allAccounts = await db.select().from(accounts);
    
    for (const account of allAccounts) {
        console.log(`Processing account: ${account.name} (Currency: ${account.currencyDefault})`);

        const accountTx = await db.select()
            .from(transactions)
            .where(eq(transactions.accountId, account.id))
            .orderBy(asc(transactions.paymentDate));

        if (accountTx.length === 0) {
            console.log(`  No transactions. Skipping.`);
            continue;
        }

        let runningBalance = 0;
        const txsByDay = new Map<string, number>();
        let minDate = new Date();
        let maxDate = new Date(0); // Epoch

        // Pass 1: Aggregate daily changes and find range
        for (const tx of accountTx) {
            const dateStr = format(tx.paymentDate, 'yyyy-MM-dd');
            const current = txsByDay.get(dateStr) || 0;
            txsByDay.set(dateStr, current + tx.amount);

            if (tx.paymentDate < minDate) minDate = tx.paymentDate;
            if (tx.paymentDate > maxDate) maxDate = tx.paymentDate;
        }

        minDate = startOfDay(minDate);
        const today = startOfDay(new Date());
        let endDate = maxDate > today ? maxDate : today;
        endDate = startOfDay(endDate);

        console.log(`  Range: ${format(minDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

        let currentDate = new Date(minDate);
        const snapshots = [];
        let count = 0;

        while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const dailyChange = txsByDay.get(dateStr) || 0;
            runningBalance += dailyChange;

            snapshots.push({
                userId: account.userId,
                accountId: account.id,
                asOfDate: new Date(currentDate),
                balanceType: "calculated",
                amount: Number(runningBalance.toFixed(2)),
                unit: account.currencyDefault || "EUR",
                sourceType: "manual"
            });

            currentDate = addDays(currentDate, 1);
            count++;
        }

        // Insert in chunks
        const chunkSize = 500;
        console.log(`  Inserting ${snapshots.length} snapshots...`);
        for (let i = 0; i < snapshots.length; i += chunkSize) {
            const chunk = snapshots.slice(i, i + chunkSize);
            await db.insert(accountBalanceSnapshots).values(chunk).onConflictDoNothing();
            process.stdout.write(".");
        }
        console.log(" Done.");
    }

    console.log("All accounts processed.");
    process.exit(0);
}

main().catch(console.error);
