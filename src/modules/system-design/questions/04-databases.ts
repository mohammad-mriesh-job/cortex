import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-db-sql-vs-nosql',
    question: 'How do you decide between a SQL and a NoSQL database for a new system?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['sql', 'nosql', 'storage-choice'],
    answer: `Start from **access patterns and requirements**, not from a favorite product.

**Default to relational (SQL)** — it gives you ACID transactions, ad-hoc joins, and flexible queries for free, plus decades of tooling. Reach for NoSQL only when a *concrete pressure* forces you off SQL:

- **Massive horizontal write scale** → wide-column (Cassandra) or key-value (DynamoDB).
- **Flexible / evolving schema** → document (MongoDB).
- **Simple high-throughput lookups** by one key → key-value (Redis).
- **Relationship-heavy traversals** → graph (Neo4j).

\`\`\`text
Relationships + multi-row ACID?  -> SQL
Else, by access pattern:
  single-key lookup   -> key-value
  self-contained docs -> document
  write-heavy, wide   -> wide-column
  graph traversals    -> graph
\`\`\`

:::gotcha
"NoSQL scales better" only holds *for the access pattern you modeled the schema around*. Off-pattern queries turn into scans or fan-out — often worse than indexed SQL.
:::

Mature systems use **polyglot persistence** — several stores, each for what it does best.`,
  },
  {
    id: 'sd-db-nosql-families',
    question: 'Name the four main NoSQL families and a use case for each.',
    difficulty: 'Easy',
    category: 'Databases',
    tags: ['nosql', 'key-value', 'document', 'wide-column', 'graph'],
    answer: `Each family serves one **data shape** well:

| Family | Model | Fits | Example |
|--|--|--|--|
| **Key-Value** | Distributed hash map, opaque values | Sessions, caches, counters | Redis, DynamoDB |
| **Document** | Indexable JSON/BSON records | Profiles, catalogs, content | MongoDB |
| **Wide-Column** | Rows with millions of dynamic columns | Time-series, logs, IoT | Cassandra |
| **Graph** | First-class nodes + edges | Social graphs, recommendations, fraud | Neo4j |

:::tip
Match the family to how the data is *read*: lookup-by-key → key-value; read-whole-record → document; write-heavy-by-partition → wide-column; traverse-relationships → graph.
:::`,
  },
  {
    id: 'sd-db-replication-purpose',
    question: 'What is database replication, and what does it scale (and not scale)?',
    difficulty: 'Easy',
    category: 'Databases',
    tags: ['replication', 'read-replicas', 'availability'],
    answer: `**Replication** keeps a full copy of the data on multiple nodes for three reasons: **availability** (survive a node dying), **read scalability** (serve reads from many copies), and **locality** (data near users).

In leader-follower, all **writes** go to the leader; it streams its change log to **followers** that serve **reads**.

\`\`\`text
writes --> [Leader] --log--> [Follower] [Follower] [Follower] <-- reads
\`\`\`

- **Scales reads** — add followers to add read capacity.
- **Does NOT scale writes** — every write still funnels through the single leader. Scaling writes is what **sharding** is for.`,
  },
  {
    id: 'sd-db-sync-vs-async',
    question: 'Compare synchronous and asynchronous replication.',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['replication', 'synchronous', 'asynchronous', 'durability'],
    answer: `The difference is *when* the leader reports "committed":

| | **Synchronous** | **Asynchronous** |
|--|--|--|
| Waits for follower ack | Yes | No |
| Write latency | Higher | Low |
| Data loss on leader crash | None | Possible (in-flight writes) |
| Stale reads from replicas | No | Yes (replication lag) |
| Availability if follower down | Blocks | Keeps accepting writes |

:::note
Fully synchronous means one slow follower stalls **all** writes; fully async risks losing recent writes on failover. Most systems use **semi-synchronous** — one sync follower for durability, the rest async so a slow node cannot freeze writes.
:::`,
  },
  {
    id: 'sd-db-replication-lag',
    question: 'What is replication lag, and how does it cause stale reads?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['replication-lag', 'stale-reads', 'read-your-writes'],
    answer: `**Replication lag** is the delay between a write committing on the leader and reaching an async follower. It is not a bug — it is physics, and it *grows under load*.

The classic failure: a user writes to the leader, then immediately reads from a **lagging follower** and sees old data — even their own change appears to vanish.

\`\`\`text
UPDATE name='Ada' -> Leader (OK)
   ...async in flight...
SELECT name -> Follower -> 'Alice'   (STALE!)
\`\`\`

**Fix: read-your-writes consistency** — after a write, route that user's reads to the leader (or to a replica confirmed to have caught up) for a short window.

:::gotcha
Never assume a read replica is current. Design for staleness explicitly.
:::`,
  },
  {
    id: 'sd-db-failover-risks',
    question: 'What can go wrong during database failover?',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['failover', 'split-brain', 'consensus'],
    answer: `Failover promotes a follower to leader when the leader dies — the riskiest moment in a replicated system. Three classic failure modes:

- **Lost writes** — with async replication, writes the old leader had but never shipped are gone once a different follower is promoted.
- **Split-brain** — the old leader returns and *also* thinks it is leader; two nodes accept conflicting writes. **Fencing (STONITH)** prevents this.
- **Bad timeouts** — too short → needless failovers on a network blip; too long → extended downtime.

:::senior
Automatic failover is a **consensus problem**: reliable failure detection (dead vs. slow?), an election that cannot pick two winners, and fencing of the deposed leader. This is why systems lean on Raft/Paxos or a coordinator (ZooKeeper, etcd) instead of hand-rolling it.
:::`,
  },
  {
    id: 'sd-db-sharding-vs-replication',
    question: 'How does sharding differ from replication, and when do you need it?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['sharding', 'partitioning', 'replication'],
    answer: `- **Replication** = full **copies** of the dataset on multiple nodes → scales reads and availability.
- **Sharding** (horizontal partitioning) = splits the dataset into **disjoint pieces** across nodes → scales **writes and total storage**.

You need sharding when the write throughput or the data volume outgrows a single machine — replication cannot help there, since every write still hits the one leader.

:::note
They are **complementary**. Production topology is usually *both*: each shard is its own replicated leader-follower group. Sharding scales writes/storage; replication gives each shard availability.
:::

Sharding is expensive and hard to reverse, so exhaust **vertical scaling, read replicas, and caching first**.`,
  },
  {
    id: 'sd-db-shard-key',
    question: 'What makes a good shard key, and what happens with a bad one?',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['shard-key', 'hotspots', 'scatter-gather'],
    answer: `A good shard key has two properties:

1. **High cardinality + even distribution** — load spreads across shards.
2. **Aligns with query patterns** — most queries hit **one** shard, not all.

Bad keys fail in two ways:

- **Hotspots** — a low-cardinality or skewed key (e.g. \`country\`, or a monotonically increasing \`timestamp\`) piles load onto one shard while others idle.
- **Scatter-gather** — queries that do not include the shard key must fan out to *every* shard and merge results — slow and complex.

\`\`\`text
spreads evenly?  --no--> hotspot
       |yes
query has key?   --no--> scatter-gather
       |yes
    good shard key
\`\`\`

:::senior
Choosing the shard key is a near one-way door on a live dataset. Prefer high-cardinality keys like \`user_id\`; add a hash/prefix to spread naturally hot keys.
:::`,
  },
  {
    id: 'sd-db-resharding-consistent-hashing',
    question: 'Why is `hash(key) % N` bad for resharding, and what solves it?',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['resharding', 'consistent-hashing', 'partitioning'],
    answer: `**Modulo hashing** ties a key's placement to the shard count \`N\`. Change \`N\` and almost every key remaps:

\`\`\`text
N=4 -> key 'x' on shard 2
N=5 -> key 'x' on shard 0   (moved!)
4 -> 5 shards remaps ~80% of keys
\`\`\`

That forces a near-total data migration every time you add a node.

**Consistent hashing** fixes it: place shards and keys on a hash ring; a key belongs to the next shard clockwise. Adding a shard only moves the keys in **one arc** — about \`1/N\` of keys. **Virtual nodes** smooth out uneven distribution. Used by Cassandra, DynamoDB, and many caches.`,
  },
  {
    id: 'sd-db-cap-pacelc',
    question: 'Explain the CAP theorem and how PACELC refines it.',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['cap-theorem', 'pacelc', 'consistency', 'availability'],
    answer: `**CAP** — Consistency, Availability, Partition tolerance. Since network **partitions are inevitable**, P is not optional. So *during a partition* you must choose:

- **CP** — refuse/block to stay consistent (HBase, etcd, ZooKeeper).
- **AP** — answer with possibly-stale data to stay available (Cassandra, DynamoDB).

:::gotcha
CAP is **not** "pick 2 of 3" permanently. When the network is healthy you get both C and A. The choice only bites *during* a partition.
:::

**PACELC** completes the picture: *if Partition (P) → trade A vs C; Else (E) → trade Latency (L) vs C*. The insight: **strong consistency costs latency even on a healthy network**, because nodes must coordinate before answering. That is why eventually-consistent stores feel fast — they skip coordination.`,
  },
  {
    id: 'sd-db-consistency-models-quorum',
    question: 'Walk through the consistency models and how quorums (W + R > N) work.',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['consistency', 'quorum', 'eventual-consistency', 'read-your-writes'],
    answer: `Consistency is a **spectrum**, strongest (slowest) to weakest (fastest):

| Model | Guarantee | Example |
|--|--|--|
| **Strong / linearizable** | Every read sees the latest write | Spanner, etcd |
| **Read-your-writes** | You always see *your own* writes | Session guarantees |
| **Quorum** | Overlapping read/write sets ensure freshness | Cassandra, DynamoDB |
| **Eventual** | Replicas converge if writes stop | DNS, S3 |

**Quorums** tune this in leaderless stores with three numbers: **N** replicas, **W** write acks, **R** read contacts. The rule:

\`\`\`text
W + R > N  ->  read & write sets overlap  ->  read sees latest write
N=3, W=2, R=2  -> 4 > 3   (strong-ish)
N=3, W=1, R=1  -> 2 <= 3  (eventual, fastest)
\`\`\`

:::senior
There is no universally correct level — pick it **per operation**. Choose the *weakest* model that still meets the business requirement, since every step toward strong consistency costs latency and availability.
:::`,
  },
  {
    id: 'sd-db-acid',
    question: 'What does ACID mean?',
    difficulty: 'Easy',
    category: 'Databases',
    tags: ['acid', 'transactions', 'relational'],
    answer: `The four guarantees of a relational transaction:

- **Atomicity** — all-or-nothing; the transaction fully commits or fully rolls back, with no partial writes.
- **Consistency** — a transaction moves the DB from one valid state to another, respecting constraints and invariants.
- **Isolation** — concurrent transactions don't see each other's uncommitted state; the result is *as if* they ran serially (tunable by isolation level).
- **Durability** — once committed, the write survives a crash (via the write-ahead log).

:::gotcha
The **C in ACID** (constraint consistency) is **unrelated** to the **C in CAP** (replica consistency) — a classic interview mix-up. And ACID isolation isn't free or absolute: most databases default to a **weaker** level (Read Committed) than serializable, so concurrency anomalies can still occur.
:::`,
  },
  {
    id: 'sd-db-acid-vs-base',
    question: 'Contrast ACID and BASE.',
    difficulty: 'Easy',
    category: 'Databases',
    tags: ['acid', 'base', 'consistency', 'nosql'],
    answer: `Two philosophies at opposite ends of the consistency/availability trade-off.

| | **ACID** (relational) | **BASE** (many NoSQL) |
|--|--|--|
| **Priority** | Correctness | Availability + scale |
| **Stands for** | Atomic, Consistent, Isolated, Durable | Basically Available, Soft state, Eventually consistent |
| **Consistency** | Strong (coordinated) | Eventual (converges later) |
| **Scaling** | Harder horizontally | Easy horizontally |
| **CAP lean** | CP | AP |

**ACID** buys strong consistency at the cost of coordination; **BASE** accepts temporary inconsistency to stay highly available and scale out.

:::senior
It's a **spectrum**, and the choice is **per-operation**: ACID for money/inventory/orders where a wrong answer is unacceptable, BASE for feeds/likes/analytics where seconds of staleness is fine. Many systems are **polyglot** — an ACID Postgres for transactions plus a BASE store for high-volume denormalized reads.
:::`,
  },
  {
    id: 'sd-db-btree-vs-lsm',
    question: 'Compare B-tree and LSM-tree storage engines. Which favors reads vs writes?',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['b-tree', 'lsm-tree', 'storage-engine'],
    answer: `Two storage-engine families with opposite optimization points:

| | **B-tree** | **LSM-tree** |
|--|--|--|
| **Used by** | Postgres, MySQL/InnoDB | Cassandra, RocksDB, LevelDB, Bigtable |
| **Writes** | **In place** in a balanced on-disk tree → random I/O + WAL | Buffer in an in-memory **memtable**, flush sorted **SSTables** sequentially |
| **Reads** | Fast: O(log n), few seeks | May check multiple SSTables (mitigated by **Bloom filters**) |
| **Background** | — | **Compaction** merges SSTables (extra I/O + write amp) |
| **Optimized for** | **Reads** | **Writes** |

:::senior
Write-heavy workloads — time-series, logs, event ingest, high-ingest KV — favor **LSM**; read-heavy workloads with range/point queries and updates favor **B-tree**. Fundamentally it's a **read-amplification (LSM) vs write-amplification (B-tree)** trade: LSM makes writes sequential at the cost of reads touching many files.
:::`,
  },
  {
    id: 'sd-db-indexing',
    question: 'How does a database index speed up queries, and when does it hurt?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['index', 'b-tree-index', 'query-performance'],
    answer: `An index (usually a **B-tree**) is a sorted auxiliary structure mapping **column value → row location**, turning a full-table **scan O(n)** into a **seek O(log n)**. It also serves range scans and \`ORDER BY\` cheaply, because the entries are kept in sorted order.

The costs:

- **Slower writes** — every \`INSERT\`/\`UPDATE\`/\`DELETE\` must update **every** index on the table.
- **Storage** — each index is extra on-disk data.
- **Ignored when unselective** — the optimizer skips a low-cardinality index and scans instead.

A **covering index** includes all columns a query needs, so it never touches the table. In a **composite** index, column order matters (the leftmost-prefix rule).

:::gotcha
Indexes aren't free wins: **over-indexing cripples write throughput**, and low-cardinality columns (boolean, status) barely help. Index the columns in the \`WHERE\`/\`JOIN\`/\`ORDER BY\` of your **hot** queries, verify with \`EXPLAIN\`, and drop the unused ones.
:::`,
  },
  {
    id: 'sd-db-leader-topologies',
    question: 'Compare single-leader, multi-leader, and leaderless replication.',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['replication', 'multi-leader', 'leaderless', 'conflicts'],
    answer: `Three ways to decide **who accepts writes**:

| | **Single-leader** | **Multi-leader** | **Leaderless** |
|--|--|--|--|
| **Writes** | One leader → followers | Several leaders (e.g. per region) | Any replica |
| **Examples** | Postgres, MySQL | Multi-region deployments | Dynamo, Cassandra |
| **Conflicts** | None (one writer) | **Yes** — concurrent same-key writes | **Yes** — reconciled at read |
| **Convergence** | — | LWW / CRDTs / app merge | Quorums (W+R>N), read-repair, anti-entropy |
| **Trade-off** | Simple; leader is a bottleneck + failover point | Write locality; conflict resolution | High availability, no failover; you tune consistency (vector clocks) |

:::senior
The axis is **write availability vs conflict complexity**. Single-leader avoids conflicts by funneling all writes through one node; multi-leader and leaderless gain availability and locality but **inherit conflict resolution as your problem**. Most apps are single-leader — go multi/leaderless only for multi-region write locality or extreme availability.
:::`,
  },
  {
    id: 'sd-db-cdc-outbox',
    question: 'How do you reliably update a database and publish an event without a dual-write bug?',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['cdc', 'outbox', 'dual-write', 'kafka'],
    answer: `The **dual-write problem**: writing to the DB and then publishing to Kafka are **two non-atomic operations** — a crash in between loses the event (or publishes one for a rolled-back write), causing permanent drift. Two reliable fixes:

1. **Transactional outbox** — in the **same DB transaction** as your business write, insert the event into an \`outbox\` table. A separate relay/poller reads the outbox and publishes to the broker, marking rows sent (at-least-once → needs **idempotent consumers**).
2. **CDC (Change Data Capture)** — tail the DB's write-ahead log with **Debezium** and stream committed changes to Kafka. No application change, and it's exact to the commit.

:::senior
Never publish to a broker in your request path **hoping both succeed**. Make the event **part of the DB commit** (outbox) or **derive it from the log** (CDC) — one ordered source of truth. This is exactly how you keep a search index, cache, or downstream service in sync with the system of record.
:::`,
  },
  {
    id: 'sd-db-normalization',
    question: 'What is normalization, and when would you deliberately denormalize?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['normalization', 'denormalization', 'schema'],
    answer: `**Normalization** structures data to eliminate redundancy — each fact stored **once**, related by keys (3NF: nothing duplicated or derivable). Benefits: no **update anomalies** (change a fact in one place), smaller storage, integrity. The cost: reads need **joins**.

**Denormalization** deliberately duplicates or pre-joins data to make a hot read a single lookup — store \`author_name\` on each post, keep a rollup count — or is **forced** in NoSQL stores that have **no joins**.

| | Normalized | Denormalized |
|--|--|--|
| **Redundancy** | None | Intentional copies |
| **Reads** | Joins | Single lookup |
| **Writes** | Update once | Update every copy |

:::senior
"**Normalize until it hurts, denormalize until it works**": start normalized for correctness by default, then denormalize the specific **proven-hot** read path — keeping the normalized data as source of truth and updating copies via events. NoSQL forces denormalization: you model a table **per query**, accepting the duplicated data.
:::`,
  },
  {
    id: 'sd-db-isolation-levels',
    question: 'Walk through SQL isolation levels and the anomalies they prevent.',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['isolation', 'transactions', 'anomalies', 'serializable'],
    answer: `Isolation levels trade **correctness for concurrency**, allowing more anomalies as they weaken:

| Level | Prevents | Still allows |
|--|--|--|
| **Read Uncommitted** | — | Dirty reads (seeing uncommitted data) |
| **Read Committed** (Postgres default) | Dirty reads | Non-repeatable reads (a row changes between two reads) |
| **Repeatable Read** | Non-repeatable reads | Phantom reads (new rows match a range) |
| **Serializable** | **All** anomalies (incl. write skew) | — (at the cost of aborts/locks) |

Postgres's Repeatable Read is implemented with **snapshot isolation**, which blocks most phantoms too.

:::gotcha
Most databases default to **Read Committed, not Serializable**, so "ACID" does **not** mean anomaly-free — you can still get **lost updates** and **write skew**. Use \`SELECT ... FOR UPDATE\` or bump to Serializable for invariant-critical transactions like balances and inventory.
:::`,
  },
  {
    id: 'sd-db-optimistic-vs-pessimistic',
    question: 'Optimistic vs pessimistic locking — when do you use each?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['locking', 'optimistic', 'pessimistic', 'concurrency'],
    answer: `Both prevent **lost updates** when two transactions edit the same row concurrently.

- **Pessimistic** — **lock the row before editing** (\`SELECT ... FOR UPDATE\`); others block until you commit. Safe under high contention, but holds locks → reduced concurrency, deadlock risk, and a poor fit for stateless HTTP.
- **Optimistic** — **don't lock**; read a version/timestamp and write with \`UPDATE ... WHERE version = :read_version\`. If **0 rows** are updated, someone else changed it → **retry**. No locks held; ideal for low-contention web apps, but wasteful retries under high contention.

| | Optimistic | Pessimistic |
|--|--|--|
| **Locks** | None (version check) | Row lock held |
| **Best contention** | Low | High |
| **Failure mode** | Retry on conflict | Blocking / deadlock |

:::senior
**Optimistic** (a version column / compare-and-swap) is the default for request/response flows and low-conflict data. Use **pessimistic** for short, hot, high-contention critical sections — inventory decrement, seat booking — where retry storms would be worse than brief blocking.
:::`,
  },
  {
    id: 'sd-db-deadlocks',
    question: 'What causes a database deadlock and how do you prevent it?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['deadlock', 'locking', 'concurrency'],
    answer: `A **deadlock** is a cycle of waits: transaction A holds lock 1 and wants lock 2, while B holds lock 2 and wants lock 1 — neither can proceed. The database **detects** the cycle and **aborts a victim** with an error; the application must **retry** it.

\`\`\`text
A: lock(row 1) ... wants row 2
B: lock(row 2) ... wants row 1   -> cycle -> DB kills one
\`\`\`

Prevention:

1. **Consistent global lock order** — always lock rows by ascending id, so no cycle can form.
2. **Keep transactions short**, touching fewer rows.
3. **Lower isolation** where it's safe.
4. **Optimistic concurrency** to avoid holding locks at all.

:::gotcha
Deadlocks are **expected** under concurrency, not a bug to fully eliminate — always wrap write transactions in **retry-on-deadlock** logic. The most common real cause is two code paths updating the **same rows in different orders**; enforce a canonical lock ordering to kill it.
:::`,
  },
  {
    id: 'sd-db-primary-key-choice',
    question: 'Auto-increment vs UUID vs Snowflake as a primary key — what are the trade-offs?',
    difficulty: 'Medium',
    category: 'Databases',
    tags: ['primary-key', 'uuid', 'snowflake', 'index-locality'],
    answer: `The choice trades **index locality vs decentralized generation vs opacity**:

| | **Auto-increment** | **UUIDv4 (random)** | **Snowflake / UUIDv7** |
|--|--|--|--|
| **Size** | 8 bytes | 16 bytes | 8–16 bytes |
| **Uniqueness** | Central counter | Global, generate anywhere | Global, distributed |
| **Order** | Sequential | Random | Time-sortable |
| **B-tree inserts** | Great (appends) | **Bad** (page splits, fragmentation) | Great (near-append) |
| **Guessable** | Yes (leaks volume) | No | No |

Random **UUIDv4** destroys insert locality because each new key lands anywhere in the index; **Snowflake/UUIDv7** are time-ordered, so they're unique *and* roughly sortable — restoring locality while staying unguessable.

:::senior
For a sharded/distributed system prefer a **time-sortable distributed id** (Snowflake, ULID, UUIDv7): decentralized generation **without** wrecking B-tree write locality the way random UUIDv4 does. And never expose raw **auto-increment** ids externally — they leak your volume and are trivially enumerable.
:::`,
  },
  {
    id: 'sd-db-wal',
    question: 'What is a write-ahead log and why is it central to a database?',
    difficulty: 'Hard',
    category: 'Databases',
    tags: ['wal', 'durability', 'write-ahead-log', 'replication'],
    answer: `The **WAL (write-ahead log)** is an **append-only log of every change**, flushed to disk **before** the change is applied to the data pages. It delivers **Durability** cheaply: a **sequential fsync** of the log (fast) makes a commit durable, even though the random data-page writes happen later and async. On crash, the DB **replays** the WAL to redo committed transactions and roll back incomplete ones.

The same log powers much more:

- **Replication** — ship WAL records to followers (Postgres streaming replication).
- **Point-in-time recovery** — replay the log up to any chosen moment.
- **CDC** — Debezium reads the WAL to stream changes downstream.

:::senior
The WAL turns **slow random writes into one fast sequential append** plus a lazy page flush — that's *why* commits are cheap. It's also the **unifying primitive**: durability, crash recovery, replication, and CDC are all just "read/ship the log." LSM-trees and Kafka are built on the exact same log-centric idea.
:::`,
  },
  {
    id: 'sd-db-oltp-vs-olap',
    question: 'What is the difference between OLTP and OLAP, and why keep them separate?',
    difficulty: 'Easy',
    category: 'Databases',
    tags: ['oltp', 'olap', 'data-warehouse', 'columnar'],
    answer: `Two workloads with opposite shapes:

| | **OLTP** | **OLAP** |
|--|--|--|
| **Full name** | Online Transaction Processing | Online Analytical Processing |
| **Queries** | Many small, fast reads/writes | Few huge aggregating scans |
| **Data** | Current, operational | Historical |
| **Store** | **Row**-oriented (Postgres, MySQL) | **Column**-oriented (Snowflake, BigQuery, Redshift) |
| **Indexed for** | Point lookups | Column scans / compression |

Data flows **OLTP → (ETL/CDC) → warehouse**. Keep them separate so heavy analytics scans don't starve the transactional workload.

:::key
Don't run analytics on your production OLTP database — one big aggregation can lock or saturate it and hurt live users. Replicate to a **columnar warehouse** built for scans. Rule of thumb: **row store = OLTP point ops; column store = OLAP aggregations**.
:::`,
  },
];

export default questions;
