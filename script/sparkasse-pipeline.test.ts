import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { runSparkasseParsePipeline } from "../server/sparkasse-pipeline";

const FALLBACK_SAMPLE = path.join("attached_assets", "20251229-22518260-umsatz_1767103688511.CSV");

const run = () => {
  if (fs.existsSync(FALLBACK_SAMPLE)) {
    const buffer = fs.readFileSync(FALLBACK_SAMPLE);
    const ok = runSparkasseParsePipeline({
      uploadAttemptId: "test",
      userId: "test",
      filename: "sample.csv",
      buffer,
      sizeBytes: buffer.length
    });
    assert.equal(ok.success, true, "Expected sample Sparkasse CSV to parse successfully");
    assert.ok(ok.rowsTotal > 0, "Expected rowsTotal > 0");
    assert.ok(ok.diagnostics.headerFound.length > 0, "Expected header to be detected");
  }

  const badDelimiterCsv = [
    "Auftragskonto,Buchungstag,Valutadatum,Buchungstext,Verwendungszweck,Beguenstigter/Zahlungspflichtiger,Kontonummer/IBAN,Betrag,Waehrung,Info",
    "DE123,01.01.25,01.01.25,TEST,TEST,TEST,DE123,1,EUR,Info"
  ].join("\n");

  const badDelimiter = runSparkasseParsePipeline({
    uploadAttemptId: "test",
    userId: "test",
    filename: "bad-delimiter.csv",
    csvContent: badDelimiterCsv
  });
  assert.equal(badDelimiter.error?.code, "DELIMITER_MISMATCH", "Expected delimiter mismatch error");

  const missingHeadersCsv = [
    "Auftragskonto;Buchungstag;Betrag",
    "DE123;01.01.25;1,00"
  ].join("\n");

  const missingHeaders = runSparkasseParsePipeline({
    uploadAttemptId: "test",
    userId: "test",
    filename: "missing-headers.csv",
    csvContent: missingHeadersCsv
  });
  assert.equal(missingHeaders.error?.code, "HEADER_MISSING_REQUIRED", "Expected missing header error");

  const badEncodingCsv = "\uFFFD\uFFFD\uFFFD";
  const badEncoding = runSparkasseParsePipeline({
    uploadAttemptId: "test",
    userId: "test",
    filename: "bad-encoding.csv",
    csvContent: badEncodingCsv
  });
  assert.equal(badEncoding.error?.code, "ENCODING_DETECT_FAILED", "Expected encoding detect failure");

  const invalidDateCsv = [
    "Auftragskonto;Buchungstag;Valutadatum;Buchungstext;Verwendungszweck;Beguenstigter/Zahlungspflichtiger;Kontonummer/IBAN;Betrag;Waehrung;Info",
    "DE123;99.99.99;01.01.25;TEST;TEST;TEST;DE123;1,00;EUR;Info"
  ].join("\n");

  const invalidDate = runSparkasseParsePipeline({
    uploadAttemptId: "test",
    userId: "test",
    filename: "invalid-date.csv",
    csvContent: invalidDateCsv
  });
  assert.equal(invalidDate.error?.code, "DATE_PARSE_FAILED", "Expected date parse failure");

  const invalidAmountCsv = [
    "Auftragskonto;Buchungstag;Valutadatum;Buchungstext;Verwendungszweck;Beguenstigter/Zahlungspflichtiger;Kontonummer/IBAN;Betrag;Waehrung;Info",
    "DE123;01.01.25;01.01.25;TEST;TEST;TEST;DE123;abc;EUR;Info"
  ].join("\n");

  const invalidAmount = runSparkasseParsePipeline({
    uploadAttemptId: "test",
    userId: "test",
    filename: "invalid-amount.csv",
    csvContent: invalidAmountCsv
  });
  assert.equal(invalidAmount.error?.code, "AMOUNT_PARSE_FAILED", "Expected amount parse failure");
};

run();
console.log("Sparkasse pipeline tests: OK");
