/**
 * Import categories and aliases from Excel file
 *
 * This script imports:
 * - 109 category rows (Nivel_1, Nivel_2, Nivel_3, keywords, etc.)
 * - 1000 merchant alias rows (alias descriptions, keywords, logo URLs)
 */

import fs from 'fs';
import path from 'path';
import { db } from './db';
import { taxonomyLevel1, taxonomyLevel2, taxonomyLeaf, rules, aliasAssets, keyDescMap, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const CATEGORIAS_JSON = '/tmp/categorias.json';
const ALIAS_JSON = '/tmp/alias.json';

interface CategoryRow {
  appClassificacao: string;
  nivel1Pt: string;
  nivel2Pt: string;
  nivel3Pt: string;
  keyWords: string | null;
  keyWordsNegative: string | null;
  receitaDespesa: string;
  fixoVariavel: string;
  recorrente: string;
}

interface AliasRow {
  aliasDesc: string;
  keyWordsAlias: string;
  urlIconInternet: string | null;
}

async function getUserId(): Promise<string> {
  // Get or create demo user (same pattern as routes.ts)
  const [user] = await db.select().from(users).where(eq(users.username, 'demo')).limit(1);

  if (user) {
    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`);
    return user.id;
  }

  // Create demo user if doesn't exist
  const [newUser] = await db.insert(users).values({
    username: 'demo',
    password: 'demo'
  }).returning();

  console.log(`✅ Created user: ${newUser.username} (ID: ${newUser.id})`);
  return newUser.id;
}

async function importCategories(userId: string) {
  console.log('🔄 Importing categories from Excel...');

  const raw = JSON.parse(fs.readFileSync(CATEGORIAS_JSON, 'utf-8'));
  const headers = raw[0];
  const rows = raw.slice(1) as any[][];

  const level1Map = new Map<string, string>();
  const level2Map = new Map<string, string>();
  const leafMap = new Map<string, string>();

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row || row.length === 0) continue;

    const [appClassificacao, nivel1Pt, nivel2Pt, nivel3Pt, keyWords, keyWordsNegative, receitaDespesa, fixoVariavel, recorrente] = row;

    if (!nivel1Pt || !nivel2Pt || !nivel3Pt) {
      skipped++;
      continue;
    }

    // Create or get Level 1
    let level1Id = level1Map.get(nivel1Pt);
    if (!level1Id) {
      const existing = await db.query.taxonomyLevel1.findFirst({
        where: and(
          eq(taxonomyLevel1.userId, userId),
          eq(taxonomyLevel1.nivel1Pt, nivel1Pt)
        )
      });

      if (existing) {
        level1Id = existing.level1Id;
      } else {
        const [newLevel1] = await db.insert(taxonomyLevel1).values({
          userId,
          nivel1Pt
        }).returning({ level1Id: taxonomyLevel1.level1Id });
        level1Id = newLevel1!.level1Id;
      }
      level1Map.set(nivel1Pt, level1Id!);
    }

    // Create or get Level 2
    const level2Key = `${nivel1Pt}::${nivel2Pt}`;
    let level2Id = level2Map.get(level2Key);
    if (!level2Id) {
      const existing = await db.query.taxonomyLevel2.findFirst({
        where: and(
          eq(taxonomyLevel2.userId, userId),
          eq(taxonomyLevel2.level1Id, level1Id!),
          eq(taxonomyLevel2.nivel2Pt, nivel2Pt)
        )
      });

      if (existing) {
        level2Id = existing.level2Id;
      } else {
        const [newLevel2] = await db.insert(taxonomyLevel2).values({
          userId,
          level1Id: level1Id!,
          nivel2Pt,
          recorrenteDefault: recorrente === 'Sim' ? 'Sim' : 'Não',
          fixoVariavelDefault: fixoVariavel,
          receitaDespesaDefault: receitaDespesa
        }).returning({ level2Id: taxonomyLevel2.level2Id });
        level2Id = newLevel2!.level2Id;
      }
      level2Map.set(level2Key, level2Id!);
    }

    // Create or get Leaf (Level 3)
    const leafKey = `${nivel1Pt}::${nivel2Pt}::${nivel3Pt}`;
    let leafId = leafMap.get(leafKey);
    if (!leafId) {
      const existing = await db.query.taxonomyLeaf.findFirst({
        where: and(
          eq(taxonomyLeaf.userId, userId),
          eq(taxonomyLeaf.level2Id, level2Id!),
          eq(taxonomyLeaf.nivel3Pt, nivel3Pt)
        )
      });

      if (existing) {
        leafId = existing.leafId;
      } else {
        const [newLeaf] = await db.insert(taxonomyLeaf).values({
          userId,
          level2Id: level2Id!,
          nivel3Pt,
          recorrenteDefault: recorrente === 'Sim' ? 'Sim' : 'Não',
          fixoVariavelDefault: fixoVariavel,
          receitaDespesaDefault: receitaDespesa
        }).returning({ leafId: taxonomyLeaf.leafId });
        leafId = newLeaf!.leafId;
      }
      leafMap.set(leafKey, leafId!);
    }

    // Create rule if keywords exist
    if (keyWords && keyWords.trim()) {
      const existingRule = await db.query.rules.findFirst({
        where: and(
          eq(rules.userId, userId),
          eq(rules.leafId, leafId!),
          eq(rules.keyWords, keyWords)
        )
      });

      if (!existingRule) {
        await db.insert(rules).values({
          userId,
          name: `${nivel3Pt} - Auto`,
          leafId: leafId!,
          keyWords: keyWords,
          keyWordsNegative: keyWordsNegative || null,
          priority: 500,
          strict: false,
          active: true
        });
      }
    }

    imported++;
  }

  console.log(`✅ Categories imported: ${imported}, skipped: ${skipped}`);
  console.log(`📊 Level 1: ${level1Map.size}, Level 2: ${level2Map.size}, Level 3 (Leaves): ${leafMap.size}`);
}

async function importAliases(userId: string) {
  console.log('🔄 Importing merchant aliases...');

  const raw = JSON.parse(fs.readFileSync(ALIAS_JSON, 'utf-8'));
  const headers = raw[0];
  const rows = raw.slice(1) as any[][];

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row || row.length === 0) continue;

    const [aliasDesc, keyWordsAlias, urlIconInternet] = row;

    if (!aliasDesc || !keyWordsAlias) {
      skipped++;
      continue;
    }

    // Check if alias already exists
    const existing = await db.query.aliasAssets.findFirst({
      where: and(
        eq(aliasAssets.userId, userId),
        eq(aliasAssets.aliasDesc, aliasDesc)
      )
    });

    if (existing) {
      // Update if needed
      await db.update(aliasAssets)
        .set({
          keyWordsAlias,
          urlIconInternet: urlIconInternet || null,
          updatedAt: new Date()
        })
        .where(and(
          eq(aliasAssets.userId, userId),
          eq(aliasAssets.aliasDesc, aliasDesc)
        ));
    } else {
      // Insert new
      await db.insert(aliasAssets).values({
        userId,
        aliasDesc,
        keyWordsAlias,
        urlIconInternet: urlIconInternet || null
      });
    }

    imported++;
  }

  console.log(`✅ Aliases imported: ${imported}, skipped: ${skipped}`);
}

async function main() {
  try {
    console.log('🚀 Starting import process...\n');

    // Check if JSON files exist
    if (!fs.existsSync(CATEGORIAS_JSON)) {
      throw new Error(`Categories JSON not found: ${CATEGORIAS_JSON}`);
    }
    if (!fs.existsSync(ALIAS_JSON)) {
      throw new Error(`Alias JSON not found: ${ALIAS_JSON}`);
    }

    // Get or create user
    const userId = await getUserId();
    console.log('');

    await importCategories(userId);
    console.log('');
    await importAliases(userId);

    console.log('\n✅ Import completed successfully!');
    console.log('📊 Data is now available in the database');

    // Close database connection
    if (db && typeof (db as any).end === 'function') {
      await (db as any).end();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();
