import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const filePath = path.join(process.cwd(), 'docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays
    console.log(data.slice(0, 5)); // Print first 5 rows
  });
} catch (error) {
  console.error('Error reading excel:', error);
}
