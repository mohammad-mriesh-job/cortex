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
];

export default questions;
