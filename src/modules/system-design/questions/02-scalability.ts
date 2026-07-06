import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-scale-vertical-vs-horizontal',
    question: 'What is the difference between vertical and horizontal scaling, and what are the trade-offs?',
    difficulty: 'Easy',
    category: 'Scalability',
    tags: ['vertical scaling', 'horizontal scaling', 'trade-offs'],
    answer: `**Vertical (scale up)** = a bigger single machine (more CPU/RAM). **Horizontal (scale out)** = more machines behind a load balancer.

| | Vertical | Horizontal |
|--|--|--|
| Ceiling | Hard limit (biggest box) | Effectively unbounded |
| Cost | Super-linear near the top | Roughly linear (commodity HW) |
| Fault tolerance | Poor — single point of failure | Good — lose a node, others carry on |
| Complexity | Low, no app changes | Higher — needs LB + statelessness |

:::tip
Start vertical (fastest fix, no code change), but design for horizontal: keep app servers **stateless** so you can add nodes later.
:::

The senior point: large systems go horizontal as much for **availability** (surviving node loss) as for raw throughput.`,
  },
  {
    id: 'sd-scale-stateless-prerequisite',
    question: 'Why must a service be stateless before you can scale it horizontally?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['stateless', 'horizontal scaling', 'sessions'],
    answer: `Horizontal scaling assumes the load balancer can route a request to **any** node and get the same result. If a server keeps client state (e.g. a session) in **local memory**, a follow-up request routed to a different node finds nothing — the user gets logged out or errors.

Statelessness makes nodes **interchangeable and disposable**, which is also what enables autoscaling and rolling deploys.

Fixes:
- **Sticky sessions** — pin a client to its node. A band-aid: state still dies with the node, and load skews.
- **Externalized session store (Redis)** or a **signed token (JWT)** — the real fix; the compute tier holds no session state.`,
  },
  {
    id: 'sd-scale-l4-vs-l7',
    question: 'What is the difference between an L4 and an L7 load balancer?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['load balancing', 'L4', 'L7'],
    answer: `- **L4 (transport):** routes on IP + TCP/UDP port only. It balances **connections** without understanding them — very fast, low overhead.
- **L7 (application):** parses the full **HTTP** request, so it can route by URL path, host, or cookie, terminate TLS, do sticky cookies and compression — at a small CPU cost.

Use **L4** for raw throughput (e.g. TCP to a DB proxy); use **L7** for content-based routing across microservices (route \`/api/*\` vs \`/images/*\`). Modern web stacks lean L7 (NGINX, Envoy, ALB).`,
  },
  {
    id: 'sd-scale-lb-algorithms',
    question: 'Name the common load-balancing algorithms and when you would use each.',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['load balancing', 'round robin', 'least connections', 'consistent hashing'],
    answer: `| Algorithm | Picks | Best when |
|--|--|--|
| Round robin | Next server in order | Uniform backends, equal requests |
| Weighted RR | RR biased by capacity | Mixed instance sizes |
| Least connections | Fewest active connections | Long-lived / uneven durations |
| Least response time | Fewest conns + lowest latency | Latency-sensitive, heterogeneous |
| IP hash / consistent hashing | Hash client/key → server | Want the same client/key to stick to a node (cache affinity) |

**Consistent hashing** is the one to name: unlike \`hash mod N\` (which remaps almost every key when N changes), it only moves ~**1/N** of keys when a node is added or removed.`,
  },
  {
    id: 'sd-scale-lb-spof',
    question: 'A load balancer improves availability — but how do you stop it from becoming a single point of failure?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['load balancing', 'high availability', 'SPOF'],
    answer: `A single LB just **relocates** the single point of failure — if it dies, everything is down. Make it redundant:

- **Active–passive:** a standby LB holds a **floating IP**; a heartbeat protocol (VRRP / keepalived) fails the IP over if the active dies.
- **Active–active:** multiple LBs serve at once, fronted by **DNS round robin** or an **anycast VIP**, so there's no idle spare and no single choke point.

Pair this with **health checks** so the LB pulls dead *backends* out of rotation too — prefer a deep check (\`/healthz\` verifies DB/cache) over a shallow port check.`,
  },
  {
    id: 'sd-scale-sticky-sessions',
    question: 'What are sticky sessions, and why are they considered a band-aid rather than a real solution?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['sticky sessions', 'sessions', 'stateless'],
    answer: `**Sticky sessions (session affinity)** make the load balancer pin each client to the **same** backend (via a cookie or IP hash), so its in-memory session is always there.

Why it's a band-aid:
- **Load skews** — you can't freely rebalance traffic.
- **Node loss loses sessions** — if that server dies, its users are logged out.
- **Deploys/autoscaling get awkward** — you can't drain and move traffic freely.

It **hides** statefulness rather than removing it. The real fix is to externalize session state to a shared store (**Redis**) or use a stateless **signed token (JWT)**, keeping app servers interchangeable.`,
  },
  {
    id: 'sd-scale-read-replicas',
    question: 'How do read replicas help scale a database, and what problem do they introduce?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['database', 'read replicas', 'replication lag'],
    answer: `Writes go to a single **primary**, which replicates to N **read-only replicas**; reads spread across the replicas. This scales **read-heavy** workloads (often 10:1 or 100:1 reads:writes) and improves read locality.

It does **not** scale write throughput (all writes still hit the one primary) or total dataset size.

**The catch — replication lag.** Replication is usually asynchronous, so a replica can trail the primary by ms–seconds. This breaks **read-your-own-writes**: a user updates a value (primary) then reads a stale replica.

:::tip
Route reads that immediately follow a write to the **primary**, or use synchronous/semi-sync replication on those paths (at a latency cost).
:::`,
  },
  {
    id: 'sd-scale-sharding',
    question: 'What is database sharding, what does it solve, and what are its costs?',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['database', 'sharding', 'partitioning'],
    answer: `**Sharding** splits one logical dataset **horizontally** across independent DBs (shards), each holding a subset of rows. Now **writes and storage spread across many primaries** — solving write throughput and datasets too big for one node.

Strategies: **range** (hot-spot risk), **hash** (resharding moves everything — prefer consistent hashing), **directory** (lookup table = new dependency).

The costs:
- Choosing the **shard key** is a one-way door.
- **Cross-shard queries/joins** require fan-out + merge.
- **Transactions across shards** need distributed coordination.
- **Rebalancing** hot shards is operationally painful.

:::senior
Only shard when you must — it's the biggest complexity jump. Exhaust vertical scaling, caching, and read replicas first; shard when a single primary can no longer absorb the writes or hold the data.
:::`,
  },
  {
    id: 'sd-scale-functional-partitioning',
    question: 'What is functional partitioning, and how does it differ from sharding?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['database', 'functional partitioning', 'microservices'],
    answer: `**Functional partitioning** splits the data by **feature/domain** — each service gets its own database (users DB, orders DB, inventory DB). It's the database side of moving toward microservices.

- **Functional partitioning = a vertical split** (by table/domain). It isolates load and failure per domain and lets each store scale/tune independently.
- **Sharding = a horizontal split** (by rows within one dataset).

They're complementary. The cost of functional partitioning: you lose cross-domain joins and single-database transactions — the app (or a saga) now stitches data together across services.`,
  },
  {
    id: 'sd-scale-ordering-strategy',
    question: 'In what order should you apply scaling techniques to a growing system?',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['scalability', 'strategy', 'caching', 'sharding'],
    answer: `Go from cheapest/simplest to most complex:

| Reach for... | When |
|--|--|
| **Vertical scaling + caching** | First — no re-architecture, huge wins for read-heavy load |
| **Horizontal scale-out (stateless app tier + LB)** | Traffic exceeds one box; need availability |
| **Read replicas** | Read-heavy DB load; writes still fit one primary |
| **Functional partitioning** | Distinct domains with independent scaling needs |
| **Sharding** | A single primary can't hold the writes or the data — last, most complex |

:::key
The instinct interviewers want: **don't jump to sharding.** Prove the cheaper levers (cache, replicas, vertical) are exhausted first. And remember the app tier only scales out if it's **stateless**.
:::`,
  },
  {
    id: 'sd-scale-autoscaling',
    question: 'How does autoscaling work, and what are its common pitfalls?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['autoscaling', 'elasticity', 'cloud'],
    answer: `Autoscaling adds or removes instances based on a **metric** (CPU, req/s, queue depth) against a target, within **min/max** bounds. The pitfalls are where interviews go:

1. **Slow to react** — instances take **minutes** to boot and warm, so a sudden spike is under-served. Scale on a **leading** metric (queue depth, RPS), not a **lagging** one (CPU).
2. **Thrashing / flapping** — aggressive thresholds scale in and out repeatedly; fix with **cooldowns + hysteresis**.
3. **Scaling the wrong tier** — app servers autoscale easily, but the **DB** is usually the real bottleneck and doesn't.
4. **Scale-in killing in-flight work** — **drain** connections first.

:::gotcha
Autoscaling handles **gradual, diurnal** load — not instant spikes (flash sale, celebrity tweet). For those, **pre-provision** or **shed load**. Scaling out a stateful tier just moves the bottleneck to the shared DB.
:::`,
  },
  {
    id: 'sd-scale-hot-partition',
    question: 'One shard is red-hot while the others idle. What causes this and how do you fix it?',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['hot-partition', 'sharding', 'celebrity-problem', 'skew'],
    answer: `A **hot partition** comes from **skewed access** to one shard key: a celebrity user, a viral item, a **monotonically increasing key** (timestamp/auto-id all landing on the newest shard), or a low-cardinality key. That one shard **saturates** while the rest idle, capping throughput at a single node.

Fixes:
- **Salt / split the hot key** — append a suffix (\`user_id#0..N\`) to spread one key across N sub-partitions; scatter-gather on read.
- **Dedicated handling** — pull celebrities out (hybrid fan-out).
- **Better key** — hash instead of range for time-series; compound keys.
- **Cache** the hot item so reads never reach the shard.

:::senior
The shard key is a near **one-way door** — design it against your **actual** access distribution (Zipfian, not uniform). Caching absorbs **read** hotspots but **not write** hotspots; those need key splitting.
:::`,
  },
  {
    id: 'sd-scale-queue-load-leveling',
    question: 'How does putting a queue in front of a service help it scale?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['message-queue', 'load-leveling', 'spikes', 'decoupling'],
    answer: `A queue turns a **synchronous, spiky** path into an **asynchronous, smoothed** one — **load leveling**. Producers enqueue instantly; consumers drain at their own **sustainable rate**. A traffic spike fills the **buffer** instead of toppling the downstream — the queue absorbs a **10× burst** so the DB sees steady load.

You scale throughput by adding **competing consumers** (each message delivered to one worker), and you **decouple** producer and consumer deploy + scaling. A single Kafka partition sustains ~**tens of MB/s**.

:::gotcha
A queue smooths **bursts** but does **not** raise **sustained** capacity. If arrival rate > drain rate for long, the backlog grows **unbounded** (latency climbs) until you add consumers or shed load. Monitor **queue depth / consumer lag** — it's your earliest warning signal.
:::`,
  },
  {
    id: 'sd-scale-connection-pool',
    question: 'Why do database connections become a scaling bottleneck, and how do you fix it?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['connection-pool', 'database', 'pgbouncer'],
    answer: `Each Postgres connection is a **backend process** costing ~**5–10 MB** plus scheduler overhead, so Postgres tops out around a **few hundred** connections. With hundreds of stateless app servers each holding a pool, you **exhaust the connection limit** even when the DB isn't CPU-bound — new connections start erroring.

**Fix:** a connection **pooler** (**PgBouncer**, RDS Proxy) multiplexes **thousands** of client connections onto a **small** pool of real DB connections (transaction pooling). Also right-size per-app pools and keep transactions **short**.

:::gotcha
"Just raise \`max_connections\`" makes it **worse** — more processes mean more memory and context-switching. The fix is **fewer, shared, reused** connections via a pooler. Connections are a scarce resource to **pool**, not multiply.
:::`,
  },
  {
    id: 'sd-scale-cqrs',
    question: 'What is CQRS and when does it help you scale?',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['cqrs', 'read-model', 'write-model', 'scalability'],
    answer: `**CQRS** (Command Query Responsibility Segregation) splits the **write model** (commands) from the **read model(s)** (queries) into separate paths and stores. Writes go to a **normalized system-of-record** tuned for consistency; reads are served from **denormalized, precomputed** read models — a materialized view, a search index, a cache — each shaped for one specific query. They sync **asynchronously** (events/CDC), so read models are **eventually consistent**.

It helps when read and write loads **diverge sharply** (100:1) or one schema can't serve both a write-heavy transactional path and diverse reads. It pairs naturally with **event sourcing**.

:::gotcha
CQRS adds real complexity — two models, eventual consistency, a sync pipeline. Don't apply it **globally**; only to the specific **aggregate** whose read/write patterns truly diverge. Often a **read replica** or a **cache** is enough.
:::`,
  },
  {
    id: 'sd-scale-geo-distribution',
    question: 'How do you serve a global user base with low latency?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['multi-region', 'geo-routing', 'latency', 'cdn'],
    answer: `Put compute and data **near users**:

1. **CDN** for static/cacheable content at edge PoPs — an edge hit is **ms** versus a **50–150 ms** cross-region hop.
2. **GeoDNS / anycast** routes each user to the **nearest region**.
3. **Regional deployments** — app tier + read replicas per region, so reads are **local**; writes route to a **primary region** (or multi-master, at a consistency cost).
4. **Async replication** across regions (RPO of seconds).

:::senior
The hard part is **write locality and consistency**. Cross-region **synchronous** writes add 50–150 ms to **every** write, so most systems keep a **single write region** (or partition users by home region) and accept **async replication + eventual consistency**. Reads localize easily; writes force a **CAP/latency** decision.
:::`,
  },
  {
    id: 'sd-scale-reads-vs-writes-scaling',
    question: 'Why do you scale reads and writes with completely different techniques?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['read-scaling', 'write-scaling', 'strategy'],
    answer: `Because **reads are easy to copy; writes must be coordinated.**

| | Reads | Writes |
|--|--|--|
| Technique | **Replicate** — add copies | **Divide** — partition |
| Tools | Read replicas, caches (Redis ~**100k ops/s**), CDNs | Sharding, queues/batching, write-back caches |
| Catch | Small staleness | Every copy must receive every write, so replication alone can't scale writes — all writes still hit the one primary |

Establish the **read:write ratio** first: **read-heavy** (100:1, feeds) → cache + replicas; **write-heavy** (metrics, logs) → shard + queue + LSM-tree stores.

:::key
**Replication scales reads; partitioning scales writes.** The read:write ratio is the first number that decides the whole architecture.
:::`,
  },
  {
    id: 'sd-scale-batching',
    question: 'How does batching improve scalability, and what does it cost?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['batching', 'throughput', 'efficiency'],
    answer: `Batching **amortizes fixed per-operation overhead** — network round trips, syscalls, fsync, index updates — across many items, multiplying **throughput**. Examples: a bulk \`INSERT\` vs 1000 single inserts, Kafka producer batching, grouping N cache reads into one \`MGET\`/pipeline, coalescing writes in a write-back cache.

The cost is **latency**: each item waits for the batch to **fill** (or for a timeout to fire).

:::gotcha
Tune the batch by **both** a max size **and** a max-wait timeout, so a half-full batch still flushes — that bounds tail latency. Bigger isn't always better: too large risks memory pressure and, on failure, **reprocessing the whole batch**. Batching is the classic **latency-vs-throughput** lever.
:::`,
  },
  {
    id: 'sd-scale-denormalization',
    question: 'How does denormalization help you scale reads, and what\'s the downside?',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['denormalization', 'read-scaling', 'materialized-view'],
    answer: `**Denormalization** pre-joins or pre-computes data so a read is a **single lookup** instead of an expensive multi-table join or aggregation at query time. You **duplicate** data — store the author name on each post, keep a precomputed feed, maintain a rollup count — doing the work **once at write time** so the common read is **O(1)**. It's essential in NoSQL (no joins) and on hot read paths.

**Downside — write complexity and consistency:** every copy must update on change, so writes **fan out** and can **drift**. You trade storage + write cost + staleness for read speed.

:::senior
Denormalize the specific **hot read path**, keep a **normalized source of truth**, and update derived copies via **events/CDC** (async), accepting eventual consistency. It's the read-side of the same trade **CQRS** and **caching** make.
:::`,
  },
  {
    id: 'sd-scale-partition-strategies',
    question: 'Compare range, hash, and directory-based partitioning.',
    difficulty: 'Medium',
    category: 'Scalability',
    tags: ['partitioning', 'range', 'hash', 'directory'],
    answer: `| Strategy | How | Pro | Con | Used by |
|--|--|--|--|--|
| **Range** | By key ranges (A–M / N–Z, or time) | Efficient **range scans** | **Hot-spots** on skewed/sequential keys — new writes hit the newest range | HBase, Bigtable |
| **Hash** | \`hash(key)\` → partition | **Even** distribution, no hotspots | Kills range queries (adjacent keys scatter); naive modulo remaps everything on resize | Cassandra, DynamoDB |
| **Directory** | A service maps key → partition | Max flexibility, easy rebalancing | Extra hop; the directory is a potential **SPOF/bottleneck** | — |

For hash, use **consistent hashing** so a resize moves only ~**1/N** of keys instead of nearly all.

:::senior
Pick by **dominant query**: range scans → range (with hotspot mitigation); point lookups + even load → hash; flexible rebalancing → directory. Real systems **combine** them — e.g. hash of a prefix, then range within it.
:::`,
  },
  {
    id: 'sd-scale-capacity-planning',
    question: 'How do you decide when to add capacity, and how much headroom to keep?',
    difficulty: 'Hard',
    category: 'Scalability',
    tags: ['capacity-planning', 'headroom', 'n-plus-1'],
    answer: `Plan from **peak, not average** — average hides 2–3× peaks. Keep enough **headroom** that any single node can fail without cascading: the **N+1 rule** provisions so **N-1 nodes carry 100%** of peak.

\`\`\`text
3 nodes each at 60%  →  lose one  →  120% dumped on a survivor  →  collapse
Keep each ≤ (N-1)/N ≈ 66% for 3 nodes
\`\`\`

Watch a **leading** indicator — queue depth, p99 creeping up, connection-pool saturation — not just CPU. **Load-test** to find the **knee** where latency explodes.

:::senior
The mistake is planning for **average** load at **100%** utilization. Real systems run at **~50–70%** so failover, deploys, and spikes have room. Capacity is a **reliability** decision (survive N-1) as much as a cost one.
:::`,
  },
  {
    id: 'sd-scale-elasticity',
    question: 'What is the difference between scalability and elasticity?',
    difficulty: 'Easy',
    category: 'Scalability',
    tags: ['elasticity', 'autoscaling', 'cloud'],
    answer: `- **Scalability** = the **ability** to handle more load by adding resources (a static property).
- **Elasticity** = doing it **automatically and bidirectionally** in real time — scaling **out** under load **and back in** when it drops — so you pay only for what you use.

Cloud **autoscaling groups** and **serverless** (Lambda) are elastic; a fixed 100-node cluster you grow by hand is **scalable but not elastic**.

:::key
Scalable answers *"can it grow?"*; elastic answers *"does it grow **and shrink** automatically to match demand?"* Elasticity turns scalability into **cost efficiency** — but only for load that changes **slower** than your boot/warmup time.
:::`,
  },
];

export default questions;
