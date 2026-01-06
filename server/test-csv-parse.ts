/**
 * Test CSV parsing for all three formats
 */

import fs from 'fs';
import { parseCSV } from './csv-parser';

const testFiles = [
  {
    name: 'Sparkasse',
    path: '/home/user/RitualFin_replit/docs/Feedback_user/CSV_original/20260102-22518260-umsatz (1).CSV',
    encoding: 'iso-8859-1'
  },
  {
    name: 'M&M',
    path: '/home/user/RitualFin_replit/docs/Feedback_user/CSV_original/2026-01-02_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv',
    encoding: 'utf-8'
  },
  {
    name: 'Amex',
    path: '/home/user/RitualFin_replit/docs/Feedback_user/CSV_original/activity (9) (1).csv',
    encoding: 'utf-8'
  }
];

async function testParsing() {
  for (const file of testFiles) {
    console.log(`\n==================== Testing ${file.name} ====================`);

    try {
      // Read file with correct encoding
      const buffer = fs.readFileSync(file.path);
      let content: string;

      if (file.encoding === 'iso-8859-1') {
        content = new TextDecoder('iso-8859-1').decode(buffer);
      } else {
        content = new TextDecoder('utf-8').decode(buffer);
      }

      console.log(`File size: ${buffer.length} bytes`);
      console.log(`Lines in file: ${content.split('\n').length}`);
      console.log(`First 200 chars:\n${content.substring(0, 200)}`);

      // Parse CSV
      const result = parseCSV(content, {
        encoding: file.encoding,
        filename: file.name
      });

      console.log(`\nParse result:`);
      console.log(`- Success: ${result.success}`);
      console.log(`- Format detected: ${result.format}`);
      console.log(`- Rows total: ${result.rowsTotal}`);
      console.log(`- Rows imported: ${result.rowsImported}`);
      console.log(`- Transactions parsed: ${result.transactions.length}`);
      console.log(`- Errors: ${result.errors.length}`);

      if (result.errors.length > 0) {
        console.log(`\nErrors:`);
        result.errors.slice(0, 5).forEach((err, i) => {
          console.log(`  ${i + 1}. ${err}`);
        });
      }

      if (result.diagnostics) {
        console.log(`\nDiagnostics:`);
        console.log(JSON.stringify(result.diagnostics, null, 2));
      }

      if (result.transactions.length > 0) {
        console.log(`\nSample transaction:`);
        console.log(JSON.stringify(result.transactions[0], null, 2));
      }

    } catch (error: any) {
      console.error(`ERROR: ${error.message}`);
      console.error(error.stack);
    }
  }
}

testParsing().catch(console.error);
