"use server";

import { readFileSync } from 'fs';
import { db } from '@/lib/db';
import { transactions, accounts } from '@/lib/db/schema';
import { parseIngestionFile } from '@/lib/ingest';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { ensureOpenCategory } from '@/lib/actions/setup-open';

/**
 * Server action to import CSV data
 * Can be called from the UI or via API
 */

const CSV_FILES = [
  {
    path: './docs/Feedback_user/CSV_original/2026-01-02_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv',
    name: 'Miles & More Gold',
    type: 'credit_card' as const,
  },
  {
    path: './docs/Feedback_user/CSV_original/20260102-22518260-umsatz (1).CSV',
    name: 'Sparkasse Girokonto',
    type: 'bank_account' as const,
  },
  {
    path: './docs/Feedback_user/CSV_original/activity (9) (1).csv',
    name: 'American Express',
    type: 'credit_card' as const,
  },
];

// Helper to generate transaction key for deduplication
function generateTransactionKey(tx: any, accountName: string): string {
  const dateStr = tx.paymentDate?.toISOString().split('T')[0] || tx.date?.toISOString().split('T')[0] || '';
  const desc = (tx.descNorm || tx.description || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const amt = Math.abs(tx.amount || 0).toFixed(2);
  return `${accountName}:${dateStr}:${desc}:${amt}`;
}

export async function importCSVData() {
  // DISABLE IN PRODUCTION/WEB - Security Flag
  console.error("❌ importCSVData is a dev-only script and has been disabled for security reasons.");
  return { success: false, error: "Dev-only script disabled" };

  /* 
  // ORIGINAL CODE COMMENTED OUT FOR SECURITY
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  const userId = session.user.id;
  const ensured = await ensureOpenCategory();
  if (!ensured.openLeafId) {
    return { success: false, error: "OPEN taxonomy not initialized" };
  }

  console.log('📊 Starting CSV import for user:', userId);

  let totalStats = {
    filesProcessed: 0,
    accountsCreated: 0,
    transactionsImported: 0,
    transactionsSkipped: 0,
    errors: [] as string[],
  };

  for (const csvFile of CSV_FILES) {
    console.log(`🔍 Processing: ${csvFile.name}`);

    try {
      // Read CSV file
      const fileContent = readFileSync(csvFile.path, 'utf-8');
      console.log(`   ✅ File read successfully (${fileContent.length} bytes)`);

      // Parse using existing parsers
      const parseResult = await parseIngestionFile(fileContent, csvFile.path, userId);

      if (!parseResult.success) {
        console.log(`   ❌ Parse failed: ${parseResult.errors.join(', ')}`);
        totalStats.errors.push(`${csvFile.name}: ${parseResult.errors.join(', ')}`);
        continue;
      }

      console.log(`   ✅ Parsed ${parseResult.rowsImported} transactions`);

      // Create or find account
      let accountId: string;
      const existingAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.userId, userId),
          eq(accounts.name, csvFile.name)
        ),
      });

      if (existingAccount) {
        accountId = existingAccount.id;
        console.log(`   ℹ️  Using existing account: ${csvFile.name}`);
      } else {
        const newAccount = await db.insert(accounts).values({
          userId: userId,
          name: csvFile.name,
          type: csvFile.type,
          institution: csvFile.name.split(' ')[0],
          currencyDefault: 'EUR',
          isActive: true,
          icon: csvFile.type === 'credit_card' ? 'credit-card' : 'building-2',
          color: csvFile.name.includes('Sparkasse') ? '#FF0000' : 
                 csvFile.name.includes('Miles') ? '#0066CC' : '#006FCF',
        }).returning({ id: accounts.id });

        accountId = newAccount[0].id;
        totalStats.accountsCreated++;
        console.log(`   ✅ Created account: ${csvFile.name}`);
      }

      // Import transactions
      let imported = 0;
      let skipped = 0;

      for (const tx of parseResult.transactions) {
        try {
          // Generate transaction key
          const txKey = generateTransactionKey(tx, csvFile.name);

          // Check if transaction already exists by key
          const existing = await db.query.transactions.findFirst({
            where: and(
              eq(transactions.userId, userId),
              eq(transactions.key, txKey)
            ),
            columns: { id: true },
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Prepare transaction data
          const paymentDate = tx.paymentDate || tx.date;
          const descRaw = tx.descRaw || tx.rawDescription || tx.description || '';
          const descNorm = tx.descNorm || tx.description || '';

          // Insert transaction
          await db.insert(transactions).values({
            userId: userId,
            // accountId: accountId, // Removed from schema
            source: csvFile.name.includes('Sparkasse') ? 'Sparkasse' :
                   csvFile.name.includes('American') ? 'Amex' :
                   csvFile.name.includes('Miles') ? 'M&M' : 'Sparkasse', // Default or logic
            paymentDate: paymentDate,
            descRaw: descRaw,
            descNorm: descNorm,
            rawDescription: tx.rawDescription,
            normalizedDescription: descNorm,
            amount: tx.amount,
            currency: tx.currency || 'EUR',
            key: txKey,
            keyDesc: tx.keyDesc,
            simpleDesc: tx.simpleDesc,
            type: tx.amount < 0 ? 'Despesa' : 'Receita',
            fixVar: 'Variável',
            leafId: ensured.openLeafId,
            category1: 'OPEN',
            category2: 'OPEN',
            category3: 'OPEN',
            needsReview: true,
            manualOverride: false,
            classifiedBy: 'AUTO_KEYWORDS',
            postingStatus: 'posted',
            processingStatus: 'enriched',
          });

          imported++;
        } catch (error: any) {
          console.log(`   ⚠️  Error importing transaction: ${error.message}`);
          totalStats.errors.push(`Transaction error: ${error.message}`);
        }
      }

      console.log(`   ✅ Imported ${imported} transactions`);
      console.log(`   ⏭️  Skipped ${skipped} duplicates`);

      totalStats.filesProcessed++;
      totalStats.transactionsImported += imported;
      totalStats.transactionsSkipped += skipped;

    } catch (error: any) {
      console.log(`   ❌ Error processing file: ${error.message}`);
      totalStats.errors.push(`${csvFile.name}: ${error.message}`);
    }
  }

  console.log('✅ Import complete!');
  console.log('📊 Summary:', totalStats);

  return {
    success: totalStats.errors.length === 0,
    ...totalStats,
  };
  */
}
