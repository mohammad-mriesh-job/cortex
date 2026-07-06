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
  {
    id: 'sd-rel-spof',
    question: 'How do you find and eliminate single points of failure in a design?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['spof', 'redundancy', 'availability'],
    answer: `A **SPOF** is any component whose failure takes down the whole system. **Find them by walking the request path** and asking "what if this dies?" at every hop — LB, app server, DB primary, cache, DNS, a shared config/service-discovery node, even a single AZ, region, or shared power/network domain.

**Eliminate them with redundancy + failover:**
- multiple LBs (floating IP / anycast);
- **stateless** app servers behind the LB (any can serve any request);
- DB **replicas** with automatic failover;
- **multi-AZ** so no single datacenter is fatal;
- no single shared dependency without a fallback.

:::senior
The subtle SPOFs are the **shared** ones: a single Redis every request touches, one NAT gateway, a service-discovery node, or "redundant nodes — all in one AZ." Redundancy only helps if failures are **independent**, so spread replicas across **fault domains** (AZs/regions); otherwise a correlated failure (rack, power, a bad deploy) defeats every copy at once.
:::`,
  },
  {
    id: 'sd-rel-liveness-vs-readiness',
    question: 'What is the difference between a liveness and a readiness probe?',
    difficulty: 'Easy',
    category: 'Reliability',
    tags: ['health-checks', 'liveness', 'readiness', 'kubernetes'],
    answer: `They answer two different questions:
- **Liveness** — "is this process alive, or **wedged**?" If it fails, the orchestrator (**Kubernetes**) **restarts** the container.
- **Readiness** — "is this instance ready to receive traffic **right now**?" If it fails, the instance is **pulled from the load-balancer pool** but **not restarted** — it may be warming up (filling caches, JIT) or a dependency is briefly unavailable.

:::gotcha
Conflating them causes outages. If your **liveness** probe checks a **downstream dependency** and that dependency blips, **every** pod fails liveness and gets **restarted at once** — turning a small hiccup into a fleet-wide **crash-loop**. Keep **liveness shallow** ("am I wedged?") and put dependency checks in **readiness** ("should I get traffic?"), where a failure just removes the pod from rotation until it recovers.
:::`,
  },
  {
    id: 'sd-rel-chaos-engineering',
    question: 'What is chaos engineering and why deliberately break production?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['chaos-engineering', 'resilience', 'testing'],
    answer: `**Chaos engineering** proactively **injects failures** — kill instances, add latency, drop packets, fail a dependency or a whole AZ — to **verify the system survives them** before a real outage runs the experiment for you. Netflix's **Chaos Monkey** randomly kills production instances, forcing every service to be built for instance loss.

The method is scientific:
1. define a **steady-state hypothesis** (what normal metrics look like);
2. inject a **controlled** failure with a **limited blast radius**;
3. check whether the system holds — if not, you just found a latent SPOF or bad assumption.

:::senior
The premise is that **failure is inevitable**, so you rehearse it **deliberately and continuously in production** rather than hoping. Start small (one instance, off-peak, with a kill switch), automate, then expand. It's the only way to prove redundancy, timeouts, retries, and failover **actually work** — **untested failover is not failover**.
:::`,
  },
  {
    id: 'sd-rel-dr-tiers',
    question: 'Compare disaster-recovery strategies and their RTO/RPO trade-offs.',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['disaster-recovery', 'rto', 'rpo', 'backup'],
    answer: `DR strategies trade **cost vs recovery speed**, measured by **RTO** (how long to recover) and **RPO** (how much data you can lose). From cheapest/slowest to priciest/fastest:

| Strategy | RTO | RPO | How |
|--|--|--|--|
| **Backup & restore** | Hours–days | Hours | Restore from backups into a fresh environment |
| **Pilot light** | ~10s of min | Minutes | Core (DB replica) always on; spin up the rest on failover |
| **Warm standby** | Minutes | Seconds | A scaled-down full copy runs; scale it up on failover |
| **Hot / active-active** | ~0 | ~0 | Both regions live; just reroute traffic |

:::senior
Pick the tier from the **business cost** of downtime and data loss, not "always active-active." And note cross-region replication is **asynchronous** (~50–150 ms), so even a hot standby usually has a **non-zero RPO** (the last few seconds of writes) unless you pay for **synchronous** cross-region commits — which cripple write latency.
:::`,
  },
  {
    id: 'sd-rel-deploy-strategies',
    question: 'Compare blue-green, canary, and rolling deployments.',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['deployment', 'blue-green', 'canary', 'rolling'],
    answer: `Three safe-deploy strategies:

| Strategy | How | Rollback | Cost |
|--|--|--|--|
| **Rolling** | Replace instances a few at a time with the new version | Slow (roll back the same way) | No extra fleet |
| **Blue-green** | Stand up a full parallel **green** fleet, then flip the LB from blue → green instantly | **Instant** (flip back) | Doubles infra during the switch |
| **Canary** | Route **1–5%** of traffic to the new version, watch error/latency, then ramp to 100% (or abort) | Fast (shift traffic back) | Small extra + good metrics needed |

:::senior
**Canary** is the gold standard because it limits **blast radius** and catches regressions on **real traffic**; **blue-green** gives the cleanest rollback. All three require **backward-compatible** schema/API changes so old and new versions coexist mid-rollout — that's the **expand-contract** (parallel-change) migration pattern.
:::`,
  },
  {
    id: 'sd-rel-graceful-degradation',
    question: 'What is graceful degradation, and how do you design for it?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['graceful-degradation', 'fallback', 'resilience'],
    answer: `**Graceful degradation** means that when a dependency fails you lose a **feature, not the whole page** — you degrade functionality instead of erroring out. Common patterns:
- serve **stale cached** data when the source is down;
- return a **default/empty** value (show the product page without the "recommended for you" widget if recs are down);
- **disable** non-critical features under load;
- **queue** writes to apply later.

Pair it with **circuit breakers** (fail fast to the fallback) and **feature flags** (a kill switch per feature).

:::senior
Decide **per dependency** what "degraded but useful" means, and **rank features by criticality**: checkout must work even if reviews, recommendations, and analytics don't. This is why you **isolate the critical path** — a failure in a non-essential downstream must never take down the core journey. Amazon still renders a product page even when half its widgets fail.
:::`,
  },
  {
    id: 'sd-rel-distributed-tracing',
    question: 'How does distributed tracing work, and what problem does it solve?',
    difficulty: 'Hard',
    category: 'Reliability',
    tags: ['tracing', 'observability', 'spans', 'context-propagation'],
    answer: `In microservices one user request **fans out across many services**, so a single service's logs can't tell you **where** the latency or error came from. Distributed tracing assigns each request a **trace id** that is **propagated through every hop** (via headers — the W3C \`traceparent\`); each service records a **span** (start/end time, parent span, tags). Collected by a backend (**OpenTelemetry** → **Jaeger**/Zipkin/Tempo), the spans reconstruct the full **causal tree** with per-hop timing, so you can see the DB call that took **400 ms** or the service that returned a 500. Volume is huge, so traces are **sampled** — e.g. 1%, or **tail-based** on errors/slow requests.

:::senior
The key mechanic is **context propagation**: the trace id must thread through **every** call — synchronous **and** async/queue hops — or the trace breaks into disconnected fragments. Tracing answers **"where in the path"**; metrics say **that** it's slow, logs say **why** — together they're the three pillars.
:::`,
  },
  {
    id: 'sd-rel-error-budget',
    question: 'What is an error budget and how does it change how teams operate?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['error-budget', 'slo', 'sre'],
    answer: `The **error budget** is **100% − SLO** — the amount of unreliability you're **allowed** to spend. At a **99.9%** SLO you may be down **~43.8 min/month**; that downtime is a **budget**.

Its power is as a **policy**:
- while budget **remains**, the team **ships features** freely — some risk is acceptable;
- when the budget is **exhausted**, feature work **freezes** and everyone focuses on reliability until you're back in budget.

:::senior
The error budget **aligns dev and ops**: it dissolves the classic "devs want to ship / SRE wants stability" fight by turning reliability into a **shared, quantified currency**. It also says **100% is the wrong target** — chasing zero errors halts progress for diminishing returns, so you deliberately **spend** the budget on velocity. **Burn-rate alerts** page you when you're spending it too fast.
:::`,
  },
  {
    id: 'sd-rel-red-use-methods',
    question: 'What are the RED and USE methods for monitoring?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['monitoring', 'red', 'use', 'golden-signals'],
    answer: `Two complementary monitoring frameworks:

| Method | For | Track |
|--|--|--|
| **RED** | **Services / requests** | **R**ate (req/s), **E**rrors (failed/s), **D**uration (latency distribution) |
| **USE** | **Resources** (CPU, disk, pool) | **U**tilization, **S**aturation (queue/wait depth), **E**rrors |

RED is the **user-facing** view of a service's health; USE is the **machine-facing** view of a resource. They pair with Google's **four golden signals** (latency, traffic, errors, saturation).

:::senior
RED tells you the **symptom** users feel — **alert on it**; USE helps you find the **cause** — which resource is saturated. **Page on RED/symptoms** (a spiking error rate), not on raw USE causes (high CPU isn't worth a page if users are fine), but keep USE metrics for **diagnosis**. Rule of thumb: **RED for every service, USE for every resource.**
:::`,
  },
  {
    id: 'sd-rel-fault-vs-failure',
    question: 'What\'s the difference between a fault, an error, and a failure?',
    difficulty: 'Easy',
    category: 'Reliability',
    tags: ['fault-tolerance', 'terminology', 'resilience'],
    answer: `A precise causal chain:
- **Fault** — a **defect** in a component: a bug, a dying disk, a dropped packet.
- **Error** — the fault **activating** into an incorrect internal state.
- **Failure** — that error becoming **externally visible**: the system deviates from spec (wrong answer, or goes down).

**Fault tolerance** = stopping a fault from becoming a failure — redundancy, retries, and failover **mask** the fault so the user never sees a failure.

:::key
The goal isn't a fault-**free** system — impossible at scale, where disks die, networks drop, and nodes crash constantly — but a fault-**tolerant** one: assume components **will** fault, and design so a fault is **contained and masked** rather than propagating into a user-visible failure. "Everything fails, all the time — plan for it" is the core reliability mindset.
:::`,
  },
  {
    id: 'sd-rel-data-durability',
    question: 'How do you make sure committed data is never lost?',
    difficulty: 'Medium',
    category: 'Reliability',
    tags: ['durability', 'replication', 'backups', 'erasure-coding'],
    answer: `Durability comes from **redundancy across independent failure domains** plus **verification**:
1. **Replicate** to N copies across **AZs/regions** — survive node, rack, or datacenter loss.
2. **Write-ahead log + fsync** — a commit survives a crash mid-write.
3. **Backups + point-in-time recovery** — guard against bugs and bad deletes that replication would faithfully copy.
4. **Erasure coding** — cheaper redundancy than full replicas (used by **S3**, HDFS).
5. **Checksums** — detect silent **bit-rot** and repair from a good copy.

**S3** targets **11 nines** of durability (99.999999999%).

:::gotcha
**Replication is not a backup**: it faithfully replicates a bad \`DELETE\` or a corruption to **every** copy. You need **independent backups** (and to actually **test restores**) for logical errors, plus **geographic spread** for disasters. Durability = copies in independent failure domains **+** integrity checks **+** real, tested backups.
:::`,
  },
  {
    id: 'sd-rel-postmortem',
    question: 'What makes a good (blameless) postmortem after an incident?',
    difficulty: 'Easy',
    category: 'Reliability',
    tags: ['postmortem', 'incident-management', 'culture'],
    answer: `A postmortem documents an incident: a **timeline**, the **impact** (users affected, duration, SLO/error-budget burn), the **root cause(s)**, how it was **detected and mitigated**, and concrete **action items with owners** to prevent recurrence.

**Blameless** means focusing on **systemic** causes — a missing alert, no timeout, an unsafe deploy process — rather than punishing an individual. The reason is practical: **blame makes people hide information**, and hidden information kills the learning that prevents the next outage.

:::senior
A good postmortem asks **"why did the *system* let a human error cause an outage?"** — no canary, no rollback button, no guardrail — and produces **tracked** fixes, turning each incident into durable resilience. The maturity signal is that action items **actually get done** and repeat incidents drop. **Detection time and blast radius** matter as much as the trigger itself.
:::`,
  },
];

export default questions;
