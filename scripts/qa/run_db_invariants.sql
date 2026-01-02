-- RitualFin DB invariants (read-only)

-- DB-01: Dedupe by key per user
SELECT user_id, key, COUNT(*)
FROM transactions
GROUP BY user_id, key
HAVING COUNT(*) > 1;

-- DB-02: AccountId coverage
SELECT COUNT(*) AS missing_account
FROM transactions
WHERE account_id IS NULL;

-- DB-03: Manual override and rule reapply
SELECT id, manual_override, rule_id_applied, needs_review
FROM transactions
WHERE manual_override = true;

-- DB-04: Interno exclusion
SELECT id, category_1, internal_transfer, exclude_from_budget
FROM transactions
WHERE category_1 = 'Interno';

-- DB-05: Uniqueness constraints
SELECT user_id, month, category_1, COUNT(*)
FROM budgets
GROUP BY user_id, month, category_1
HAVING COUNT(*) > 1;

SELECT user_id, month, COUNT(*)
FROM goals
GROUP BY user_id, month
HAVING COUNT(*) > 1;

SELECT goal_id, category_1, COUNT(*)
FROM category_goals
GROUP BY goal_id, category_1
HAVING COUNT(*) > 1;

-- DB-06: Referential integrity
SELECT t.id
FROM transactions t
LEFT JOIN accounts a ON t.account_id = a.id
WHERE t.account_id IS NOT NULL AND a.id IS NULL;
