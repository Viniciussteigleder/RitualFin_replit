/**
 * Migration endpoint to run category/alias import
 * Call via: POST /api/admin/migrate-categories
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import { db } from './db';
import { taxonomyLevel1, taxonomyLevel2, taxonomyLeaf, rules, aliasAssets, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export const migrationRouter = Router();

async function getUserId(): Promise<string> {
  const [user] = await db.select().from(users).where(eq(users.username, 'demo')).limit(1);
  if (user) return user.id;

  const [newUser] = await db.insert(users).values({
    username: 'demo',
    password: 'demo'
  }).returning();
  return newUser.id;
}

migrationRouter.post('/api/admin/migrate-categories', async (req: Request, res: Response) => {
  try {
    const CATEGORIAS_JSON = '/tmp/categorias.json';
    const ALIAS_JSON = '/tmp/alias.json';

    // Check files exist
    if (!fs.existsSync(CATEGORIAS_JSON) || !fs.existsSync(ALIAS_JSON)) {
      return res.status(400).json({
        error: 'JSON files not found. Run Excel extraction first.'
      });
    }

    const userId = await getUserId();
    const stats = {
      userId,
      categories: { imported: 0, skipped: 0, level1: 0, level2: 0, level3: 0 },
      aliases: { imported: 0, skipped: 0 }
    };

    // Import categories
    const categoriesRaw = JSON.parse(fs.readFileSync(CATEGORIAS_JSON, 'utf-8'));
    const categoryRows = categoriesRaw.slice(1);

    const level1Map = new Map<string, string>();
    const level2Map = new Map<string, string>();
    const leafMap = new Map<string, string>();

    for (const row of categoryRows) {
      if (!row || row.length === 0) continue;

      const [appClassificacao, nivel1Pt, nivel2Pt, nivel3Pt, keyWords, keyWordsNegative, receitaDespesa, fixoVariavel, recorrente] = row;

      if (!nivel1Pt || !nivel2Pt || !nivel3Pt) {
        stats.categories.skipped++;
        continue;
      }

      // Level 1
      let level1Id = level1Map.get(nivel1Pt);
      if (!level1Id) {
        const existing = await db.query.taxonomyLevel1.findFirst({
          where: and(eq(taxonomyLevel1.userId, userId), eq(taxonomyLevel1.nivel1Pt, nivel1Pt))
        });
        if (existing) {
          level1Id = existing.level1Id;
        } else {
          const [newLevel1] = await db.insert(taxonomyLevel1).values({ userId, nivel1Pt }).returning();
          level1Id = newLevel1!.level1Id;
        }
        level1Map.set(nivel1Pt, level1Id!);
      }

      // Level 2
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
            userId, level1Id: level1Id!, nivel2Pt,
            recorrenteDefault: recorrente === 'Sim' ? 'Sim' : 'Não',
            fixoVariavelDefault: fixoVariavel,
            receitaDespesaDefault: receitaDespesa
          }).returning();
          level2Id = newLevel2!.level2Id;
        }
        level2Map.set(level2Key, level2Id!);
      }

      // Leaf (Level 3)
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
            userId, level2Id: level2Id!, nivel3Pt,
            recorrenteDefault: recorrente === 'Sim' ? 'Sim' : 'Não',
            fixoVariavelDefault: fixoVariavel,
            receitaDespesaDefault: receitaDespesa
          }).returning();
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
            userId, name: `${nivel3Pt} - Auto`, leafId: leafId!,
            keyWords, keyWordsNegative: keyWordsNegative || null,
            priority: 500, strict: false, active: true
          });
        }
      }

      stats.categories.imported++;
    }

    stats.categories.level1 = level1Map.size;
    stats.categories.level2 = level2Map.size;
    stats.categories.level3 = leafMap.size;

    // Import aliases
    const aliasesRaw = JSON.parse(fs.readFileSync(ALIAS_JSON, 'utf-8'));
    const aliasRows = aliasesRaw.slice(1);

    for (const row of aliasRows) {
      if (!row || row.length === 0) continue;
      const [aliasDesc, keyWordsAlias, urlIconInternet] = row;
      if (!aliasDesc || !keyWordsAlias) {
        stats.aliases.skipped++;
        continue;
      }

      const existing = await db.query.aliasAssets.findFirst({
        where: and(eq(aliasAssets.userId, userId), eq(aliasAssets.aliasDesc, aliasDesc))
      });

      if (existing) {
        await db.update(aliasAssets).set({
          keyWordsAlias,
          urlIconInternet: urlIconInternet || null,
          updatedAt: new Date()
        }).where(and(eq(aliasAssets.userId, userId), eq(aliasAssets.aliasDesc, aliasDesc)));
      } else {
        await db.insert(aliasAssets).values({
          userId, aliasDesc, keyWordsAlias,
          urlIconInternet: urlIconInternet || null
        });
      }

      stats.aliases.imported++;
    }

    res.json({
      success: true,
      message: 'Migration completed successfully',
      stats
    });

  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
