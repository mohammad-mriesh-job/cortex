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
  {
    id: 'db-adv-scalar-subquery',
    question: 'What is a scalar subquery, and where can you use one?',
    difficulty: 'Easy',
    category: 'Advanced SQL',
    tags: ['subqueries', 'scalar', 'expressions'],
    answer: `A **scalar subquery** returns exactly **one row and one column** — a single value — so it can appear anywhere an expression is allowed: the \`SELECT\` list, \`WHERE\`, \`HAVING\`, even inside another expression.

\`\`\`sql
-- scalar subquery in the SELECT list (uncorrelated: evaluated once)
SELECT name, salary,
       (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;
\`\`\`

If it references a column from the outer query it becomes a **correlated** scalar subquery, re-evaluated per outer row.

:::gotcha
A scalar subquery that unexpectedly returns **more than one row** fails at runtime ("more than one row returned by a subquery used as an expression"); if it returns **zero** rows it yields \`NULL\`. Guard multi-row cases with an aggregate (\`MAX\`) or \`LIMIT 1\`.
:::`,
  },
  {
    id: 'db-adv-cte-materialization',
    question: 'Are CTEs always materialized? How does WITH behave across dialects?',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['cte', 'materialization', 'optimizer', 'postgres', 'mysql'],
    answer: `Not anymore, and it varies by engine — a classic senior gotcha:

- **PostgreSQL before 12** treated **every** CTE as an **optimization fence**: always materialized into a temp result, so filters outside could **not** be pushed inside. A \`WITH\` could be slower than the equivalent subquery.
- **PostgreSQL 12 and later** **inlines** a CTE that is referenced once and side-effect-free (like a subquery). You override with \`AS MATERIALIZED\` / \`AS NOT MATERIALIZED\`.
- **MySQL 8** and **SQL Server** treat a CTE like a derived table — merged into the outer query or materialized as the optimizer sees fit.

\`\`\`sql
WITH recent AS MATERIALIZED (        -- force a one-time compute + reuse
  SELECT * FROM events WHERE ts > now() - interval '1 day'
)
SELECT * FROM recent WHERE user_id = 42;
\`\`\`

:::senior
Use \`MATERIALIZED\` deliberately when a CTE is **expensive and referenced multiple times** (compute once), or to stop a predicate from changing what the CTE scans. **Recursive** CTEs are always materialized.
:::`,
  },
  {
    id: 'db-adv-recursive-org-chart',
    question: 'Write a recursive query returning every employee with their org-chart depth and a path from the CEO.',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['cte', 'recursive', 'hierarchy', 'query-patterns'],
    answer: `Seed the roots in the anchor, then join children to already-found parents, accumulating **depth** and a breadcrumb **path**:

\`\`\`sql
WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 1 AS depth, name AS path
  FROM employees WHERE manager_id IS NULL          -- anchor: the CEO
  UNION ALL
  SELECT e.id, e.name, e.manager_id, o.depth + 1,
         o.path || ' > ' || e.name                 -- extend the path
  FROM employees e
  JOIN org o ON e.manager_id = o.id                -- recursive term
)
SELECT depth, path FROM org ORDER BY path;
-- 1  CEO
-- 2  CEO > VP Sales
-- 3  CEO > VP Sales > Rep A
\`\`\`

In **MySQL** use \`CONCAT(o.path, ' > ', e.name)\` — it has no \`||\` string operator by default.

:::gotcha
Guard against **cycles** (a bad \`manager_id\` loop recurses forever): Postgres offers a \`CYCLE\` clause, or add a depth cap like \`WHERE o.depth < 50\`.
:::`,
  },
  {
    id: 'db-adv-lag-lead',
    question: 'How do LAG and LEAD work? Write a month-over-month revenue change.',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['window-functions', 'lag', 'lead', 'time-series'],
    answer: `\`LAG\`/\`LEAD\` read a value from a row **N positions before / after** the current row in the window's order — no self-join required.

\`\`\`sql
SELECT month, revenue,
       revenue - LAG(revenue) OVER (ORDER BY month) AS mom_delta,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / LAG(revenue) OVER (ORDER BY month), 1) AS mom_pct
FROM monthly_sales;
-- Jan  100   NULL    NULL
-- Feb  120     20    20.0
-- Mar   90    -30   -25.0
\`\`\`

\`LAG(x, offset, default)\` takes an optional offset (default 1) and a fallback for missing rows. \`PARTITION BY product\` resets the comparison per product.

:::gotcha
The **first row's** \`LAG\` is \`NULL\`, so its delta is \`NULL\`. Wrap in \`COALESCE(..., 0)\` if you need zero, and beware the divide — a \`NULL\` or \`0\` previous value makes the percentage \`NULL\` (use \`NULLIF\` to avoid divide-by-zero).
:::`,
  },
  {
    id: 'db-adv-nth-highest-salary',
    question: 'Find the Nth-highest salary. Give more than one approach.',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['ranking', 'query-patterns', 'dense-rank', 'top-n'],
    answer: `The single most-asked SQL question. Three canonical solutions for the **3rd** highest:

\`\`\`sql
-- 1) DENSE_RANK — treats tied salaries as one rank (the go-to)
SELECT DISTINCT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employees
) t WHERE rnk = 3;

-- 2) OFFSET/FETCH over distinct salaries
SELECT DISTINCT salary FROM employees
ORDER BY salary DESC
OFFSET 2 ROWS FETCH NEXT 1 ROW ONLY;   -- MySQL: LIMIT 1 OFFSET 2

-- 3) Correlated subquery — the pre-window-function classic
SELECT DISTINCT salary FROM employees e
WHERE 3 = (SELECT COUNT(DISTINCT salary) FROM employees
           WHERE salary >= e.salary);
\`\`\`

\`DENSE_RANK\` is preferred: "3rd highest" means the **3rd distinct amount**, so ties don't consume a rank.

:::gotcha
Clarify **ties** and **distinct-vs-positional** up front. If \`N\` exceeds the number of distinct salaries, all three return **no rows** — say so out loud rather than assuming a value exists.
:::`,
  },
  {
    id: 'db-adv-second-highest-no-window',
    question: 'Find the second-highest salary WITHOUT window functions.',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['subqueries', 'query-patterns', 'aggregation'],
    answer: `The subquery classic — the **max of everything below the overall max**:

\`\`\`sql
SELECT MAX(salary) AS second_highest
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
\`\`\`

Why interviewers like it: it returns **exactly one value**, and returns \`NULL\` (not an error, not zero rows) when there is no second value — e.g. one row, or every salary equal. The \`LIMIT 1 OFFSET 1\` form instead returns **zero rows** in that edge case, which downstream code may not expect.

:::senior
\`MAX(salary < top)\` naturally ignores duplicates of the top value, so this yields the second **distinct** amount. If the interviewer wants the second-ranked **row** (allowing ties to share first place), that is a different question — confirm which before writing.
:::`,
  },
  {
    id: 'db-adv-find-delete-duplicates',
    question: 'How do you find duplicate rows and delete all but one?',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['duplicates', 'delete', 'row-number', 'query-patterns'],
    answer: `**Find** with \`GROUP BY … HAVING COUNT(*) > 1\`. **Delete** keeping one using \`ROW_NUMBER\` over the duplicate key (or a physical row id).

\`\`\`sql
-- find duplicate emails
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- delete all but the lowest id per email (portable)
DELETE FROM users
WHERE id NOT IN (SELECT MIN(id) FROM users GROUP BY email);

-- window-function form: keep row 1 of each group
WITH d AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
  FROM users
)
DELETE FROM users WHERE id IN (SELECT id FROM d WHERE rn > 1);
\`\`\`

**Postgres** can delete by the hidden \`ctid\` when there is no unique id. **MySQL** needs the "\`NOT IN\` on the same table" wrapped in a derived table (you cannot delete from a table you select directly in the subquery).

:::gotcha
After cleanup, add a \`UNIQUE\` constraint so duplicates cannot return — otherwise you will run this again next month.
:::`,
  },
  {
    id: 'db-adv-gaps-and-islands',
    question: 'What is the gaps-and-islands problem, and how do you collapse consecutive values into ranges?',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['gaps-and-islands', 'window-functions', 'query-patterns'],
    answer: `**Islands** are runs of consecutive values; **gaps** are the holes between them. The trick: subtract a \`ROW_NUMBER\` from the sequence — within a consecutive run the difference is **constant**, so it becomes a group key.

\`\`\`sql
-- collapse consecutive day-numbers into [start, end] ranges
WITH g AS (
  SELECT day, day - ROW_NUMBER() OVER (ORDER BY day) AS grp
  FROM attendance
)
SELECT MIN(day) AS start_day, MAX(day) AS end_day, COUNT(*) AS len
FROM g GROUP BY grp ORDER BY start_day;
-- days 1,2,3, 7,8, 10  ->  (1,3), (7,8), (10,10)
\`\`\`

For **dates**, subtract \`ROW_NUMBER\` days (an interval) instead of an integer. For islands defined by a **status change**, use \`LAG\` to flag boundaries and a running \`SUM\` of those flags as the group key.

:::senior
This \`ROW_NUMBER\`-difference idiom is the backbone of streaks, sessionization, and consecutive-login problems — recognize it and most "runs" questions collapse to a \`GROUP BY\`.
:::`,
  },
  {
    id: 'db-adv-consecutive-days-streak',
    question: 'Find users who logged in at least 3 consecutive days.',
    difficulty: 'Hard',
    category: 'Advanced SQL',
    tags: ['gaps-and-islands', 'window-functions', 'dates', 'query-patterns'],
    answer: `A gaps-and-islands problem on dates. Group each user's login dates by \`(date − row_number days)\`; each group is one unbroken streak.

\`\`\`sql
WITH runs AS (
  SELECT user_id, login_date,
         login_date - (ROW_NUMBER() OVER (PARTITION BY user_id
                       ORDER BY login_date)) * INTERVAL '1 day' AS grp
  FROM (SELECT DISTINCT user_id, login_date FROM logins) d
)
SELECT user_id, MIN(login_date) AS streak_start, COUNT(*) AS streak_len
FROM runs
GROUP BY user_id, grp
HAVING COUNT(*) >= 3;
\`\`\`

\`DISTINCT\` first so two logins on the same day don't count twice. In **MySQL 8** the syntax is \`DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (...) DAY)\`.

:::gotcha
Subtracting \`ROW_NUMBER\` only lines up when the step is exactly **one day**. For "within 30 minutes" sessionization, compare \`LAG(ts)\` against a threshold and start a new group when the gap exceeds it.
:::`,
  },
  {
    id: 'db-adv-pivot-conditional-agg',
    question: 'How do you pivot rows into columns in portable SQL?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['pivot', 'conditional-aggregation', 'case', 'query-patterns'],
    answer: `**Conditional aggregation** — one aggregate per target column, each wrapping a \`CASE\` that only lets matching rows through:

\`\`\`sql
-- rows (region, quarter, amount) -> one row per region, a column per quarter
SELECT region,
  SUM(CASE WHEN quarter = 'Q1' THEN amount END) AS q1,
  SUM(CASE WHEN quarter = 'Q2' THEN amount END) AS q2,
  SUM(CASE WHEN quarter = 'Q3' THEN amount END) AS q3,
  SUM(CASE WHEN quarter = 'Q4' THEN amount END) AS q4
FROM sales
GROUP BY region;
\`\`\`

This is plain ANSI SQL and works everywhere. Vendor shortcuts exist — SQL Server \`PIVOT\`, Postgres \`crosstab\` (tablefunc extension) — but conditional aggregation is the portable, readable default. Use \`COUNT(CASE … END)\` for counts.

:::gotcha
Pivot columns must be **known in advance**; a dynamic set of columns requires generating the SQL dynamically. The \`CASE\` with no \`ELSE\` yields \`NULL\`, which \`SUM\`/\`COUNT\` ignore — exactly what you want.
:::`,
  },
  {
    id: 'db-adv-upsert-merge',
    question: 'How do you perform an UPSERT (insert-or-update) across databases?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['upsert', 'merge', 'on-conflict', 'postgres', 'mysql'],
    answer: `Insert if new, update if the key already exists — atomically, avoiding a check-then-insert race:

\`\`\`sql
-- Postgres / SQLite
INSERT INTO counters (key, n) VALUES ('hits', 1)
ON CONFLICT (key) DO UPDATE SET n = counters.n + EXCLUDED.n;

-- MySQL
INSERT INTO counters (key, n) VALUES ('hits', 1)
ON DUPLICATE KEY UPDATE n = n + VALUES(n);

-- ANSI / SQL Server / Oracle
MERGE INTO counters t
USING (VALUES ('hits', 1)) s(key, n) ON t.key = s.key
WHEN MATCHED THEN UPDATE SET n = t.n + s.n
WHEN NOT MATCHED THEN INSERT (key, n) VALUES (s.key, s.n);
\`\`\`

\`ON CONFLICT\` needs a \`UNIQUE\`/PK to conflict on; \`EXCLUDED\` (Postgres) / \`VALUES()\` (MySQL) refers to the row that **would** have been inserted. \`ON CONFLICT DO NOTHING\` silently skips.

:::gotcha
\`MERGE\` has historically shipped with concurrency/race bugs in several engines. On Postgres, \`ON CONFLICT\` is the safer, more idiomatic choice.
:::`,
  },
  {
    id: 'db-adv-grouping-sets-rollup',
    question: 'What do GROUPING SETS, ROLLUP, and CUBE do?',
    difficulty: 'Medium',
    category: 'Advanced SQL',
    tags: ['grouping-sets', 'rollup', 'cube', 'aggregation'],
    answer: `They compute **multiple grouping levels** — subtotals and grand totals — in one pass, instead of \`UNION\`-ing several \`GROUP BY\` queries.

\`\`\`sql
SELECT region, product, SUM(amount)
FROM sales
GROUP BY ROLLUP (region, product);
-- (region, product)  detail rows
-- (region, NULL)     per-region subtotal
-- (NULL,   NULL)     grand total
\`\`\`

- \`ROLLUP (a, b)\` → hierarchical totals: \`(a,b)\`, \`(a)\`, \`()\`.
- \`CUBE (a, b)\` → **every** combination: \`(a,b)\`, \`(a)\`, \`(b)\`, \`()\`.
- \`GROUPING SETS ((a), (b))\` → exactly the sets you list.

The \`NULL\`s in subtotal rows mean "all values."

:::gotcha
A real \`NULL\` in the data and a subtotal-marker \`NULL\` look identical. Use \`GROUPING(col)\` (returns 1 for a subtotal row) to tell them apart. Supported in Postgres, Oracle, and SQL Server; **MySQL** offers only \`GROUP BY … WITH ROLLUP\`.
:::`,
  },
];

export default questions;
