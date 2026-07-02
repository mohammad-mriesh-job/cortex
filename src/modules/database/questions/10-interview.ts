import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-iq-inner-vs-left-join',
    question: 'What is the difference between an INNER JOIN and a LEFT JOIN?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['joins', 'sql', 'fundamentals'],
    answer: `An **INNER JOIN** returns only rows that have a match in *both* tables. A **LEFT JOIN** returns *every* row from the left table, plus matching right-table columns — or \`NULL\` where there is no match.

\`\`\`sql
-- Customers with no orders: kept by LEFT (amount = NULL), dropped by INNER
SELECT c.name, o.amount
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
\`\`\`

:::gotcha
Putting a right-table condition in \`WHERE\` (e.g. \`WHERE o.amount > 0\`) silently turns a \`LEFT JOIN\` back into an \`INNER JOIN\`, because the NULL rows fail the test. Put such conditions in the \`ON\` clause, or filter on \`o.id IS NULL\` on purpose to find non-matches.
:::`,
  },
  {
    id: 'db-iq-index-how',
    question: 'How does a database index speed up queries, and when can an index hurt?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['indexing', 'b-tree', 'performance'],
    answer: `A typical index is a **B-tree**: a sorted, balanced structure that turns an O(n) full-table scan into an O(log n) lookup for equality, range, and \`ORDER BY\` queries. It is a trade — reads get faster, but every \`INSERT\`/\`UPDATE\`/\`DELETE\` must also maintain the index, and it costs storage.

Indexes hurt when:

- The table is **write-heavy** — each extra index taxes every write.
- The column has **low selectivity** (e.g. a boolean) — scanning is cheaper than the index.
- You **over-index** "just in case" instead of for real query patterns.

:::senior
For a **composite index** \`(a, b, c)\`, only the **leftmost prefix** is usable: it serves filters on \`a\`, \`(a, b)\`, and \`(a, b, c)\`, but *not* on \`b\` alone. A **covering index** that includes every column a query needs lets the engine answer from the index alone, skipping the table entirely.
:::`,
  },
  {
    id: 'db-iq-window-vs-groupby',
    question: 'When would you use a window function instead of GROUP BY?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['window-functions', 'aggregation', 'sql'],
    answer: `\`GROUP BY\` **collapses** each group into one row. A window function computes an aggregate *while keeping every original row*, adding the result as an extra column.

Use a window function when you need the detail rows **and** a group-level value together — ranking, running totals, per-group percentages, or comparing a row to its neighbours.

\`\`\`sql
-- Each employee's salary AND their department average, side by side
SELECT name, salary,
       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM employees;
\`\`\`

The three knobs are \`PARTITION BY\` (the group), \`ORDER BY\` (the sequence), and the frame (how many rows are visible). \`ROW_NUMBER\`, \`RANK\`, \`SUM() OVER\`, and \`LAG/LEAD\` cover most cases.`,
  },
  {
    id: 'db-iq-top-n-per-group',
    question: 'How do you find the top 3 highest-paid employees in each department?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['window-functions', 'top-n', 'query-patterns'],
    answer: `This is the **top-N per group** pattern. Rank rows *within* each department with \`ROW_NUMBER()\`, then filter in an outer query (you cannot filter a window function in \`WHERE\`).

\`\`\`sql
SELECT * FROM (
  SELECT e.*,
         ROW_NUMBER() OVER (PARTITION BY dept_id
                            ORDER BY salary DESC) AS rn
  FROM employees e
) t
WHERE rn <= 3;
\`\`\`

Choose the ranking function by how you want ties handled: \`ROW_NUMBER\` gives an exact N (arbitrary tie-break), \`RANK\` keeps ties but skips numbers, \`DENSE_RANK\` keeps ties without gaps.`,
  },
  {
    id: 'db-iq-acid',
    question: 'What does ACID stand for, and what does each property guarantee?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['transactions', 'acid', 'fundamentals'],
    answer: `ACID is the set of guarantees a transaction provides:

| Letter | Property | Guarantee |
|---|---|---|
| **A** | Atomicity | all statements commit, or none do (all-or-nothing) |
| **C** | Consistency | the transaction moves the DB from one valid state to another (constraints hold) |
| **I** | Isolation | concurrent transactions do not corrupt each other |
| **D** | Durability | once committed, data survives a crash (written to durable storage) |

The classic example is a bank transfer: debiting one account and crediting another must be **atomic** — a crash between the two must never lose money. Isolation is the property with tunable levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE), because full isolation is expensive.`,
  },
  {
    id: 'db-iq-isolation-levels',
    question: 'Explain the SQL isolation levels and the anomalies they prevent.',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['transactions', 'isolation', 'concurrency'],
    answer: `Isolation levels trade **correctness for concurrency**. Higher levels prevent more anomalies but reduce throughput.

| Level | Dirty read | Non-repeatable read | Phantom |
|---|:---:|:---:|:---:|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | prevented | possible | possible |
| REPEATABLE READ | prevented | prevented | possible* |
| SERIALIZABLE | prevented | prevented | prevented |

- **Dirty read** — reading another transaction's uncommitted change.
- **Non-repeatable read** — the same row returns different values within one transaction.
- **Phantom** — a re-run query sees new rows that match its \`WHERE\`.

:::senior
The defaults differ: PostgreSQL and Oracle default to READ COMMITTED; MySQL/InnoDB to REPEATABLE READ. *\\*InnoDB's REPEATABLE READ blocks most phantoms via next-key locking.* Many databases implement isolation with **MVCC** (multi-version concurrency control), so readers see a snapshot and never block writers.
:::`,
  },
  {
    id: 'db-iq-normalization',
    question: 'What is normalization, and why would you ever denormalize?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['normalization', 'schema-design', '3nf'],
    answer: `**Normalization** organizes tables so each fact lives in exactly one place, eliminating redundancy and the update/insert/delete **anomalies** it causes. The practical target is **3NF**: every non-key column depends on the key, the whole key, and nothing but the key.

**Denormalization** deliberately reintroduces redundancy (a duplicated column, a precomputed total) to speed up reads by avoiding joins or aggregation.

| | Normalized | Denormalized |
|---|---|---|
| Redundancy | minimal | intentional copies |
| Writes | simple, one place | must keep copies in sync |
| Reads | more joins | fewer joins, faster |

:::senior
Normalize by default — anomalies are correctness bugs. Denormalize only a **measured** read-hot path, and own the cost of keeping the copy consistent (via triggers, application logic, or accepting eventual consistency).
:::`,
  },
  {
    id: 'db-iq-sql-injection',
    question: 'What is SQL injection and how do you prevent it?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['security', 'sql-injection', 'parameterized-queries'],
    answer: `SQL injection happens when user input is **concatenated into SQL text** so the input can change the query's meaning. Classic payload in a login field:

\`\`\`sql
-- input:  xyz' OR 1=1 --
SELECT * FROM users WHERE email = 'xyz' OR 1=1 --';
\`\`\`

\`OR 1=1\` makes the predicate always true and \`--\` comments out the rest, returning every user.

**The fix is parameterized queries** (prepared statements): the driver sends the SQL and the values over separate channels, so input is bound as data and can never be parsed as code.

\`\`\`sql
SELECT * FROM users WHERE email = ?;   -- value bound separately
\`\`\`

:::gotcha
Escaping quotes or blacklisting keywords is fragile and leaks. Parameterize everything; use input validation only as defense-in-depth. Identifiers (table/column names) cannot be parameterized — validate those against an **allowlist**.
:::`,
  },
  {
    id: 'db-iq-null-pitfalls',
    question: 'What are the common pitfalls with NULL in SQL?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['null', 'three-valued-logic', 'gotchas'],
    answer: `\`NULL\` means **unknown**, so SQL uses three-valued logic (TRUE / FALSE / UNKNOWN). Any comparison *with* NULL yields UNKNOWN, which \`WHERE\` treats as not-true.

- \`x = NULL\` is never true — use \`x IS NULL\`.
- \`COUNT(*)\` counts all rows; \`COUNT(col)\` and \`SUM\`/\`AVG\` **skip** NULLs (so \`AVG\` divides by the non-null count).
- \`x NOT IN (1, 2, NULL)\` is never TRUE (the NULL makes the whole thing UNKNOWN) — prefer \`NOT EXISTS\`.
- Concatenation/arithmetic with NULL usually yields NULL — guard with \`COALESCE(x, default)\`.

\`\`\`sql
SELECT COALESCE(nickname, name) FROM users;  -- fall back when nickname is NULL
\`\`\``,
  },
  {
    id: 'db-iq-delete-truncate-drop',
    question: 'What is the difference between DELETE, TRUNCATE, and DROP?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['dml', 'ddl', 'gotchas'],
    answer: `All three remove data, but at different levels:

| | \`DELETE\` | \`TRUNCATE\` | \`DROP\` |
|---|---|---|---|
| Category | DML | DDL | DDL |
| Removes | selected rows (\`WHERE\`) | all rows | the whole table |
| Speed | slow, row-by-row, logged | fast, deallocates pages | fast |
| Rollback | yes, inside a transaction | limited / DB-specific | usually no |
| Triggers | fire | usually not | n/a |
| Auto-increment | keeps counter | resets | gone |
| Structure/indexes | kept | kept | removed |

Rule of thumb: \`DELETE\` when you need a \`WHERE\` or rollback; \`TRUNCATE\` to empty a table fast; \`DROP\` to remove the table entirely.`,
  },
  {
    id: 'db-iq-schema-design',
    question: 'How do you approach a "design the schema for X" question?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['schema-design', 'system-design', 'process'],
    answer: `Show a **process**, out loud, in six steps:

1. **Clarify requirements** — read/write mix, scale, and the top queries that must be fast.
2. **Identify entities** — the core nouns become tables (User, Product, Order…).
3. **Map relationships** — decide 1:1, 1:M, or M:N for each pair.
4. **Choose keys** — a primary key per table, foreign keys per link, natural unique constraints.
5. **Add indexes** — index the columns you filter, join, and sort on (especially foreign keys).
6. **Plan for scale** — normalize to 3NF first, then denormalize proven hot paths; add replicas, then shard.

:::key
The single most-tested detail: every **many-to-many** needs a **junction table** whose composite key is the two foreign keys (e.g. \`order_items(order_id, product_id)\`). Never store a comma-separated list of ids.
:::`,
  },
  {
    id: 'db-iq-n-plus-one',
    question: 'What is the N+1 query problem, and how do you fix it?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['performance', 'orm', 'n-plus-one'],
    answer: `The N+1 problem is when code runs **1** query to fetch a list, then **N** more — one per row — to fetch each row's related data. It is common with lazy-loading ORMs and is death by a thousand round-trips.

\`\`\`text
1 query:  SELECT * FROM posts;              -- returns N posts
N queries: SELECT * FROM users WHERE id = ? -- once per post's author
\`\`\`

Fixes:

- **JOIN** the related table in a single query, or use the ORM's eager-loading (\`JOIN FETCH\` / \`include\`).
- **Batch** the follow-up into one \`WHERE id IN (…)\` query.

:::senior
It is a *latency* problem, not a *rows* problem: 100 tiny indexed queries can be far slower than one join because each pays network + planning round-trip cost. Watch your query logs / \`EXPLAIN\` counts, not just row counts.
:::`,
  },
  {
    id: 'db-iq-sql-vs-nosql',
    question: 'When would you choose a NoSQL database over a relational one?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['nosql', 'trade-offs', 'system-design'],
    answer: `Choose based on the **data shape, access pattern, and consistency need** — not hype.

| Use relational (SQL) when… | Use NoSQL when… |
|---|---|
| data is highly related, needs joins | data is document-shaped or key-value |
| you need ACID transactions | you need massive horizontal scale / write throughput |
| schema is stable, ad-hoc queries matter | schema is fluid; access patterns are known and few |

NoSQL families: **document** (MongoDB), **key-value** (Redis, DynamoDB), **wide-column** (Cassandra), **graph** (Neo4j). Most trade rich querying and strong consistency for scale and flexibility.

:::senior
Modern relational databases scale further than people assume (read replicas, partitioning, \`JSONB\` columns). "Web scale" is rarely the real reason — pick NoSQL when the **access pattern** genuinely fits it, and remember many NoSQL stores are **eventually consistent** (an AP choice under CAP).
:::`,
  },
  {
    id: 'db-iq-explain-slow-query',
    question: 'A query is slow. How do you diagnose and fix it?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['performance', 'explain', 'tuning'],
    answer: `Measure before guessing — run **\`EXPLAIN\`** (or \`EXPLAIN ANALYZE\`) to see the plan the optimizer chose.

Look for:

- **Sequential/full scans** on big tables where an index should apply → add or fix an index.
- The **join algorithm** (nested loop vs hash vs merge) and the estimated vs actual **row counts** — a big gap means stale statistics; run \`ANALYZE\`.
- **Sort/temp** steps that spill to disk → support the \`ORDER BY\`/\`GROUP BY\` with an index.

Then, common fixes:

\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC;
-- Seq Scan on orders → add: CREATE INDEX ON orders (user_id, created_at);
\`\`\`

:::senior
Beyond indexes: reduce the rows and columns you fetch (avoid \`SELECT *\`), make predicates **sargable** (no functions wrapping an indexed column, e.g. \`WHERE date_col >= '…'\` rather than \`WHERE YEAR(date_col) = …\`), and fix N+1 patterns. Keep statistics fresh so the planner estimates well.
:::`,
  },
  {
    id: 'db-iq-sharding-replication',
    question: 'What is the difference between replication and sharding?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['scale', 'sharding', 'replication'],
    answer: `They solve different scaling problems:

- **Replication** — copy the *same* data to multiple nodes. Improves **read** throughput (fan reads across replicas) and availability (failover). Writes still go to a primary, and replicas can be **stale** (replication lag).
- **Sharding (partitioning)** — split *different* data across nodes by a **shard key** (e.g. \`user_id\`). Each shard holds a subset, so it scales **writes** and total data size.

| | Replication | Sharding |
|---|---|---|
| Copies | full copy per node | disjoint subset per node |
| Scales | reads, availability | writes, storage |
| Main risk | stale reads (lag) | bad shard key → hotspots, cross-shard joins |

:::senior
Reach for replication first — it is simpler and solves the common read-heavy case. Shard only when a single primary can no longer hold the write volume or data size, and choose the shard key carefully: a poor key creates **hotspots** and forces expensive **cross-shard** joins and transactions. The two are often combined: each shard is itself replicated.
:::`,
  },
];

export default questions;
