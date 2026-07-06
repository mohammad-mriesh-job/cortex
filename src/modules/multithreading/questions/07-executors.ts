import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-pools-executorservice-basics',
    question: 'What does an ExecutorService give you over creating threads with `new Thread()` per task?',
    difficulty: 'Easy',
    category: 'High-Level Concurrency',
    tags: ['executor', 'threadpool', 'basics'],
    answer: `An **ExecutorService** decouples *task submission* from *task execution*. Instead of spawning a thread per task, you hand it work and a pool of **reusable worker threads** runs it.

- **Thread reuse** — thread creation is expensive; a pool amortizes it across many tasks.
- **Bounded resources** — a fixed pool caps concurrency, giving you back-pressure instead of unbounded thread growth.
- **Lifecycle & results** — \`submit\` returns a \`Future\`; \`shutdown()\`/\`awaitTermination\` manage the pool cleanly.

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(8);
Future<Integer> f = pool.submit(() -> compute());
pool.shutdown();
\`\`\`

:::key
Prefer pools over raw threads: reuse, bounded concurrency, and a Future-based result/lifecycle API.
:::`,
  },
  {
    id: 'mt-pools-submit-vs-execute',
    question: 'What is the difference between `submit` and `execute` on an ExecutorService?',
    difficulty: 'Easy',
    category: 'High-Level Concurrency',
    tags: ['executor', 'future', 'basics'],
    answer: `- **\`execute(Runnable)\`** — fire-and-forget. Returns \`void\`; an uncaught exception propagates to the thread's uncaught-exception handler.
- **\`submit(Runnable | Callable)\`** — returns a **\`Future\`**. You can wait for completion, get a result, or observe a thrown exception.

The subtle part: with \`submit\`, an exception is **captured inside the Future** and only surfaces when you call \`get()\` (wrapped in \`ExecutionException\`). If you never call \`get()\`, the failure is **silently swallowed** — a common source of "my task just vanished" bugs.

\`\`\`java
Future<?> f = pool.submit(() -> risky());
f.get();  // throws ExecutionException if risky() failed
\`\`\``,
  },
  {
    id: 'mt-pools-shutdown',
    question: 'Why must you call `shutdown()` on an ExecutorService, and how does it differ from `shutdownNow()`?',
    difficulty: 'Easy',
    category: 'High-Level Concurrency',
    tags: ['executor', 'shutdown', 'lifecycle'],
    answer: `Pool worker threads are **non-daemon** by default, so a live pool **keeps the JVM from exiting** — leak one and your process never terminates.

- **\`shutdown()\`** — graceful. Stops accepting new tasks, but lets already-submitted tasks finish. Pair it with \`awaitTermination(timeout)\` to wait.
- **\`shutdownNow()\`** — abrupt. Attempts to **interrupt** running tasks and returns the tasks still queued. Only tasks that check for interruption actually stop.

\`\`\`java
pool.shutdown();
if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
    pool.shutdownNow();   // last resort
}
\`\`\`

:::gotcha
\`shutdown()\` does not block. Without \`awaitTermination\`, your main thread may move on before the tasks finish.
:::`,
  },
  {
    id: 'mt-pools-fixed-pool-oom',
    question: 'Why can `Executors.newFixedThreadPool(n)` cause an OutOfMemoryError even though it caps threads?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['threadpool', 'oom', 'queue'],
    answer: `\`newFixedThreadPool\` bounds the **threads** but backs the pool with an **unbounded \`LinkedBlockingQueue\`**. If tasks arrive faster than the \`n\` workers can finish them, the queue grows without limit until the heap is exhausted — a delayed, silent crash under load.

The fix is to construct \`ThreadPoolExecutor\` directly with a **bounded** queue and a **rejection policy**, so overload produces back-pressure instead of an OOM:

\`\`\`java
var pool = new ThreadPoolExecutor(
    n, n, 0L, TimeUnit.MILLISECONDS,
    new ArrayBlockingQueue<>(1_000),          // bounded
    new ThreadPoolExecutor.CallerRunsPolicy() // back-pressure
);
\`\`\`

:::key
Fixed pool = bounded threads, unbounded queue. Bound the queue and pick a rejection policy in production.
:::`,
  },
  {
    id: 'mt-pools-tpe-parameters',
    question: 'Walk through the ThreadPoolExecutor parameters. When does it create a thread beyond corePoolSize?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['threadpoolexecutor', 'sizing', 'queue'],
    answer: `A submitted task flows through the knobs in a strict order:

1. Fewer than **corePoolSize** threads? Start a new core thread and run it.
2. Otherwise, if the **workQueue** has room, **enqueue** the task.
3. Only if the queue is **full** and there are fewer than **maximumPoolSize** threads, spawn an extra (non-core) thread.
4. Otherwise, hand the task to the **RejectedExecutionHandler**.

- **keepAliveTime** — how long idle *non-core* threads survive before being reaped.

The counter-intuitive result: extra threads are created **only after the queue fills**. With an **unbounded queue**, the queue never fills, so \`maximumPoolSize\` is **never reached** — the pool stays at core forever. You need a **bounded queue** for \`max > core\` to matter.`,
  },
  {
    id: 'mt-pools-rejection-policies',
    question: 'Name the built-in rejection policies. Which one gives you natural back-pressure?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['rejection', 'threadpoolexecutor', 'backpressure'],
    answer: `When the queue is full **and** the pool is at \`maximumPoolSize\`, the \`RejectedExecutionHandler\` decides:

- **\`AbortPolicy\`** (default) — throws \`RejectedExecutionException\`.
- **\`CallerRunsPolicy\`** — runs the task on the **submitting thread**.
- **\`DiscardPolicy\`** — silently drops the new task.
- **\`DiscardOldestPolicy\`** — drops the oldest queued task, then retries.

**\`CallerRunsPolicy\`** gives natural **back-pressure**: when the pool is saturated, the producer is forced to execute the task itself, which slows down submission until the pool catches up — no unbounded growth, no dropped work.

:::senior
CallerRunsPolicy is a great default for ingestion pipelines: it self-throttles the source instead of dropping data or blowing up memory.
:::`,
  },
  {
    id: 'mt-pools-sizing',
    question: 'How do you size a thread pool for CPU-bound vs IO-bound tasks?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['sizing', 'cpu-bound', 'io-bound'],
    answer: `It depends on how much time a task spends **waiting** versus **computing**:

- **CPU-bound** (compute, no blocking): threads ≈ **number of cores** (\`Runtime.getRuntime().availableProcessors()\`), maybe \`cores + 1\`. Extra threads only add scheduling and cache-thrash overhead.
- **IO-bound** (DB, HTTP, disk): threads can be **much higher**, because each thread is blocked most of the time. Brian Goetz's rule:

\`\`\`text
threads = cores * targetUtilization * (1 + waitTime / computeTime)
\`\`\`

So a task that waits 9x as long as it computes wants roughly \`cores * 10\` threads to keep the CPUs busy.

:::key
CPU-bound ~ cores. IO-bound scales with the wait/compute ratio. Measure under real load rather than guessing.
:::`,
  },
  {
    id: 'mt-pools-thenapply-vs-thencompose',
    question: 'In CompletableFuture, when do you use `thenApply` vs `thenCompose`, and what does the `Async` suffix change?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['completablefuture', 'thencompose', 'async'],
    answer: `- **\`thenApply(fn)\`** — *map*. \`fn\` returns a plain value \`T -> U\`, giving \`CF<U>\`.
- **\`thenCompose(fn)\`** — *flat-map*. \`fn\` returns another \`CompletableFuture\`, and \`thenCompose\` **flattens** it. Using \`thenApply\` here yields a nested \`CF<CF<U>>\`.

\`\`\`java
userCf.thenApply(User::name);              // CF<String>
userCf.thenCompose(u -> fetchOrders(u));   // CF<List<Order>>, flattened
\`\`\`

The **\`Async\`** suffix controls **which thread** runs the callback:

- **\`thenApply\`** may run on whatever thread completed the previous stage (possibly the caller, if it was already done).
- **\`thenApplyAsync\`** always dispatches the callback to a pool (commonPool, or the executor you pass).

Use the \`Async\` form with an explicit executor when the callback does real work or must not run on the completing thread.`,
  },
  {
    id: 'mt-pools-cf-exceptions',
    question: 'How do you handle errors in a CompletableFuture chain, and why prefer `join()` over `get()`?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['completablefuture', 'exceptions', 'error-handling'],
    answer: `An exception in a stage propagates down the chain, skipping normal stages until a handler catches it:

- **\`exceptionally(ex -> fallback)\`** — recover with a fallback **only on failure**.
- **\`handle((v, ex) -> ...)\`** — always runs; sees the value **or** the exception. Can transform either.
- **\`whenComplete((v, ex) -> ...)\`** — a side-effecting peek that does **not** alter the result.

\`\`\`java
cf.thenApply(this::parse)
  .exceptionally(ex -> DEFAULT);
\`\`\`

Exceptions get wrapped in a **\`CompletionException\`** (unwrap via \`getCause()\`). Prefer **\`join()\`** over \`get()\` at the end: \`join()\` throws the **unchecked** \`CompletionException\`, whereas \`get()\` forces you to handle checked \`ExecutionException\` and \`InterruptedException\`.

:::gotcha
\`cancel(true)\` on a CompletableFuture does not interrupt the running task — it just completes the future exceptionally. The work keeps running.
:::`,
  },
  {
    id: 'mt-pools-chm-atomic-ops',
    question: 'Two threads run `if (!map.containsKey(k)) map.put(k, compute())` on a ConcurrentHashMap. What is wrong, and how do you fix it?',
    difficulty: 'Hard',
    category: 'High-Level Concurrency',
    tags: ['concurrenthashmap', 'computeifabsent', 'race'],
    answer: `Per-operation thread-safety does **not** make a *sequence* of operations atomic. \`containsKey\` and \`put\` are two calls, and a second thread can slip between them — both see the key absent, both compute, and one \`put\` clobbers the other. This is the classic **check-then-act / get-then-put race**.

The fix is an **atomic combinator** that folds the check and the write into one locked step:

\`\`\`java
// lazy init — mapping function runs at most once per key
map.computeIfAbsent(k, key -> compute());

// atomic accumulate / counter
counts.merge(k, 1L, Long::sum);
\`\`\`

:::senior
Inside \`computeIfAbsent\` the mapping function runs while holding the bin lock, so it must not update the *same* map for another key that could hash to the same bin — that can deadlock. Also note \`size()\` and iterators are **weakly consistent**: never drive control flow off a concurrent \`size()\`.
:::`,
  },
  {
    id: 'mt-pools-cas-aba',
    question: 'Explain compare-and-swap, the ABA problem, and the pitfall of the lambda passed to `updateAndGet`.',
    difficulty: 'Hard',
    category: 'High-Level Concurrency',
    tags: ['cas', 'atomic', 'aba'],
    answer: `**Compare-and-swap (CAS)** is one hardware instruction: set a field to \`new\` **only if** it still equals \`expected\`, atomically. Atomic methods are a **spin loop** over CAS — read, compute, \`compareAndSet\`, retry on failure.

\`\`\`java
int cur, next;
do { cur = a.get(); next = cur + 1; }
while (!a.compareAndSet(cur, next));
\`\`\`

**The ABA problem:** CAS only compares the *value*. If a reference goes \`A -> B -> A\`, a \`compareAndSet(A, ...)\` succeeds even though it changed underneath you — dangerous for lock-free stacks and object pools. Fix with **\`AtomicStampedReference\`**, which pairs the value with a version stamp.

**The lambda pitfall:** the function passed to \`updateAndGet\`/\`getAndUpdate\`/\`accumulateAndGet\` can **run multiple times** (once per CAS retry), so it must be **pure and side-effect-free** — no logging, no counters, no external mutation.`,
  },
  {
    id: 'mt-pools-forkjoin-parallel-streams',
    question: 'What is work-stealing, and why is blocking inside a parallel stream (or the commonPool) dangerous?',
    difficulty: 'Hard',
    category: 'High-Level Concurrency',
    tags: ['forkjoin', 'parallel-streams', 'work-stealing'],
    answer: `**Work-stealing:** each Fork/Join worker owns a **deque**. It pushes/pops its own subtasks from the **head** (LIFO, cache-friendly); when idle, it **steals** from the **tail** of another worker's deque. This balances load with no central coordinator, so no thread sits idle while work remains.

**Why blocking is dangerous:** parallel streams and default \`...Async\` tasks all share **one** \`ForkJoinPool.commonPool()\`, sized *cores − 1*. A blocking call (DB, HTTP, \`sleep\`) inside a parallel stream **ties up a scarce pool thread**, and enough of them **starve every other parallel task in the JVM**.

Guidance:
- Keep commonPool work **CPU-bound and non-blocking**.
- For blocking work, submit to your **own** \`ForkJoinPool\` / \`ExecutorService\`, or wrap it in a **\`ManagedBlocker\`** so the pool compensates.
- Parallel streams help **only** for **large, splittable (arrays/ArrayList), CPU-bound, stateless** sources — otherwise split/merge overhead makes them slower than sequential.

:::key
Work-stealing keeps workers busy; but never block the shared commonPool, and only parallelize large, splittable, CPU-bound pipelines.
:::`,
  },
  {
    id: 'mt-pools-factory-methods',
    question: 'What do the `Executors` factory methods give you, and which are risky?',
    difficulty: 'Easy',
    category: 'High-Level Concurrency',
    tags: ['executors', 'factory', 'threadpool'],
    answer: `The \`Executors\` class has static factories that wrap common \`ThreadPoolExecutor\` (or \`ForkJoinPool\`) configurations.

| Factory | What it gives you | Trap |
| --- | --- | --- |
| \`newFixedThreadPool(n)\` | \`n\` reused threads | **unbounded \`LinkedBlockingQueue\`** — OOM under overload |
| \`newCachedThreadPool()\` | threads on demand, reaped after 60s | **unbounded threads** under bursts (\`SynchronousQueue\`, max = \`Integer.MAX_VALUE\`) |
| \`newSingleThreadExecutor()\` | one thread, tasks run serially in order | unbounded queue; a stuck task blocks all others |
| \`newScheduledThreadPool(n)\` | delayed / periodic tasks | a thrown task silently kills future runs |
| \`newWorkStealingPool()\` | a \`ForkJoinPool\` sized to cores | not FIFO; for CPU-bound splittable work |
| \`newVirtualThreadPerTaskExecutor()\` | one **virtual thread** per task (Java 21) | cheap blocking, but don't pool virtual threads |

:::senior
For production, construct \`ThreadPoolExecutor\` directly (bounded queue + rejection policy) or use virtual threads — the fixed/cached factories each hide an **unbounded** resource.
:::`,
  },
  {
    id: 'mt-pools-cached-pool-danger',
    question: 'Why is `Executors.newCachedThreadPool()` dangerous under load?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['threadpool', 'cached', 'oom'],
    answer: `\`newCachedThreadPool()\` backs the pool with a **\`SynchronousQueue\`** — a queue with **zero capacity** — and sets \`maximumPoolSize\` to \`Integer.MAX_VALUE\`. A \`SynchronousQueue\` can only hand off a task if a thread is *already waiting* to take it, so every submission that finds all workers busy must **spawn a brand-new thread immediately**.

Under a burst that means **unbounded thread creation**: thousands of platform threads, each costing roughly **~1 MB** of stack, quickly leading to thread exhaustion or \`OutOfMemoryError: unable to create new native thread\`.

\`\`\`java
// what the factory hides
new ThreadPoolExecutor(0, Integer.MAX_VALUE,
    60L, TimeUnit.SECONDS, new SynchronousQueue<>());
\`\`\`

It is safe **only** for many short-lived, bursty, well-bounded tasks. For anything driven by external load, prefer a **bounded \`ThreadPoolExecutor\`** or a **virtual-thread executor**.

:::gotcha
A cached pool has no upper bound on threads. One traffic spike can create enough threads to take down the whole JVM.
:::`,
  },
  {
    id: 'mt-pools-scheduled-rate-vs-delay',
    question: '`scheduleAtFixedRate` vs `scheduleWithFixedDelay` — how do they differ, and what is the classic gotcha?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['scheduledexecutorservice', 'scheduling', 'periodic'],
    answer: `Both schedule repeating tasks on a \`ScheduledExecutorService\`; they differ in **where the clock starts**.

| | \`scheduleAtFixedRate\` | \`scheduleWithFixedDelay\` |
| --- | --- | --- |
| Period measured from | **start** of the previous run | **end** of the previous run |
| Goal | fixed **cadence** (e.g. every 10s) | fixed **gap** between runs |
| If a run overruns the period | next run fires **immediately** (runs never overlap, but bunch up) | next run fires \`delay\` **after** it finally finishes |

\`\`\`java
ses.scheduleAtFixedRate(this::poll, 0, 10, TimeUnit.SECONDS);
ses.scheduleWithFixedDelay(this::poll, 0, 10, TimeUnit.SECONDS);
\`\`\`

:::gotcha
If a scheduled task throws an **uncaught exception**, all future executions are **silently cancelled** — the schedule just stops, with no error and no retry. Always wrap the task body in \`try/catch\`.
:::`,
  },
  {
    id: 'mt-pools-cf-creation',
    question: 'What are the ways to create a `CompletableFuture`?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['completablefuture', 'supplyasync', 'creation'],
    answer: `Four common paths, depending on whether the value is computed asynchronously or supplied by hand:

- **\`supplyAsync(supplier[, executor])\`** — run a \`Supplier\` async, complete with its **return value**.
- **\`runAsync(runnable[, executor])\`** — run a \`Runnable\` async, completes with **\`Void\`**.
- **\`completedFuture(v)\`** — an already-complete future (handy in tests / short-circuits).
- **\`new CompletableFuture<>()\`** then \`complete(v)\` / \`completeExceptionally(ex)\` — **manual** completion, e.g. to bridge a callback-style API.

\`\`\`java
CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> load(), myPool);

CompletableFuture<String> b = new CompletableFuture<>();
api.onResult(b::complete, b::completeExceptionally);   // bridge a callback
\`\`\`

:::gotcha
Without an explicit \`executor\`, \`supplyAsync\`/\`runAsync\` run on \`ForkJoinPool.commonPool()\`. Pass your **own** executor for blocking work so you don't starve the shared commonPool.
:::`,
  },
  {
    id: 'mt-pools-cf-combine',
    question: 'How do you combine multiple `CompletableFuture`s (fan-out / fan-in)?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['completablefuture', 'allof', 'combine'],
    answer: `Three combinators cover most cases:

- **\`thenCombine(other, biFn)\`** — wait for **two** futures and merge their results.
- **\`allOf(cf...)\`** — completes when **all** finish; returns \`CF<Void>\`, so you re-read each source future for its value.
- **\`anyOf(cf...)\`** — completes with the result of the **first** to finish.

Fan-out then fan-in:

\`\`\`java
List<CompletableFuture<Item>> futures = ids.stream()
    .map(id -> CompletableFuture.supplyAsync(() -> fetch(id), pool))
    .toList();

CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();

List<Item> items = futures.stream().map(CompletableFuture::join).toList();
\`\`\`

:::key
\`allOf\` returns \`Void\` — it only signals completion. Collect the actual results by joining the **original** futures after it returns.
:::`,
  },
  {
    id: 'mt-pools-cf-timeout',
    question: 'How do you bound how long a `CompletableFuture` is allowed to take?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['completablefuture', 'timeout', 'resilience'],
    answer: `Two Java 9+ methods put a time bound on a stage so a hung dependency can't block the pipeline forever:

- **\`orTimeout(t, unit)\`** — if not done in time, complete it **exceptionally** with \`TimeoutException\`.
- **\`completeOnTimeout(fallback, t, unit)\`** — if not done in time, complete it with a **fallback value** instead.

\`\`\`java
fetchPrice()
    .orTimeout(2, TimeUnit.SECONDS)
    .exceptionally(ex -> cachedPrice());                    // degrade on timeout

fetchPrice()
    .completeOnTimeout(DEFAULT_PRICE, 2, TimeUnit.SECONDS); // fallback value
\`\`\`

Combine \`orTimeout\` with \`exceptionally\`/\`handle\` for a graceful degrade.

:::gotcha
A timeout completes the *future*, but the underlying task **keeps running** — \`orTimeout\` does not cancel or interrupt the work behind it.
:::`,
  },
  {
    id: 'mt-pools-chm-internals',
    question: 'How does `ConcurrentHashMap` achieve high concurrency since Java 8?',
    difficulty: 'Hard',
    category: 'High-Level Concurrency',
    tags: ['concurrenthashmap', 'internals', 'locking'],
    answer: `Java 8 dropped the old **segment locks**. The map is a single \`Node[]\` table of **bins** (hash buckets), and locking is per-bin:

1. **Empty bin** — insert with a lock-free **CAS** on the bin head; no lock at all in the common case.
2. **Collision** — \`synchronized\` on the **first node of that bin only**, so writes to different bins proceed in parallel (fine-grained locking).
3. **Treeify** — a bin exceeding **8** nodes converts from a linked list to a **red-black tree**, bounding worst-case lookups at **O(log n)**.
4. **Resize is cooperative** — threads that find a resize in progress **help transfer** bins instead of blocking.
5. **\`size()\`/\`mappingCount()\`** use striped counters (\`baseCount\` + \`CounterCell[]\`) — **weakly consistent**, not a lock.

\`\`\`java
map.get(k);                         // never blocks
map.computeIfAbsent(k, this::load); // locks one bin only
\`\`\`

Iterators are **weakly consistent** (no \`ConcurrentModificationException\`), and **null keys/values are forbidden** — a null \`get\` would be ambiguous under concurrency.

:::senior
Per-bin locking plus lock-free reads is why CHM scales with cores, where \`synchronizedMap\` (one global lock) serializes every access.
:::`,
  },
  {
    id: 'mt-pools-copyonwrite',
    question: 'When should you use `CopyOnWriteArrayList`?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['copyonwritearraylist', 'read-mostly', 'listeners'],
    answer: `Every mutation (\`add\`/\`set\`/\`remove\`) **copies the entire backing array** under a lock and swaps in the new one. Reads take **no lock** — they read a stable, effectively-immutable array — and iterators walk a **snapshot**, so they never throw \`ConcurrentModificationException\` and never reflect later writes.

**Use it for read-mostly, small, rarely-written collections.** The canonical case is a **listener / observer list**: read on every event, mutated only when someone subscribes.

\`\`\`java
private final List<Listener> listeners = new CopyOnWriteArrayList<>();
void fire(Event e) { for (Listener l : listeners) l.on(e); } // no lock, safe
\`\`\`

Avoid it for **write-heavy or large** collections: each write is **O(n)** plus a full allocation, which crushes throughput and churns GC.

| Need | Pick |
| --- | --- |
| Read-mostly listener list | \`CopyOnWriteArrayList\` |
| General concurrent map | \`ConcurrentHashMap\` |
| Occasional writes, simple | \`Collections.synchronizedList\` |

:::key
COW trades **O(n) writes** for lock-free reads and snapshot iteration — perfect for observer lists, wrong for write-heavy data.
:::`,
  },
  {
    id: 'mt-pools-synchronized-collections',
    question: 'Why does `Collections.synchronizedMap` still need external synchronization, and how does it differ from `ConcurrentHashMap`?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['synchronizedmap', 'concurrenthashmap', 'collections'],
    answer: `\`Collections.synchronizedMap\`/\`synchronizedList\` wrap **each method** in \`synchronized\` on a single mutex. One call is atomic, but two problems remain:

1. **Compound actions aren't atomic.** \`if (!m.containsKey(k)) m.put(k, v)\` is two locked calls with a gap between them — the classic check-then-act race.
2. **Iteration isn't safe by itself.** You must hold the lock manually across the whole loop or risk \`ConcurrentModificationException\`:

\`\`\`java
synchronized (m) {                     // required
    for (var e : m.entrySet()) { ... }
}
\`\`\`

It also **serializes all access** through one lock. \`ConcurrentHashMap\` instead uses **per-bin locking** (no global lock), offers **atomic combinators** (\`computeIfAbsent\`, \`merge\`) that fix check-then-act, and gives **weakly-consistent iterators** that need no external lock.

:::key
Synchronized wrappers = one lock + manual locking for compounds and iteration. Prefer the concurrent collections: they bake atomicity in and scale with cores.
:::`,
  },
  {
    id: 'mt-pools-concurrentskiplistmap',
    question: 'What is `ConcurrentSkipListMap` for?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['concurrentskiplistmap', 'navigablemap', 'sorted'],
    answer: `\`ConcurrentSkipListMap\` is a **thread-safe sorted map** (a \`NavigableMap\`), with \`ConcurrentSkipListSet\` as its \`Set\` sibling. It is implemented as a **lock-free skip list**, not a tree, giving **O(log n)** \`get\`/\`put\`/\`remove\` with **no global lock** and **weakly-consistent** iterators.

Reach for it when you need concurrency **and** ordering — there is **no concurrent \`TreeMap\`**.

\`\`\`java
ConcurrentSkipListMap<Long, Event> byTime = new ConcurrentSkipListMap<>();
byTime.put(now, e);
byTime.ceilingEntry(cutoff);    // navigation
byTime.headMap(cutoff).clear(); // range view
\`\`\`

It keeps keys in **sorted order** and supports the full navigable API: \`firstKey\`/\`lastKey\`, \`floor\`/\`ceiling\`/\`higher\`/\`lower\`, and range views \`headMap\`/\`tailMap\`/\`subMap\`.

:::key
Need a concurrent **sorted** or **navigable** map/set? Use \`ConcurrentSkipListMap\`/\`Set\` — \`ConcurrentHashMap\` is unordered and \`TreeMap\` isn't thread-safe.
:::`,
  },
  {
    id: 'mt-pools-managedblocker',
    question: 'How do you block safely inside a `ForkJoinPool` or parallel stream?',
    difficulty: 'Hard',
    category: 'High-Level Concurrency',
    tags: ['forkjoinpool', 'managedblocker', 'blocking'],
    answer: `A blocking call inside the \`commonPool\` ties up one of its few workers (sized ~\`cores - 1\`); enough blocked workers **stall every parallel stream and \`...Async\` task in the JVM**. The escape hatch is **\`ForkJoinPool.ManagedBlocker\`**: when a worker is about to block through it, the pool can spin up a **compensation thread** to preserve target parallelism.

\`\`\`java
class TakeBlocker<T> implements ForkJoinPool.ManagedBlocker {
    final BlockingQueue<T> q; T item;
    TakeBlocker(BlockingQueue<T> q) { this.q = q; }
    public boolean block() throws InterruptedException {
        if (item == null) item = q.take();          // the blocking call
        return true;
    }
    public boolean isReleasable() {
        return item != null || (item = q.poll()) != null;
    }
}
ForkJoinPool.managedBlock(new TakeBlocker<>(queue));
\`\`\`

- **\`block()\`** does the actual blocking and returns \`true\` when done.
- **\`isReleasable()\`** is a cheap non-blocking check, so the pool can skip compensation if the value is already available.

:::senior
\`ManagedBlocker\` mitigates starvation, but the cleaner fix is not to block the shared pool at all — use your **own executor** or **virtual threads**.
:::`,
  },
  {
    id: 'mt-pools-completionservice',
    question: 'What does `ExecutorCompletionService` give you over a list of `Future`s?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['completionservice', 'future', 'completion-order'],
    answer: `With a plain \`List<Future>\` you consume results in **submission order** — \`futures.get(0).get()\` blocks on the first task even if the third finished first. **\`ExecutorCompletionService\`** instead hands you results in **completion order (fastest-first)**: it wraps an executor and pushes each finished task onto an internal \`BlockingQueue\`.

\`\`\`java
var ecs = new ExecutorCompletionService<Item>(pool);
for (var id : ids) ecs.submit(() -> fetch(id));

for (int i = 0; i < ids.size(); i++) {
    Item item = ecs.take().get();   // next COMPLETED result, blocks
    process(item);                  // handle each the moment it's ready
}
\`\`\`

\`take()\` blocks for the next completed \`Future\`; \`poll()\` is the non-blocking variant. Ideal for **streaming results as they arrive**, or taking the **first successful** result and cancelling the rest.

:::key
List-of-Futures = submission order; \`ExecutorCompletionService\` = completion order. Use it whenever the fastest result should be processed first.
:::`,
  },
  {
    id: 'mt-pools-invokeall-invokeany',
    question: 'What do `invokeAll` and `invokeAny` do on an ExecutorService?',
    difficulty: 'Medium',
    category: 'High-Level Concurrency',
    tags: ['invokeall', 'invokeany', 'executor'],
    answer: `Both take a **collection of \`Callable\`s** and block, but return different things:

- **\`invokeAll(tasks)\`** — runs **all** tasks and **blocks until every one finishes** (or the optional timeout elapses, cancelling the unfinished ones). Returns a \`List<Future>\` in **input order**, each already done, so \`get()\` won't block.
- **\`invokeAny(tasks)\`** — a **race**: returns the result of the **first task to complete successfully** and **cancels the rest**. It throws \`ExecutionException\` only if **every** task fails.

\`\`\`java
List<Future<Row>> all = pool.invokeAll(queries); // wait for all, ordered
Row fastest = pool.invokeAny(replicaReads);       // first success wins
\`\`\`

| | \`invokeAll\` | \`invokeAny\` |
| --- | --- | --- |
| Returns | \`List<Future>\` (all) | one result |
| Order | input order | fastest success |
| Failure | reported per-future | throws only if **all** fail |

:::key
\`invokeAll\` = gather everything (ordered); \`invokeAny\` = first successful result, cancel the losers. Both accept a timeout.
:::`,
  },
  {
    id: 'mt-pools-graceful-shutdown',
    question: 'What is the canonical idiom for shutting down an ExecutorService gracefully?',
    difficulty: 'Hard',
    category: 'High-Level Concurrency',
    tags: ['shutdown', 'awaittermination', 'lifecycle'],
    answer: `Because \`shutdown()\` **doesn't block** and worker threads are **non-daemon** (a live pool keeps the JVM alive), you need a three-step drain: stop accepting work, wait for in-flight tasks, then force the stragglers.

\`\`\`java
void shutdownGracefully(ExecutorService pool) {
    pool.shutdown();                                   // 1. stop accepting new tasks
    try {
        if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
            pool.shutdownNow();                        // 2. interrupt stragglers
            if (!pool.awaitTermination(10, TimeUnit.SECONDS))
                log.warn("pool did not terminate");    // 3. give up
        }
    } catch (InterruptedException e) {
        pool.shutdownNow();
        Thread.currentThread().interrupt();            // restore the interrupt
    }
}
\`\`\`

- **\`shutdown()\`** — graceful; lets queued/running tasks finish, refuses new ones.
- **\`awaitTermination\`** — actually **blocks** until the pool drains or the timeout expires.
- **\`shutdownNow()\`** — interrupts running tasks and drops the queue once the grace period is exceeded.

:::senior
If \`awaitTermination\` is interrupted, call \`shutdownNow()\` **and restore the interrupt** with \`Thread.currentThread().interrupt()\` — swallowing it hides the cancellation from callers up the stack.
:::`,
  },
];

export default questions;
