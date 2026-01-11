
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.production.local" });
config({ path: ".env.local" });
config();

// Embedded Match Logic to avoid import issues
function normalize(text: string): string {
  if (!text) return "";
  return text.toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim();
}

async function reapplyRules() {
    const url = process.env.DATABASE_URL;
    if (!url) process.exit(1);

    const pool = new pg.Pool({ connectionString: url });
    const client = await pool.connect();
    
    try {
        console.log("--- RE-APPLYING RULES TO TRANSACTIONS ---");
        
        // 1. Fetch Rules (Valid ones only)
        const rulesRes = await client.query(`
            SELECT id, key_words, category_1, category_2, category_3, leaf_id, type, fix_var, priority 
            FROM rules 
            WHERE active = true AND key_words IS NOT NULL AND key_words != ''
        `);
        const rules = rulesRes.rows;
        console.log(`Loaded ${rules.length} active rules.`);

        // 2. Fetch Transactions (Uncategorized or all?)
        // Let's do ALL to ensure leaf_id is backfilled
        const txRes = await client.query(`SELECT id, desc_raw, desc_norm FROM transactions`);
        console.log(`Loaded ${txRes.rows.length} transactions.`);

        let updatedCount = 0;
        
        // 3. Match and Update
        for (const tx of txRes.rows) {
            const haystack = normalize(tx.desc_norm || tx.desc_raw);
            const matches = [];

            for (const rule of rules) {
                const keywords = (rule.key_words || "").split(";").map((k: string) => normalize(k)).filter(Boolean);
                if (keywords.some((k: string) => haystack.includes(k))) {
                     matches.push(rule);
                }
            }

            // Sort by priority desc
            matches.sort((a, b) => (b.priority || 500) - (a.priority || 500));

            if (matches.length > 0) {
                const best = matches[0];
                const conflict = matches.length > 1 && matches[0].priority === matches[1].priority;
                
                // Only update if we have a leaf_id (or if we want to confirm the rule match even without leaf)
                // We prefer leaf_id.
                
                // Construct Update
                await client.query(`
                    UPDATE transactions 
                    SET 
                        category_1 = $1,
                        category_2 = $2,
                        category_3 = $3,
                        leaf_id = $4,
                        rule_id_applied = $5,
                        conflict_flag = $6,
                        display = 'yes'
                    WHERE id = $7
                `, [
                    best.category_1,
                    best.category_2,
                    best.category_3,
                    best.leaf_id, // Might be null if rule wasn't patched, but that's what we have
                    best.id,
                    conflict,
                    tx.id
                ]);
                updatedCount++;
            }
        }

        console.log(`✅ Re-applied rules to ${updatedCount} transactions.`);
        
        // Verify Stats
        const stats = await client.query(`
            SELECT COUNT(*) as total, SUM(CASE WHEN leaf_id IS NOT NULL THEN 1 ELSE 0 END) as leaves 
            FROM transactions
        `);
        console.log("New Stats:", stats.rows[0]);

    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

reapplyRules();
