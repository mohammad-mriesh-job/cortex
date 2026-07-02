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
];

export default questions;
