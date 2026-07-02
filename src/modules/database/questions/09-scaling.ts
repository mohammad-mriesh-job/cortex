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
];

export default questions;
