import { db } from "../src/lib/db";
import { transactions, users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseGermanNumber(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/"/g, "").replace(/\s/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Handle DD.MM.YYYY or DD.MM.YY
  if (dateStr.includes(".")) {
    const [day, month, year] = dateStr.split(".");
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  }
  
  // Handle DD/MM/YYYY
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  }
  
  return new Date(dateStr);
}

function generateKey(date: Date, amount: number, description: string, source: string): string {
  const hashString = `${date.toISOString()}-${amount}-${description}-${source}`;
  return crypto.createHash("md5").update(hashString).digest("hex");
}

async function seedMilesAndMore() {
  const filePath = path.join(__dirname, "../docs/Feedback_user/CSV_original/2026-01-02_Transactions_list_Miles_&_More_Gold_Credit_Card_5310XXXXXXXX7340 (1).csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  
  const records = parse(fileContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    from_line: 3,
    relax_column_count: true,
  });

  console.log(`📥 Processing ${records.length} Miles & More transactions...`);

  const user = await db.query.users.findFirst({
    where: eq(users.email, "vinicius.steigleder@gmail.com"),
  });

  if (!user) {
    console.error("❌ User not found");
    return;
  }

  let inserted = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      const amount = parseGermanNumber(record.Amount);
      const paymentDate = parseDate(record["Authorised on"] || record["Processed on"] || "");
      const description = record.Description || "";
      const key = generateKey(paymentDate, amount, description, "M&M");

      const existing = await db.query.transactions.findFirst({
        where: eq(transactions.key, key),
      });

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(transactions).values({
        userId: user.id,
        key,
        date: paymentDate,
        paymentDate,
        amount,
        descRaw: description,
        descNorm: description,
        accountSource: "Miles & More",
        currency: record.Currency || "EUR",
        type: amount < 0 ? "Despesa" : "Receita",
        status: record.Status === "Processed" ? "FINAL" : "OPEN",
        source: "M&M",
      });
      inserted++;
    } catch (error) {
      console.error(`Error:`, error);
    }
  }

  console.log(`✅ M&M: Inserted ${inserted}, Skipped ${skipped}`);
}

async function seedSparkasse() {
  const filePath = path.join(__dirname, "../docs/Feedback_user/CSV_original/20260102-22518260-umsatz (1).CSV");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  
  const records = parse(fileContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    quote: '"',
  });

  console.log(`📥 Processing ${records.length} Sparkasse transactions...`);

  const user = await db.query.users.findFirst({
    where: eq(users.email, "vinicius.steigleder@gmail.com"),
  });

  if (!user) return;

  let inserted = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      const amount = parseGermanNumber(record.Betrag);
      const paymentDate = parseDate(record.Buchungstag || "");
      const description = record["Beguenstigter/Zahlungspflichtiger"] || record.Verwendungszweck || "";
      const key = generateKey(paymentDate, amount, description, "Sparkasse");

      const existing = await db.query.transactions.findFirst({
        where: eq(transactions.key, key),
      });

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(transactions).values({
        userId: user.id,
        key,
        date: paymentDate,
        paymentDate,
        amount,
        descRaw: record.Verwendungszweck || "",
        descNorm: description,
        accountSource: "Sparkasse",
        currency: record.Waehrung || "EUR",
        type: amount < 0 ? "Despesa" : "Receita",
        status: "FINAL",
        source: "Sparkasse",
      });
      inserted++;
    } catch (error) {
      console.error(`Error:`, error);
    }
  }

  console.log(`✅ Sparkasse: Inserted ${inserted}, Skipped ${skipped}`);
}

async function seedAmex() {
  const filePath = path.join(__dirname, "../docs/Feedback_user/CSV_original/activity (9) (1).csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  
  const records = parse(fileContent, {
    columns: true,
    delimiter: ",",
    skip_empty_lines: true,
    quote: '"',
  });

  console.log(`📥 Processing ${records.length} Amex transactions...`);

  const user = await db.query.users.findFirst({
    where: eq(users.email, "vinicius.steigleder@gmail.com"),
  });

  if (!user) return;

  let inserted = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      const amount = parseGermanNumber(record.Betrag);
      const paymentDate = parseDate(record.Datum || "");
      const description = record.Beschreibung || "";
      const key = generateKey(paymentDate, amount, description, "Amex");

      const existing = await db.query.transactions.findFirst({
        where: eq(transactions.key, key),
      });

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(transactions).values({
        userId: user.id,
        key,
        date: paymentDate,
        paymentDate,
        amount,
        descRaw: description,
        descNorm: description,
        accountSource: "Amex",
        currency: "EUR",
        type: amount < 0 ? "Despesa" : "Receita",
        status: "FINAL",
        source: "Amex",
      });
      inserted++;
    } catch (error) {
      console.error(`Error:`, error);
    }
  }

  console.log(`✅ Amex: Inserted ${inserted}, Skipped ${skipped}`);
}

async function main() {
  console.log("🚀 Starting seeding...\n");
  
  try {
    await seedMilesAndMore();
    await seedSparkasse();
    await seedAmex();
    
    console.log("\n✨ Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
}

main();
