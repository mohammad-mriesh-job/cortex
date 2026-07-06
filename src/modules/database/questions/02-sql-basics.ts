import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-sql-select-distinct',
    question: 'Does `SELECT DISTINCT` de-duplicate per column or per row?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['select', 'distinct'],
    answer: `\`DISTINCT\` operates on the **whole selected row**, not on a single column.

\`\`\`sql
-- unique categories: Office, Kitchen, Home  → 3 rows
SELECT DISTINCT category FROM products;

-- unique (category, price) PAIRS → possibly more than 3 rows
SELECT DISTINCT category, price FROM products;
\`\`\`

So adding a second column can *increase* the row count, because more combinations become distinct.

:::tip
\`COUNT(DISTINCT col)\` counts distinct **non-NULL** values of one column — a different tool from row-level \`SELECT DISTINCT\`.
:::`,
  },
  {
    id: 'db-sql-where-vs-having',
    question: 'What is the difference between `WHERE` and `HAVING`?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['where', 'having', 'group by'],
    answer: `They filter at different stages of the pipeline.

| | \`WHERE\` | \`HAVING\` |
|--|--------|----------|
| Filters | individual **rows** | whole **groups** |
| Runs | **before** \`GROUP BY\` | **after** \`GROUP BY\` |
| Aggregates allowed? | no | yes |

\`\`\`sql
SELECT region, SUM(amount) AS total
FROM sales
WHERE amount > 40          -- drop tiny rows first
GROUP BY region
HAVING SUM(amount) > 200;  -- then drop small groups
\`\`\`

Rule of thumb: filter on **raw columns** in \`WHERE\`; filter on **aggregates** in \`HAVING\`. Doing row filtering in \`WHERE\` also lets indexes help before the (expensive) grouping step.`,
  },
  {
    id: 'db-sql-null-three-valued',
    question: 'Explain SQL three-valued logic. What does `WHERE` do with `UNKNOWN`?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['null', 'three-valued logic'],
    answer: `A NULL means *unknown*, so any comparison involving it yields a third truth value: **UNKNOWN** (besides TRUE and FALSE).

\`WHERE\` (and \`HAVING\`, and a join \`ON\`) keeps a row **only when the predicate is exactly TRUE** — both FALSE and UNKNOWN are discarded.

\`\`\`text
30 = NULL   → UNKNOWN → row dropped
NULL <> 5   → UNKNOWN → row dropped
FALSE AND UNKNOWN → FALSE   (short-circuit)
TRUE  OR  UNKNOWN → TRUE    (short-circuit)
\`\`\`

:::gotcha
This is why \`NOT (x = 5)\` is **not** always the same as \`x <> 5\` once NULLs are involved — a NULL \`x\` makes both UNKNOWN, so neither returns the row.
:::`,
  },
  {
    id: 'db-sql-is-null-vs-equals',
    question: 'Why does `WHERE col = NULL` return no rows, and what should you write instead?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['null', 'is null'],
    answer: `\`col = NULL\` evaluates to **UNKNOWN** for every row (you cannot compare *equality* against an unknown), and \`WHERE\` keeps only TRUE — so you get zero rows.

Use the dedicated NULL operators, which return real TRUE/FALSE:

\`\`\`sql
SELECT * FROM users WHERE age IS NULL;      -- rows with no age
SELECT * FROM users WHERE age IS NOT NULL;  -- rows that have an age
\`\`\`

\`IS NULL\` / \`IS NOT NULL\` are the only operators that inspect NULL directly.`,
  },
  {
    id: 'db-sql-not-in-null',
    question: 'Why can `NOT IN` return zero rows when the list or subquery contains a NULL?',
    difficulty: 'Hard',
    category: 'SQL Basics',
    tags: ['null', 'not in', 'subquery'],
    answer: `\`NOT IN\` expands into a chain of \`<>\` joined by \`AND\`. A single NULL poisons the chain:

\`\`\`text
id NOT IN (1, 2, NULL)
= id <> 1 AND id <> 2 AND id <> NULL
=  TRUE  AND  TRUE  AND  UNKNOWN     (for id = 5)
=  UNKNOWN                           → row NOT returned
\`\`\`

Because the last term is always UNKNOWN, **no row can ever be TRUE**, so the query returns nothing.

**Fixes:**

\`\`\`sql
-- 1. NOT EXISTS is not fooled by NULLs
SELECT * FROM a
WHERE NOT EXISTS (SELECT 1 FROM b WHERE b.x = a.id);

-- 2. or exclude NULLs from the subquery
... WHERE id NOT IN (SELECT x FROM b WHERE x IS NOT NULL);
\`\`\`

:::senior
Prefer \`NOT EXISTS\` by default: it is NULL-safe and the planner often turns it into an efficient anti-join.
:::`,
  },
  {
    id: 'db-sql-count-variants',
    question: 'Compare `COUNT(*)`, `COUNT(col)`, and `COUNT(DISTINCT col)`.',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['aggregation', 'count', 'null'],
    answer: `All three count, but over different things:

| Expression | Counts |
|------------|--------|
| \`COUNT(*)\` | **all rows**, including those full of NULLs |
| \`COUNT(col)\` | rows where \`col IS NOT NULL\` |
| \`COUNT(DISTINCT col)\` | distinct **non-NULL** values of \`col\` |

\`\`\`sql
-- rows, non-null emails, and unique non-null emails
SELECT COUNT(*), COUNT(email), COUNT(DISTINCT email)
FROM users;
\`\`\`

A classic bug: using \`COUNT(some_nullable_col)\` when you meant \`COUNT(*)\`, and silently undercounting the rows that have a NULL there.`,
  },
  {
    id: 'db-sql-logical-order',
    question: 'What is the logical order in which SQL clauses are evaluated?',
    difficulty: 'Hard',
    category: 'SQL Basics',
    tags: ['query order', 'execution order'],
    answer: `You *write* \`SELECT\` first, but it is evaluated near the end. The logical order is:

\`\`\`text
FROM / JOIN  ->  WHERE  ->  GROUP BY  ->  HAVING
   ->  SELECT  ->  DISTINCT  ->  ORDER BY  ->  LIMIT / OFFSET
\`\`\`

This ordering explains several rules:

- \`WHERE\` cannot use aggregates (they do not exist until after \`GROUP BY\`) — that is what \`HAVING\` is for.
- \`WHERE\` cannot use a \`SELECT\` alias (created later at the \`SELECT\` step).
- \`ORDER BY\` **can** use a \`SELECT\` alias, because it runs after \`SELECT\`.

:::note
This is the *logical* (semantic) order. The optimizer may physically reorder work as long as the result is identical.
:::`,
  },
  {
    id: 'db-sql-alias-in-where',
    question: 'Can you reference a column alias defined in `SELECT` inside `WHERE`? How do you work around it?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['alias', 'where', 'query order'],
    answer: `No. \`WHERE\` is evaluated **before** \`SELECT\`, so the alias does not exist yet:

\`\`\`sql
-- ERROR: column "net" does not exist
SELECT price - discount AS net
FROM items
WHERE net > 0;
\`\`\`

Workarounds:

\`\`\`sql
-- 1. repeat the expression
SELECT price - discount AS net FROM items
WHERE price - discount > 0;

-- 2. compute it in a subquery / CTE, then filter the alias
WITH t AS (SELECT price - discount AS net FROM items)
SELECT * FROM t WHERE net > 0;
\`\`\`

Note \`ORDER BY net\` **would** work, since \`ORDER BY\` runs after \`SELECT\`.`,
  },
  {
    id: 'db-sql-order-by-limit-pagination',
    question: 'Why must `LIMIT` be paired with `ORDER BY`, and how does `OFFSET` paginate?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['order by', 'limit', 'pagination'],
    answer: `Without \`ORDER BY\`, row order is **undefined** — \`LIMIT 10\` returns *some* 10 rows that can change between runs, plans, or after an update. Always sort first when the identity of the rows matters.

\`OFFSET\` skips rows before applying \`LIMIT\`, which gives page-by-page access:

\`\`\`sql
-- page 3 with 20 rows per page (skip the first 40)
SELECT id, name FROM users
ORDER BY id
LIMIT 20 OFFSET 40;
\`\`\`

:::senior
Large \`OFFSET\` is slow — the engine still scans and discards all skipped rows. For deep pages, prefer **keyset (seek) pagination**: \`WHERE id > :lastSeenId ORDER BY id LIMIT 20\`, which uses the index and stays fast at any depth.
:::`,
  },
  {
    id: 'db-sql-group-by-rules',
    question: 'What can you put in the SELECT list when you use GROUP BY?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['group by', 'aggregation', 'only_full_group_by'],
    answer: `With \`GROUP BY\`, every column in the \`SELECT\` list must be **either** a column you grouped by **or** wrapped in an aggregate (\`SUM\`, \`COUNT\`, \`MAX\`…). A "bare" non-grouped column has no single value per group, so it is ambiguous.

\`\`\`sql
-- OK: dept_id is grouped, salary is aggregated
SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id;

-- ERROR (standard/Postgres): name is neither grouped nor aggregated
SELECT dept_id, name, AVG(salary) FROM employees GROUP BY dept_id;
\`\`\`

:::gotcha
**MySQL** historically allowed the ambiguous form and returned an *arbitrary* value for \`name\` — a silent-wrong-answer trap. Modern MySQL enables \`ONLY_FULL_GROUP_BY\` by default, matching the standard; Postgres has always rejected it. To pick a *specific* row per group, use a window function or \`DISTINCT ON\` (Postgres), not a bare column.
:::`,
  },
  {
    id: 'db-sql-distinct-vs-group-by',
    question: 'DISTINCT vs GROUP BY — when are they equivalent, and which should you use?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['distinct', 'group by', 'deduplication'],
    answer: `For pure de-duplication they are equivalent and usually produce the **same plan**:

\`\`\`sql
SELECT DISTINCT dept_id FROM employees;
SELECT dept_id FROM employees GROUP BY dept_id;   -- same result
\`\`\`

Use each for its intent:

- **\`DISTINCT\`** — you just want unique rows, no aggregation.
- **\`GROUP BY\`** — you are collapsing groups to compute an **aggregate** (\`COUNT\`, \`SUM\`), or you need \`HAVING\`.

\`\`\`sql
-- GROUP BY earns its keep here; DISTINCT can't aggregate
SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id HAVING COUNT(*) > 5;
\`\`\`

:::gotcha
\`SELECT DISTINCT\` applies to the **whole row**, so \`SELECT DISTINCT a, b\` de-dups on the *pair* — a common surprise. And do not reach for \`DISTINCT\` to paper over a join that fan-out-duplicated rows; fix the join instead.
:::`,
  },
  {
    id: 'db-sql-like-escaping',
    question: 'How does LIKE work, including the wildcards and escaping?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['like', 'pattern-matching', 'wildcards'],
    answer: `\`LIKE\` does pattern matching with two wildcards:

- \`%\` — matches **any sequence** of characters (including none).
- \`_\` — matches **exactly one** character.

\`\`\`sql
WHERE name LIKE 'A%'     -- starts with A
WHERE name LIKE '_o%'    -- second letter is o
WHERE email LIKE '%@%.%' -- crude email shape
\`\`\`

To match a **literal** \`%\` or \`_\`, use \`ESCAPE\`:

\`\`\`sql
WHERE code LIKE '50\\%%' ESCAPE '\\'   -- codes starting with "50%"
\`\`\`

:::gotcha
A **leading wildcard** (\`LIKE '%term'\`) **cannot use a normal B-tree index** — it forces a full scan, because the index is ordered by prefix. For suffix/substring search use a trigram index (Postgres \`pg_trgm\`), full-text search, or a reversed column. Note \`LIKE\` is case-sensitive in Postgres (use \`ILIKE\`) but often case-insensitive in MySQL, depending on collation.
:::`,
  },
  {
    id: 'db-sql-case',
    question: 'What is a CASE expression and where can you use it?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['case', 'conditional', 'pivot'],
    answer: `\`CASE\` is SQL's inline conditional — it returns a value based on conditions, usable **anywhere an expression is allowed**: \`SELECT\`, \`WHERE\`, \`ORDER BY\`, \`GROUP BY\`, even inside aggregates.

\`\`\`sql
-- searched CASE
SELECT name,
  CASE WHEN salary >= 100000 THEN 'high'
       WHEN salary >= 50000  THEN 'mid'
       ELSE 'entry' END AS band
FROM employees;
\`\`\`

A powerful pattern is **conditional aggregation** (pivoting):

\`\`\`sql
SELECT
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
  SUM(CASE WHEN status = 'new'  THEN amount ELSE 0 END) AS pending
FROM orders;
\`\`\`

:::tip
There are two forms: **simple** \`CASE x WHEN 1 THEN …\` (equality only) and **searched** \`CASE WHEN x > 1 THEN …\` (any predicate). \`CASE\` stops at the first match and returns \`NULL\` when nothing matches and there is no \`ELSE\`.
:::`,
  },
  {
    id: 'db-sql-cast-convert',
    question: 'What does CAST do, and what is implicit vs explicit conversion?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['cast', 'conversion', 'types'],
    answer: `\`CAST(expr AS type)\` **explicitly** converts a value from one type to another. The SQL-standard form is \`CAST\`; many engines also accept \`CONVERT\` or the Postgres shorthand \`::\`.

\`\`\`sql
SELECT CAST('2024-01-01' AS DATE);   -- text -> date
SELECT CAST(price AS INTEGER);       -- numeric -> int (truncates)
SELECT '2024-01-01'::date;           -- Postgres shorthand
\`\`\`

**Implicit** conversion is when the engine inserts a cast for you to compare mismatched types (e.g. a number vs a \`VARCHAR\`).

:::gotcha
Implicit conversion is a silent performance trap: if the engine casts the **column** rather than the literal (e.g. \`WHERE phone = 5551234\` on a \`VARCHAR phone\`), it must convert every row and **cannot use the index**. Match the literal's type to the column's. Explicit \`CAST\` also makes intent clear and portable.
:::`,
  },
  {
    id: 'db-sql-fetch-first',
    question: 'How do you limit the number of rows returned, across different databases?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['limit', 'fetch-first', 'top', 'dialects'],
    answer: `Row-limiting syntax is **not portable** — a classic dialect gotcha:

| Database | Syntax |
|---|---|
| PostgreSQL / MySQL / SQLite | \`LIMIT 10 [OFFSET 20]\` |
| SQL standard / newer engines | \`FETCH FIRST 10 ROWS ONLY\` (with \`OFFSET 20 ROWS\`) |
| SQL Server | \`TOP 10\`, or \`OFFSET/FETCH\` |
| Oracle 11g and earlier | \`WHERE ROWNUM <= 10\` |

\`\`\`sql
-- portable ANSI form (Postgres 8.4+, Oracle 12c+, SQL Server 2012+, DB2)
SELECT * FROM events ORDER BY id OFFSET 20 ROWS FETCH FIRST 10 ROWS ONLY;
\`\`\`

:::gotcha
\`LIMIT\`/\`FETCH\` without \`ORDER BY\` returns an **undefined** set of rows — the engine may return different rows each run. Always pair row-limiting with a deterministic \`ORDER BY\`. \`FETCH FIRST … WITH TIES\` additionally returns rows tied with the last one.
:::`,
  },
  {
    id: 'db-sql-order-by-nulls',
    question: 'How do you sort by multiple columns and control where NULLs go?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['order by', 'nulls', 'sorting'],
    answer: `\`ORDER BY\` takes a comma-separated list; each key can be \`ASC\` (default) or \`DESC\`, applied left to right as tiebreakers:

\`\`\`sql
SELECT * FROM employees
ORDER BY dept_id ASC, salary DESC, name ASC;
\`\`\`

NULL ordering differs by engine; control it explicitly with \`NULLS FIRST\` / \`NULLS LAST\`:

\`\`\`sql
SELECT * FROM tasks ORDER BY due_date ASC NULLS LAST;  -- undated tasks at the end
\`\`\`

:::gotcha
Defaults are inconsistent: **PostgreSQL/Oracle** sort NULLs **last** for \`ASC\` (first for \`DESC\`); **MySQL/SQL Server** sort NULLs **first** for \`ASC\`. If NULL placement matters, specify \`NULLS FIRST/LAST\`. MySQL lacks that clause — emulate with \`ORDER BY col IS NULL, col\`.
:::`,
  },
  {
    id: 'db-sql-between-in',
    question: 'What do BETWEEN and IN do, and what are their edge cases?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['between', 'in', 'operators'],
    answer: `- **\`BETWEEN a AND b\`** is shorthand for \`>= a AND <= b\` — **inclusive** on both ends.
- **\`IN (…)\`** tests membership in a list or subquery: \`x IN (1,2,3)\` means \`x=1 OR x=2 OR x=3\`.

\`\`\`sql
WHERE age BETWEEN 18 AND 65          -- inclusive both ends
WHERE status IN ('new', 'paid')      -- either value
\`\`\`

:::gotcha
Two traps. **\`BETWEEN\` on timestamps**: \`BETWEEN '2024-01-01' AND '2024-01-31'\` misses times on Jan 31 after midnight — prefer \`>= '2024-01-01' AND < '2024-02-01'\`. And **\`NOT IN\` with a NULL** in the list returns *no rows* (three-valued logic) — use \`NOT EXISTS\` instead.
:::`,
  },
  {
    id: 'db-sql-aggregate-null',
    question: 'How do aggregate functions handle NULL?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['aggregation', 'null', 'sum', 'avg'],
    answer: `Aggregates **skip NULLs** — with one exception, \`COUNT(*)\`:

| Function | NULL handling |
|---|---|
| \`COUNT(*)\` | counts **all rows** |
| \`COUNT(col)\` | counts rows where \`col IS NOT NULL\` |
| \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\` | ignore NULLs |

The subtle one is \`AVG\`: it divides by the count of **non-NULL** values, not all rows.

\`\`\`sql
-- values: 10, 20, NULL
SELECT COUNT(*), COUNT(v), SUM(v), AVG(v) FROM t;
-- 3,        2,        30,     15   (AVG = 30/2, not 30/3)
\`\`\`

:::gotcha
\`SUM\` over an all-NULL (or empty) set is **NULL**, not 0 — wrap it in \`COALESCE(SUM(v), 0)\` when a caller expects a number. \`MAX\`/\`MIN\` over no rows are also NULL.
:::`,
  },
  {
    id: 'db-sql-insert-variants',
    question: 'What are the main forms of INSERT?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['insert', 'dml', 'bulk-insert'],
    answer: `\`INSERT\` has several useful shapes:

\`\`\`sql
-- 1. single row, named columns (preferred — order-independent, defaults apply)
INSERT INTO users (name, email) VALUES ('Ada', 'ada@x.com');

-- 2. multi-row: one statement, one round trip, one transaction
INSERT INTO users (name, email) VALUES
  ('Bo', 'bo@x.com'), ('Cy', 'cy@x.com');

-- 3. INSERT ... SELECT: copy/transform from another query
INSERT INTO archived_users (id, name)
SELECT id, name FROM users WHERE last_seen < '2023-01-01';
\`\`\`

:::tip
Always list the target columns explicitly — \`INSERT INTO users VALUES (…)\` relies on column order and breaks silently when the schema changes. Multi-row \`INSERT\` is dramatically faster than N single-row inserts because it pays the round-trip and logging cost once. Use \`RETURNING\` (Postgres) to get generated ids back.
:::`,
  },
  {
    id: 'db-sql-update-from-join',
    question: 'How do you UPDATE a table using values from another table?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['update', 'join', 'dml', 'dialects'],
    answer: `You reference the other table via a join or subquery — but the **syntax is dialect-specific**:

\`\`\`sql
-- PostgreSQL: UPDATE ... FROM
UPDATE orders o
SET status = 'vip'
FROM customers c
WHERE o.customer_id = c.id AND c.tier = 'gold';

-- MySQL: join in the UPDATE clause
UPDATE orders o
JOIN customers c ON c.id = o.customer_id
SET o.status = 'vip'
WHERE c.tier = 'gold';

-- Portable: correlated subquery
UPDATE orders SET status = 'vip'
WHERE customer_id IN (SELECT id FROM customers WHERE tier = 'gold');
\`\`\`

:::gotcha
\`DELETE\` has the same split (\`DELETE ... USING\` in Postgres, \`DELETE o FROM … JOIN …\` in MySQL). If the correlated subquery can return NULL, watch the \`NOT IN\` trap. Always run the matching \`SELECT\` first to preview the rows before the \`UPDATE\`/\`DELETE\`.
:::`,
  },
  {
    id: 'db-sql-string-functions',
    question: 'What are the common string functions, and how do you concatenate?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['string-functions', 'concat', 'null'],
    answer: `Core string toolkit (names vary slightly by engine):

| Task | Function |
|---|---|
| length | \`LENGTH(s)\` / \`CHAR_LENGTH(s)\` |
| upper / lower | \`UPPER(s)\`, \`LOWER(s)\` |
| substring | \`SUBSTRING(s FROM 2 FOR 3)\` |
| trim spaces | \`TRIM(s)\` |
| replace | \`REPLACE(s, 'a', 'b')\` |
| find position | \`POSITION('x' IN s)\` |

Concatenation:

\`\`\`sql
SELECT first_name || ' ' || last_name AS full_name FROM users;  -- ANSI / Postgres / Oracle
SELECT CONCAT(first_name, ' ', last_name) FROM users;           -- MySQL
\`\`\`

:::gotcha
ANSI \`||\` returns **NULL** if any operand is NULL — one NULL blanks the whole string. Use \`CONCAT(...)\` (treats NULL as empty) or \`COALESCE\` each part. In **MySQL**, \`||\` is the logical OR operator by default, not concatenation — always use \`CONCAT\` there.
:::`,
  },
  {
    id: 'db-sql-subquery-types',
    question: 'What are the different kinds of subquery?',
    difficulty: 'Medium',
    category: 'SQL Basics',
    tags: ['subquery', 'scalar', 'derived-table'],
    answer: `A subquery is a \`SELECT\` nested inside another statement. Classify by **what it returns** and **where it sits**:

| Kind | Returns | Example use |
|---|---|---|
| **Scalar** | one row, one column | \`SELECT (SELECT MAX(x) FROM t)\` |
| **Column / multi-row** | one column, many rows | \`WHERE id IN (SELECT …)\` |
| **Row** | one row, many columns | \`WHERE (a,b) = (SELECT a,b …)\` |
| **Table (derived)** | many rows and columns | \`FROM (SELECT …) AS t\` |

Also **correlated** (references the outer query, re-evaluated per row) vs **uncorrelated** (independent, evaluated once).

\`\`\`sql
-- scalar subquery in the SELECT list
SELECT name, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS n_orders
FROM users u;
\`\`\`

:::gotcha
A scalar subquery that accidentally returns **more than one row** raises a runtime error. A **derived table** must be given an alias in most engines. Correlated subqueries can be slow — the optimizer may or may not rewrite them into a join.
:::`,
  },
  {
    id: 'db-sql-datetime-functions',
    question: 'How do you extract parts of a date and truncate to a period?',
    difficulty: 'Easy',
    category: 'SQL Basics',
    tags: ['date-functions', 'extract', 'date_trunc'],
    answer: `Two workhorses for date math, plus \`now()\` / \`CURRENT_DATE\`:

- **\`EXTRACT(field FROM ts)\`** — pull out a component (\`YEAR\`, \`MONTH\`, \`DOW\`, \`HOUR\`).
- **\`DATE_TRUNC('month', ts)\`** (Postgres) — round *down* to the start of a period, ideal for grouping by month.

\`\`\`sql
-- monthly revenue, grouped by truncated month
SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount)
FROM orders
GROUP BY 1 ORDER BY 1;

SELECT EXTRACT(YEAR FROM created_at) FROM orders;  -- e.g. 2024
\`\`\`

:::gotcha
Names differ: MySQL uses \`YEAR(ts)\`, \`MONTH(ts)\`, and \`DATE_FORMAT(ts, '%Y-%m')\` instead of \`DATE_TRUNC\`. Crucially, wrapping the column as \`YEAR(created_at) = 2024\` is **non-SARGable** and disables the index — prefer a range: \`created_at >= '2024-01-01' AND created_at < '2025-01-01'\`.
:::`,
  },
];

export default questions;
