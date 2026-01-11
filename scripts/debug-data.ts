
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.production.local" });
config({ path: ".env.local" });
config();

async function debugData() {
  const url = process.env.DATABASE_URL;
  if (!url) { process.exit(1); }

  const pool = new pg.Pool({ connectionString: url });
  
  try {
    const client = await pool.connect();
    console.log("--- PHASE 2: DATA INTEGRITY CHECK ---");

    // A) Rules Count
    const rulesRes = await client.query(`SELECT COUNT(*) as count FROM rules;`);
    console.log(`Rules Count: ${rulesRes.rows[0].count}`);

    // B) Leaf ID Stats
    const leafRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN leaf_id IS NULL THEN 1 ELSE 0 END) as leaf_null,
        SUM(CASE WHEN leaf_id IS NOT NULL THEN 1 ELSE 0 END) as leaf_present
      FROM transactions;
    `);
    console.log("Leaf ID Stats:", leafRes.rows[0]);

    // C) Sample NULL leaf_id
    console.log("Sample Transactions (desc_raw vs desc_norm):");
    const sampleRes = await client.query(`
        SELECT id, payment_date, amount, desc_raw, desc_norm, category_1 
        FROM transactions 
        WHERE leaf_id IS NULL 
        LIMIT 5;
    `);
    console.table(sampleRes.rows);

    // D) Inspect Rules
    console.log("Sample Rules:");
    const ruleSample = await client.query(`
        SELECT id, key_words, category_1, leaf_id 
        FROM rules 
        LIMIT 5;
    `);
    console.table(ruleSample.rows);

    // D) Taxonomy Leaf Count
    try {
        const taxRes = await client.query(`SELECT COUNT(*) as count FROM taxonomy_leaf;`);
        console.log(`Taxonomy Leaf Count: ${taxRes.rows[0].count}`);
    } catch (e) {
        console.log("Could not query taxonomy_leaf (maybe table name differs)");
    }

    client.release();
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

debugData();
