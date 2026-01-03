import { Client } from "pg";

const queries = [
  {
    id: "DB-01",
    description: "Dedupe by key per user",
    sql: `SELECT user_id, key, COUNT(*)
FROM transactions
GROUP BY user_id, key
HAVING COUNT(*) > 1;`,
  },
  {
    id: "DB-02",
    description: "AccountId coverage",
    sql: `SELECT COUNT(*) AS missing_account
FROM transactions
WHERE account_id IS NULL;`,
  },
  {
    id: "DB-03",
    description: "Manual override and rule reapply",
    sql: `SELECT id, manual_override, rule_id_applied, needs_review
FROM transactions
WHERE manual_override = true;`,
  },
  {
    id: "DB-04",
    description: "Interno exclusion",
    sql: `SELECT id, category_1, internal_transfer, exclude_from_budget
FROM transactions
WHERE category_1 = 'Interno';`,
  },
  {
    id: "DB-05a",
    description: "Budget uniqueness",
    sql: `SELECT user_id, month, category_1, COUNT(*)
FROM budgets
GROUP BY user_id, month, category_1
HAVING COUNT(*) > 1;`,
  },
  {
    id: "DB-05b",
    description: "Goal uniqueness",
    sql: `SELECT user_id, month, COUNT(*)
FROM goals
GROUP BY user_id, month
HAVING COUNT(*) > 1;`,
  },
  {
    id: "DB-05c",
    description: "Category goal uniqueness",
    sql: `SELECT goal_id, category_1, COUNT(*)
FROM category_goals
GROUP BY goal_id, category_1
HAVING COUNT(*) > 1;`,
  },
  {
    id: "DB-06",
    description: "Referential integrity",
    sql: `SELECT t.id
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
WHERE t.account_id IS NOT NULL AND a.id IS NULL;`,
  },
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  for (const query of queries) {
    const result = await client.query(query.sql);
    console.log(`\n## ${query.id}: ${query.description}`);
    console.log(JSON.stringify(result.rows, null, 2));
  }

  await client.end();
}

run().catch((error) => {
  console.error("DB invariants failed:", error.message || error);
  process.exit(1);
});
