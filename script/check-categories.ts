import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve(process.cwd(), "docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx");
const workbook = XLSX.readFile(filePath);
const catSheet = workbook.Sheets["Categorias"];
const catData = XLSX.utils.sheet_to_json(catSheet);

const l1 = new Set();
catData.forEach((row: any) => {
    if (row["Nivel_1_PT"]) l1.add(row["Nivel_1_PT"].trim());
});

console.log("Unique L1 Categories:", Array.from(l1).sort());
