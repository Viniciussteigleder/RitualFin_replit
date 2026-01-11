
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.production.local" });
config({ path: ".env.local" });
config();

async function patchRules() {
    const url = process.env.DATABASE_URL;
    if (!url) process.exit(1);

    const pool = new pg.Pool({ connectionString: url });
    const client = await pool.connect();
    
    try {
        console.log("--- PATCHING RULES LEAF_ID ---");
        
        // 1. Fetch Taxonomy Data (Correct Table Names)
        console.log("Fetching Taxonomy...");
        const level1Res = await client.query(`SELECT level_1_id as id, nivel_1_pt as name FROM taxonomy_level_1`);
        const level2Res = await client.query(`SELECT level_2_id as id, level_1_id as parent_id, nivel_2_pt as name FROM taxonomy_level_2`);
        const leafRes = await client.query(`SELECT leaf_id, level_2_id as parent_id, nivel_3_pt as name FROM taxonomy_leaf`);

        // 2. Build Lookup Map
        const l1Map = new Map(); 
        level1Res.rows.forEach(r => l1Map.set(r.name, r.id));

        const l2Map = new Map(); // Name|ParentID -> ID
        level2Res.rows.forEach(r => l2Map.set(`${r.name}|${r.parent_id}`, r.id));

        const leafLookup = new Map(); // "Cat1|Cat2|LeafName" -> LeafID

        for (const leaf of leafRes.rows) {
            // resolve parent (l2)
            const l2 = level2Res.rows.find(l => l.id === leaf.parent_id);
            if (!l2) continue;

            // resolve grandparent (l1)
            const l1 = level1Res.rows.find(l => l.id === l2.parent_id);
            if (!l1) continue;

            // Normalized Keys for robustness (Uppercase)
            const key = `${l1.name.toUpperCase()}|${l2.name.toUpperCase()}|${leaf.name.toUpperCase()}`;
            leafLookup.set(key, leaf.leaf_id);
        }

        console.log(`Built lookup for ${leafLookup.size} leaves.`);

        // 3. Update Rules
        const rulesRes = await client.query(`SELECT id, category_1, category_2, category_3 FROM rules WHERE leaf_id IS NULL`);
        console.log(`Found ${rulesRes.rows.length} rules with NULL leaf_id.`);

        let updated = 0;
        for (const rule of rulesRes.rows) {
            const c1 = (rule.category_1 || "").toUpperCase();
            const c2 = (rule.category_2 || "").toUpperCase();
            const c3 = (rule.category_3 || "").toUpperCase();
            
            // Try specific match
            let matchKey = `${c1}|${c2}|${c3}`;
            let leafId = leafLookup.get(matchKey);

            if (!leafId && rule.category_3 === null) {
                 matchKey = `${c1}|${c2}|OUTROS`; // Try "Outros" mapping
                 leafId = leafLookup.get(matchKey);
            }
            
            // Fallbacks:
            // If c3 not found, try finding specific common leaves
            if (!leafId && c2 === "ALIMENTAÇÃO") {
               // Often "Alimentação" has "Supermercado" or "Restaurantes"
               // Check some hardcoded heuristics if needed or search leaves under c2
            }

            if (leafId) {
                await client.query(`UPDATE rules SET leaf_id = $1 WHERE id = $2`, [leafId, rule.id]);
                updated++;
            } else {
                // console.warn(`Could not find leaf for Rule ${rule.id}: ${c1} > ${c2} > ${c3}`);
                // Only warn every 10 to avoid noise if many fail
            }
        }

        console.log(`✅ Updated ${updated} rules with valid leaf_id.`);
        
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

patchRules();
