import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'senior-idempotency',
    question: 'In a distributed system, why is idempotency important and how do you implement it?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['idempotency', 'distributed', 'resilience'],
    answer: `Networks deliver **at-least-once**: a client that times out can't tell whether the server actually succeeded, so it retries. An operation is **idempotent** if applying it twice has the same effect as once, which is what makes those retries safe.

- Naturally idempotent: \`PUT /user/42 {…}\` (sets state), \`DELETE\`.
- Not idempotent: "append a row", "charge a card", most \`POST\`s.

The standard fix is an **idempotency key**: the client sends a unique ID, and the server records it atomically and dedupes replays.

\`\`\`java
boolean first = seen.putIfAbsent(key, result) == null;
return first ? result : cachedResultFor(key);
\`\`\`

:::senior
"Exactly-once *delivery*" is a myth over an unreliable network. Aim instead for "exactly-once *processing*" via **idempotent consumers** on at-least-once transport — design every mutating endpoint to be safely retryable.
:::`,
  },
  {
    id: 'senior-virtual-vs-reactive',
    question: 'Virtual threads vs reactive programming — when would you choose each?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['virtual-threads', 'reactive', 'concurrency'],
    answer: `Both target the same problem: handling huge numbers of concurrent, mostly **I/O-bound** requests without one OS thread per request.

| | Reactive (WebFlux) | Virtual threads (JDK 21+) |
|---|---|---|
| Style | non-blocking callbacks/operators | ordinary **blocking** code |
| Concurrency | very high | very high (millions) |
| Debugging | hard (broken stack traces) | normal stack traces |
| Cost | "viral" \`Mono\`/\`Flux\`, steep curve | young; pinning caveats |

For most I/O-bound services, **virtual threads** deliver reactive-like scalability while keeping simple, debuggable blocking code — they remove most reasons to adopt reactive. Choose **reactive** when you genuinely need streaming, rich operators, or first-class **backpressure**.

:::gotcha
A virtual thread **pins** its carrier inside a \`synchronized\` block or a native call, killing the scalability gain. Use \`ReentrantLock\` instead on hot paths.
:::`,
  },
  {
    id: 'senior-circuit-breaker',
    question: 'Explain the circuit breaker pattern and its states.',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['resilience', 'circuit-breaker', 'distributed'],
    answer: `A circuit breaker stops calling a failing dependency so it can recover, and so callers **fail fast** instead of piling up on timeouts.

States:

- **Closed** — calls flow normally; failures are counted.
- **Open** — the failure threshold was exceeded, so calls are rejected immediately for a cool-down period.
- **Half-Open** — after the cool-down, a few trial calls probe for recovery; success returns to Closed, failure returns to Open.

\`\`\`mermaid
stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failures exceed threshold
  Open --> HalfOpen: cool-down elapses
  HalfOpen --> Closed: trials succeed
  HalfOpen --> Open: trial fails
\`\`\`

It pairs with **timeouts** (to detect failure), **retries with backoff** (for transient blips), and **bulkheads** (for isolation). Resilience4j is the standard library.`,
  },
  {
    id: 'senior-immutability-concurrency',
    question: 'Why does immutability simplify concurrency, and what are the pitfalls?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['immutability', 'concurrency', 'thread-safety'],
    answer: `An immutable object can't change after construction, so it has **no race conditions**: any number of threads can read it without synchronization, and it can be shared and cached freely. This is why share-nothing, message-passing designs scale.

Build them with \`final\` fields, no setters, and \`record\`s.

:::gotcha
\`final\` freezes the **reference**, not the target. Storing a caller's mutable \`List\`, array, or \`Date\` leaks your internals — take a **defensive copy** in the constructor (\`List.copyOf\`). And those copies are **shallow**: if the elements themselves are mutable, you're still exposed.
:::

The cost is allocation (a fresh object per "change"), largely mitigated by escape analysis and by structural sharing in persistent data structures.`,
  },
  {
    id: 'senior-jmh-traps',
    question: 'Why is a simple nanoTime() loop a poor way to microbenchmark Java?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['performance', 'jmh', 'jit'],
    answer: `Because the JVM optimizes adaptively, a naive loop measures the wrong thing:

- **Warmup** — early iterations run in the **interpreter** before C1/C2 JIT compiles the hot path, so you measure cold code.
- **Dead-code elimination** — if you ignore the result, the JIT may delete the work entirely.
- **Constant folding** — constant inputs get precomputed at compile time.
- **On-stack replacement** and loop **hoisting** can move work out of the timed region.

Use **JMH**, which forks a fresh JVM, warms up, and consumes results via a \`Blackhole\`:

\`\`\`java
@Benchmark
public void hash(Blackhole bh) { bh.consume(key.hashCode()); }
\`\`\`

:::gotcha
Even JMH lies if you feed it constant inputs or mis-scope \`@State\` — and a green microbenchmark never proves a real-world win. Always confirm against a full-system benchmark.
:::`,
  },
  {
    id: 'senior-connection-pool-sizing',
    question: 'How do you size a database connection pool, and why are bigger pools often worse?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['pooling', 'database', 'performance'],
    answer: `A connection pool (HikariCP) reuses expensive DB connections. The instinct to make it large is wrong: a database has finite cores and disks, so **too many connections increase lock contention and context-switching**, hurting both throughput and latency.

A useful starting formula:

\`\`\`text
pool size ≈ (core_count × 2) + effective_spindle_count
\`\`\`

That often lands **under 20**, even for high-traffic services. Tune from there using metrics (connection wait time, pool utilization).

:::senior
**Virtual threads** break the "one connection per thread" model. With millions of threads you must **not** scale the pool to the thread count — keep it small and let the pool be the **backpressure point** that protects the database, which is the real bottleneck.
:::`,
  },
  {
    id: 'senior-dependency-injection',
    question: 'What problem does dependency injection solve, and why prefer constructor injection?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['spring', 'dependency-injection', 'design'],
    answer: `**Dependency injection** inverts control of object creation: instead of a class doing \`new Collaborator()\`, the container creates collaborators and passes them in. The class declares *what* it needs, not *how* to build it.

Benefits: **loose coupling** (depend on interfaces), **testability** (inject mocks), and centralized lifecycle/configuration.

\`\`\`java
@Service
class OrderService {
  private final PaymentGateway gateway;
  OrderService(PaymentGateway gateway) { this.gateway = gateway; }
}
\`\`\`

:::senior
Prefer **constructor injection** over field \`@Autowired\`: it allows \`final\` fields, makes dependencies explicit, fails fast when one is missing, and lets you unit-test **without** Spring. A constructor with too many parameters is also honest feedback that the class does too much — field injection just hides that smell.
:::`,
  },
  {
    id: 'senior-read-through-cache',
    question: 'How would you design a read-through cache, and what are its main failure modes?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['caching', 'system-design', 'performance'],
    answer: `A read-through cache sits in front of a slow store: on a miss, load from the origin, populate the cache, then return. Use a bounded, evicting cache (**Caffeine** locally, **Redis** when shared across instances) and track the **hit ratio**.

Failure modes a senior must address:

- **Stampede / thundering herd** — a hot key expires and thousands of requests hit the origin at once. Fix with **single-flight** (coalesce concurrent loads) and **jittered / probabilistic early refresh**.
- **Invalidation** — the genuinely hard part. Prefer short TTLs or **event-driven** invalidation; never cache without a consistency story.
- **Stale reads** — accept and explicitly bound how stale data may be.

:::gotcha
A distributed (Redis) cache adds a network hop and a new failure mode: if the cache is down, do you **fail open** (hit the DB and risk overload) or **fail closed** (return an error)? Decide that deliberately, don't discover it in an incident.
:::`,
  },
  {
    id: 'senior-design-rate-limiter',
    question: 'How would you design a distributed rate limiter (e.g. 100 requests per minute per user)?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['system-design', 'rate-limiting', 'distributed'],
    answer: `Clarify first: limit per user, IP, or API key? hard or soft? global or per-node?

**Algorithms:**

| Algorithm | Note |
|---|---|
| Fixed window | simplest; allows double bursts at window edges |
| Sliding window log | accurate; memory-heavy |
| Sliding window counter | good accuracy/cost balance |
| **Token bucket** | allows controlled bursts; common default |

**Going distributed:** node-local counters can't enforce a global limit, so keep state in a shared store — **Redis** with an **atomic** Lua script (or \`INCR\` + \`EXPIRE\`) so the check-and-increment is race-free:

\`\`\`text
count = INCR key
if count == 1: EXPIRE key 60
allow = count <= limit
\`\`\`

Return **429** with a \`Retry-After\` header. Trade-offs: Redis becomes a hot dependency to protect (replicate it); local token buckets with periodic sync cut latency at the cost of precision.

:::senior
Rate limiting is fundamentally **load shedding** — protecting the system matters more than perfect accuracy. A slightly leaky limiter that's fast and highly available beats an exact one that adds latency and a hard dependency to every request.
:::`,
  },
  {
    id: 'senior-cap-theorem',
    question: 'Explain the CAP theorem and how it guides real system-design choices.',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['system-design', 'cap', 'consistency'],
    answer: `CAP says that during a **network partition** (P), a distributed system must choose between **Consistency** (every read sees the latest write) and **Availability** (every request gets a non-error response). Partitions are unavoidable, so the real decision is **C vs A *during* a partition**.

- **CP** (ZooKeeper, etcd, a single RDBMS) — reject or stall to stay consistent. Good for config, leader election, money.
- **AP** (Dynamo-style stores, Cassandra) — stay available and reconcile later (eventual consistency). Good for carts, feeds, metrics.

:::senior
CAP is a coarse lens. In practice prefer **PACELC**: *if Partition then A-vs-C, Else (normal operation) Latency-vs-Consistency.* Most of the time there is no partition, and you're really trading latency against consistency — which is the choice you actually live with day to day.
:::`,
  },
];

export default questions;
