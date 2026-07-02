import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-perf-what-is-index',
    question: 'What is a database index, and what data structure is it usually built on?',
    difficulty: 'Easy',
    category: 'Performance',
    tags: ['index', 'b-tree', 'fundamentals'],
    answer: `An **index** is a separate, sorted structure over one or more columns that lets the database **jump** to matching rows instead of reading every row. Almost every relational index is a **B-tree** (more precisely a **B+tree**).

- **Balanced & shallow** — even a billion rows is ~4–5 levels deep, because each node fans out to hundreds of children.
- Turns an **O(n)** full scan into an **O(log n)** seek.
- Leaves are stored **in sorted order**, so the same index also serves \`ORDER BY\`, range scans, and \`BETWEEN\`.

:::key
An index trades **write cost and storage** for **read speed**. It only helps *selective* queries — fetching most of a table is cheaper with a full scan.
:::`,
  },
  {
    id: 'db-perf-seek-vs-scan',
    question: 'When will the optimizer prefer a full table scan over an index seek?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['index seek', 'table scan', 'selectivity'],
    answer: `When the query is **not selective** — it returns a large fraction of the table.

- An index seek does a **random** I/O per matching row (plus a possible bookmark lookup). For a few rows that's a huge win.
- To return, say, 80–90% of rows, doing millions of random lookups is *slower* than one **sequential** scan that reads pages in order.

The tipping point depends on selectivity and how clustered the data is. Other triggers for a scan:

- No usable index on the filtered column.
- The predicate isn't **SARGable** (e.g. a function wraps the column).
- **Stale statistics** make the planner mis-estimate row counts.

:::senior
This is why adding an index doesn't always speed things up — and why \`EXPLAIN ANALYZE\` comparing *estimated* vs *actual* rows is the first diagnostic.
:::`,
  },
  {
    id: 'db-perf-clustered-vs-nonclustered',
    question: 'What is the difference between a clustered and a non-clustered (secondary) index?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['clustered', 'secondary index', 'bookmark lookup'],
    answer: `A **clustered index** *is* the table: the rows are physically stored in the B-tree, sorted by the index key (usually the primary key). There is **one** per table, and a PK seek needs **no** extra hop.

A **non-clustered (secondary) index** is a separate B-tree whose leaves store the key plus a **pointer** back to the row — the PK value (InnoDB) or a physical address (heap engines). Reading columns not in the index requires a second lookup.

\`\`\`sql
-- secondary index on email; needs 'name' from the table too
SELECT name FROM users WHERE email = ?;
-- seek ix_email  →  bookmark lookup to fetch name
\`\`\`

:::gotcha
Those per-row **bookmark lookups** are random I/O. Thousands of them can be slower than a scan — the reason **covering indexes** exist.
:::`,
  },
  {
    id: 'db-perf-composite-left-prefix',
    question: 'Explain the left-prefix rule for composite indexes.',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['composite index', 'left-prefix', 'multi-column'],
    answer: `A composite index on \`(a, b, c)\` is a B-tree sorted by **\`a\`, then \`b\` within each \`a\`, then \`c\`**. It can seek only when the filter forms a **left prefix** of that column list.

| Query | Uses index? |
|---|---|
| \`WHERE a = ?\` | ✅ |
| \`WHERE a = ? AND b = ?\` | ✅ |
| \`WHERE a = ? AND b = ? AND c = ?\` | ✅ |
| \`WHERE b = ?\` (skips \`a\`) | ❌ |
| \`WHERE c = ?\` | ❌ |

The \`b\` and \`c\` values are **scattered** across the tree, so there's no contiguous range to seek without first pinning \`a\`.

:::key
Order columns so the most-frequently-filtered (and equality-filtered) column comes **first**, and put **range** predicates **last** — a range stops the prefix from extending to later columns.
:::`,
  },
  {
    id: 'db-perf-covering-index',
    question: 'What is a covering index and why is it faster?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['covering index', 'index-only scan'],
    answer: `A **covering index** contains **every column a query references**, so the engine answers the query **from the index alone** — an **index-only scan** with zero table hops (no bookmark lookups).

\`\`\`sql
-- Postgres / SQL Server: keep columns in the leaves as payload
CREATE INDEX ix ON orders (customer_id) INCLUDE (total, status);
SELECT total, status FROM orders WHERE customer_id = 42;  -- Heap Fetches: 0
\`\`\`

- \`INCLUDE\` stores extra columns only in the **leaves**, so they don't bloat the search path or change ordering.
- MySQL/InnoDB has no \`INCLUDE\`, so you widen the key: \`(customer_id, total, status)\`.

The cost: a wider index means more storage and slightly slower writes — worth it for hot read paths.`,
  },
  {
    id: 'db-perf-reading-explain',
    question: 'How do you read an EXPLAIN plan, and what do you look for?',
    difficulty: 'Hard',
    category: 'Performance',
    tags: ['explain', 'query plan', 'analyze'],
    answer: `A plan is a **tree**, read **inside-out / bottom-up**: the most-indented node runs first and feeds its parent up to the root.

**What to look for:**

1. **Scan types** — a \`Seq Scan\` on a large table under a selective filter is a red flag; \`Index Only Scan\` is ideal.
2. **Join algorithms** — a \`Nested Loop\` with a large *outer* row count is often slow.
3. **Estimated vs actual rows** — with \`EXPLAIN ANALYZE\`, a big gap means **stale statistics** (run \`ANALYZE\`).
4. **cost** = relative planner units (not milliseconds); the second number is the node total.

\`\`\`text
Hash Join                          ← runs last (top)
  ->  Seq Scan on orders           ← ⚠ full scan
  ->  Hash
        ->  Index Scan on customers ← runs first (deepest)
\`\`\`

:::senior
Use plans to turn tuning from guessing into observation: the plan tells you exactly which node is expensive and why the optimizer chose it.
:::`,
  },
  {
    id: 'db-perf-join-algorithms',
    question: 'Compare nested loop, hash, and merge joins. When is each chosen?',
    difficulty: 'Hard',
    category: 'Performance',
    tags: ['join algorithms', 'nested loop', 'hash join', 'merge join'],
    answer: `| Algorithm | How it works | Best when |
|---|---|---|
| **Nested loop** | for each outer row, probe the inner side (ideally via index) | outer input **small** and inner is **indexed** |
| **Hash join** | build a hash table on the smaller input, probe with the larger | large, **unsorted**, **equi-joins** (\`=\`); needs memory |
| **Merge join** | sort both inputs on the key, then zip them | both inputs already **sorted** on the join key |

- **Nested loop** shines for small result sets and indexed lookups; degrades to O(n×m) without an index.
- **Hash join** is the workhorse for big unsorted equi-joins, but can't do inequality joins and may spill to disk if it exceeds work memory.
- **Merge join** is great when inputs arrive pre-sorted (e.g. from index scans), otherwise the sort cost may make hash join cheaper.

:::key
Equality + one small indexed side → **nested loop**. Equality + big unsorted inputs → **hash**. Already sorted on the key → **merge**.
:::`,
  },
  {
    id: 'db-perf-sargable',
    question: 'What makes a predicate SARGable, and why does it matter?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['sargable', 'index usage', 'functions'],
    answer: `**SARGable** (*Search ARGument able*) means the predicate can use an **index seek**. The rule: the indexed column must appear **bare** — not wrapped in a function or arithmetic.

\`\`\`sql
-- ❌ NOT SARGable: YEAR() runs on every row → full scan
WHERE YEAR(created_at) = 2024

-- ✅ SARGable: column stays bare, index seeks the range
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'
\`\`\`

Other non-SARGable patterns: \`price * 1.2 > 100\`, \`UPPER(email) = ?\`, and **implicit type conversions** that cast the column.

**Fixes:** move the transformation to the constant side, precompute a stored column, or create an **expression index** (e.g. on \`LOWER(email)\`).

:::gotcha
Wrapping the column forces the engine to compute the expression for **every row** to test it — that's a full scan by definition.
:::`,
  },
  {
    id: 'db-perf-keyset-pagination',
    question: 'Why is OFFSET pagination slow at depth, and what is the alternative?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['pagination', 'offset', 'keyset'],
    answer: `\`LIMIT n OFFSET m\` still **reads and discards** the first \`m\` rows every time, so cost grows with page depth — page 5,000 might scan 100,000 rows to return 20.

**Keyset (seek) pagination** remembers the last row seen and seeks past it, so every page costs the same:

\`\`\`sql
-- ❌ deep OFFSET: scans 100,020 rows
SELECT * FROM events ORDER BY id LIMIT 20 OFFSET 100000;

-- ✅ keyset: seeks straight to the spot, ~20 rows
SELECT * FROM events WHERE id > 100000 ORDER BY id LIMIT 20;
\`\`\`

**Requirements:** a **stable, unique, indexed** sort key (the PK, or \`(created_at, id)\` as a tiebreaker).

**Trade-off:** you get fast next/previous but lose random "jump to page N" access — usually the right call for infinite scroll and large-table APIs.`,
  },
  {
    id: 'db-perf-n-plus-one',
    question: 'What is the N+1 query problem and how do you fix it?',
    difficulty: 'Easy',
    category: 'Performance',
    tags: ['n+1', 'orm', 'joins'],
    answer: `The **N+1 problem**: you run **1** query to fetch a list, then **1 query per row** to fetch related data — \`1 + N\` round trips. It's common with lazy-loading ORMs.

\`\`\`text
SELECT id FROM authors;                    -- 1 query → 100 authors
SELECT * FROM books WHERE author_id = ?;   -- ×100 more queries
-- total: 101 round trips
\`\`\`

**Fixes:**

1. **JOIN** — fetch everything in one query:
\`\`\`sql
SELECT a.id, b.title FROM authors a JOIN books b ON b.author_id = a.id;
\`\`\`
2. **Batch** — one follow-up query: \`... WHERE author_id IN (…100 ids…)\` (2 queries total).
3. In ORMs, use eager loading (\`JOIN FETCH\`, \`includes\`, \`select_related\`).

:::key
The pain is **round-trip latency**, not per-query time — especially bad over a network. Collapse N+1 into 1 (join) or 2 (batch).
:::`,
  },
  {
    id: 'db-perf-implicit-conversion',
    question: 'How can an implicit type conversion silently disable an index?',
    difficulty: 'Hard',
    category: 'Performance',
    tags: ['implicit conversion', 'type mismatch', 'index usage'],
    answer: `When you compare a column to a value of a **different type**, the database inserts a cast. If it casts the **column** (not the literal), every row must be converted before comparison — so the index on that column is **bypassed** and you get a full scan.

\`\`\`sql
-- phone is VARCHAR, literal is a number
WHERE phone = 5551234
-- planner rewrites to: WHERE CAST(phone AS <number>) = 5551234  → scan
\`\`\`

The fix is to make the literal match the column's type:

\`\`\`sql
WHERE phone = '5551234'   -- string vs VARCHAR → index seeks
\`\`\`

:::gotcha
This is *silent* — the query returns correct results, just slowly. It's a classic when an ORM binds a parameter with the wrong type, or when joining columns of mismatched types across tables. Check the plan for a \`CAST\`/\`CONVERT\` around an indexed column.
:::`,
  },
  {
    id: 'db-perf-over-indexing',
    question: 'What is over-indexing, and how do you decide which indexes to keep?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['over-indexing', 'write amplification', 'index maintenance'],
    answer: `**Over-indexing** is adding more indexes than the workload justifies. Every index **speeds reads but taxes writes**: each \`INSERT\`/\`UPDATE\`/\`DELETE\` must update **every** index on the table, and each one costs storage, memory, and buffer-cache space.

**How to prune:**

- **Usage stats** — drop indexes with zero reads (\`pg_stat_user_indexes\`, \`sys.dm_db_index_usage_stats\`).
- **Redundancy** — \`(a)\` is covered by \`(a, b)\`; keep the composite, drop the single.
- **Duplicates** — same columns, same order = pure overhead.
- **Balance** — write-heavy tables want *few* well-chosen indexes; read-heavy analytical tables can afford more.

:::senior
Indexing is a workload trade-off: index for the queries you actually run, then measure. An unused index is 100% cost and 0% benefit.
:::`,
  },
];

export default questions;
