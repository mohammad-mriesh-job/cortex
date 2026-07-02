import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-int-page-anatomy',
    question: 'Describe the layout of a heap page (the "slotted page" structure).',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['storage', 'pages', 'tuple'],
    answer: `A table's data is a **heap file** — a sequence of fixed-size **pages** (8 KB in Postgres). The DB always reads/writes whole pages, never single rows. A page is filled from **both ends**:

- **Page header** at the top (LSN, checksum, free-space pointers).
- A **line-pointer (slot) array** growing downward — each entry holds a tuple's offset + length.
- **Free space** in the middle.
- **Tuples** packed upward from the bottom.

The indirection matters: callers reach a row *through* its line pointer, so a tuple can be moved within the page (to compact free space) without invalidating any reference to it.

\`\`\`sql
-- ctid = (page number, slot number) is a row's physical address
SELECT ctid, id FROM customers LIMIT 2;  -- (0,1), (0,2) ...
\`\`\`

:::senior
Each tuple also carries a ~23-byte header with the MVCC stamps \`xmin\`/\`xmax\`. That's why an "update" is really *insert a new version + mark the old one dead*, and why narrow tables have surprisingly high per-row overhead.
:::`,
  },
  {
    id: 'db-int-buffer-pool',
    question: 'What is the buffer pool and what problem does it solve?',
    difficulty: 'Easy',
    category: 'Internals',
    tags: ['buffer pool', 'caching'],
    answer: `The **buffer pool** is a fixed region of shared RAM that caches disk pages in page-sized **frames**. Because RAM is ~100,000× faster than a disk seek, keeping hot pages resident means most reads never touch the disk.

Every page a query touches goes through it:

\`\`\`mermaid
flowchart LR
  Q["Query"] --> BP["Buffer pool (RAM)"]
  BP -->|hit| Q
  BP -->|miss| D[("Disk")]
  D --> BP
\`\`\`

Each frame tracks whether it's **dirty** (modified, not yet written back), its **pin/ref count** (in use → can't evict), and a **usage count** for eviction. In Postgres it's sized by \`shared_buffers\`, typically ~25% of RAM.`,
  },
  {
    id: 'db-int-wal-rule',
    question: 'What is write-ahead logging, and why does it make commits both fast and durable?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['wal', 'durability', 'commit'],
    answer: `**Write-ahead logging (WAL)** enforces one rule: the **log record** for a change must be durable **before** the modified data page is written. On \`COMMIT\`, the database fsyncs only the WAL — not the table's data pages.

That's why commits are fast **and** durable:

- **Fast** — WAL is a **sequential append** to one file, and concurrent commits are batched into one fsync (**group commit**). The expensive random data-page writes are deferred.
- **Durable** — after the log record is on disk, a crash can't lose the change: recovery replays it. The dirty data page can stay in RAM indefinitely.

\`\`\`text
COMMIT  →  fsync WAL up to commit LSN  →  return OK
data pages written later by the checkpointer/bgwriter
\`\`\`

:::key
Commit durability = fsync of the **log**, not the data files. That single indirection is the whole trick.
:::`,
  },
  {
    id: 'db-int-redo-undo',
    question: 'Distinguish redo from undo, and outline the phases of ARIES crash recovery.',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['wal', 'recovery', 'aries'],
    answer: `A log record can carry the **new** value (redo) and/or the **old** value (undo):

| | Contains | Powers |
|---|---|---|
| **Redo** | new value | re-applying committed changes lost from cache after a crash |
| **Undo** | old value | \`ROLLBACK\`, and removing uncommitted changes during recovery |

**ARIES** recovery runs three passes from the last checkpoint:

1. **Analysis** (forward) — determine which transactions were in flight and which pages were dirty at crash time.
2. **Redo** (forward) — *repeat history*: re-apply **every** logged change to restore the exact pre-crash state.
3. **Undo** (backward) — roll back transactions that never committed.

The result: committed work is preserved, uncommitted work vanishes.

:::senior
Postgres keeps **redo** in WAL and derives "undo" from **MVCC** (the old row version survives until vacuum), so it has no separate undo log. Oracle and InnoDB maintain an explicit undo log instead. Same durability contract, different mechanism.
:::`,
  },
  {
    id: 'db-int-checkpoint',
    question: 'What is a checkpoint, and how does checkpoint frequency trade off against recovery time?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['checkpoint', 'recovery', 'wal'],
    answer: `A **checkpoint** flushes all dirty pages up to a point and records that LSN in the WAL. It guarantees that everything before it is safely on disk, so **crash recovery only has to replay WAL from the last checkpoint** — not the entire log.

\`\`\`text
[checkpoint] --- log --- log --- log --- [crash]
             └─ recovery replays only this range ─┘
\`\`\`

The trade-off:

- **Frequent** checkpoints → shorter recovery, but constant background write I/O and WAL-write amplification (full-page images).
- **Rare** checkpoints → less steady I/O, but a longer, I/O-heavy restart and more WAL to keep.

Tuned via \`checkpoint_timeout\` and \`max_wal_size\`; \`CHECKPOINT;\` forces one.`,
  },
  {
    id: 'db-int-query-pipeline',
    question: 'Walk through the stages a SQL statement passes through before returning rows.',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['query processing', 'planner', 'executor'],
    answer: `SQL is declarative, so the engine turns text into an execution strategy through a pipeline:

\`\`\`mermaid
flowchart LR
  T["SQL"] --> P["Parse"] --> A["Analyze / bind"] --> R["Rewrite"] --> O["Plan / optimize"] --> E["Execute"]
\`\`\`

1. **Parser** — check **syntax**, build a raw parse tree.
2. **Analyzer / binder** — resolve table & column **names and types**, verify they exist and are permitted → query tree.
3. **Rewriter** — expand **views** and apply rules (e.g. row-level security).
4. **Planner / optimizer** — choose the **cheapest** physical plan: join order, scan and join methods.
5. **Executor** — run the plan tree, pulling rows on demand via the **iterator (volcano) model**.

Parsing/binding fail fast on invalid queries; by the optimizer stage the query is known-valid and the only question is *how fast*, not *whether it's correct*.`,
  },
  {
    id: 'db-int-cost-optimizer',
    question: 'How does a cost-based optimizer choose a plan, and why do stale statistics ruin it?',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['optimizer', 'statistics', 'cost'],
    answer: `The optimizer enumerates equivalent physical plans and keeps the one with the lowest **estimated cost** — a *prediction*, not a measurement:

\`\`\`text
cost ≈ pages_read × seq_page_cost + rows_processed × cpu_tuple_cost
rows_processed = selectivity × table_cardinality
\`\`\`

**Selectivity** comes from column **statistics**: \`n_distinct\`, most-common-values, histograms, null fraction, correlation (in \`pg_stats\`, refreshed by \`ANALYZE\`).

Everything hinges on the estimated **row count (cardinality)**. If statistics are stale — say the table grew from 5 rows to 5 million — the optimizer may estimate "a handful of rows" and pick a nested-loop + index scan that's now catastrophic. Wrong cardinality cascades into wrong join methods and join order.

\`\`\`sql
EXPLAIN ANALYZE SELECT ...;  -- compare estimated rows vs actual rows
ANALYZE my_table;            -- fix a large gap by refreshing stats
\`\`\`

:::gotcha
Before blaming the optimizer or adding hints, check the **estimated-vs-actual rows** gap in \`EXPLAIN ANALYZE\`. Most "bad plans" are bad *estimates*, cured by \`ANALYZE\` or extended statistics — not by a smarter cost model.
:::`,
  },
  {
    id: 'db-int-clock-lru',
    question: 'Why do databases use the CLOCK algorithm for page eviction instead of true LRU?',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['buffer pool', 'eviction', 'clock', 'lru'],
    answer: `**True LRU** evicts the least-recently-used page, but it must reorder a shared, lock-protected list on **every single page access**. Under high concurrency that lock becomes a bottleneck — the bookkeeping costs more than the disk savings.

**CLOCK (second-chance)** approximates LRU cheaply:

- Frames sit in a ring; each has a **reference bit** (Postgres uses a small usage **counter**).
- A "hand" sweeps: if the bit is **1**, clear it to 0 and move on (a *second chance*); if it's **0**, that frame is the **victim**.

\`\`\`text
ref=1 → clear to 0, advance   (recently used, spare it)
ref=0 → evict this frame       (cold, reclaim it)
\`\`\`

This is O(1), needs almost no locking, and closely mimics LRU because recently-touched pages keep getting their bit set. If the victim's page is dirty it must be flushed first — and the **WAL rule** means its log record has to be durable before that flush.`,
  },
  {
    id: 'db-int-hit-ratio',
    question: 'What is the buffer cache hit ratio, how do you measure it, and what does a low value mean?',
    difficulty: 'Easy',
    category: 'Internals',
    tags: ['caching', 'hit ratio', 'monitoring'],
    answer: `The **cache hit ratio** is the fraction of page requests served from the buffer pool without a disk read:

\`\`\`text
hit ratio = blks_hit / (blks_hit + blks_read)
\`\`\`

\`\`\`sql
SELECT round(sum(blks_hit) * 100.0
           / nullif(sum(blks_hit + blks_read), 0), 2) AS hit_pct
FROM pg_stat_database;
\`\`\`

For an OLTP working set you generally want **> 99%**. A **falling** ratio means the working set no longer fits in \`shared_buffers\`, so the cache is thrashing — pages get evicted and re-read repeatedly, and latency climbs.

:::note
Don't chase 100% by making \`shared_buffers\` huge: the **OS page cache** also caches file pages, so an oversized pool double-caches and wastes RAM. The pool and OS cache form a two-tier cache.
:::`,
  },
  {
    id: 'db-int-toast',
    question: 'How does Postgres store a value too large to fit inline in a row (TOAST)?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['storage', 'toast', 'large values'],
    answer: `A tuple must fit in one 8 KB page, and Postgres wants ~4 tuples per page, so a value bigger than roughly **2 KB** can't stay inline. **TOAST** (The Oversized-Attribute Storage Technique) handles it:

1. **Compress** the large attribute.
2. If the row is *still* too big, move the value **out-of-line** into a hidden companion TOAST table, leaving an ~18-byte pointer in the main row.

Per-column strategies: \`PLAIN\` (no TOAST), \`MAIN\` (compress, out-of-line as last resort), \`EXTENDED\` (compress + out-of-line — the default for \`text\`/\`jsonb\`/\`bytea\`), \`EXTERNAL\` (out-of-line, no compression, for fast substring access).

\`\`\`sql
SELECT pg_column_size(profile_json) FROM users ORDER BY 1 DESC LIMIT 3;
\`\`\`

:::gotcha
Reading a TOASTed column costs an **extra fetch** from the TOAST table. A \`SELECT *\` that hauls a big \`jsonb\` you don't need can be dramatically slower than selecting only the columns you use.
:::`,
  },
];

export default questions;
