import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { db } from '../src/lib/db/index.js';
import { transactions, accounts } from '../src/lib/db/schema.js';
import { parseIngestionFile } from '../src/lib/ingest/index.js';
import { eq, and } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

/**
 * Import real transaction data from CSV files
 * This script processes the 3 CSV files from docs/Feedback_user/CSV_original/
 */

const USER_ID = 'e9d1c9aa-fa90-4483-b132-b06db86792ac'; // Demo user

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

async function importCSVData() {
  console.log('📊 Starting CSV import...\n');

  let totalStats = {
    filesProcessed: 0,
    accountsCreated: 0,
    transactionsImported: 0,
    transactionsSkipped: 0,
    errors: 0,
  };

  for (const csvFile of CSV_FILES) {
    console.log(`🔍 Processing: ${csvFile.name}`);
    console.log(`   File: ${csvFile.path}`);

    try {
      // Read CSV file
      const fileContent = readFileSync(csvFile.path, 'utf-8');
      console.log(`   ✅ File read successfully (${fileContent.length} bytes)`);

      // Parse using existing parsers
      const parseResult = await parseIngestionFile(fileContent, csvFile.path, USER_ID);

      if (!parseResult.success) {
        console.log(`   ❌ Parse failed: ${parseResult.errors.join(', ')}`);
        totalStats.errors++;
        continue;
      }

      console.log(`   ✅ Parsed ${parseResult.rowsImported} transactions`);

      // Create or find account
      let accountId: string;
      const existingAccount = await db.query.accounts.findFirst({
        where: eq(accounts.name, csvFile.name),
      });

      if (existingAccount) {
        accountId = existingAccount.id;
        console.log(`   ℹ️  Using existing account: ${csvFile.name}`);
      } else {
        const newAccount = await db.insert(accounts).values({
          userId: USER_ID,
          name: csvFile.name,
          type: csvFile.type,
          institution: csvFile.name.split(' ')[0], // First word as institution
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
              eq(transactions.userId, USER_ID),
              eq(transactions.key, txKey)
            ),
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
            userId: USER_ID,
            accountId: accountId,
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
            category1: 'Outros', // Default category
            needsReview: true, // Mark for categorization
            classifiedBy: 'MANUAL',
            postingStatus: 'posted',
            processingStatus: 'enriched',
          });

          imported++;
        } catch (error: any) {
          console.log(`   ⚠️  Error importing transaction: ${error.message}`);
          totalStats.errors++;
        }
      }

      console.log(`   ✅ Imported ${imported} transactions`);
      console.log(`   ⏭️  Skipped ${skipped} duplicates\n`);

      totalStats.filesProcessed++;
      totalStats.transactionsImported += imported;
      totalStats.transactionsSkipped += skipped;

    } catch (error: any) {
      console.log(`   ❌ Error processing file:`);
      console.log(`      Message: ${error.message}`);
      console.log(`      Stack: ${error.stack}`);
      console.log('');
      totalStats.errors++;
    }
  }

  console.log('✅ Import complete!\n');
  console.log('📊 Summary:');
  console.log(`   Files processed: ${totalStats.filesProcessed}/${CSV_FILES.length}`);
  console.log(`   Accounts created: ${totalStats.accountsCreated}`);
  console.log(`   Transactions imported: ${totalStats.transactionsImported}`);
  console.log(`   Transactions skipped (duplicates): ${totalStats.transactionsSkipped}`);
  console.log(`   Errors: ${totalStats.errors}`);
}

// Run the import
importCSVData()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
