import { createRequire } from "module";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function reset() {
  const { db } = await import("../src/lib/db");
  const { sql } = await import("drizzle-orm");

  console.log("💥 Dropping schema public...");
  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO neondb_owner;`); // Specific to Neon/Postgres default user 
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
  
  console.log("✅ Schema reset.");
  process.exit(0);
}

reset().catch(e => {
    console.error(e);
    process.exit(1);
});
