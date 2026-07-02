import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'sd-rel-nines-downtime',
    question: 'What does "four nines" (99.99%) availability translate to in downtime per year, and why is each extra nine so much harder?',
    difficulty: 'Easy',
    category: 'Reliability',
    tags: ['availability', 'sla', 'nines'],
    answer: `**99.99% ≈ 52 minutes of downtime per year** (~4.4 min/month).

The reference points worth memorizing:

| Availability | Downtime / year |
|--|--|
| 99% | ~3.65 days |
| 99.9% | ~8.77 hours |
| 99.99% | ~52.6 minutes |
| 99.999% | ~5.26 minutes |

Each extra nine **divides allowed downtime by 10**, so it costs roughly 10× more effort. At five nines (~5 min/year), no human can respond in time — a single bad deploy blows the whole annual budget — which forces fully automated failover and rollback. That is why chasing nines has sharply diminishing returns.`,
  },
  {
    id: 'sd-rel-sli-slo-sla',
    question: 'Distinguish SLI, SLO, and SLA. Why should the SLO be stricter than the SLA?',
    difficulty: 'Easy',
    category: 'Reliability',
    tags: ['sla', 'slo', 'sli', 'error-budget'],
    answer: `- **SLI** (Indicator) — the *measured* number, e.g. "99.95% of requests succeeded."
- **SLO** (Objective) — the *internal target* for that SLI, e.g. "99.9% monthly."
- **SLA** (Agreement) — the *customer contract* with penalties, e.g. "99.9% or we refund 10%."

Mental model: **measure an SLI, aim at an SLO, promise an SLA.**

You set the **SLO stricter than the SLA** (e.g. target 99.95%, promise 99.9%) so you get an early-warning buffer — alerts fire and you can react *before* the contractual SLA is breached and money is owed.

The gap between 100% and the SLO is your **error budget**: while budget remains you ship features; when it's exhausted you freeze and stabilize.`,
  },
  {
    id: 'sd-rel-serial-parallel',
    question: 'Three components each with 99.9% availability. Compare the combined availability if they are in series vs in parallel.',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['availability', 'redundancy', 'math'],
    answer: `**Series (dependency chain — all must be up):** availabilities *multiply*.

\`\`\`text
0.999 × 0.999 × 0.999 ≈ 0.997  → 99.7%  (worse than any single part)
\`\`\`

Every extra dependency in the request path *lowers* availability — a day of extra downtime per year here.

**Parallel (redundant replicas — any one suffices):** *unavailabilities* multiply.

\`\`\`text
1 − (1 − 0.999)³ = 1 − (0.001)³ ≈ 0.999999999  → nine nines
\`\`\`

Redundancy turns mediocre components into a highly available system.

:::gotcha
The parallel math only holds if failures are **independent**. Replicas sharing a rack, power supply, or load balancer have a correlated fault domain — spread them across AZs/regions.
:::`,
  },
  {
    id: 'sd-rel-circuit-breaker',
    question: 'Explain the circuit breaker pattern and its three states. What problem does it solve that retries alone do not?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['circuit-breaker', 'fault-tolerance', 'resilience'],
    answer: `A circuit breaker wraps a remote call and stops sending requests to a dependency that is clearly failing, **failing fast** instead.

**Three states:**

| State | Behavior | Transition |
|--|--|--|
| **CLOSED** | Requests flow; count failures | → OPEN when failure rate crosses threshold |
| **OPEN** | Reject instantly, don't call the dependency | → HALF-OPEN after a cooldown timer |
| **HALF-OPEN** | Allow a few trial requests | → CLOSED if they pass, → OPEN if any fail |

**What retries can't do:** retries handle *transient* blips, but when a dependency is genuinely down, retrying just wastes timeouts and holds threads. The breaker's real value is **latency insulation** — in OPEN it converts slow 500ms timeouts (threads held) into instant rejections (threads freed), protecting the caller and giving the dependency room to recover. HALF-OPEN auto-recovers with a single probe rather than slamming the recovering service.`,
  },
  {
    id: 'sd-rel-backoff-jitter',
    question: 'Why do naive retries make an outage worse, and how do exponential backoff and jitter fix it?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['retries', 'backoff', 'jitter', 'thundering-herd'],
    answer: `Naive immediate retries *amplify* load precisely when a service is already struggling — a **retry storm** that can keep a recovering dependency down.

- **Exponential backoff** — wait longer each attempt (\`1s, 2s, 4s, 8s\`), giving the dependency room to recover instead of hammering it.
- **Jitter** — randomize each delay. Without it, all clients that failed at the same instant retry at the same instant, creating a **thundering herd** of synchronized spikes.

\`\`\`text
delay = random(0, base × 2ⁿ)      // "full jitter"
\`\`\`

:::warning
Only retry **idempotent** operations (or those with an idempotency key) — retrying \`POST /charge\` can double-charge. Always cap retries and pair them with a circuit breaker.
:::`,
  },
  {
    id: 'sd-rel-timeout-cascade',
    question: 'Why is a missing timeout on a remote call one of the most dangerous reliability bugs?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['timeout', 'cascading-failure', 'fault-tolerance'],
    answer: `The most common production incident is a dependency that gets **slow, not down**. Without a timeout:

1. Callers block indefinitely on the hung call.
2. Threads pile up waiting; the thread/connection pool exhausts.
3. The caller can no longer serve *any* request — the outage propagates **upstream**.

One slow dependency thus takes down healthy services above it — a **cascading failure**.

**Fix:** every remote call gets a timeout, sized from the dependency's **p99 latency** (not a round guess like 30s). Pair timeouts with retries (backoff + jitter), a circuit breaker, and bulkheads so a slow callee is bounded and isolated.`,
  },
  {
    id: 'sd-rel-bulkhead',
    question: 'What is the bulkhead pattern and when would you reach for it?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['bulkhead', 'isolation', 'fault-tolerance'],
    answer: `Named after a ship's watertight compartments: if one floods, the others keep the ship afloat.

In software, you give **each dependency its own resource pool** (thread pool or connection pool) instead of a shared one. That way a single slow or saturated dependency can only exhaust *its own* compartment — it cannot starve every other dependency of threads.

**When to use it:** any service that calls multiple downstreams from a shared pool. Without bulkheads, one slow dependency grabbing all threads is a classic cascading-failure trigger. Bulkheads cap the **blast radius**; they compose with timeouts and circuit breakers (isolate → fail fast → bound → retry → fallback).`,
  },
  {
    id: 'sd-rel-active-active-capacity',
    question: 'Compare active-passive and active-active redundancy. What capacity trap does active-active hide?',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['redundancy', 'failover', 'active-active', 'capacity'],
    answer: `- **Active-passive** — one node serves; a standby idles and replicates, then is promoted on failover. Simpler (one writer, no conflicts), full capacity after failover (the standby was spare), but ~50% resources sit idle.
- **Active-active** — all nodes serve live traffic. Full utilization and instant reroute on failure, but concurrent writes risk conflicts and it's more complex.

**The trap — capacity planning.** If two active nodes each run at 60% and one dies, the survivor must absorb **120%** and falls over, cascading. Active-active must be provisioned so that **N−1 nodes carry 100% of peak load** (the "N+1" rule). Active-passive sidesteps this because the standby was always spare.

Rule of thumb: stateless web/app tiers → active-active; stateful primaries (relational DBs) → active-passive to keep a single writer.`,
  },
  {
    id: 'sd-rel-multiaz-multiregion',
    question: 'Multi-AZ vs multi-region redundancy — what does each protect against, and why is cross-region replication usually asynchronous?',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['multi-region', 'multi-az', 'replication', 'rpo-rto'],
    answer: `| Scope | Protects against | Replication |
|--|--|--|
| **Multi-AZ** (zones, one region) | Rack, power, single-datacenter loss | ~1–2 ms → can be **synchronous** (near-zero RPO) |
| **Multi-region** (far apart) | Whole-region outage, disaster | ~tens–hundreds of ms → usually **asynchronous** |

**Why cross-region is async:** waiting for a synchronous ack across ~100 ms of latency would add that latency to *every write* — crippling throughput. So cross-region replicates asynchronously, which means a region failover can **lose the last few seconds of writes** — a non-zero **RPO** (Recovery Point Objective).

Related metric: **RTO** (Recovery Time Objective) = how long recovery may take. Active-active multi-region gives near-zero RTO because both sides are already live; the price is handling cross-region consistency.`,
  },
  {
    id: 'sd-rel-health-check-failover',
    question: 'How do health checks drive automatic failover, and what are the two classic ways automatic failover goes wrong?',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['health-checks', 'failover', 'split-brain', 'flapping'],
    answer: `A load balancer (or DNS) probes each node (\`GET /health\`) on an interval; after **N consecutive** failures it marks the node unhealthy and reroutes to a standby.

**Design choices interviewers reward:**
- **Shallow vs deep checks.** Shallow = "process alive." Deep = "dependencies reachable" — catches more, but a flaky shared dependency can mark *every* node unhealthy at once and take down the fleet.
- **Threshold + hysteresis.** Require N failures to eject and M successes to re-add.

**Two classic failure modes:**
1. **Flapping** — a too-sensitive check ping-pongs a node in and out on a single blip. Fixed by the failure threshold.
2. **Split-brain** — the passive wrongly believes the primary is dead and *both* accept writes, corrupting data. Fixed by a **quorum/consensus** store (etcd, ZooKeeper) or a fencing token so exactly one leader exists.

:::gotcha
Automatic failover can be worse than the failure it fixes if it flaps or splits the brain — always pair it with consensus and thresholds.
:::`,
  },
  {
    id: 'sd-rel-three-pillars',
    question: 'What are the three pillars of observability, and how do you use them together to debug an incident?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['observability', 'metrics', 'logs', 'traces'],
    answer: `| Pillar | Answers | Shape | Cost |
|--|--|--|--|
| **Metrics** | *Is something wrong?* | Numeric time-series | Cheap, low cardinality |
| **Traces** | *Where in the path?* | Causal spans across services | Medium (sampled) |
| **Logs** | *What/why exactly?* | Discrete events | Expensive at volume |

**Workflow:** **metrics tell you *that* something is wrong** (a p99 latency spike) → **traces tell you *where*** (drill into a slow trace, DB hop is 40 ms) → **logs tell you *why*** (read that service's error). A **correlation/trace ID** threaded through every hop stitches all three together for a single request.

:::note
Keep metric labels **low-cardinality** (region, endpoint, status) — a label like \`user_id\` explodes into millions of series and bankrupts the metrics backend. Push high-cardinality detail into logs and traces.
:::`,
  },
  {
    id: 'sd-rel-alert-symptoms-burn',
    question: 'What should you alert on to avoid alert fatigue, and what is SLO burn-rate alerting?',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['alerting', 'slo', 'error-budget', 'golden-signals'],
    answer: `**Alert on symptoms users feel, not internal causes.** High CPU isn't worth a page (users don't feel CPU); a spiking 5xx rate is. The canonical symptom set is Google's **four golden signals**: **latency, traffic, errors, saturation**. Every alert must be *actionable* — cause-based alerts (high CPU, a self-rotating disk) generate noise nobody acts on, causing **alert fatigue** that buries real incidents.

**SLO burn-rate alerting** pages on how *fast* you're spending the error budget rather than on raw thresholds:
- **Burn rate = 1** → on pace to spend the budget exactly by period end (fine).
- **Burn rate = 10** → a 30-day budget gone in 3 days (page now).

**Multi-window, multi-burn-rate** alerts combine a fast burn (e.g. 14× over 1h → page for acute outages) with a slow burn (e.g. 2× over 6h → ticket for creeping degradation), so paging is proportional to user impact and fires *before* the SLA breaks.`,
  },
  {
    id: 'sd-rel-backpressure-vs-shedding',
    question: 'Distinguish backpressure from load shedding. When would you use each under overload?',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['backpressure', 'load-shedding', 'overload', 'graceful-degradation'],
    answer: `Both keep a system from collapsing under overload, but they act differently:

- **Backpressure** — a *cooperative* signal that flows against the data direction: a busy downstream tells its upstream "slow down." Implemented via bounded queues, \`HTTP 429\` (with \`Retry-After\`), gRPC flow control, or rate limiting. The request is **preserved** for later.
- **Load shedding** — the server *unilaterally drops* requests (a cheap, instant \`503\`) to protect the core. The request is **gone**.

**When to use each:** backpressure when the sender can afford to wait — it's gentler and loses no work. Load shedding is the **last resort** when you must protect the core *right now* regardless of what senders do. When shedding, be **priority-aware**: drop background jobs, prefetches, retries, and analytics first; protect user-facing and in-flight requests. Both beat an unbounded queue, which keeps accepting work it can never finish until goodput collapses.`,
  },
];

export default questions;
