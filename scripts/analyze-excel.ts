import XLSX from "xlsx";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeExcel() {
  const filePath = path.join(__dirname, "../docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx");
  
  const workbook = XLSX.readFile(filePath);
  
  console.log("📊 Workbook Info:");
  console.log("Sheet Names:", workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n📄 Sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log("First 10 rows:");
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
    
    // Also show as objects
    const dataAsObjects = XLSX.utils.sheet_to_json(worksheet);
    console.log("\nFirst 5 rows as objects:");
    console.log(JSON.stringify(dataAsObjects.slice(0, 5), null, 2));
  });
}

analyzeExcel().catch(console.error);
