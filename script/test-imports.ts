import fs from "node:fs/promises";
import path from "node:path";
import { parseCSV } from "../server/csv-parser";

async function loadCsv(file: string, encoding?: string) {
  const content = await fs.readFile(file);
  return parseCSV(content.toString(encoding || "utf-8"), { encoding });
}

async function run() {
  const sparkassePath = path.join("attached_assets", "20251229-22518260-umsatz_1767103688511.CSV");
  const amexPath = path.join("attached_assets", "activity_(8)_1766875792745.csv");
  const mmPath = path.join("attached_assets", "2025-11-24_Transactions_list_Miles_&_More_Gold_Credit_Card_531_1766834531215.csv");

  const spark = await loadCsv(sparkassePath, "latin1");
  if (!spark.success || spark.transactions.length === 0) {
    throw new Error("Sparkasse parse failed");
  }
  const sparkKeyDescHasPayment = spark.transactions.some(t => t.keyDesc.toLowerCase().includes("pagamento amex"));
  console.log("Sparkasse OK", { rows: spark.transactions.length, hasAmexPayment: sparkKeyDescHasPayment });

  const amex = await loadCsv(amexPath, "utf-8");
  if (!amex.success || amex.transactions.length === 0) {
    throw new Error("Amex parse failed");
  }
  const amexKeyDescHasPayment = amex.transactions.some(t => t.keyDesc.toLowerCase().includes("pagamento amex"));
  console.log("Amex OK", { rows: amex.transactions.length, hasPayment: amexKeyDescHasPayment });

  const mm = await loadCsv(mmPath, "utf-8");
  if (!mm.success || mm.transactions.length === 0) {
    throw new Error("M&M parse failed");
  }
  const mmHasForeign = mm.transactions.some(t => t.keyDesc.includes("compra internacional"));
  console.log("M&M OK", { rows: mm.transactions.length, hasForeign: mmHasForeign });

  console.log("All import checks passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
