import XLSX from 'xlsx';
import { config } from 'dotenv';
import { db } from '../src/lib/db/db.js';
import { rules, taxonomyLevel1, taxonomyLevel2, taxonomyLeaf } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

/**
 * Import Categories, Keywords, and Aliases from Excel
 * Source: docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx
 */

const EXCEL_PATH = './docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx';

// Demo user ID
const USER_ID = 'e9d1c9aa-fa90-4483-b132-b06db86792ac';

interface ExcelRow {
  [key: string]: any;
}

async function importExcelData() {
  console.log('📊 Starting Excel import...');
  console.log(`📁 Reading file: ${EXCEL_PATH}`);

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(EXCEL_PATH);
    console.log(`📋 Sheets found: ${workbook.SheetNames.join(', ')}`);

    let stats = {
      level1: 0,
      level2: 0,
      level3: 0,
      rules: 0,
    };

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n🔍 Processing sheet: "${sheetName}"`);
      const worksheet = workbook.Sheets[sheetName];
      const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      console.log(`   Found ${data.length} rows`);

      if (data.length === 0) {
        console.log('   ⚠️  Empty sheet, skipping');
        continue;
      }

      // Inspect first row to determine sheet type
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      console.log(`   Columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`);

      // Determine sheet type and process
      if (sheetName.toLowerCase().includes('alias') && columns.some(c => c.toLowerCase().includes('key_words'))) {
        await importRules(data, stats);
      } else if (sheetName.toLowerCase().includes('regra') || sheetName.toLowerCase().includes('rule') || 
          sheetName.toLowerCase().includes('keyword') || sheetName.toLowerCase().includes('palavra')) {
        await importRules(data, stats);
      } else if (sheetName.toLowerCase().includes('taxonomia') || sheetName.toLowerCase().includes('categoria')) {
        await importTaxonomy(data, stats);
      } else {
        // Try to auto-detect
        if (columns.some(c => c.toLowerCase().includes('keyword') || c.toLowerCase().includes('palavra') || c.toLowerCase().includes('regra') || c.toLowerCase().includes('key_words'))) {
          await importRules(data, stats);
        } else if (columns.some(c => c.toLowerCase().includes('nivel') || c.toLowerCase().includes('categoria'))) {
          await importTaxonomy(data, stats);
        } else {
          console.log('   ℹ️  Unknown sheet type, skipping');
        }
      }
    }

    console.log('\n✅ Import complete!');
    console.log('\n📊 Summary:');
    console.log(`   Taxonomy Level 1: ${stats.level1}`);
    console.log(`   Taxonomy Level 2: ${stats.level2}`);
    console.log(`   Taxonomy Level 3 (Leaf): ${stats.level3}`);
    console.log(`   Rules/Keywords: ${stats.rules}`);

  } catch (error) {
    console.error('❌ Error reading Excel file:', error);
    throw error;
  }
}

async function importTaxonomy(data: ExcelRow[], stats: any) {
  console.log('   📂 Importing taxonomy...');

  const level1Map = new Map<string, string>();
  const level2Map = new Map<string, { level1: string; level2: string }>();

  for (const row of data) {
    // Try all possible column name variations
    const nivel1 = row['Nivel_1_PT'] || row['Nivel 1'] || row['nivel1'] || row['Categoria 1'] || row['categoria1'];
    const nivel2 = row['Nivel_2_PT'] || row['Nivel 2'] || row['nivel2'] || row['Categoria 2'] || row['categoria2'];
    const nivel3 = row['Nivel_3_PT'] || row['Nivel 3'] || row['nivel3'] || row['Categoria 3'] || row['categoria3'];

    if (!nivel1) continue;

    const nivel1Str = String(nivel1).trim();
    if (!nivel1Str) continue;

    // Track Level 1
    if (!level1Map.has(nivel1Str)) {
      level1Map.set(nivel1Str, '');
    }

    // Track Level 2
    if (nivel2) {
      const nivel2Str = String(nivel2).trim();
      if (nivel2Str) {
        const key = `${nivel1Str}::${nivel2Str}`;
        if (!level2Map.has(key)) {
          level2Map.set(key, { level1: nivel1Str, level2: nivel2Str });
        }
      }
    }
  }

  console.log(`   Found ${level1Map.size} unique Level 1 categories`);
  console.log(`   Found ${level2Map.size} unique Level 2 categories`);

  // Import Level 1 - use upsert pattern
  for (const nivel1 of Array.from(level1Map.keys())) {
    try {
      // First check if exists
      const existing = await db.query.taxonomyLevel1.findFirst({
        where: eq(taxonomyLevel1.nivel1Pt, nivel1),
      });

      if (existing) {
        level1Map.set(nivel1, existing.level1Id);
        console.log(`   ℹ️  Level 1 "${nivel1}" already exists, using ID: ${existing.level1Id}`);
      } else {
        // Insert new
        const result = await db.insert(taxonomyLevel1).values({
          userId: USER_ID,
          nivel1Pt: nivel1,
        }).returning({ id: taxonomyLevel1.level1Id });
        
        if (result.length > 0) {
          level1Map.set(nivel1, result[0].id);
          stats.level1++;
          console.log(`   ✅ Created Level 1 "${nivel1}" with ID: ${result[0].id}`);
        }
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error with Level 1 "${nivel1}": ${error.message}`);
    }
  }

  // Import Level 2
  for (const [key, { level1, level2 }] of Array.from(level2Map.entries())) {
    const level1Id = level1Map.get(level1);
    if (!level1Id) {
      console.log(`   ⚠️  Skipping Level 2 "${level2}" - parent Level 1 "${level1}" not found`);
      continue;
    }

    try {
      // Check if exists
      const existing = await db.query.taxonomyLevel2.findFirst({
        where: eq(taxonomyLevel2.nivel2Pt, level2),
      });

      if (existing) {
        console.log(`   ℹ️  Level 2 "${level2}" already exists`);
      } else {
        await db.insert(taxonomyLevel2).values({
          userId: USER_ID,
          level1Id: level1Id,
          nivel2Pt: level2,
        });
        
        stats.level2++;
        console.log(`   ✅ Created Level 2 "${level2}"`);
      }
    } catch (error: any) {
      console.log(`   ⚠️  Error inserting Level 2 "${level2}": ${error.message}`);
    }
  }

  console.log(`   ✅ Imported ${stats.level1} new Level 1, ${stats.level2} new Level 2 categories`);
}

