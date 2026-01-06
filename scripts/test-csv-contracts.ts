import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCsvFromRows } from "../server/csv-export";
import { csvContracts } from "../server/csv-contracts";
import { previewCsvImport } from "../server/csv-imports";

const fixtures = (name: string) =>
  readFileSync(join(process.cwd(), "server/fixtures/csv-contracts", name));

const testExportBom = () => {
  const csv = buildCsvFromRows(csvContracts.classification, [
    {
      "App classificação": "Alimentação",
      "Nível_1_PT": "Essenciais",
      "Nível_2_PT": "Mercado",
      "Nível_3_PT": "Supermercado",
      "Key_words": "LIDL",
      "Key_words_negative": "",
      "Receita/Despesa": "Despesa",
      "Fixo/Variável": "Variável",
      "Recorrente": "Não"
    }
  ]);
  assert.ok(csv.startsWith("\uFEFF"), "export should include UTF-8 BOM");
  assert.ok(csv.includes("\r\n"), "export should use CRLF line endings");
};

const testEncodingDetection = () => {
  const bom = previewCsvImport("classification", fixtures("classification_utf8_bom.csv"), "classification_utf8_bom.csv");
  assert.equal(bom.success, true);
  assert.equal(bom.detectedEncoding, "utf-8-bom");

  const win = previewCsvImport("aliases_assets", fixtures("aliases_assets_windows1252.csv"), "aliases_assets_windows1252.csv");
  assert.equal(win.success, true);
  assert.equal(win.detectedEncoding, "windows-1252");
};

const testDelimiterValidation = () => {
  const mixed = previewCsvImport(
    "classification",
    fixtures("classification_mixed_delimiter.csv"),
    "classification_mixed_delimiter.csv"
  );
  assert.equal(mixed.success, false);
  assert.ok(mixed.reasonCodes.includes("DELIMITER_INCONSISTENT"));
};

const testHeaderStrictness = () => {
  const bad = previewCsvImport("classification", fixtures("classification_bad_header.csv"), "classification_bad_header.csv");
  assert.equal(bad.success, false);
  assert.ok(bad.reasonCodes.includes("HEADER_MISMATCH"));
};

const testRowShape = () => {
  const bad = previewCsvImport("classification", fixtures("classification_row_shape.csv"), "classification_row_shape.csv");
  assert.equal(bad.success, false);
  assert.ok(bad.reasonCodes.includes("ROW_SHAPE_INVALID"));
};

const testDecodeCorruption = () => {
  const bad = previewCsvImport(
    "classification",
    fixtures("classification_decode_corrupt.csv"),
    "classification_decode_corrupt.csv"
  );
  assert.equal(bad.success, false);
  assert.ok(bad.reasonCodes.includes("DECODE_CORRUPTION"));
};

const run = () => {
  testExportBom();
  testEncodingDetection();
  testDelimiterValidation();
  testHeaderStrictness();
  testRowShape();
  testDecodeCorruption();
  console.log("csv-contract tests passed");
};

run();
