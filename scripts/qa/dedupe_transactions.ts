import { Client } from "pg";

const apply = process.argv.includes("--apply");

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const duplicates = await client.query<{
    user_id: string;
    key: string;
    ids: string[];
  }>(`
    SELECT user_id, key, array_agg(id ORDER BY imported_at ASC, id ASC) AS ids
    FROM transactions
    GROUP BY user_id, key
    HAVING COUNT(*) > 1;
  `);

  let totalDuplicates = 0;
  let totalDeleted = 0;

  for (const row of duplicates.rows) {
    const [, ...dupes] = row.ids;
    if (dupes.length === 0) continue;
    totalDuplicates += dupes.length;

    if (apply) {
      await client.query(
        "DELETE FROM transactions WHERE id = ANY($1)",
        [dupes]
      );
      totalDeleted += dupes.length;
    }
  }

  console.log(`Duplicate groups: ${duplicates.rowCount}`);
  console.log(`Duplicate rows: ${totalDuplicates}`);
  if (apply) {
    console.log(`Deleted rows: ${totalDeleted}`);
  } else {
    console.log("Dry run only (use --apply to delete duplicates).");
  }

  await client.end();
}

run().catch((error) => {
  console.error("Dedupe failed:", error.message || error);
  process.exit(1);
});
