
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.production.local" });
config({ path: ".env.local" });
config();

async function inspectTaxonomy() {
    console.log("--- Inspecting Taxonomy Leaf ---");
    const url = process.env.DATABASE_URL;
    if (!url) process.exit(1);

    const pool = new pg.Pool({ connectionString: url });
    try {
        const client = await pool.connect();
        const res = await client.query(`SELECT * FROM taxonomy_leaf LIMIT 10`);
        console.table(res.rows);
        client.release();
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

inspectTaxonomy();
