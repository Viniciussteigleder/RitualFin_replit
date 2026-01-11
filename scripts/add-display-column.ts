
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.production.local" });
config({ path: ".env.local" });
config();

async function addDisplayColumn() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("❌ DATABASE_URL not found");
        process.exit(1);
    }

    console.log("Target DB:", url.replace(/:[^:]+@/, ":***@"));

    const pool = new pg.Pool({ connectionString: url });
    const client = await pool.connect();
    
    try {
        console.log("\n🔍 Checking for display column...");
        
        // Check if column exists
        const checkRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'display'
        `);
        
        if (checkRes.rows.length > 0) {
            console.log("✅ Column 'display' already exists");
        } else {
            console.log("❌ Column 'display' NOT FOUND - Adding it now...");
            
            // Add the column
            await client.query(`
                ALTER TABLE transactions 
                ADD COLUMN IF NOT EXISTS display text NOT NULL DEFAULT 'yes'
            `);
            
            console.log("✅ Column 'display' added successfully");
        }
        
        // Verify
        const verifyRes = await client.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'display'
        `);
        
        console.log("\n📊 Final state:");
        console.table(verifyRes.rows);
        
    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

addDisplayColumn();
