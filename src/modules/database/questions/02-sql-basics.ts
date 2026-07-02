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
];

export default questions;
