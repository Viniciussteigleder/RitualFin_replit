/**
 * Excel Rules Parser
 *
 * Parses the RitualFin-categorias-alias.xlsx file and generates
 * canonical JSON snapshots as the single source of truth.
 *
 * Usage: npx tsx scripts/parse-rules-xlsx.ts
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const EXCEL_PATH = 'docs/Feedback_user/Categorias_Keywords_Alias/RitualFin-categorias-alias.xlsx';
const OUTPUT_DIR = 'rules/oracle';

interface CategoryRow {
  app_category: string;
  level1_pt: string;
  level2_pt: string;
  level3_pt: string;
  keywords: string[];
  keywords_negative: string[];
  type: 'Despesa' | 'Receita';
  fix_var: 'Fixo' | 'Variável';
  recurring: boolean;
}

interface AliasRow {
  alias_desc: string;
  keywords: string[];
  icon_url: string;
}

function normalizeString(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function parseKeywords(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .toString()
    .split(';')
    .map(k => normalizeString(k))
    .filter(k => k.length > 0);
}

function parseExcel() {
  console.log('Parsing Excel file:', EXCEL_PATH);

  const workbook = XLSX.readFile(EXCEL_PATH);

  console.log('\nSheet names found:');
  workbook.SheetNames.forEach((name, i) => {
    console.log(`  ${i + 1}. "${name}"`);
  });

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Parse Categorias sheet
  const categoriasSheet = workbook.Sheets['Categorias'];
  const categoriasData = XLSX.utils.sheet_to_json(categoriasSheet);

  console.log(`\n=== Parsing "Categorias" (${categoriasData.length} rows) ===`);

  const categories: CategoryRow[] = categoriasData.map((row: any) => ({
    app_category: normalizeString(row['App classificação']),
    level1_pt: normalizeString(row['Nivel_1_PT']),
    level2_pt: normalizeString(row['Nivel_2_PT']),
    level3_pt: normalizeString(row['Nivel_3_PT']),
    keywords: parseKeywords(row['Key_words']),
    keywords_negative: parseKeywords(row['Key_words_negative']),
    type: (row['Receita/Despesa'] === 'Receita' ? 'Receita' : 'Despesa') as 'Despesa' | 'Receita',
    fix_var: (row['Fixo/Variável'] === 'Fixo' ? 'Fixo' : 'Variável') as 'Fixo' | 'Variável',
    recurring: row['Recorrente'] === 'Sim',
  })).filter(c => c.level1_pt); // Filter out empty rows

  // Parse Alias_desc sheet
  const aliasSheet = workbook.Sheets['Alias_desc'];
  const aliasData = XLSX.utils.sheet_to_json(aliasSheet);

  console.log(`=== Parsing "Alias_desc" (${aliasData.length} rows) ===`);

  const aliases: AliasRow[] = aliasData.map((row: any) => ({
    alias_desc: (row['Alias_Desc'] || '').toString().trim(),
    keywords: parseKeywords(row['Key_words_alias']),
    icon_url: (row['URL_icon_internet'] || '').toString().trim(),
  })).filter(a => a.alias_desc && a.keywords.length > 0);

  // Generate statistics
  const stats = {
    total_categories: categories.length,
    unique_level1: new Set(categories.map(c => c.level1_pt)).size,
    unique_level2: new Set(categories.map(c => c.level2_pt)).size,
    unique_level3: new Set(categories.map(c => c.level3_pt)).size,
    total_keywords: categories.reduce((sum, c) => sum + c.keywords.length, 0),
    categories_with_keywords: categories.filter(c => c.keywords.length > 0).length,
    total_aliases: aliases.length,
    total_alias_keywords: aliases.reduce((sum, a) => sum + a.keywords.length, 0),
    type_breakdown: {
      despesa: categories.filter(c => c.type === 'Despesa').length,
      receita: categories.filter(c => c.type === 'Receita').length,
    },
    fix_var_breakdown: {
      fixo: categories.filter(c => c.fix_var === 'Fixo').length,
      variavel: categories.filter(c => c.fix_var === 'Variável').length,
    },
  };

  // Build keyword -> category mapping for rules
  const keywordRules: Array<{
    keyword: string;
    negative_keywords: string[];
    app_category: string;
    level1: string;
    level2: string;
    level3: string;
    type: string;
    fix_var: string;
    recurring: boolean;
  }> = [];

  categories.forEach(cat => {
    cat.keywords.forEach(kw => {
      keywordRules.push({
        keyword: kw,
        negative_keywords: cat.keywords_negative,
        app_category: cat.app_category,
        level1: cat.level1_pt,
        level2: cat.level2_pt,
        level3: cat.level3_pt,
        type: cat.type,
        fix_var: cat.fix_var,
        recurring: cat.recurring,
      });
    });
  });

  // Build alias -> display mapping
  const aliasMapping: Array<{
    keyword: string;
    alias_desc: string;
    icon_url: string;
  }> = [];

  aliases.forEach(alias => {
    alias.keywords.forEach(kw => {
      aliasMapping.push({
        keyword: kw,
        alias_desc: alias.alias_desc,
        icon_url: alias.icon_url,
      });
    });
  });

  // Write output files
  const categoriesPath = path.join(OUTPUT_DIR, 'categories.json');
  const aliasesPath = path.join(OUTPUT_DIR, 'aliases.json');
  const keywordRulesPath = path.join(OUTPUT_DIR, 'keyword-rules.json');
  const aliasMappingPath = path.join(OUTPUT_DIR, 'alias-mapping.json');
  const statsPath = path.join(OUTPUT_DIR, 'stats.json');
  const metadataPath = path.join(OUTPUT_DIR, 'metadata.json');

  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
  fs.writeFileSync(aliasesPath, JSON.stringify(aliases, null, 2));
  fs.writeFileSync(keywordRulesPath, JSON.stringify(keywordRules, null, 2));
  fs.writeFileSync(aliasMappingPath, JSON.stringify(aliasMapping, null, 2));
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  fs.writeFileSync(metadataPath, JSON.stringify({
    source: EXCEL_PATH,
    parsed_at: new Date().toISOString(),
    sheets: workbook.SheetNames,
  }, null, 2));

  console.log(`\n=== Oracle Generated ===`);
  console.log(`Category entries: ${categories.length}`);
  console.log(`  - With keywords: ${stats.categories_with_keywords}`);
  console.log(`  - Total keywords: ${stats.total_keywords}`);
  console.log(`  - Unique Level 1: ${stats.unique_level1}`);
  console.log(`  - Unique Level 2: ${stats.unique_level2}`);
  console.log(`  - Unique Level 3: ${stats.unique_level3}`);
  console.log(`Alias entries: ${aliases.length}`);
  console.log(`  - Total alias keywords: ${stats.total_alias_keywords}`);
  console.log(`\nType breakdown:`);
  console.log(`  - Despesa: ${stats.type_breakdown.despesa}`);
  console.log(`  - Receita: ${stats.type_breakdown.receita}`);
  console.log(`\nFixo/Variável breakdown:`);
  console.log(`  - Fixo: ${stats.fix_var_breakdown.fixo}`);
  console.log(`  - Variável: ${stats.fix_var_breakdown.variavel}`);
  console.log(`\nOutput files:`);
  console.log(`  ${categoriesPath}`);
  console.log(`  ${aliasesPath}`);
  console.log(`  ${keywordRulesPath}`);
  console.log(`  ${aliasMappingPath}`);
  console.log(`  ${statsPath}`);
  console.log(`  ${metadataPath}`);

  return { categories, aliases, keywordRules, aliasMapping, stats };
}

// Run
parseExcel();
