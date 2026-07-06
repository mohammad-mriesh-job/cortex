import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'db-scale-scaling-ladder',
    question: 'Your database is slow under load. In what order should you attempt to scale it?',
    difficulty: 'Easy',
    category: 'Scaling',
    tags: ['scaling', 'playbook', 'indexing'],
    answer: `Climb from **cheapest and most reversible** to **most expensive and irreversible** — and always **measure first**:

1. **Measure** — slow-query log, \`EXPLAIN ANALYZE\`, metrics. Find the *real* bottleneck.
2. **Optimize queries + indexes** — a missing index is the most common cause; often a 10–100x win for one \`CREATE INDEX\`.
3. **Cache** hot reads (Redis) — absorbs the bulk of read traffic.
4. **Read replicas** — fan the remaining reads across followers.
5. **Vertical scale** — a bigger box buys time (but hits a ceiling).
6. **Partition / shard** — the last resort, for when *writes* outgrow one primary.

:::key
The senior signal is **restraint**: never jump to sharding when an unindexed query or a missing cache is the real problem. Rungs 1–2 routinely deliver 10–100x on a single node and buy you years.
:::`,
  },
  {
    id: 'db-scale-read-replicas',
    question: 'What do read replicas scale, and what do they NOT help with?',
    difficulty: 'Easy',
    category: 'Scaling',
    tags: ['replication', 'read-replicas', 'scaling'],
    answer: `Read replicas are copies of the primary that serve **read** queries. Since most workloads are read-heavy, fanning reads across replicas multiplies read capacity while the primary handles writes.

They do **not** help with **write** throughput — every write still goes to the single primary and is then replicated to *every* replica (so write load, if anything, goes up). When writes are the bottleneck you need **partitioning/sharding**, not more replicas.

:::gotcha
Reads from a replica can be **stale** due to replication lag. If a user must see their own writes immediately, add **read-your-writes** handling (route them to the primary briefly, or to a replica known to have caught up).
:::`,
  },
  {
    id: 'db-scale-sync-vs-async',
    question: 'Synchronous vs asynchronous replication — what is the trade-off, and what is semi-synchronous?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['replication', 'consistency', 'durability'],
    answer: `The knob is: **does the primary wait for replicas before acking a write?**

| | Synchronous | Asynchronous |
|---|---|---|
| Primary waits for replica? | Yes | No — acks immediately |
| Write latency | Higher (round-trip) | Low |
| Data loss on primary crash | None | **Possible** (unshipped writes lost) |
| If a replica is slow/down | Writes **stall** | Writes unaffected |

- **Synchronous** = durable but slow, and one slow follower freezes every write.
- **Asynchronous** = fast, but a crash can lose writes that were acked-but-not-yet-shipped, and replicas serve stale reads.

**Semi-synchronous** is the common middle ground: wait for **at least one** replica to confirm (guaranteeing durability), then let the rest catch up asynchronously (keeping throughput). Postgres \`synchronous_commit\` and MySQL semi-sync do exactly this.`,
  },
  {
    id: 'db-scale-replication-lag',
    question: 'A user updates their profile, refreshes, and sees the OLD value. What happened and how do you fix it?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['replication', 'replication-lag', 'consistency'],
    answer: `This is a **stale read caused by replication lag**. The write committed on the **primary**, but the refresh's read was routed to a **replica** that had not yet applied the change.

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant P as Primary
    participant R as Replica
    U->>P: UPDATE profile
    P-->>U: OK
    U->>R: SELECT profile
    R-->>U: old value (not applied yet)
\`\`\`

The fix is **read-your-writes consistency**:

- Route the user's reads to the **primary** for a short window after they write.
- Track a write timestamp / LSN per user and only read from a replica that has caught up **past** it.
- Serve the just-written value from a **session cache**.

:::gotcha
Lag is not constant — a big batch write or network blip can spike it from milliseconds to minutes. Always **monitor** it (\`pg_stat_replication\`, \`SHOW REPLICA STATUS\`) and design for it being arbitrarily large.
:::`,
  },
  {
    id: 'db-scale-hotspot',
    question: 'What is a sharding hotspot, and what commonly causes one?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['sharding', 'hotspot', 'shard-key'],
    answer: `A **hotspot** is one shard receiving a disproportionate share of traffic while the others sit idle — so you sharded but got little or no scaling.

Common causes and cures:

| Cause | Cure |
|---|---|
| **Monotonic key** (timestamp, auto-increment) — all new writes hit the newest shard | Hash the key, or add a high-cardinality prefix |
| **Low-cardinality key** (e.g. \`country = 'US'\`) | Pick a higher-cardinality or **composite** key |
| **One celebrity/whale row** (a user with millions of followers) | Further split that entity, cache it, or replicate it |

:::gotcha
The classic bug: sharding on an **auto-incrementing id or timestamp**. Every new write targets the single "newest" shard, so write throughput barely improves. Always hash a monotonic key before routing.
:::`,
  },
  {
    id: 'db-scale-shard-key',
    question: 'How do you choose a good shard key, and why does it matter so much?',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['sharding', 'shard-key', 'data-modeling'],
    answer: `The shard key is the column whose value decides which shard a row lives on — it determines whether you scale smoothly or build a distributed traffic jam. Balance three properties:

- **Even distribution** — high cardinality so load spreads across all shards (avoid hotspots).
- **Query locality** — most hot queries should carry the key so they hit **one** shard. A query *without* the shard key becomes a **scatter-gather** across all shards.
- **Cardinality** — enough distinct values to split as you grow.

| Strategy | Distribution | Range queries | Hotspot risk |
|---|---|---|---|
| Hash of high-cardinality id | Even | Bad | Low |
| Range of a natural key | Uneven | Good | Medium |
| Timestamp / auto-increment | Terrible | Good | **Severe** |
| Composite (\`tenant_id\` + hash) | Even | Within tenant | Low |

A **composite key** (e.g. tenant + hash) often wins: locality within a tenant *and* even spread.

:::senior
Cross-shard **JOINs and transactions** are the real tax — no single node has both rows, so they need scatter-gather or two-phase commit. Model so your hot paths carry the shard key, and treat any query that does not as a red flag.
:::`,
  },
  {
    id: 'db-scale-cap',
    question: 'Explain the CAP theorem and how it guides real system-design choices.',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['cap', 'consistency', 'distributed-systems'],
    answer: `CAP says that during a **network partition** (P), a distributed system must choose between **Consistency** (every read sees the latest write) and **Availability** (every request gets a non-error response).

Since partitions are **unavoidable** on real networks, P is not optional — so the real decision is **C vs A *during* a partition**:

- **CP** (ZooKeeper, etcd, single RDBMS) — refuse or stall to stay consistent. Good for config, leader election, money.
- **AP** (Cassandra, DynamoDB, Riak) — stay available and reconcile later (eventual consistency). Good for carts, feeds, metrics.

A "CA" system (consistent + available but not partition-tolerant) is effectively a **single node** — the moment you replicate it, you must re-answer C-vs-A.

:::senior
CAP only describes the (rare) partition. Prefer **PACELC**: *if Partition then A-vs-C, Else (normal operation) Latency-vs-Consistency*. Most of the time there is no partition and you are really trading latency against consistency — the choice you live with every day.
:::`,
  },
  {
    id: 'db-scale-sql-vs-nosql',
    question: 'When would you choose a NoSQL store over a relational database — and what are the four NoSQL families?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['nosql', 'sql', 'data-modeling'],
    answer: `Default to **relational** (transactions, ad-hoc queries, integrity, and \`jsonb\` for flexibility). Reach for NoSQL only for a **specific** reason: a proven write/scale ceiling, a non-relational shape, or an access pattern one model nails.

The four families:

| Family | Shape | Query by | Sweet spot |
|---|---|---|---|
| **Key-Value** (Redis, DynamoDB) | \`key → blob\` | The key only | Caches, sessions, counters |
| **Document** (MongoDB) | Self-contained JSON | Key + fields | Catalogs, per-object data |
| **Wide-Column** (Cassandra) | (partition, cluster) rows | Partition key + range | Massive writes, time-series |
| **Graph** (Neo4j) | Nodes + edges | Traversals | Social, fraud, recommendations |

:::gotcha
NoSQL is **schema-flexible, not schema-free** — the schema moves from the database into every piece of app code that reads the data. And most NoSQL forces you to **model around your queries up front**; get the access pattern wrong and there is no cheap \`JOIN\` or new index to save you.
:::`,
  },
  {
    id: 'db-scale-cache-strategies',
    question: 'Compare write-through and write-back caching. Which risks data loss?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['caching', 'write-through', 'write-back'],
    answer: `Both keep the cache fresh on writes, but differ on **when** the database is updated:

- **Write-through** — the write goes **through the cache to the DB synchronously** before acking. Cache and DB stay in sync; reads after a write are warm. Cost: every write pays both cache and DB latency, and you cache data that may never be read.
- **Write-back (write-behind)** — write to the **cache only**, ack immediately, and flush to the DB **asynchronously** (batched) later. Fastest writes and it coalesces repeated writes to the same key.

**Write-back risks data loss**: if the cache node dies before the flush, those writes are gone, and the DB is temporarily behind.

\`\`\`text
write-through:  app -> cache -> DB (sync) -> ack
write-back:     app -> cache -> ack   ...later...   cache -> DB (batched)
\`\`\`

Contrast with **cache-aside**, where the app writes to the DB and just **invalidates** the key — the most common general-purpose pattern.`,
  },
  {
    id: 'db-scale-pacelc-consistency',
    question: 'What does PACELC add over CAP, and name a few consistency models between "strong" and "eventual".',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['pacelc', 'consistency', 'distributed-systems'],
    answer: `**PACELC** extends CAP to cover normal operation, not just the partition:

> **P**artition → **A** or **C**; **E**lse → **L**atency or **C**onsistency.

CAP only speaks to the rare partition; PACELC captures the constant, everyday trade of **latency vs consistency** (e.g. read from a slow-but-fresh primary, or a fast-but-stale replica?).

- **DynamoDB / Cassandra** = PA/EL (available under partition, low-latency otherwise)
- **MongoDB** = PA/EC
- **Spanner / etcd** = PC/EC (consistent always, pays latency)

Consistency is a **ladder**, not a switch — from strongest/most-coordination to weakest/fastest:

| Model | Guarantee |
|---|---|
| **Strong (linearizable)** | Every read sees the latest write |
| **Causal** | Cause-before-effect order preserved |
| **Read-your-writes** | You always see your *own* latest writes |
| **Monotonic reads** | Never see an *older* value than one already seen |
| **Eventual** | If writes stop, replicas eventually converge |

:::gotcha
"Eventual consistency" only promises convergence **if writes stop** — with no time bound and no built-in winner. Always pair it with a **conflict-resolution** rule (last-write-wins, CRDTs, vector clocks, or app-level merge).
:::`,
  },
  {
    id: 'db-scale-cache-invalidation',
    question: 'Why is cache invalidation hard? Explain the dual-write race and cache stampedes.',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['caching', 'invalidation', 'cache-stampede'],
    answer: `A cache entry is a bet that the source of truth has not changed; invalidation is settling that bet, and it is hard because the cache and DB are **two copies with no shared transaction**.

**The dual-write race** — "write DB, then delete cache" is not atomic. If the delete fails, or another request repopulates the cache *between* your DB write and the delete, the cache is now **permanently stale**. Mitigations:

- Prefer **delete** over in-place **update** (let the next read reload from the DB — no racing writes).
- Add a **TTL** so any missed invalidation self-heals within a bounded window.
- Invalidate from the **database changelog** (CDC / binlog, e.g. Debezium) so invalidation cannot be skipped.

**Cache stampede (thundering herd)** — a hot key expires and thousands of concurrent requests all miss and hammer the DB at once, often taking it down. Fixes:

- **Single-flight / request coalescing** — only one caller recomputes; the rest wait.
- **Stale-while-revalidate** — serve the old value while one worker refreshes.
- **Jittered / probabilistic early expiry** — so keys do not all expire simultaneously.

:::senior
Decide the cache-down failure mode deliberately: **fail open** (all traffic to the DB, risking overload) or **fail closed** (return errors). For a cache fronting a fragile DB, uncontrolled fail-open *is* the outage — add a circuit breaker and load-shedding.
:::`,
  },
  {
    id: 'db-scale-connection-pool',
    question: 'How do you size a database connection pool, and why are bigger pools often worse?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['connection-pooling', 'performance', 'scaling'],
    answer: `A connection pool keeps a small set of warm connections and lends them out, avoiding the cost of opening one per request (TCP + TLS + auth) and the memory/backend process each consumes on the DB.

Making the pool large is the instinctive mistake. A database has **finite CPUs and disks**, so too many concurrent connections cause **lock contention and context-switching**, hurting both throughput and latency. A useful starting formula:

\`\`\`text
pool size ~= (core_count x 2) + effective_spindle_count
\`\`\`

That often lands **under ~20**, even for busy services. The pool should be the **backpressure point** that protects the DB — the real bottleneck — not a firehose pointed at it.

:::gotcha
This bites hardest with **serverless / many-instance** deployments: 100 instances x a 20-connection pool = 2000 connections and an instantly-overwhelmed database. Front them with a proxy pooler (**PgBouncer**, RDS Proxy). And note **virtual threads** break the "one connection per thread" model — keep the pool small regardless of thread count.
:::`,
  },
  {
    id: 'db-scale-statement-vs-row-replication',
    question: 'What is the difference between statement-based and row-based replication?',
    difficulty: 'Easy',
    category: 'Scaling',
    tags: ['replication', 'binlog', 'statement-based', 'row-based'],
    answer: `Two ways a primary tells replicas what changed:

- **Statement-based (SBR)** — ships the **SQL statement**. Compact logs, but **non-deterministic** statements replicate wrong: \`NOW()\`, \`RAND()\`, \`UUID()\`, auto-increment races, \`LIMIT\` without \`ORDER BY\` — the replica can compute a different result and **diverge**.
- **Row-based (RBR)** — ships the **actual changed row images** (before/after). Deterministic and safe, but a single \`UPDATE\` touching a million rows logs a million rows.
- **Mixed** — MySQL chooses per statement: row-based for unsafe ones, statement-based otherwise.

MySQL's binlog defaults to **ROW** today; Postgres **logical** replication is row-based, and **physical** (WAL) replication ships byte-level changes (lower still).

:::gotcha
Statement-based replication silently **diverges** replicas on non-deterministic SQL — the reason row-based became the default. Row-based bloats the log on bulk writes, so keep large \`UPDATE\`/\`DELETE\` operations batched.
:::`,
  },
  {
    id: 'db-scale-failover-split-brain',
    question: 'How does automatic failover work, and how do you avoid split-brain?',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['failover', 'split-brain', 'quorum', 'fencing'],
    answer: `**Failover** promotes a replica to primary when the primary dies. The danger is **split-brain**: the old primary is not actually dead (just partitioned), so **two** nodes accept writes and diverge.

Defenses:

- **Quorum** — require a **majority** of voters to agree on the new primary. A minority partition cannot elect one, so it cannot split. This needs an **odd** number of voters (3, 5) to break ties.
- **Fencing / STONITH** — forcibly isolate the old primary (kill it, revoke its VIP/storage) **before** promoting, so it cannot keep serving writes.
- **Leases / epochs** — the new primary carries a higher term; the old one's writes are rejected when it rejoins.

\`\`\`text
partition -> majority side elects new primary -> old primary fenced -> no split-brain
\`\`\`

:::senior
This is exactly what consensus protocols (Raft/Paxos: etcd, Consul) make correct. Rolling your own failover on a naive health check is how you **get** split-brain — use a proven coordinator (Patroni, Orchestrator, or managed cloud failover).
:::`,
  },
  {
    id: 'db-scale-partitioning-strategies',
    question: 'What are the main table partitioning strategies, and what is partition pruning?',
    difficulty: 'Easy',
    category: 'Scaling',
    tags: ['partitioning', 'range', 'list', 'hash', 'pruning'],
    answer: `**Partitioning** splits one big logical table into physical **partitions** inside the same database. Strategies:

- **Range** — by a value range: dates (month/year), id ranges. Ideal for time-series and dropping old data by detaching a partition.
- **List** — by an explicit set: \`region IN ('US','CA')\`, status. Good for categorical splits.
- **Hash** — by \`hash(key)\` to spread rows **evenly** when there is no natural range.

**Partition pruning** is the payoff: if a query filters on the partition key, the planner scans **only** the relevant partitions.

\`\`\`sql
CREATE TABLE events (...) PARTITION BY RANGE (created_at);
-- WHERE created_at >= '2024-06-01' scans only June's partition
\`\`\`

:::gotcha
Pruning works **only** when the query filters on the partition key — a query without it scans **every** partition, often worse than one unpartitioned indexed table. And a monotonic range key funnels all new writes into the newest partition (a hotspot).
:::`,
  },
  {
    id: 'db-scale-partitioning-vs-sharding',
    question: 'What is the difference between partitioning and sharding?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['partitioning', 'sharding', 'scaling'],
    answer: `Both split a table by a key, but at different scopes:

- **Partitioning** — split within **one** database instance. The engine manages partitions; queries are transparent; you still have one machine's CPU/RAM/disk. Solves manageability, pruning, index size, and cheap old-data drops.
- **Sharding** — split across **multiple independent** databases/servers. Each shard is a separate DB; the **application or a router** picks which one. Solves write throughput, total storage, and load beyond one machine.

| | Partitioning | Sharding |
|---|---|---|
| Scope | one server | many servers |
| Managed by | the DB engine | app / proxy / router |
| Scales | manageability, scans | writes, storage, throughput |
| Cross-piece query | normal SQL | scatter-gather, hard joins |

:::senior
Partitioning is a **single-node** optimization; sharding is **horizontal scale-out** with real distributed cost (cross-shard joins/transactions, rebalancing). **Partition first**, and shard only when one node genuinely cannot cope.
:::`,
  },
  {
    id: 'db-scale-multi-tenancy',
    question: 'What are the multi-tenant database models, and how do you choose?',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['multi-tenancy', 'saas', 'isolation', 'data-modeling'],
    answer: `Three models, trading isolation against cost and operability:

| Model | Isolation | Scale | Notes |
|---|---|---|---|
| **Shared schema** (\`tenant_id\` column) | Weakest | Thousands of tenants, cheapest | One migration; noisy-neighbor + leak risk |
| **Schema-per-tenant** | Medium | Hundreds | Per-tenant tweaks; migrations run N times |
| **Database-per-tenant** | Strongest | Most expensive | Full isolation, easy per-tenant backup/move |

- **Shared schema** scales to many small tenants, but a forgotten \`tenant_id\` filter **leaks data across tenants** — enforce with **row-level security** or a mandatory scoping layer.
- **DB-per-tenant** gives clean isolation and per-tenant compliance/backups, but does not scale operationally to 100k tenants.

:::senior
Many SaaS start **shared-schema** and graduate their largest or most-regulated tenants to dedicated schemas/databases — a hybrid. Decide on **tenant count**, **isolation/compliance** needs, and the **blast radius** of one bad query.
:::`,
  },
  {
    id: 'db-scale-cache-aside',
    question: 'How does the cache-aside (lazy-loading) pattern work?',
    difficulty: 'Easy',
    category: 'Scaling',
    tags: ['caching', 'cache-aside', 'redis'],
    answer: `The application manages the cache directly.

- **Read** — check the cache; on a **hit** return it; on a **miss** load from the DB, populate the cache, then return.
- **Write** — update the DB and **invalidate (delete)** the cached key.

\`\`\`text
READ:  hit  -> return cached
       miss -> row = DB; cache.set(key, row, ttl); return row
WRITE: DB update; cache.delete(key)     -- next read repopulates
\`\`\`

It is the most common general-purpose pattern (Redis in front of a SQL DB). The cache only holds data actually requested, and a cache outage still lets reads fall through to the DB — degraded, not down.

:::gotcha
Prefer **delete** over update-in-place on writes (avoids a stale-write race), and always set a **TTL** so a missed invalidation self-heals. The first read after each write is a guaranteed cold **miss** — acceptable for most workloads.
:::`,
  },
  {
    id: 'db-scale-zero-downtime-migration',
    question: 'How do you make a breaking schema change with zero downtime?',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['migrations', 'expand-contract', 'zero-downtime', 'backfill'],
    answer: `Use **expand-contract (parallel change)** so old and new code both work throughout the rollout:

1. **Expand** — add the new structure **backward-compatibly**: a new nullable column or table. No drops, no renames; old code ignores it.
2. **Backfill** — populate it in **small, throttled batches**, never one giant locking \`UPDATE\`.
3. **Migrate code** — deploy code that writes **both** old and new (dual-write), then reads from new.
4. **Contract** — once everything uses the new path and is verified, drop the old column/table.

\`\`\`text
add nullable col -> backfill in batches -> dual-write -> switch reads -> drop old
\`\`\`

:::gotcha
**Never rename a column in one step** — old code breaks the instant it deploys. A rename is really *add-new + backfill + dual-write + switch + drop*: five independently deployable, reversible steps, not one.
:::`,
  },
  {
    id: 'db-scale-lock-safe-ddl',
    question: 'Which schema changes take dangerous locks, and how do you apply them safely?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['ddl', 'locking', 'online-migration', 'postgres', 'mysql'],
    answer: `Some DDL takes an exclusive lock that blocks reads/writes for its duration — fine on a small table, an outage on a large one.

- **\`CREATE INDEX\`** locks writes → use **\`CREATE INDEX CONCURRENTLY\`** (Postgres) or online DDL / \`pt-online-schema-change\` / \`gh-ost\` (MySQL).
- **Adding a column with a volatile default / \`NOT NULL\`** historically rewrote the whole table. Modern Postgres adds a **constant** default instantly (metadata only); otherwise add nullable, backfill, then validate the \`NOT NULL\`.
- **Changing a column type** usually rewrites and locks — do it via a new column.

:::gotcha
Even a "fast" \`ALTER\` must first **acquire** the lock, so it queues behind a long-running query and then **blocks everything behind it** — a millisecond change can cascade into an outage. Set a short \`lock_timeout\`, retry, and migrate in low-traffic windows.
:::`,
  },
  {
    id: 'db-scale-pg-vs-mysql',
    question: 'How would you choose between PostgreSQL and MySQL?',
    difficulty: 'Easy',
    category: 'Scaling',
    tags: ['postgres', 'mysql', 'database-choice'],
    answer: `Both are excellent — choose on features and ecosystem, not folklore.

- **PostgreSQL** — richer feature set: advanced types (\`JSONB\`, arrays, ranges, PostGIS), powerful indexing (GIN/GiST/partial/expression), deep window/CTE support, strict standards, **transactional DDL**, extensibility. The default for complex, analytical, or correctness-sensitive workloads.
- **MySQL** — huge install base, simple replication, very fast on straightforward read-heavy web workloads; InnoDB is solid and hosting is ubiquitous.

:::senior
The differences that actually bite: **default isolation** (Postgres \`READ COMMITTED\` vs InnoDB \`REPEATABLE READ\`), **clustered PK** (InnoDB) vs **heap** (Postgres), \`NULL\` ordering, and Postgres's transactional DDL for safe migrations. For a greenfield app needing rich queries most teams pick Postgres; MySQL fits simple workloads with a favorable ecosystem.
:::`,
  },
  {
    id: 'db-scale-pgbouncer-modes',
    question: "What are PgBouncer's pooling modes, and what breaks in transaction mode?",
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['connection-pooling', 'pgbouncer', 'transaction-pooling'],
    answer: `A pooler multiplexes many client connections onto few server connections. PgBouncer offers three modes:

- **Session pooling** — a server connection is tied to the client for its whole session. Safest, least sharing.
- **Transaction pooling** — the server connection is held only for a **transaction**, then returned. Maximum sharing — the usual choice for many app instances.
- **Statement pooling** — returned after each statement; forbids multi-statement transactions.

What breaks in **transaction mode**: anything using **session state** that outlives a transaction — session \`SET\`, advisory locks, \`LISTEN\`/\`NOTIFY\`, \`WITH HOLD\` cursors, and **server-side prepared statements** (prepared on one server connection, absent on the next).

:::gotcha
Transaction pooling gives the biggest connection reduction (vital for serverless / many-instance apps) but silently breaks session features. Disable or emulate prepared statements, and audit \`SET\`/advisory-lock assumptions before enabling it.
:::`,
  },
  {
    id: 'db-scale-backups-pitr',
    question: 'What backup strategies exist, and how does point-in-time recovery work?',
    difficulty: 'Medium',
    category: 'Scaling',
    tags: ['backups', 'pitr', 'wal', 'disaster-recovery'],
    answer: `Two families:

- **Logical** — export data as statements/rows (\`pg_dump\`, \`mysqldump\`). Portable across versions/architectures and selective (one table), but slow to restore and not incremental.
- **Physical** — copy the data files/blocks (\`pg_basebackup\`, XtraBackup, storage snapshot). Fast whole-cluster restore, but version/architecture-specific.

**Point-in-time recovery (PITR)** = a physical **base backup** plus the continuously **archived WAL/binlog**. To recover, restore the base backup and **replay the log up to a chosen timestamp/LSN** — rolling back to the moment **just before** a bad deploy or accidental \`DELETE\`, not merely the last nightly dump.

:::gotcha
A backup you have never **restored** is a hope, not a backup — test restores and measure **RTO**. Set your **RPO** (max acceptable data loss): continuous WAL archiving gives seconds; nightly dumps risk losing a day.
:::`,
  },
  {
    id: 'db-scale-resharding',
    question: 'A shard is getting too big. How do you reshard without a painful migration?',
    difficulty: 'Hard',
    category: 'Scaling',
    tags: ['sharding', 'resharding', 'consistent-hashing', 'rebalancing'],
    answer: `The pain depends entirely on how you mapped keys to shards:

- **Naive modulo** (\`shard = hash(key) % N\`) — adding a shard changes \`N\`, so **almost every key** remaps → a massive data move. Avoid this.
- **Consistent hashing** — keys and shards sit on a ring; adding a shard moves only the keys between two ring points (~\`1/N\` of data).
- **Virtual buckets / vnodes** — hash keys into a **fixed large** number of logical buckets (e.g. 4096), then map buckets → physical shards. Rebalancing moves whole buckets; the key→bucket function never changes. This is what Vitess, Citus, and Dynamo-style systems do.

\`\`\`text
key -> hash -> bucket (fixed 4096) -> shard (movable mapping)
\`\`\`

:::senior
Design the bucket layer **up front** — retrofitting resharding onto modulo sharding is one of the most dreaded migrations in the industry. Move buckets **online**: copy/dual-write a bucket, verify, cut over reads, then drop the source.
:::`,
  },
];

export default questions;
