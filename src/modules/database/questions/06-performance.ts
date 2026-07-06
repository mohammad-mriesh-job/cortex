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
  {
    id: 'db-perf-btree-height',
    question: 'How does a B-tree index find a row, and why is it only 3-4 levels deep for millions of rows?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['b-tree', 'index', 'fanout', 'internals'],
    answer: `A B+tree is a **balanced** tree of pages. Each internal page holds many keys plus child pointers — a high **fanout** (hundreds per 8-16 KB page). A lookup walks root → internal → leaf, **one page read per level**.

Because fanout is in the hundreds, height grows **logarithmically**:

\`\`\`text
fanout 300:  level 1 = 300 keys
             level 2 = 90,000
             level 3 = 27,000,000
             level 4 = 8,000,000,000   <- a billion rows in 4 levels
\`\`\`

So even a billion-row index is ~4 pages deep. The top levels stay **cached**, so a seek is often ~1 real disk read. Leaves store the key plus a row pointer and are **linked in sorted order** for range scans.

:::key
High fanout + balance = \`O(log_fanout n)\` with a tiny constant. That is why an index seek touches a handful of pages while a full scan touches them all.
:::`,
  },
  {
    id: 'db-perf-what-to-index',
    question: 'Which columns should you index, and which should you not?',
    difficulty: 'Easy',
    category: 'Performance',
    tags: ['index', 'design', 'selectivity'],
    answer: `**Index** the columns your queries filter, join, and sort on:

- **Selective \`WHERE\` filters** — high-cardinality columns queried often.
- **Join keys**, especially **foreign keys** (rarely auto-indexed outside InnoDB).
- **\`ORDER BY\` / \`GROUP BY\`** columns, to skip a sort.

**Don't index:**

- **Low-cardinality** columns (boolean, a 2-3 value status) — a scan is cheaper.
- Columns you **rarely query**, or **tiny tables** (a seq scan beats the overhead).
- Speculative "just in case" indexes — each one taxes **every** write and eats buffer cache.

:::senior
Index for the queries you **actually run** — find them in the slow log or \`pg_stat_statements\` — then confirm with \`EXPLAIN\` that the index is used and \`pg_stat_user_indexes\` that it earns its keep. One well-ordered composite index often replaces several single-column ones.
:::`,
  },
  {
    id: 'db-perf-partial-index',
    question: 'What is a partial (filtered) index and when is it useful?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['partial-index', 'filtered-index', 'index'],
    answer: `A **partial index** indexes only the rows matching a \`WHERE\` predicate, so it is smaller, cheaper to maintain, and faster to scan.

\`\`\`sql
-- index only the hot "pending" queue, not the millions of done rows
CREATE INDEX ix_pending ON orders (created_at) WHERE status = 'pending';
\`\`\`

Ideal when queries always filter on a condition true for a **small subset**: a job queue (\`status = 'pending'\`), live rows (\`WHERE deleted_at IS NULL\`), or active flags. It can also enforce a **conditional \`UNIQUE\`** — e.g. one active email while ignoring soft-deleted rows.

**Postgres/SQLite** call it *partial*; **SQL Server** calls it a *filtered index*. **MySQL/InnoDB** has none — emulate with a generated column.

:::gotcha
The planner uses it only when the query's \`WHERE\` **implies** the index predicate. \`WHERE status = 'pending'\` matches; a query without that condition cannot use the index.
:::`,
  },
  {
    id: 'db-perf-expression-index',
    question: 'How do you index a query that filters on a function of a column, like LOWER(email)?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['expression-index', 'functional-index', 'sargable'],
    answer: `A predicate that wraps a column in a function is **non-SARGable** and bypasses a normal index. Build an **expression (functional) index** on the same expression:

\`\`\`sql
CREATE INDEX ix_lower_email ON users (LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'a@b.com';  -- now seeks the index
\`\`\`

The index stores the **computed** value, so the planner can match the \`WHERE\` expression to it. Common uses: case-insensitive lookup (\`LOWER\`), date truncation (\`date(created_at)\`), and extracting a JSON field.

**Postgres/Oracle/SQLite** support it directly; **MySQL 8** has functional indexes (earlier MySQL needs a **stored generated column**, then index that).

:::gotcha
The query expression must match the indexed expression **exactly**. For pervasive case-insensitivity, a \`citext\` column or a case-insensitive **collation** is often cleaner than sprinkling \`LOWER()\` through every query.
:::`,
  },
  {
    id: 'db-perf-why-index-ignored',
    question: 'You created an index but the query still does a full scan. Why might the optimizer ignore it?',
    difficulty: 'Hard',
    category: 'Performance',
    tags: ['optimizer', 'index usage', 'troubleshooting'],
    answer: `Run \`EXPLAIN ANALYZE\` first, then work down the usual suspects:

1. **Non-SARGable predicate** — a function or arithmetic wraps the column: \`YEAR(d)\`, \`col + 1\`, \`LOWER(x)\`.
2. **Type mismatch** — an implicit cast falls on the column (\`VARCHAR\` compared to a number).
3. **Leading wildcard** — \`LIKE '%term'\` has no prefix to seek.
4. **Low selectivity** — the filter returns a large fraction of rows, so a scan is genuinely cheaper (the optimizer is right).
5. **Stale statistics** — the planner mis-estimates row counts; run \`ANALYZE\`.
6. **Small table** — scanning a few pages beats index overhead.
7. **Left-prefix miss** — filtering on a non-leading column of a composite index; or \`OR\` across columns.

:::senior
"The optimizer won't use my index" is usually **correct behaviour** (selectivity) or a **stats** problem (\`ANALYZE\`), not a bug. Confirm the estimated-vs-actual row gap in \`EXPLAIN ANALYZE\` before reaching for a hint.
:::`,
  },
  {
    id: 'db-perf-leading-wildcard',
    question: "Why can't LIKE '%term%' use an index, and what can?",
    difficulty: 'Easy',
    category: 'Performance',
    tags: ['like', 'wildcard', 'full-text', 'index'],
    answer: `A B-tree index is sorted left-to-right, so it can seek a **known prefix** but not an unknown one.

\`\`\`sql
WHERE name LIKE 'Smi%'    -- anchored prefix -> index range scan
WHERE name LIKE '%mith'   -- leading wildcard -> full scan
WHERE name LIKE '%mit%'   -- infix -> full scan
\`\`\`

\`'Smi%'\` is just a range of everything starting with "Smi". A **leading wildcard** gives no starting point, so the engine must test every row.

Fixes for infix/suffix search: a **trigram index** (Postgres \`pg_trgm\` GIN), a **full-text search** index, a reversed-string index for suffix matches, or an external search engine.

:::gotcha
In Postgres, even anchored prefix \`LIKE\` needs the \`text_pattern_ops\` operator class (or a \`C\` locale) to use a plain B-tree, because the default locale's collation is not byte-order.
:::`,
  },
  {
    id: 'db-perf-count-star-slow',
    question: 'Why is SELECT COUNT(*) slow on a large table, and what can you do?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['count', 'mvcc', 'aggregation'],
    answer: `In an MVCC engine (Postgres, InnoDB) there is **no single stored row count** — \`COUNT(*)\` must scan and check each row's **visibility** for your snapshot, so it is \`O(rows)\`.

Options:

- **Approximate** — read \`reltuples\` from \`pg_class\` (refreshed by \`ANALYZE\`): instant, roughly correct, great for dashboards.
- **Maintained counter** — a summary row updated by trigger for exact live counts.
- **Covering index** — \`COUNT\` over a small index is cheaper than scanning the wide heap.

**MySQL differs by engine:** **MyISAM** stores an exact count (instant), but **InnoDB** (the default) does not — same scan cost as Postgres.

:::gotcha
\`COUNT(*)\`, \`COUNT(1)\`, and \`COUNT(pk)\` are **equal in speed** — "\`COUNT(1)\` is faster" is a myth. \`COUNT(col)\` differs only in that it **skips NULLs** in that column.
:::`,
  },
  {
    id: 'db-perf-slow-query-methodology',
    question: 'Walk me through your process for diagnosing and fixing a slow query.',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['tuning', 'explain', 'methodology'],
    answer: `Measure, never guess:

1. **Find it** — slow-query log, \`pg_stat_statements\` (rank by total time = mean × calls), or APM. Fix the query that costs the most, not the scariest-looking one.
2. **\`EXPLAIN ANALYZE\`** — get the real plan with per-node **actual** time and rows. Hunt the expensive node: seq scans on big tables, nested loops over many rows, sorts spilling to disk, and **estimated-vs-actual** row gaps (stale stats → \`ANALYZE\`).
3. **Fix** — add or reorder an index, make predicates SARGable, rewrite (drop \`SELECT *\`, kill N+1, filter earlier), or refresh statistics.
4. **Verify** — re-run \`EXPLAIN ANALYZE\`; confirm the plan changed and time dropped, and that you did not slow writes elsewhere.

:::key
One change at a time, always re-measured, on **production-scale data**. A plan that is fine on 1,000 rows can flip to a disaster on 10 million.
:::`,
  },
  {
    id: 'db-perf-bitmap-scan',
    question: 'What is a bitmap index scan, and when does Postgres choose it over a plain index scan?',
    difficulty: 'Hard',
    category: 'Performance',
    tags: ['bitmap-scan', 'explain', 'postgres'],
    answer: `A middle ground between an index scan and a seq scan. Rather than jump to each matching row immediately (random I/O), Postgres builds a **bitmap of matching page locations** from the index, sorts it, then reads the heap **in physical page order** (near-sequential I/O), fetching all wanted rows per page in one visit.

It is chosen when a filter matches **too many rows** for efficient per-row random lookups but **too few** to justify a full scan — the awkward middle. It can also **combine indexes**: build a bitmap per index and \`BitmapAnd\`/\`BitmapOr\` them for multi-column predicates without a composite index.

\`\`\`text
Bitmap Heap Scan on orders
  Recheck Cond: (status = 'x')
  ->  Bitmap Index Scan on ix_status
\`\`\`

:::gotcha
The **Recheck Cond** appears because a bitmap can go **lossy** (tracking whole pages, not exact rows) under memory pressure, so rows are re-tested after fetch. A growing lossy recheck is a hint to raise \`work_mem\`.
:::`,
  },
  {
    id: 'db-perf-index-selectivity',
    question: 'What is index selectivity, and why does a boolean column make a poor index?',
    difficulty: 'Easy',
    category: 'Performance',
    tags: ['selectivity', 'cardinality', 'index'],
    answer: `**Selectivity** is how few rows a typical value matches. **High** selectivity (email, near-unique) means a seek returns few rows — a big win. **Low** selectivity (a boolean, a 2-value status) means one value matches roughly half the table, so the index seek's per-row random I/O costs **more** than a straight sequential scan — and the optimizer correctly skips it.

**Rule of thumb:** an index pays off when a query returns less than roughly **5-10%** of the table.

:::senior
A low-selectivity column can still earn its place as the **trailing** column of a composite index, or inside a **partial index** (\`WHERE flag = true\`) that indexes only the rare, interesting rows.
:::`,
  },
  {
    id: 'db-perf-order-by-index',
    question: 'How can an index satisfy an ORDER BY and speed up ORDER BY ... LIMIT?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['order-by', 'index', 'top-n', 'sort'],
    answer: `Index leaves are stored **sorted**, so an index matching the \`ORDER BY\` lets the engine **read rows already in order** and skip the sort step entirely (no \`Sort\` node, no temp-file spill).

\`\`\`sql
CREATE INDEX ix ON events (user_id, created_at DESC);
SELECT * FROM events WHERE user_id = 42 ORDER BY created_at DESC LIMIT 10;
-- seek user_id = 42, walk the index in order, stop after 10 rows
\`\`\`

This is decisive for **top-N**: with the index, \`LIMIT 10\` reads ~10 index entries; without it, the engine must sort **all** of user 42's rows first, then take 10.

:::gotcha
The \`ORDER BY\` columns, order, and direction must match the index (or be its exact reverse). Any **leading** index column must be pinned by a \`WHERE =\` for the ordering on later columns to apply.
:::`,
  },
  {
    id: 'db-perf-index-merge-vs-composite',
    question: 'For a query filtering on two columns, is one composite index better than two single-column indexes?',
    difficulty: 'Medium',
    category: 'Performance',
    tags: ['composite-index', 'index-merge', 'design'],
    answer: `Usually **yes**. A composite index on \`(a, b)\` seeks the combination directly, in one structure. Two single-column indexes force the engine to either use just one and filter the rest, or do an **index merge / bitmap AND** — scan both and intersect the row sets — which reads more and materializes intermediate results.

\`\`\`sql
-- best for  WHERE a = ? AND b = ?
CREATE INDEX ix_ab ON t (a, b);
\`\`\`

Prefer a composite when the columns are queried **together**. Keep separate indexes when they are also queried **independently** — remember \`(a, b)\` serves \`WHERE a\` but **not** \`WHERE b\` alone (left-prefix rule).

:::senior
Do not build every permutation. \`(a, b)\` already covers \`WHERE a\`; add a lone \`(b)\` only if \`b\` is filtered by itself. Order composite columns: **equality and high-selectivity first, range predicates last**.
:::`,
  },
];

export default questions;
