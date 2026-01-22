import "dotenv/config";
import { resetDatabaseCore } from "../src/lib/reset-core";
import { db } from "../src/lib/db/script-db";

async function main() {
  console.log("Running reset script...");
  try {
    const result = await resetDatabaseCore(db);
    console.log(result);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
