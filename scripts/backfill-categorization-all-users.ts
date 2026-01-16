#!/usr/bin/env npx tsx

import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { applyCategorizationCore } from "../src/lib/actions/categorization";

async function main() {
  const allUsers = await db.select({ id: users.id }).from(users);
  if (!allUsers.length) {
    console.log("No users found.");
    return;
  }

  for (const u of allUsers) {
    const res = await applyCategorizationCore(u.id);
    if (res.success) {
      console.log(`OK: backfilled categorization for user ${u.id} (total=${res.total}, categorized=${res.categorized})`);
    } else {
      console.error(`FAIL: user ${u.id}: ${res.error}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

