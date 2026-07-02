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
];

export default questions;
