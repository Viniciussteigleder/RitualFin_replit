
import { config } from "dotenv";
import pg from "pg";

// Simulate Next.js env loading priority
config({ path: ".env.production.local" });
config({ path: ".env.local" });
config(); // Default .env

async function debugEnv() {
  const url = process.env.DATABASE_URL || "";
  const maskedUrl = url.replace(/:[^:]+@/, ":***@");
  
  console.log("--- DEBUG ENV START ---");
  console.log("Effective DATABASE_URL:", maskedUrl);

  if (!url) {
    console.error("❌ DATABASE_URL is missing!");
    process.exit(1);
  }

  // Parse connection details
  const isNeon = url.includes("neon.tech");
  console.log("Is Neon DB:", isNeon);
  
  // Test Connection
  console.log("Testing connection...");
  const pool = new pg.Pool({
    connectionString: url,
    // Add sslmode=require if not present in URL for Neon
    ssl: url.includes("sslmode=") ? undefined : { rejectUnauthorized: false } 
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connection Successful!");
    
    // 1.2 Verify Schema
    console.log("Checking 'transactions' table schema...");
    const res = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name = 'display';
    `);
    
    if (res.rows.length > 0) {
      console.log("✅ 'display' column found:", res.rows[0]);
    } else {
      console.error("❌ 'display' column MISSING in this DB!");
    }

    client.release();
  } catch (err: any) {
    console.error("❌ Connection Failed:", err.message);
    if (err.code) console.error("Error Code:", err.code);
  } finally {
    await pool.end();
    console.log("--- DEBUG ENV END ---");
  }
}

debugEnv();
