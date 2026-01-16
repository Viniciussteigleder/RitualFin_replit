#!/usr/bin/env npx tsx

import { db } from "../src/lib/db";
import { taxonomyLevel1 } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";
import { CATEGORY1_VALUES } from "../src/lib/constants/category1";

async function main() {
  const rows = await db.execute(sql`SELECT DISTINCT nivel_1_pt AS name FROM taxonomy_level_1 ORDER BY name ASC`);
  const names = rows.rows.map((r: any) => String(r.name));
  const allowed = new Set<string>(CATEGORY1_VALUES as unknown as string[]);
  const unknown = names.filter((n) => !allowed.has(n));

  console.log("taxonomy_level_1 distinct names:", names.length);
  console.log(names.join("\n"));
  console.log("\nUnknown vs category_1 enum:", unknown.length);
  if (unknown.length) console.log(unknown.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

