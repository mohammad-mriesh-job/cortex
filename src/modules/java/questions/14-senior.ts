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
  {
    id: 'senior-effective-java-static-factory',
    question: 'When would you prefer a static factory method over a public constructor?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['effective-java', 'api-design', 'factory'],
    answer: `A **static factory method** is a static method that returns an instance of the class (\`List.of()\`, \`Optional.of()\`, \`Integer.valueOf()\`). *Effective Java* Item 1 says to consider one over a plain constructor because it offers four things a constructor cannot:

1. **It has a name.** \`BigInteger.probablePrime(bits, rnd)\` says what it does, and you can offer several factories with the same parameter types (a constructor can't).
2. **It need not create a new object.** It can return a cached instance — \`Integer.valueOf\` and \`Boolean.valueOf\` reuse values — enabling singletons and flyweights (instance control).
3. **It can return any subtype.** Return an interface and hide the concrete class, so the implementation can change freely (\`EnumSet.of\` returns a different class for small vs large enums).
4. **The returned type can vary by the arguments.**

\`\`\`java
public static Money of(long cents) { return new Money(cents); }  // named, can cache, can hide the subtype
\`\`\`

:::gotcha
A class with only static factories and a private constructor **can't be subclassed**, and factories are less discoverable than constructors. Follow the naming conventions callers expect: \`of\`, \`valueOf\`, \`from\`, \`getInstance\`, \`create\`.
:::`,
  },
  {
    id: 'senior-program-to-interfaces',
    question: 'What does "program to an interface, not an implementation" mean in practice?',
    difficulty: 'Easy',
    category: 'Senior & Design',
    tags: ['api-design', 'abstraction', 'coupling'],
    answer: `Declare variables, parameters, and return types with the most general **interface** that still gives callers what they need — \`List\`, not \`ArrayList\`; \`Map\`, not \`HashMap\`. Your code then depends on *behaviour*, not a concrete class.

\`\`\`java
public List<String> names() { return new ArrayList<>(); }   // good: callers decoupled from the impl
public ArrayList<String> names2() { /* ... */ }             // leaky: return type locks you to ArrayList
\`\`\`

Benefits: swap implementations without touching callers, mock the interface in tests, and keep coupling low.

:::gotcha
"Most general that suffices" — not "most abstract possible". If clients need index access, return \`List\`, not \`Collection\`; if insertion order is part of the contract, that guarantee must survive. Pick the least specific type that still exposes the behaviour clients rely on, and use a concrete type deliberately when you need its specific contract (e.g. \`ArrayDeque\` as a stack).
:::`,
  },
  {
    id: 'senior-api-minimal-surface',
    question: 'What principles guide the design of a good public API or class?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['api-design', 'effective-java', 'encapsulation'],
    answer: `The guiding rule: **make it easy to use correctly and hard to use incorrectly.**

- **Minimize the public surface.** Every public method and field is a permanent commitment. When in doubt, leave it out — you can always add later, but you can almost never remove without breaking callers.
- **Fail fast.** Validate parameters at the boundary (\`Objects.requireNonNull\`, range checks) so a bad call throws at the call site, not as a mysterious NPE three layers down.
- **Prefer immutability**, and make **defensive copies** of mutable inputs/outputs so callers can't reach in and corrupt your invariants.
- **Don't leak internals** — return interfaces, never your live backing collection.
- **Least astonishment** — consistent names and behaviour, and honour the \`equals\`/\`hashCode\` contracts.

\`\`\`java
public Range(int lo, int hi) {
    if (lo > hi) throw new IllegalArgumentException("lo > hi");  // fail fast
    this.lo = lo; this.hi = hi;                                  // immutable
}
\`\`\`

:::senior
Keep the API small *now* so you can grow it later. A tight, immutable, well-validated surface is the one you can evolve; a wide one calcifies because every method is already something a client depends on.
:::`,
  },
  {
    id: 'senior-backward-compatible-api',
    question: 'How do you evolve a public API or library without breaking existing callers?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['api-design', 'compatibility', 'versioning'],
    answer: `Distinguish **source compatibility** (their code still compiles) from **binary compatibility** (their already-compiled \`.jar\` still links without recompiling). Both matter for a published library.

| Change | Safe? |
|---|---|
| Add a new method / overload | Yes |
| Add a method to an **interface** | **No** — breaks implementers, unless it's a \`default\` method |
| Remove or rename a public method | No |
| Change a parameter or return type | No — it's a new signature, old callers break |
| Reorder / rename \`enum\` constants | No — breaks persisted values and \`switch\` |

Rules of thumb: **add, don't change or remove.** Introduce new behaviour as new overloads; extend interfaces via \`default\` methods. Deprecate the old path with \`@Deprecated(since="…", forRemoval=true)\` and keep it working for a release cycle with a migration note. Follow **SemVer** — breaking changes only in a major version.

:::gotcha
Adding a parameter isn't "changing" a method — it's a *new overload*, and the old signature must stay or you break binary compatibility. Likewise, treat public enums and serialized forms as part of the contract: they're the changes teams forget.
:::`,
  },
  {
    id: 'senior-error-handling-strategy',
    question: 'How do you decide whether a method signals failure with an exception, an Optional, or a Result type?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['error-handling', 'optional', 'api-design'],
    answer: `Match the mechanism to whether the outcome is **exceptional** or **expected**.

| Mechanism | Use when | Example |
|---|---|---|
| **Exception** | truly exceptional or a bug; caller usually can't continue | \`IllegalArgumentException\`, \`IOException\` |
| **Optional<T>** (return only) | a value may legitimately be **absent**, with no "why" | \`findById\`, a lookup miss |
| **Result / sealed type** | an **expected domain failure** the caller must handle, with a reason | validation, parsing, payment declined |

Guidance: use **unchecked** exceptions for programming errors (\`IllegalState\`/\`IllegalArgument\`), **checked** only when the caller can realistically recover. Don't use exceptions for normal control flow — they're costly and obscure it. Don't use \`Optional\` for fields or parameters, or to hide an error whose *cause* the caller needs.

\`\`\`java
sealed interface ParseResult permits Ok, Err {}
record Ok(int value) implements ParseResult {}
record Err(String reason) implements ParseResult {}
\`\`\`

:::senior
A sealed \`Result\` plus an exhaustive \`switch\` makes the compiler enforce that every failure is handled — expected errors become checked control flow instead of exceptions thrown past unsuspecting callers.
:::`,
  },
  {
    id: 'senior-testability-seams',
    question: 'How do you design code so that it is easy to unit-test?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['testing', 'dependency-injection', 'design'],
    answer: `Testable code is mostly **well-decoupled** code — if something is hard to test, that's design feedback.

- **Inject dependencies** (via the constructor) instead of \`new\`-ing collaborators or reaching for static singletons inside your logic — tests can then pass fakes or mocks.
- **Introduce seams** around what you can't control: I/O, the network, time, and randomness. Inject a \`Clock\` instead of calling \`Instant.now()\`, and a supplier/\`Random\` instead of \`Math.random()\`, so behaviour is deterministic.
- **Separate pure logic from side effects.** A pure function of input → output needs no mocks at all.
- **Avoid static, global, mutable state** — it bleeds between tests and forces awkward ordering.

\`\`\`java
class TokenService {
  private final Clock clock;
  TokenService(Clock clock) { this.clock = clock; }        // test injects Clock.fixed(...)
  boolean expired(Token t) { return t.expiry().isBefore(clock.instant()); }
}
\`\`\`

:::gotcha
If you need PowerMock to stub a \`static\`, a constructor, or \`System.currentTimeMillis()\`, the untestable call *is* the design smell. Refactor it into an injectable seam rather than reaching for a heavier mocking tool.
:::`,
  },
  {
    id: 'senior-premature-optimization',
    question: '"Premature optimization is the root of all evil" — how do you actually approach performance work?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['performance', 'profiling', 'methodology'],
    answer: `Optimize from **measurement, not intuition** — developers are famously bad at guessing where time goes. A disciplined loop:

1. **Set a target** — a latency/throughput SLO. Without a goal you can't know when to stop.
2. **Profile under realistic load** (async-profiler, JFR) to find the *actual* hot path.
3. **Apply Amdahl's law** — speeding up code that's 5% of runtime caps your gain at ~5%. Attack the dominant cost first, usually I/O, N+1 queries, allocation, or serialization — rarely raw CPU.
4. **Optimize, then re-measure** to confirm the win and catch regressions.

Keep code clear first; constant-factor micro-tweaks that hurt readability rarely pay off, while an algorithmic fix (O(n²) → O(n)) or removing redundant round-trips dwarfs them.

:::senior
The biggest wins are usually **architectural** — caching, batching, doing less work — not clever inner loops. And always confirm against the **whole system**: a green microbenchmark can "prove" a speedup on a path that was never your bottleneck.
:::`,
  },
  {
    id: 'senior-reading-gc-logs',
    question: 'How do you tell whether an application has a garbage-collection problem?',
    difficulty: 'Hard',
    category: 'Senior & Design',
    tags: ['jvm', 'gc', 'performance'],
    answer: `Turn on unified GC logging (\`-Xlog:gc*\`) and read three signals:

1. **Pause times** — how long each stop-the-world pause lasts. Multi-hundred-millisecond pauses wreck tail latency; if the SLA is tight, the heap may be too large for the collector, or you need a low-pause collector (**G1**, **ZGC**, **Shenandoah**).
2. **GC frequency / allocation rate** — very frequent young collections mean you're filling Eden fast. A high allocation rate is a code problem; cutting allocation on hot paths beats any flag.
3. **Post-GC old-gen occupancy trend** — the live heap *after* each full GC. Flat is healthy; **steadily climbing** toward the ceiling is a **memory leak**, ending in back-to-back full GCs ("GC thrash", where the app burns most of its CPU collecting) and finally \`OutOfMemoryError\`.

Also watch **throughput %** (time in the app vs GC) and the promotion rate into old gen.

:::senior
Don't tune flags blindly. First decide **throughput vs latency**, then right-size the heap. Most "GC problems" are really an **allocation** or **leak** problem in disguise — fix the code, not just \`-Xmx\`.
:::`,
  },
  {
    id: 'senior-low-coupling',
    question: 'How do you keep coupling low between classes and modules?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['coupling', 'cohesion', 'architecture'],
    answer: `Aim for **high cohesion** (a unit does one thing) and **low coupling** (few, stable dependencies). Practical moves:

- **Depend on abstractions, not concretions** (Dependency Inversion) — code against interfaces so implementations swap freely.
- **Keep the public surface small** — hide internals with encapsulation and package-private types.
- **Obey the Law of Demeter** — talk to immediate collaborators, not \`a.getB().getC().doIt()\`; a "train wreck" couples you to a whole object graph.
- **Inject dependencies inward** instead of reaching out to static singletons or global state.
- **Forbid cyclic dependencies** between packages/modules — dependencies should point one way, toward stable abstractions.
- **Decouple with events/messages** so producers don't know their consumers.

Loosely coupled code is independently testable, deployable, and changeable — a change stays local instead of rippling across the system.

:::senior
Coupling, not lines of code, is what makes big systems hard to change. Make it visible — measure fan-in/fan-out and package cycles — and treat a dependency cycle between modules as a design bug to break, not tolerate.
:::`,
  },
  {
    id: 'senior-defensive-vs-contracts',
    question: 'Defensive programming vs design by contract — where should a method validate its inputs?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['defensive-programming', 'contracts', 'validation'],
    answer: `**Design by contract** frames each method as preconditions (the caller's job), postconditions, and invariants. **Defensive programming** distrusts inputs and checks them. The senior move is to apply each in the right place.

- **Validate hard at trust boundaries** — any public API or code taking external/untrusted input (HTTP, files, another service). You can't trust the caller, so reject bad input loudly: \`Objects.requireNonNull\`, range checks, \`IllegalArgumentException\`.
- **Inside your own module, prefer contracts** over re-checking the same argument at every private layer — that noise obscures logic and hides where the bad value entered.
- **Fail fast at the boundary** so the stack trace points at the culprit, not a distant NPE.

\`\`\`java
Order(Customer c, List<Item> items) {
  this.customer = Objects.requireNonNull(c, "customer");   // boundary check, always runs
  this.items = List.copyOf(items);                         // rejects nulls + defensive copy
}
\`\`\`

:::gotcha
\`assert\` is **disabled by default** (it needs \`-ea\`). Never use assertions to validate the arguments of a public method or anything security-relevant — use explicit checks that always run. Reserve \`assert\` for internal invariants you believe can never be false.
:::`,
  },
  {
    id: 'senior-thread-safety-documentation',
    question: 'How do you design a class to be thread-safe, and how should you document that?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['concurrency', 'thread-safety', 'api-design'],
    answer: `Pick an explicit **strategy** — don't just sprinkle \`synchronized\`:

- **Immutable** — no mutable state; inherently thread-safe and shareable. The best default (\`String\`, records).
- **Thread-confined** — state never escapes one thread (locals, \`ThreadLocal\`).
- **Guarded** — mutable state behind a consistent lock; guard *every* access and keep critical sections short. Annotate with \`@GuardedBy("lock")\`.
- **Delegated** — hand state to thread-safe building blocks (\`ConcurrentHashMap\`, \`AtomicLong\`, \`BlockingQueue\`).

Then **document the level**, because callers can't infer it: *immutable*, *thread-safe*, *conditionally thread-safe* (client must lock for compound actions, like iterating a synchronized collection), or *not thread-safe*.

\`\`\`java
// @GuardedBy("this")
private int count;
public synchronized void inc() { count++; }
\`\`\`

:::senior
Undocumented thread-safety is a latent bug. \`SimpleDateFormat\` looks harmless but is **mutable and unsynchronized**, so sharing one across threads silently corrupts its output. State the contract in Javadoc; never make callers read your source to guess it.
:::`,
  },
  {
    id: 'senior-api-pagination',
    question: 'How would you design an API that returns a large list — offset vs cursor pagination?',
    difficulty: 'Medium',
    category: 'Senior & Design',
    tags: ['api-design', 'pagination', 'database'],
    answer: `Never return an unbounded list — page it. Two designs:

| | Offset / limit | Cursor / keyset |
|---|---|---|
| Request | \`?page=3&size=20\` → SQL \`LIMIT/OFFSET\` | \`?after=<token>\` → \`WHERE id > :k ORDER BY id LIMIT n\` |
| Random access | jump to any page | forward (or back) only |
| Deep pages | slow — DB scans and discards \`OFFSET n\` rows | fast — index seek, depth-independent |
| Concurrent writes | rows shift → items skipped/duplicated across pages | stable |
| Total count | easy | hard |

**Offset** suits small, static, admin-style tables where "go to page 50" matters. **Cursor/keyset** wins for large or fast-changing datasets and infinite scroll — the client passes the last key it saw, and an index makes each page O(log n) regardless of depth.

:::senior
Make the cursor an **opaque token**, not a raw offset — that lets you change the underlying sort/filter without breaking clients. And always **cap \`size\` server-side** so one caller can't request a million rows in a single page.
:::`,
  },
];

export default questions;
