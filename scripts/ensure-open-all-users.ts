#!/usr/bin/env npx tsx

import { db } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { ensureOpenCategoryCore } from "../src/lib/actions/setup-open";

async function main() {
  const allUsers = await db.select({ id: users.id }).from(users);
  if (!allUsers.length) {
    console.log("No users found.");
    return;
  }

  for (const u of allUsers) {
    const res = await ensureOpenCategoryCore(u.id);
    if (res.success) {
      console.log(`OK: ensured OPEN for user ${u.id}`);
    } else {
      console.error(`FAIL: user ${u.id}: ${res.error}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