async function importRules(data: ExcelRow[], stats: any) {
  console.log('   🔑 Importing rules/keywords...');

  for (const row of data) {
    // Try different column name variations
    const keyword = row['Key_words_alias'] || row['Keyword'] || row['keyword'] || row['Palavra-chave'] || row['palavra'] || row['Keywords'] || row['Alias_Desc'];
    const categoria1 = row['Categoria 1'] || row['categoria1'] || row['Category 1'] || row['Nivel 1'] || row['Nivel_1_PT'];
    const categoria2 = row['Categoria 2'] || row['categoria2'] || row['Category 2'] || row['Nivel 2'] || row['Nivel_2_PT'];
    const categoria3 = row['Categoria 3'] || row['categoria3'] || row['Category 3'] || row['Nivel 3'] || row['Nivel_3_PT'];
    const tipo = row['Tipo'] || row['tipo'] || row['Type'] || row['Receita/Despesa'];
    const fixoVariavel = row['Fixo/Variável'] || row['fixoVariavel'] || row['Fix/Var'];

    if (!keyword) continue;

    const keywordStr = String(keyword).trim();
    if (!keywordStr) continue;

    try {
      await db.insert(rules).values({
        userId: USER_ID,
        keywords: keywordStr,
        name: keywordStr,
        type: tipo === 'Receita' ? 'Receita' : 'Despesa',
        fixVar: fixoVariavel === 'Fixo' ? 'Fixo' : 'Variável',
        category1: categoria1 as any || 'Outros',
        category2: categoria2 || null,
        category3: categoria3 || null,
        active: true,
        priority: 500,
      }).onConflictDoNothing();
      
      stats.rules++;
    } catch (error: any) {
      console.log(`   ⚠️  Error inserting rule "${keywordStr}": ${error.message}`);
    }
  }

  console.log(`   ✅ Imported ${stats.rules} rules`);
}

// Run the import
importExcelData()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
