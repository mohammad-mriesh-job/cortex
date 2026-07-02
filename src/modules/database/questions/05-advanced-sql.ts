import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-adv-correlated-subquery',
    question: 'What is a correlated subquery, and why can it be slow?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['subqueries', 'correlated', 'performance'],
    answer: `A **correlated subquery** references a column from the **outer** query, so it cannot be evaluated once up front — conceptually it **re-runs for every outer row**.

\`\`\`sql
SELECT name FROM employees e
WHERE salary > (
  SELECT AVG(salary) FROM employees
  WHERE dept_id = e.dept_id   -- e.dept_id ties it to the outer row
);
\`\`\`

For N outer rows the inner query runs ~N times, which is why it can be slow.

:::senior
Optimizers often rewrite these into a **semi-join** (\`EXISTS\`) or a single grouped/windowed pass, but not always. A window function (\`AVG(salary) OVER (PARTITION BY dept_id)\`) or a joined derived table usually beats a hand-written correlated subquery.
:::`,
  },
  {
    id: 'db-adv-in-vs-exists',
    question: 'IN vs EXISTS — what is the difference and when do you prefer each?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['subqueries', 'in', 'exists'],
    answer: `| | \`IN (subquery)\` | \`EXISTS (subquery)\` |
|---|---|---|
| Tests | value is in a returned list | at least one row exists |
| Subquery returns | a column of values | rows (SELECT list ignored) |
| Short-circuits | no — builds the full list | yes — stops at first match |
| NULL-safe negation | \`NOT IN\` **breaks** on NULL | \`NOT EXISTS\` is safe |

- Prefer **\`IN\`** for a small, known, NULL-free list of values.
- Prefer **\`EXISTS\`** for a correlated existence check — it can stop at the first matching row.

The performance gap has narrowed in modern optimizers (both often plan to the same semi-join), so choose for **correctness and clarity** first.`,
  },
  {
    id: 'db-adv-not-in-null-trap',
    question: 'Why can `NOT IN` with a subquery return zero rows unexpectedly?',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['subqueries', 'null', 'not-in'],
    answer: `Because of **three-valued logic**. If the subquery returns any \`NULL\`:

\`\`\`sql
x NOT IN (1, 2, NULL)
-- expands to: x <> 1 AND x <> 2 AND x <> NULL
-- x <> NULL is UNKNOWN, so the whole AND can never be TRUE
\`\`\`

Every row evaluates to UNKNOWN and is rejected — you get **no rows**.

:::gotcha
\`IN\` with a NULL is merely useless; \`NOT IN\` is actively **wrong**. Fix it with \`NOT EXISTS\` (NULL-safe) or add \`WHERE col IS NOT NULL\` to the subquery.
:::

\`\`\`sql
-- Safe rewrite:
SELECT name FROM employees e
WHERE NOT EXISTS (
  SELECT 1 FROM departments d WHERE d.manager_id = e.id
);
\`\`\``,
  },
  {
    id: 'db-adv-cte-vs-subquery',
    question: 'What is a CTE and how does it differ from a derived table (subquery in FROM)?',
    difficulty: 'Easy',
    category: 'Advanced SQL',
    tags: ['cte', 'with', 'subqueries'],
    answer: `A **CTE** (Common Table Expression) is a **named** temporary result set defined with \`WITH\`, scoped to the single statement that follows.

\`\`\`sql
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_sal FROM employees GROUP BY dept_id
)
SELECT e.name FROM employees e
JOIN dept_avg d ON d.dept_id = e.dept_id
WHERE e.salary > d.avg_sal;
\`\`\`

Versus a **derived table**, which is an *anonymous* subquery inside \`FROM\`. Differences:

- A CTE is **named** and can be **referenced multiple times** and can be **self-referencing** (recursive).
- CTEs read **top-down** as a pipeline; nested subqueries read inside-out.
- Both are scoped to the statement; performance is usually comparable.`,
  },
  {
    id: 'db-adv-recursive-cte',
    question: 'How does a recursive CTE work?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['cte', 'recursive', 'hierarchy'],
    answer: `A \`WITH RECURSIVE\` CTE has two parts joined by \`UNION [ALL]\`:

1. **Anchor** — runs once, seeds the working set (base case).
2. **Recursive term** — references the CTE itself; runs repeatedly, each pass fed the previous pass's new rows.

It **stops when the recursive term produces no new rows**.

\`\`\`sql
WITH RECURSIVE nums AS (
  SELECT 1 AS n                    -- anchor
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 5  -- recursive term
)
SELECT n FROM nums;   -- 1, 2, 3, 4, 5
\`\`\`

The canonical use is **hierarchy traversal** (org charts, category trees, graph reachability).

:::gotcha
Always include a terminating condition. Without one the recursion never ends — engines either error or cap it (e.g. SQL Server's \`MAXRECURSION\`).
:::`,
  },
  {
    id: 'db-adv-window-vs-groupby',
    question: 'How do window functions differ from GROUP BY?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['window-functions', 'group-by', 'over'],
    answer: `\`GROUP BY\` **collapses** rows into one per group. A **window function** computes over related rows but **keeps every row**, adding the result as a new column.

\`\`\`sql
-- GROUP BY: 1 row per department
SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id;

-- Window: every employee, plus their dept average alongside
SELECT name, salary, AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM employees;
\`\`\`

That is the whole point: window functions let you show **detail and aggregate together** without a self-join.

:::note
Window functions are evaluated **after** \`WHERE\`/\`GROUP BY\`/\`HAVING\`, so you cannot filter on their result in \`WHERE\` — wrap the query in a CTE/derived table and filter outside.
:::`,
  },
  {
    id: 'db-adv-rank-functions',
    question: 'ROW_NUMBER vs RANK vs DENSE_RANK — how do they differ on ties?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['window-functions', 'ranking', 'row_number'],
    answer: `They differ **only when values tie**. For scores \`90, 90, 80, 70\` ordered descending:

| Function | Output | Behaviour on ties |
|----------|--------|-------------------|
| \`ROW_NUMBER\` | 1, 2, 3, 4 | always unique — ties broken arbitrarily |
| \`RANK\` | 1, 1, **3**, 4 | ties share a rank, then **skips** |
| \`DENSE_RANK\` | 1, 1, **2**, 3 | ties share a rank, **no gap** |

\`\`\`sql
SELECT name, score,
  ROW_NUMBER() OVER (ORDER BY score DESC) AS rn,
  RANK()       OVER (ORDER BY score DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY score DESC) AS drnk
FROM scores;
\`\`\`

Use \`ROW_NUMBER\` when you need **exactly one** row per group (e.g. top-N-per-group); use \`RANK\`/\`DENSE_RANK\` when tied rows should share a position.`,
  },
  {
    id: 'db-adv-running-total',
    question: 'How do you compute a running total, and what is the default window frame gotcha?',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['window-functions', 'running-total', 'frames'],
    answer: `Add \`ORDER BY\` to an aggregate window:

\`\`\`sql
SELECT day, amount,
  SUM(amount) OVER (PARTITION BY region ORDER BY day) AS running_total
FROM sales;
\`\`\`

\`PARTITION BY\` **resets** the accumulation at each region boundary.

:::gotcha
The moment you add \`ORDER BY\` to an aggregate window, the **default frame** becomes \`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` — turning \`SUM\` into a running total, **not** a partition-wide total.
:::

To control it explicitly:

\`\`\`sql
-- grand total on every row (no ORDER BY, or full frame):
SUM(amount) OVER (PARTITION BY region)
-- 3-row moving average:
AVG(amount) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
\`\`\`

Also note \`ROWS\` (physical row offsets) vs \`RANGE\` (logical value ranges) can differ on ties.`,
  },
  {
    id: 'db-adv-topn-per-group',
    question: 'How do you select the top-N rows per group (e.g. the highest-paid employee per department)?',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['window-functions', 'top-n', 'row_number'],
    answer: `Use \`ROW_NUMBER()\` partitioned by the group, then filter in an outer query (you cannot filter a window result in \`WHERE\`):

\`\`\`sql
WITH ranked AS (
  SELECT name, dept_id, salary,
         ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
  FROM employees
)
SELECT name, dept_id, salary
FROM ranked
WHERE rn = 1;   -- top 1 per dept; use rn <= N for top-N
\`\`\`

- \`ROW_NUMBER\` guarantees **exactly one** winner per group even when salaries tie.
- Swap for \`RANK\`/\`DENSE_RANK\` if you *want* all tied top earners returned.

This "compute in a CTE, filter outside" shape is the standard answer for top-N-per-group and deduplication.`,
  },
  {
    id: 'db-adv-coalesce-nullif',
    question: 'What do COALESCE and NULLIF do, and give a practical use of each.',
    difficulty: 'Easy',
    category: 'Advanced SQL',
    tags: ['conditional', 'coalesce', 'nullif', 'null'],
    answer: `- **\`COALESCE(a, b, …)\`** returns the **first non-NULL** argument — a clean way to supply defaults.
- **\`NULLIF(a, b)\`** returns \`NULL\` when \`a = b\`, else \`a\` — famously used as a **divide-by-zero guard**.

\`\`\`sql
SELECT COALESCE(phone, email, 'no contact') AS contact FROM users;

SELECT revenue / NULLIF(orders, 0) AS avg_order_value FROM stats;
--                       ^ orders = 0 -> NULL -> result NULL, no error
\`\`\`

| Call | Result |
|------|--------|
| \`COALESCE(NULL, 5, 9)\` | \`5\` |
| \`NULLIF(10, 10)\` | \`NULL\` |
| \`NULLIF(10, 0)\` | \`10\` |`,
  },
  {
    id: 'db-adv-view-vs-matview',
    question: 'View vs materialized view — what is the trade-off?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['views', 'materialized-view', 'refresh'],
    answer: `A **plain view** stores only the query — it re-runs on every read, so data is **always current** but you pay the query cost each time. A **materialized view** stores the **result** on disk — reads are **fast** (and it can be indexed), but the data is **stale until you refresh** it.

\`\`\`sql
CREATE VIEW active_users AS SELECT id, name FROM users WHERE active;
CREATE MATERIALIZED VIEW sales_by_region AS
  SELECT region, SUM(amount) FROM sales GROUP BY region;
REFRESH MATERIALIZED VIEW sales_by_region;   -- recompute the snapshot
\`\`\`

| | Plain view | Materialized view |
|---|---|---|
| Stores data | no | yes |
| Freshness | always live | as of last refresh |
| Read cost | recomputes | cheap lookup |
| Indexable | no | yes |

Reach for a materialized view when an expensive aggregation is read far more often than the data changes.`,
  },
  {
    id: 'db-adv-triggers',
    question: 'What is a trigger, and what are the pros and cons of putting logic in one?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['triggers', 'procedures', 'audit'],
    answer: `A **trigger** is a function bound to a table event (\`INSERT\`/\`UPDATE\`/\`DELETE\`) that fires **automatically**, \`BEFORE\` or \`AFTER\`, per row or per statement. \`NEW\`/\`OLD\` expose the affected rows.

\`\`\`sql
CREATE TRIGGER log_new_order
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION write_audit();   -- writes NEW.* to order_audit
\`\`\`

- **BEFORE** → validate or modify/reject the row.
- **AFTER** → side effects like auditing once the row is final.

**Pros:** runs next to the data (low latency), centralizes rules for all clients, guarantees the action happens.

**Cons:** logic is **implicit and hidden** (a plain INSERT does surprising work), harder to test/version/debug, and dialect-specific.

:::gotcha
Triggers run **inside your transaction**, so a slow or failing trigger slows or fails the original statement. Keep \`FOR EACH ROW\` logic light on hot tables, and watch for recursive trigger loops/deadlocks.
:::`,
  },
];

export default questions;
