import { and, eq, isNull, or } from "drizzle-orm";
import { db, isDatabaseConfigured, pool } from "../server/db";
import {
  appCategory,
  appCategoryLeaf,
  rules,
  taxonomyLeaf,
  taxonomyLevel1,
  taxonomyLevel2,
  transactions,
  users
} from "../shared/schema";

type LeafRef = {
  leafId: string;
  nivel1Pt: string;
  nivel2Pt: string;
  nivel3Pt: string;
};

const normalizeKey = (value: string) => value.trim().toLowerCase();

async function ensureLevel1(userId: string, name: string, cache: Map<string, string>) {
  const key = normalizeKey(name);
  const existing = cache.get(key);
  if (existing) return existing;

  const [created] = await db.insert(taxonomyLevel1).values({
    userId,
    nivel1Pt: name
  }).returning();
  cache.set(key, created.level1Id);
  return created.level1Id;
}

async function ensureLevel2(userId: string, level1Id: string, name: string, cache: Map<string, string>) {
  const key = `${level1Id}::${normalizeKey(name)}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const [created] = await db.insert(taxonomyLevel2).values({
    userId,
    level1Id,
    nivel2Pt: name
  }).returning();
  cache.set(key, created.level2Id);
  return created.level2Id;
}

async function ensureLeaf(userId: string, level2Id: string, name: string, cache: Map<string, LeafRef>, level1Name: string, level2Name: string) {
  const key = `${level2Id}::${normalizeKey(name)}`;
  const existing = cache.get(key);
  if (existing) return existing.leafId;

  const [created] = await db.insert(taxonomyLeaf).values({
    userId,
    level2Id,
    nivel3Pt: name
  }).returning();
  cache.set(key, {
    leafId: created.leafId,
    nivel1Pt: level1Name,
    nivel2Pt: level2Name,
    nivel3Pt: name
  });
  return created.leafId;
}

async function ensureAppCategory(userId: string, name: string, cache: Map<string, string>) {
  const key = normalizeKey(name);
  const existing = cache.get(key);
  if (existing) return existing;

  const [created] = await db.insert(appCategory).values({
    userId,
    name,
    active: true,
    orderIndex: cache.size
  }).returning();
  cache.set(key, created.appCatId);
  return created.appCatId;
}

async function ensureAppCategoryLeaf(userId: string, appCatId: string, leafId: string, cache: Set<string>) {
  const key = `${appCatId}::${leafId}`;
  if (cache.has(key)) return;
  await db.insert(appCategoryLeaf).values({ userId, appCatId, leafId });
  cache.add(key);
}

async function migrateUser(userId: string) {
  const existingLevel1 = await db.select().from(taxonomyLevel1).where(eq(taxonomyLevel1.userId, userId));
  const existingLevel2 = await db.select().from(taxonomyLevel2).where(eq(taxonomyLevel2.userId, userId));
  const existingLeaves = await db.select().from(taxonomyLeaf).where(eq(taxonomyLeaf.userId, userId));
  const existingAppCats = await db.select().from(appCategory).where(eq(appCategory.userId, userId));
  const existingAppLeafs = await db.select().from(appCategoryLeaf).where(eq(appCategoryLeaf.userId, userId));

  const level1Cache = new Map(existingLevel1.map((row) => [normalizeKey(row.nivel1Pt), row.level1Id]));
  const level2Cache = new Map(existingLevel2.map((row) => [`${row.level1Id}::${normalizeKey(row.nivel2Pt)}`, row.level2Id]));
  const leafCache = new Map(existingLeaves.map((row) => [`${row.level2Id}::${normalizeKey(row.nivel3Pt)}`, {
    leafId: row.leafId,
    nivel1Pt: "",
    nivel2Pt: "",
    nivel3Pt: row.nivel3Pt
  } as LeafRef]));
  const appCatCache = new Map(existingAppCats.map((row) => [normalizeKey(row.name), row.appCatId]));
  const appLeafCache = new Set(existingAppLeafs.map((row) => `${row.appCatId}::${row.leafId}`));

  const legacyRules = await db.select().from(rules)
    .where(or(eq(rules.userId, userId), isNull(rules.userId)));
  const legacyTransactions = await db.select().from(transactions)
    .where(eq(transactions.userId, userId));

  const legacyTriples = new Map<string, { level1: string; level2: string; level3: string }>();

  const addTriple = (level1?: string | null, level2?: string | null, level3?: string | null) => {
    const normalizedLevel1 = (level1 || "Outros").trim() || "Outros";
    const normalizedLevel2 = (level2 && level2.trim().length > 0) ? level2.trim() : "Geral";
    const normalizedLevel3 = (level3 && level3.trim().length > 0)
      ? level3.trim()
      : (level2 && level2.trim().length > 0 ? `${normalizedLevel2} - Geral` : "Geral");
    const key = `${normalizeKey(normalizedLevel1)}::${normalizeKey(normalizedLevel2)}::${normalizeKey(normalizedLevel3)}`;
    if (!legacyTriples.has(key)) {
      legacyTriples.set(key, { level1: normalizedLevel1, level2: normalizedLevel2, level3: normalizedLevel3 });
    }
  };

  legacyRules.forEach((rule) => addTriple(rule.category1, rule.category2, rule.category3));
  legacyTransactions.forEach((tx) => addTriple(tx.category1, tx.category2, tx.category3));

  const leafByLegacyKey = new Map<string, LeafRef>();

  for (const triple of legacyTriples.values()) {
    const level1Id = await ensureLevel1(userId, triple.level1, level1Cache);
    const level2Id = await ensureLevel2(userId, level1Id, triple.level2, level2Cache);
    const leafId = await ensureLeaf(userId, level2Id, triple.level3, leafCache, triple.level1, triple.level2);

    const appCatId = await ensureAppCategory(userId, triple.level1, appCatCache);
    await ensureAppCategoryLeaf(userId, appCatId, leafId, appLeafCache);

    const key = `${normalizeKey(triple.level1)}::${normalizeKey(triple.level2)}::${normalizeKey(triple.level3)}`;
    leafByLegacyKey.set(key, {
      leafId,
      nivel1Pt: triple.level1,
      nivel2Pt: triple.level2,
      nivel3Pt: triple.level3
    });
  }

  for (const rule of legacyRules) {
    if (rule.leafId) continue;
    const key = `${normalizeKey(rule.category1 || "Outros")}::${normalizeKey(rule.category2 || "Geral")}::${normalizeKey(rule.category3 || (rule.category2 ? `${rule.category2} - Geral` : "Geral"))}`;
    const resolvedLeaf = leafByLegacyKey.get(key);
    if (!resolvedLeaf) continue;
    await db.update(rules)
      .set({
        leafId: resolvedLeaf.leafId,
        keyWords: rule.keyWords || rule.keywords || null
      })
      .where(eq(rules.id, rule.id));
  }

  for (const tx of legacyTransactions) {
    if (tx.leafId) continue;
    const key = `${normalizeKey(tx.category1 || "Outros")}::${normalizeKey(tx.category2 || "Geral")}::${normalizeKey(tx.category3 || (tx.category2 ? `${tx.category2} - Geral` : "Geral"))}`;
    const resolvedLeaf = leafByLegacyKey.get(key);
    if (!resolvedLeaf) continue;
    await db.update(transactions)
      .set({ leafId: resolvedLeaf.leafId })
      .where(eq(transactions.id, tx.id));
  }
}

async function run() {
  if (!isDatabaseConfigured) {
    throw new Error("DATABASE_URL não configurada. Configure antes de executar a migração.");
  }

  const allUsers = await db.select().from(users);
  for (const user of allUsers) {
    await migrateUser(user.id);
    console.log(`Taxonomia migrada para user ${user.username}`);
  }
}

run()
  .then(() => {
    console.log("Migração concluída.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    if (pool) {
      await pool.end();
    }
  });
