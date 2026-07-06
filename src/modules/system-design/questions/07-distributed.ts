import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-dist-consensus-why-hard',
    question: 'Why is reaching consensus across machines fundamentally hard?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['consensus', 'flp', 'failure-detection'],
    answer: `In one process, "agree on X" is an assignment. Across a network it fights three problems at once:

- **Crashes** — a node with the answer can die before sharing it.
- **Message loss/delay** — you cannot distinguish a *slow* node from a *dead* one, so no timeout is provably correct.
- **Split brain** — a network partition can leave two halves each believing they are in charge.

:::key
The **FLP impossibility** result proves that in a fully asynchronous network with even one crash, no algorithm can *guarantee* consensus in bounded time. Real systems dodge this with **timeouts** (a failure detector): they terminate *almost always* and are *always* correct. Safety is never sacrificed — only liveness is best-effort.
:::`,
  },
  {
    id: 'sd-dist-raft-leader-election',
    question: 'How does Raft elect a leader, and why can there never be two leaders in one term?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['raft', 'consensus', 'leader-election'],
    answer: `Time is divided into **terms**, each with at most one leader. A follower that stops receiving heartbeats becomes a **candidate**, increments the term, votes for itself, and requests votes from the others.

- A node grants **exactly one vote per term**.
- A candidate becomes leader only on a **majority** of votes.

Because each node votes once and a majority is required, **two candidates cannot both reach a majority in the same term** — that would need some node to vote twice. That single rule prevents split brain.

:::note
Election timeouts are **randomized** (e.g. 150–300 ms) so nodes rarely time out together, which avoids repeated split votes — one candidate usually asks first and wins.
:::`,
  },
  {
    id: 'sd-dist-quorum-wrn',
    question: 'Explain the quorum rule W + R > N. What does it guarantee and what does it not?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['quorum', 'consistency', 'replication'],
    answer: `With \`N\` replicas, a write waits for \`W\` acks and a read consults \`R\` replicas. If **W + R > N**, every read set overlaps every write set in **at least one** node, so a read is guaranteed to see the latest acknowledged write.

| Config (N=3) | W | R | Result |
|---|---|---|---|
| Strong | 2 | 2 | W+R=4 > 3 → consistent |
| Fast/loose | 1 | 1 | 2 < 3 → may read stale |

:::gotcha
Overlap gives **read-your-writes consistency**, not full linearizability — concurrent writes still conflict and need resolution (last-writer-wins by timestamp, or version vectors). Also, choosing \`W = N\` means a single node failure blocks all writes: quorums trade availability for consistency.
:::`,
  },
  {
    id: 'sd-dist-2pc-blocking',
    question: 'What is two-phase commit and what is its fatal weakness?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['2pc', 'transactions', 'atomicity'],
    answer: `A **coordinator** drives participants through two rounds:

1. **Prepare** — each participant locks its rows and votes *yes* only if certain it can commit.
2. **Commit/abort** — if **all** voted yes, commit everywhere; any single *no* aborts everywhere.

It delivers true atomicity and is common inside a datacenter (XA). The fatal flaw:

:::gotcha
**2PC is blocking.** Between voting yes and hearing the decision, a participant holds its **locks**. If the **coordinator crashes** after prepare but before the decision, participants are stuck **in doubt** — they cannot commit or abort until it recovers. The coordinator is a single point of failure and one slow node stalls everyone.
:::`,
  },
  {
    id: 'sd-dist-saga-compensation',
    question: 'What is the Saga pattern, and how does it "roll back" a partially completed transaction?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['saga', 'transactions', 'microservices', 'compensation'],
    answer: `A **Saga** replaces a global transaction with a **sequence of local transactions**, each committing immediately in its own service. There is no rollback — if a later step fails, the saga runs **compensating transactions** that *semantically undo* the completed steps (refund the charge, release the reservation), in reverse order.

Example: create order → charge card → reserve stock **fails** → compensate: refund card → cancel order. Net effect: no money kept, no stock held.

:::warning
A Saga has **no isolation** — intermediate states (a \`PENDING\` order) are visible to other transactions. Counter it with **semantic locks** (a status other flows respect) and make every step **idempotent** so retries are safe.
:::`,
  },
  {
    id: 'sd-dist-saga-choreo-vs-orch',
    question: 'Choreography vs orchestration for a Saga — what is the difference and when do you pick each?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['saga', 'choreography', 'orchestration', 'events'],
    answer: `Both coordinate a saga; they differ in **who decides the next step**:

- **Choreography** — no central brain. Each service emits **events**; others react (\`OrderCreated\` → Payments charges → emits \`PaymentCompleted\` → Inventory reserves). Decoupled and no single point of failure, but the end-to-end flow is hard to see and debug. Best for **simple** sagas (2–4 steps).
- **Orchestration** — a central **orchestrator** explicitly calls each step and fires compensations on failure. Flow is explicit, easy to monitor and test, but the orchestrator is extra infrastructure and a coupling hotspot. Best for **complex** sagas with branching.

:::key
Rule of thumb: choreography for short flows, orchestration once the step count or branching makes the implicit event chain hard to follow.
:::`,
  },
  {
    id: 'sd-dist-idempotency-key',
    question: 'A client retries a payment because the response was lost. How do you prevent a double charge?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['idempotency', 'retries', 'payments'],
    answer: `Use an **idempotency key**. The client generates a unique key (UUID) and sends it with the request. The server records the key alongside the *result* of the first attempt; any later request with the **same key** returns the **stored result** instead of re-executing.

So even if the client retries because the original 200 was lost in the network, the card is charged **once**.

:::gotcha
**Store the key and perform the effect atomically.** If you charge the card and then crash before saving the key, the retry re-charges. Wrap "record key + do effect" in one transaction, or write the key as \`PENDING\` first and flip to \`DONE\` on commit so a concurrent retry waits rather than double-executing.
:::`,
  },
  {
    id: 'sd-dist-exactly-once-myth',
    question: 'A stakeholder demands "exactly-once" message delivery. How do you respond?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['exactly-once', 'at-least-once', 'deduplication'],
    answer: `Exactly-once **delivery** is not achievable over an unreliable network — you can't distinguish a lost message from a lost ack, so you must either risk dropping (at-most-once) or risk duplicating (at-least-once).

The practical answer is **at-least-once delivery + idempotent processing** = exactly-once **effect**:

- Retry until acked, so nothing is lost.
- Dedup on the consumer using a message ID / idempotency key (a dedup store with a TTL, a unique DB constraint, or per-producer sequence numbers).

:::senior
Distinguishing **delivery** from **effect** is the whole insight. "Kafka exactly-once" is producer IDs + sequence numbers doing dedup — not magic. The business only cares that the effect happens once.
:::`,
  },
  {
    id: 'sd-dist-modulo-vs-ring',
    question: 'Why not shard keys with hash(key) % N, and what does consistent hashing do instead?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['consistent-hashing', 'sharding', 'hash-ring'],
    answer: `With \`hash(key) % N\`, changing \`N\` by one changes the modulus, so **nearly every key** (about (N-1)/N of them) maps to a different node — a rehash storm and mass cache misses.

**Consistent hashing** maps both keys and nodes onto a circular space and assigns each key to the **first node clockwise**. Adding or removing a node only reassigns the keys in the **one arc** next to it — about **1/N** of keys move, not all of them.

:::key
The whole win: a membership change costs ~1/N of the keys instead of ~all of them. Used by Dynamo, Cassandra, CDNs, and load balancers.
:::`,
  },
  {
    id: 'sd-dist-virtual-nodes',
    question: 'What problem do virtual nodes solve in consistent hashing?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['consistent-hashing', 'virtual-nodes', 'load-balancing'],
    answer: `With few real nodes, their random ring positions create **uneven arcs** — one node may own a huge share and become a hotspot. And when a node dies, its **entire** load falls on the single next node.

**Virtual nodes** hash each physical node onto the ring under many labels (\`A#1 … A#150\`), so each server owns **many small arcs** scattered around the ring:

- Load evens out (law of large numbers).
- A departing node's traffic spreads across **many** nodes, not one neighbor.
- Heterogeneous hardware: give a bigger box **more** vnodes for a larger share.

Real systems use **100–256 vnodes per physical node** (Dynamo, Cassandra).`,
  },
  {
    id: 'sd-dist-clock-skew',
    question: 'Why should you never order distributed events by wall-clock timestamp?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['clocks', 'clock-skew', 'ordering'],
    answer: `Every server's clock drifts, and even with **NTP** two machines can disagree by tens to hundreds of milliseconds — NTP can even step a clock *backwards*. So a causally **later** write can carry an **earlier** timestamp.

Under last-writer-wins by timestamp, that means the **newest data is silently discarded**. Wall-clock time is fine for *display* but unsafe for *ordering*.

:::note
Google **Spanner** works around this with **TrueTime** (GPS + atomic clocks) that exposes time as a bounded interval and *waits out* the uncertainty before committing — at the cost of special hardware. Most systems instead use **logical clocks**.
:::`,
  },
  {
    id: 'sd-dist-lamport-vs-vector',
    question: 'Lamport clocks vs vector clocks — what does each give you?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['lamport-clock', 'vector-clock', 'causality'],
    answer: `Both are **logical clocks** capturing causality (happens-before) rather than physical time.

- **Lamport clock** — one integer per process; on receive, \`counter = max(local, received) + 1\`. Guarantees *if A → B then L(A) < L(B)*, giving a **total order** consistent with causality. But the converse is false — a smaller counter does **not** prove causality, so it **cannot detect concurrency**.
- **Vector clock** — one integer **per process** (an array). Compare element-wise: if one vector dominates, that event happened first; if **neither dominates**, the events are **concurrent** — a genuine conflict.

:::senior
Use a **Lamport clock** when you just need *a* consistent order (e.g. a tie-break). Use a **vector clock** when you must detect concurrent writes and resolve conflicts instead of losing data to last-writer-wins (Dynamo returns both versions as siblings). Vector clocks cost more (grow with the number of processes) and need pruning at scale.
:::`,
  },
  {
    id: 'sd-dist-fallacies',
    question: 'What are the fallacies of distributed computing, and why do they matter?',
    difficulty: 'Easy',
    category: 'Distributed Systems',
    tags: ['fallacies', 'networking', 'design-principles'],
    answer: `The eight false assumptions engineers carry over when a monolith becomes distributed (Deutsch/Gosling at Sun):

1. The network is reliable. 2. Latency is zero. 3. Bandwidth is infinite. 4. The network is secure. 5. Topology doesn't change. 6. There is one administrator. 7. Transport cost is zero. 8. The network is homogeneous.

Each is a lie the network eventually exposes. Packets drop, so calls need timeouts, retries, and idempotency. Latency isn't zero — it's ~0.5 ms same-datacenter and **50–150 ms cross-region** — so you batch, cache, and colocate instead of chatting. Bandwidth is capped, so you compress and paginate.

:::key
Every fallacy maps to a defensive pattern. Assume the network **will** fail, be slow, and change: design for timeouts, backoff, idempotency, and failure detection rather than treating a remote call as if it were a local function.
:::`,
  },
  {
    id: 'sd-dist-raft-log-replication',
    question: 'Once a Raft leader is elected, how does it replicate the log and decide an entry is committed?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['raft', 'log-replication', 'consensus', 'commit'],
    answer: `The leader appends each client command to its log and sends \`AppendEntries\` RPCs to followers. An entry is **committed** once it is stored on a **majority** of nodes; the leader then applies it to its state machine and advances the commit index it shares with followers.

- Each entry carries the leader's **term** and an index. A follower rejects entries whose preceding \`(index, term)\` doesn't match, forcing the leader to back up and re-sync the divergent tail — so logs converge (the **Log Matching Property**).
- A leader only counts replicas to commit entries from its **own current term**; older-term entries commit *indirectly* once a current-term entry above them commits (the Figure-8 safeguard).

Majority = \`floor(N/2)+1\`, so a **5-node cluster tolerates 2 failures** and still commits.

:::senior
The commit rule (majority + current-term) is what keeps Raft safe across leader changes: a committed entry sits on a majority, and any future leader needs a majority's votes, so it necessarily already holds every committed entry.
:::`,
  },
  {
    id: 'sd-dist-paxos-vs-raft',
    question: 'How does Paxos relate to Raft, and why do most new systems pick Raft?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['paxos', 'raft', 'consensus'],
    answer: `Both solve the same problem — get a majority to agree on a sequence of values despite crashes — with the same core: a **majority quorum**, so any two quorums intersect. Basic Paxos agrees on a *single* value; Multi-Paxos chains it into a log. Raft is a reformulation designed for understandability: a strong single leader, an append-only log, and randomized election timeouts.

| | Paxos | Raft |
|--|--|--|
| Leader | optional / implicit | mandatory, explicit |
| Reputation | correct but famously hard | designed to be teachable |
| Used by | Chubby, Spanner | etcd, Consul, CockroachDB, TiKV |

:::note
Google's *"Paxos Made Live"* documents how much the paper omits — leader election, log compaction, membership changes. Raft folds those into its core spec, which is why it dominates new implementations even though the two are equivalent in power.
:::`,
  },
  {
    id: 'sd-dist-zookeeper-etcd',
    question: 'What do coordination services like ZooKeeper and etcd do, and when do you actually need one?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['zookeeper', 'etcd', 'coordination', 'consensus'],
    answer: `They are small, strongly-consistent (CP) key-value stores backed by consensus (**ZAB** for ZooKeeper, **Raft** for etcd) that provide the primitives distributed systems keep re-needing: **leader election, service discovery/config, distributed locks, and membership**. You store tiny *critical metadata*, never bulk application data.

Reach for one when exactly one node must hold a role, or all nodes must agree on one value:

- Kafka used ZooKeeper for controller election and broker membership; **Kubernetes stores all cluster state in etcd**; HBase/Hadoop lean on ZooKeeper.
- Killer features: **ephemeral nodes** (auto-deleted when a client's session dies → liveness and lock release) and **watches** (push notification on change).

:::gotcha
Keep it off the hot path. A 3- or 5-node ensemble does maybe **tens of thousands of writes/sec**, not hundreds of thousands — it's for coordination, not throughput. And run an **odd** number (3 or 5) so a majority quorum survives one or two failures.
:::`,
  },
  {
    id: 'sd-dist-distributed-lock-fencing',
    question: 'How do you implement a distributed lock with Redis, and why is a TTL not enough?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['distributed-lock', 'redis', 'fencing-token', 'redlock'],
    answer: `The basic lock is \`SET key <uuid> NX PX 30000\` — set **only if absent** (\`NX\`) with a **TTL** (\`PX\`) so a crashed holder doesn't deadlock forever. Release by checking the uuid matches, then deleting, in one atomic Lua script so you never delete someone else's lock.

The TTL creates the real danger: if holder **A** pauses (GC, slow disk) past the TTL, the lock expires, **B** acquires it, and now both believe they hold it → **two concurrent writers**.

:::senior
No timing tweak fixes this — the fix is a **fencing token**. The lock service hands out a monotonically increasing number with each grant; every write to the protected resource includes its token, and the resource **rejects any token lower than the highest it has seen**. A stale writer's token is smaller, so its write is refused. This is Kleppmann's core critique of **Redlock** (Redis's multi-node lock): even a quorum of Redis nodes can't stop a paused client from corrupting data without fencing. Locks give mutual exclusion for *efficiency*; **correctness needs fencing**.
:::`,
  },
  {
    id: 'sd-dist-split-brain-quorum',
    question: 'Why do clustered systems require a majority quorum and an odd number of nodes?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['split-brain', 'quorum', 'partition', 'availability'],
    answer: `A network partition can split a cluster into two groups that can't see each other. If each side acts independently, both may elect a leader and accept writes — **split-brain** — and the two histories diverge and corrupt.

A **majority quorum** prevents it: any action needs \`floor(N/2)+1\` nodes. Only one side of a partition can hold a majority, so the minority side **refuses to serve** (sacrifices availability) while the majority stays consistent. Two majorities can't coexist → at most one leader.

Odd \`N\` maximizes fault tolerance per node:

| N | Majority needed | Failures tolerated |
|--|--|--|
| 3 | 2 | 1 |
| 4 | 3 | 1 |
| 5 | 3 | 2 |

:::key
\`N=4\` tolerates the *same* one failure as \`N=3\` but costs an extra node and a larger quorum — so clusters use **odd counts (3 or 5)**. This is exactly why etcd, ZooKeeper, and Consul deploy as 3 or 5 nodes.
:::`,
  },
  {
    id: 'sd-dist-gossip',
    question: 'What is a gossip protocol and where is it used?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['gossip', 'epidemic', 'membership', 'failure-detection'],
    answer: `A decentralized way to spread information: each node periodically picks a few **random** peers and exchanges state. Like a rumor, an update reaches the whole cluster in **O(log N) rounds** with no coordinator — epidemic (anti-entropy) communication.

Why it scales: no node needs the full membership list or a central broker, and it degrades gracefully — losing a few nodes barely slows propagation. The costs are **eventual consistency** (several rounds to converge) and some redundant messages.

It powers cluster **membership and failure detection** in Cassandra, DynamoDB, Consul (SWIM/Serf), and Redis Cluster — nodes continuously gossip "who's alive" so the ring self-heals.

:::note
Convergence is ~\`log2(N)\` rounds: a **1,000-node** cluster converges in ~10 rounds, so state spreads in **seconds** even at large scale. That logarithmic fan-out is the whole appeal.
:::`,
  },
  {
    id: 'sd-dist-crdt',
    question: 'What is a CRDT and what problem does it solve that last-writer-wins cannot?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['crdt', 'conflict-resolution', 'eventual-consistency'],
    answer: `A **Conflict-free Replicated Data Type** is a structure whose concurrent updates on different replicas **always merge to the same result**, with no coordination and no lost updates. Convergence is *mathematically guaranteed* because the merge is commutative, associative, and idempotent (a join over a lattice).

The problem it fixes: **last-writer-wins** resolves a concurrent write by throwing one away — a real update silently vanishes. CRDTs **merge instead of discard**:

- **G-Counter** — per-node counts; merge = element-wise \`max\`, then sum → no lost increments.
- **OR-Set** — add/remove tagged with unique ids so a concurrent add + remove resolves deterministically.

Used by Riak, Redis (active-active), Automerge/Yjs (collaborative editors), and Figma.

:::senior
CRDTs buy **AP + strong eventual consistency**: replicas accept writes offline and always converge once they sync. The cost is metadata overhead (tombstones, version vectors) and that only *some* data types have a CRDT form — you can't make an arbitrary invariant like "balance ≥ 0" conflict-free.
:::`,
  },
  {
    id: 'sd-dist-bloom-filter',
    question: 'What is a Bloom filter and where would you use one?',
    difficulty: 'Easy',
    category: 'Distributed Systems',
    tags: ['bloom-filter', 'probabilistic', 'membership'],
    answer: `A Bloom filter is a compact, **probabilistic set-membership** structure. It answers "is X in the set?" with either **definitely not** or **maybe yes** — false positives are possible, **false negatives never**. It's a bit array plus \`k\` hash functions: to add, set the \`k\` bits; to test, check all \`k\` bits are set.

Its value is memory: ~**10 bits per element** for a 1% false-positive rate, versus storing the keys themselves. You accept a small false-positive rate to skip an expensive lookup.

Classic use — **skip disk reads**: Cassandra, HBase, and RocksDB keep a Bloom filter per SSTable, so a read for a key that isn't there avoids touching the file. Also "have we crawled this URL?" and CDN cache checks.

:::gotcha
You can't **delete** from a standard Bloom filter (clearing a bit might unset it for another element) and it can't enumerate members. Use a **Counting Bloom filter** when you need removals.
:::`,
  },
  {
    id: 'sd-dist-sketches',
    question: 'How do HyperLogLog and Count-Min Sketch let you answer "how many?" with tiny memory?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['hyperloglog', 'count-min-sketch', 'probabilistic', 'streaming'],
    answer: `Both are **probabilistic sketches** that trade exactness for near-constant memory on massive streams:

- **HyperLogLog** — estimates **cardinality** (count of *distinct* items). It watches the longest run of leading zeros in item hashes; more distinct items make long runs likelier. Redis's \`PFADD\`/\`PFCOUNT\` counts uniques into the **billions using ~12 KB** at ~0.8% error — versus a hash set that would need gigabytes. Ideal for "unique visitors."
- **Count-Min Sketch** — estimates the **frequency** of an item. A small 2-D array of counters indexed by several hashes; a query takes the **min** counter to reduce collision inflation. Used for heavy-hitters / top-k and per-key rate stats.

:::key
The pattern: on unbounded streams an *exact* count needs memory proportional to distinct items, but a sketch gives a **bounded-error estimate in fixed, tiny memory**. HLL for distinct-count, Count-Min for per-key frequency.
:::`,
  },
  {
    id: 'sd-dist-merkle-trees',
    question: 'How do Merkle trees let two replicas find their differences efficiently?',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    tags: ['merkle-tree', 'anti-entropy', 'replication', 'hashing'],
    answer: `A Merkle tree is a **hash tree**: leaves are hashes of data blocks (or key ranges), each parent is the hash of its children, up to a single **root hash**. If two replicas' root hashes match, their whole datasets are identical — **one comparison**. If the roots differ, you descend only the subtrees whose hashes differ, pinpointing the divergent blocks in **O(log N)** comparisons transferring **O(log N)** hashes — instead of shipping and comparing all the data.

This drives **anti-entropy repair**: Dynamo and Cassandra exchange Merkle trees per key-range to reconcile replicas after failures with minimal network. Git commits, blockchain blocks, and IPFS use the same structure for tamper-evident verification.

:::senior
The win is **bandwidth**: reconciling two 1 TB replicas that differ in one row transfers a handful of hashes down a single path, not a terabyte. The trade-off is keeping the tree current, and that a skewed key distribution makes ranges uneven.
:::`,
  },
  {
    id: 'sd-dist-unique-id-snowflake',
    question: 'How do you generate unique IDs across many servers without a central bottleneck?',
    difficulty: 'Medium',
    category: 'Distributed Systems',
    tags: ['id-generation', 'snowflake', 'uuid', 'sharding'],
    answer: `A single auto-increment column forces every insert through one coordinator — a scaling and availability bottleneck. The options:

- **Snowflake** (Twitter) — a **64-bit** ID packed as **41 bits millisecond timestamp + 10 bits machine id + 12 bits per-ms sequence**. Each node mints **~4,096 IDs/ms** locally with zero coordination, and IDs are roughly **time-sortable** (k-sorted) — great for index locality.
- **UUIDv4** — 122 random bits, generated anywhere with negligible collision odds, but random order wrecks B-tree locality (page splits). **UUIDv7** fixes this by prefixing a timestamp, restoring sortability.
- **Ticket server** — a dedicated DB hands out **ranges** (e.g. blocks of 1,000) so each app server allocates locally between refills.

:::gotcha
Snowflake depends on the **wall clock**. If NTP steps a node **backwards**, it can mint duplicate or out-of-order IDs, so real implementations **refuse to generate** until the clock catches back up.
:::`,
  },
];

export default questions;
