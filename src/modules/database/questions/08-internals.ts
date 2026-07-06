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
  {
    id: 'db-int-bplus-vs-btree',
    question: 'What is the difference between a B-tree and a B+tree, and why do databases use B+trees?',
    difficulty: 'Easy',
    category: 'Internals',
    tags: ['b-tree', 'b-plus-tree', 'index', 'storage'],
    answer: `In a **B-tree**, keys and their data pointers live in **every** node. In a **B+tree**, internal nodes hold **only keys** to guide the search; **all data pointers live in the leaves**, and the leaves are **linked** in sorted order.

Why databases prefer B+trees:

- **Higher fanout** — internal nodes carry no payload, so more keys fit per page → shallower tree → fewer disk reads.
- **Fast range scans** — follow the linked leaves sideways instead of re-walking the tree.
- **Uniform lookups** — every search ends at a leaf, so depth (and cost) is predictable.

\`\`\`text
B+tree:  [internal: keys only]
             |        |
          [leaf k+ptr] <-> [leaf] <-> [leaf]   (linked, sorted)
\`\`\`

:::key
Nearly every relational index is a **B+tree** — the data-in-leaves, linked-leaf design is exactly what range and \`ORDER BY\` queries need.
:::`,
  },
  {
    id: 'db-int-heap-vs-clustered',
    question: 'What is the difference between heap-organized and clustered (index-organized) table storage?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['heap', 'clustered-index', 'storage', 'innodb'],
    answer: `It is how the **table's rows** are physically stored:

- **Heap** (PostgreSQL; SQL Server without a clustered index) — rows sit in an unordered heap file. **Every** index is secondary and points to a physical location (\`ctid\`/RID); the PK is just another secondary index.
- **Clustered / index-organized** (InnoDB, SQL Server clustered index, Oracle IOT) — the table **is** a B+tree keyed by the clustering key (usually the PK); rows live **in the leaves** in key order. There is no separate heap.

Consequences of clustering: a PK lookup needs **no** extra hop and PK range scans are sequential — but **secondary indexes store the PK value** and need a second lookup, and a wide/random PK bloats every secondary index.

:::gotcha
This is why InnoDB wants a **small, monotonic** primary key: it is duplicated inside every secondary index, and a random PK (like a UUIDv4) causes leaf **page splits** on insert. Heap tables don't share this sensitivity.
:::`,
  },
  {
    id: 'db-int-lsm-tree',
    question: 'How does an LSM-tree store data, and why is it write-optimized?',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['lsm-tree', 'storage-engine', 'compaction', 'sstable'],
    answer: `A **Log-Structured Merge tree** turns random writes into sequential ones:

1. Writes go to an in-memory sorted structure (**memtable**) plus an append-only **WAL** for durability.
2. When the memtable fills, it is flushed to disk as an immutable, sorted **SSTable** — a purely sequential write, never an in-place update.
3. Background **compaction** merges SSTables, dropping overwritten keys and **tombstones** (deletes are markers, not in-place removals).

\`\`\`text
write -> memtable (+WAL) --flush--> SSTable L0 --compact--> SSTable L1 -> ...
\`\`\`

Writes are fast because they only append to memory and a sequential log — no random page update. Used by RocksDB, Cassandra, LevelDB, and MyRocks.

:::senior
The cost is **read** and **space** amplification: a read may probe the memtable plus several SSTables, and compaction rewrites data repeatedly. Bloom filters (skip SSTables) and leveled compaction are the standard mitigations.
:::`,
  },
  {
    id: 'db-int-lsm-vs-btree',
    question: 'Compare LSM-trees and B-trees in terms of read, write, and space amplification.',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['lsm-tree', 'b-tree', 'amplification', 'trade-offs'],
    answer: `Two storage philosophies with opposite trade-offs:

| | B-tree | LSM-tree |
|---|---|---|
| Writes | in-place page update — **random** I/O | append memtable, **sequential** SSTable flush |
| Write amplification | rewrites a whole page per change | higher (compaction rewrites), but sequential |
| Reads | one tree traversal, predictable | may probe memtable + many SSTables (bloom filters help) |
| Space | free-space slack, fragmentation | tombstones + un-compacted overwrites |
| Best for | read-heavy, range scans, OLTP | write-heavy, high-ingest, SSD-friendly |

- **B-tree** — read-optimized and mature; each write does a random page update.
- **LSM** — write-optimized (sequential, kind to SSDs), but reads and compaction cost more.

:::senior
"Write amplification" differs by design: a B-tree rewrites a full page for a one-row change; an LSM rewrites the same data several times over successive compactions. Choose LSM for ingest-heavy/time-series, B-tree for balanced OLTP with range queries.
:::`,
  },
  {
    id: 'db-int-bloom-filter',
    question: 'How do bloom filters speed up reads in an LSM-tree?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['bloom-filter', 'lsm-tree', 'reads', 'probabilistic'],
    answer: `A read may have to check many SSTables to locate a key. A **bloom filter** is a compact probabilistic bitset per SSTable that answers "is key X **possibly** in here?" cheaply, so the engine can **skip** SSTables that definitely lack the key.

- **No false negatives** — a "not present" answer is always correct, so skipping is safe.
- **Tunable false positives** — it may say "maybe" for an absent key; you then check that SSTable and miss. More bits per key → fewer false positives.

\`\`\`text
GET key -> bloom says "no" for SSTables 1,2 -> skip -> read only SSTable 3
\`\`\`

This converts a lookup from "scan every SSTable" into "check the one or two that might match" — a huge I/O saving, especially for absent or rare keys.

:::gotcha
Bloom filters accelerate **point lookups**, not **range scans** (a range has no single key to test). And you cannot delete from a plain bloom filter, only rebuild it.
:::`,
  },
  {
    id: 'db-int-autovacuum',
    question: 'What does VACUUM do in Postgres, and what is transaction-ID wraparound?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['vacuum', 'autovacuum', 'wraparound', 'mvcc', 'postgres'],
    answer: `MVCC leaves **dead tuples** (old row versions) behind. **VACUUM** reclaims their space for reuse (plain \`VACUUM\`) or returns it to the OS (\`VACUUM FULL\`, which rewrites and **locks** the table). **Autovacuum** triggers it when a table's dead-tuple ratio crosses a threshold, and refreshes planner statistics.

Its second, critical job is **freezing** to prevent **transaction-ID wraparound**: XIDs are 32-bit and eventually wrap, so VACUUM stamps old rows "frozen" (always visible) to let the counter advance safely. If autovacuum falls behind — often blocked by a long transaction — Postgres nears wraparound and will ultimately **force a shutdown** to protect data.

:::gotcha
Do not disable autovacuum. The usual failure is vacuum running too **slowly** (bloat, wraparound warnings), not too aggressively. A single long-running or idle-in-transaction session blocks cleanup by pinning the oldest snapshot.
:::`,
  },
  {
    id: 'db-int-prepared-statements',
    question: 'What is a prepared statement, and what two benefits does it give?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['prepared-statements', 'plan-cache', 'sql-injection'],
    answer: `A **prepared statement** sends the SQL **once** with placeholders; the server parses, analyzes, and often plans it, returning a handle you **execute** repeatedly with different bind values.

Two benefits:

1. **Performance** — skip re-parsing and re-planning on each execution; reuse the cached plan. A big win for hot, repeated queries.
2. **SQL-injection safety** — values travel on a **separate channel** from the SQL text, so input is always **data**, never parsed as code. This is *the* fix for injection.

\`\`\`sql
PREPARE q (int) AS SELECT * FROM users WHERE id = $1;
EXECUTE q(42);
\`\`\`

:::senior
Plans can be **generic** (planned once, reused) or **custom** (re-planned per value set). Postgres uses custom plans for the first few executions, then a generic plan if it is not much worse — so a prepared statement over **skewed** data can flip to a bad generic plan.
:::`,
  },
  {
    id: 'db-int-plan-cache-pitfall',
    question: 'What is parameter sniffing (a plan-cache pitfall), and how do you handle it?',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['plan-cache', 'parameter-sniffing', 'optimizer', 'skew'],
    answer: `A cached plan is chosen for the **first** parameter values (or as a generic plan) and reused for **all** later values. When data is **skewed**, a plan optimal for one value is terrible for another.

Example: \`WHERE status = ?\` — \`'archived'\` matches 99% of rows (seq scan is right), \`'pending'\` matches 0.1% (index seek is right). Whichever value planned the cached plan penalizes the other.

Fixes by engine:

- **SQL Server** ("parameter sniffing") — \`OPTION (RECOMPILE)\`, \`OPTIMIZE FOR\`, or a plan guide.
- **Postgres** — the generic-vs-custom switch; \`plan_cache_mode = force_custom_plan\` to always re-plan.
- **General** — for wildly skewed columns, don't share one plan: recompile, or split into per-value-class queries.

:::gotcha
The signature symptom is "the **same** query is sometimes fast, sometimes slow." Suspect a cached or generic plan being reused across skewed parameters before blaming the data.
:::`,
  },
  {
    id: 'db-int-utf8mb4',
    question: "In MySQL, what is the difference between utf8 and utf8mb4, and why does it bite people?",
    difficulty: 'Easy',
    category: 'Internals',
    tags: ['mysql', 'utf8mb4', 'encoding', 'gotcha'],
    answer: `MySQL's **utf8** (alias \`utf8mb3\`) is a **broken 3-byte** encoding covering only the Basic Multilingual Plane. It **cannot** store 4-byte characters — emoji, some CJK extensions, certain symbols. **utf8mb4** is real, full UTF-8 (up to 4 bytes per character).

The classic bug: an app saves "Hello 😀" and legacy \`utf8\` either errors ("Incorrect string value") or truncates at the emoji.

\`\`\`sql
ALTER TABLE t CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

Always use **utf8mb4** for user text in MySQL. This trap is MySQL-specific — PostgreSQL's \`UTF8\` has always been true UTF-8.

:::gotcha
utf8mb4 uses up to 4 bytes/char, so a \`VARCHAR(255)\` index can exceed old key-length limits (767/3072 bytes) — the reason legacy schemas capped indexed columns at \`VARCHAR(191)\`.
:::`,
  },
  {
    id: 'db-int-hot-updates',
    question: 'What is a Postgres HOT update, and how does fill factor relate?',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['hot-update', 'fillfactor', 'mvcc', 'postgres'],
    answer: `MVCC makes every \`UPDATE\` write a **new** tuple version, which normally must be added to **every index** — expensive. A **HOT (Heap-Only Tuple) update** avoids that: if the update changes **no indexed column** *and* there is **free space on the same page**, Postgres chains the new version to the old **on that page** and **skips the indexes entirely**. Indexes still point at the old slot, which forwards to the new tuple.

**Fill factor** leaves each page partly empty at load time so future updates have room to stay HOT:

\`\`\`sql
ALTER TABLE t SET (fillfactor = 80);   -- reserve 20% per page for HOT updates
\`\`\`

Lower fill factor → more HOT updates → less index churn and bloat, at some space cost.

:::senior
HOT is why "don't index columns you update constantly" matters: updating an **indexed** column forces a non-HOT update that touches every index. HOT chains are tidied by vacuum and page pruning.
:::`,
  },
  {
    id: 'db-int-columnar-storage',
    question: 'What is columnar storage and why is it faster for analytics?',
    difficulty: 'Medium',
    category: 'Internals',
    tags: ['columnar', 'olap', 'compression', 'vectorization'],
    answer: `A **row store** (OLTP default) keeps all of a row's columns together — great for reading or writing whole rows. A **column store** (OLAP: ClickHouse, Redshift, Parquet, DuckDB) stores each **column** contiguously.

Why columnar wins for analytics:

- **Read only needed columns** — \`SUM(amount)\` over a 50-column table touches one column's data, not every row in full.
- **Compression** — a column is one data type with repeated/similar values → excellent compression (dictionary, RLE) → less I/O.
- **Vectorized / SIMD execution** — process a batch of one column at a time.

The trade-off: reading or writing a single full row scatters across many column segments, so column stores are poor for OLTP point access.

:::gotcha
OLTP → row store; analytics → column store. Don't run heavy aggregations on your OLTP row store — offload to a columnar warehouse, replica, or extension (e.g. Citus columnar) instead.
:::`,
  },
  {
    id: 'db-int-torn-page',
    question: 'What is a torn page, and how do databases protect against one?',
    difficulty: 'Hard',
    category: 'Internals',
    tags: ['torn-page', 'doublewrite', 'full-page-writes', 'durability'],
    answer: `A DB page (8-16 KB) is larger than a disk sector, so a crash **mid-write** can leave a page **half-old, half-new** — a **torn (partial) page**. WAL redo alone cannot repair it, because redo assumes the base page is intact.

Protections:

- **PostgreSQL — \`full_page_writes\`**: the **first** change to a page after each checkpoint writes the **entire page image** into the WAL, so recovery restores the whole page before applying redo. (This is why WAL volume spikes right after a checkpoint.)
- **MySQL/InnoDB — doublewrite buffer**: pages are first written to a sequential doublewrite area, then to their final home; a crash mid-final-write is repaired from the intact copy.

:::gotcha
Both cost extra write I/O for safety. Disable them **only** on storage that guarantees **atomic** page writes (certain SSDs, ZFS, or sector-aligned pages) — otherwise disabling risks silent corruption after a crash.
:::`,
  },
];

export default questions;
