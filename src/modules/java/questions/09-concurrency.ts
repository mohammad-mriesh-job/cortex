import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'conc-start-vs-run',
    question: 'What is the difference between calling start() and run() on a Thread?',
    difficulty: 'Easy',
    category: 'Concurrency',
    tags: ['threads', 'runnable'],
    answer: `- **\`start()\`** asks the JVM to create a **new thread** with its own call stack and schedule it; the JVM then invokes \`run()\` on that new thread. This is the only way to get concurrency.
- **\`run()\`** is just an ordinary method — calling it directly executes the body **on the current thread**, synchronously. No new thread is created.

\`\`\`java
t.start();  // concurrent, on a new thread
t.run();    // sequential, on the calling thread
\`\`\`

:::gotcha
Calling \`start()\` twice throws \`IllegalThreadStateException\` — a \`Thread\` is single-use. Use an \`ExecutorService\` to reuse workers.
:::`,
  },
  {
    id: 'conc-thread-states',
    question: 'Name the states in the Java thread lifecycle. Is there a "running" state?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['threads', 'lifecycle'],
    answer: `\`Thread.State\` has **six** values: \`NEW\`, \`RUNNABLE\`, \`BLOCKED\`, \`WAITING\`, \`TIMED_WAITING\`, \`TERMINATED\`.

There is **no separate "running" state** — \`RUNNABLE\` covers both "ready to run" and "currently executing on a CPU", because the JVM doesn't distinguish them from the OS scheduler.

| State | Trigger |
|-------|---------|
| \`BLOCKED\` | waiting for a monitor (\`synchronized\`) lock |
| \`WAITING\` | \`wait()\`, \`join()\`, \`park()\` with no timeout |
| \`TIMED_WAITING\` | \`sleep(t)\`, timed \`wait\`/\`join\` |`,
  },
  {
    id: 'conc-synchronized-vs-lock',
    question: 'When would you use a ReentrantLock instead of synchronized?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['locks', 'synchronized', 'reentrantlock'],
    answer: `Both give mutual exclusion and visibility via a reentrant lock. Choose **\`ReentrantLock\`** when you need capabilities \`synchronized\` lacks:

- **\`tryLock()\`** / \`tryLock(timeout)\` — back off instead of blocking forever (deadlock avoidance).
- **\`lockInterruptibly()\`** — respond to interruption while waiting.
- **Fairness** — \`new ReentrantLock(true)\` grants the lock in arrival order.
- **Multiple \`Condition\`s** — separate wait-sets on one lock.

\`\`\`java
lock.lock();
try { /* critical section */ }
finally { lock.unlock(); }   // MUST be in finally
\`\`\`

:::senior
The cost is discipline: forget the \`finally\` and you leak the lock. Prefer plain \`synchronized\` for simple mutual exclusion — it can't leak and is easier to read. Reach for \`ReentrantLock\` only when you need its extra features.
:::`,
  },
  {
    id: 'conc-volatile-vs-synchronized',
    question: 'volatile vs synchronized — what does each guarantee?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['volatile', 'synchronized', 'memory-model'],
    answer: `- **\`volatile\`** gives **visibility** and **ordering** for a single field (reads/writes hit main memory and aren't reordered across it) but **no atomicity** for compound actions.
- **\`synchronized\`** gives **mutual exclusion** *and* visibility (a happens-before edge on release/acquire), so it can make multi-step operations atomic.

\`\`\`java
volatile int n;
n++;                 // still a race: read-modify-write isn't atomic

synchronized void inc() { n++; }   // now atomic
\`\`\`

:::tip
Rule of thumb: \`volatile\` for a one-way flag or publishing an immutable reference; \`synchronized\` (or an \`Atomic*\` class) when an update reads and then writes the same state.
:::`,
  },
  {
    id: 'conc-happens-before',
    question: 'What is the happens-before relationship and why does it matter?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['memory-model', 'happens-before', 'visibility'],
    answer: `**Happens-before** is the Java Memory Model's ordering guarantee: if action A *happens-before* B, then A's memory effects are **visible** to B and A is ordered before B. Without such an edge there is **no** visibility guarantee — a thread may never see another's write.

Key edges (transitive):

- **Program order** within one thread.
- **Monitor**: unlock happens-before a later lock of the same monitor.
- **\`volatile\`**: a write happens-before a later read of that field.
- **Thread**: \`start()\` happens-before the thread's first action; a thread's last action happens-before \`join()\` returns.
- **\`final\` fields**: frozen at end of construction (if \`this\` doesn't escape).

:::gotcha
This is why a non-\`volatile\` stop flag can loop forever: no happens-before edge connects the writer's update to the reader, so the reader may cache a stale value.
:::`,
  },
  {
    id: 'conc-deadlock-prevention',
    question: 'What are the four conditions for deadlock, and how do you prevent it?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['deadlock', 'locks'],
    answer: `Deadlock needs **all four Coffman conditions** at once — break any one to prevent it:

1. **Mutual exclusion** — resources held exclusively.
2. **Hold and wait** — hold one lock while requesting another.
3. **No preemption** — locks can't be forcibly reclaimed.
4. **Circular wait** — a cycle of threads each waiting on the next.

The most practical fixes:

- **Global lock ordering** — always acquire locks in the same order (breaks *circular wait*). The standard answer to the two-account transfer problem.
- **\`tryLock(timeout)\`** — give up and retry instead of blocking (breaks *no preemption*).

\`\`\`java
Account first = a.id() < b.id() ? a : b;   // consistent order
synchronized (first) { synchronized (a == first ? b : a) { /* ... */ } }
\`\`\`

Diagnose a suspected deadlock with a thread dump (\`jstack\` / \`jcmd <pid> Thread.print\`) — the JVM prints "Found one Java-level deadlock" and names the cycle.`,
  },
  {
    id: 'conc-shutdown-vs-shutdownnow',
    question: 'Difference between ExecutorService.shutdown() and shutdownNow()?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['executors', 'thread-pool'],
    answer: `- **\`shutdown()\`** — *graceful*. Stops accepting new tasks but lets already-submitted ones (running **and** queued) finish.
- **\`shutdownNow()\`** — *forceful, best-effort*. **Interrupts** running threads, discards the queued tasks, and **returns** the list of tasks that never started.

\`\`\`java
pool.shutdown();
if (!pool.awaitTermination(30, TimeUnit.SECONDS)) {
    pool.shutdownNow();   // escalate
}
\`\`\`

:::gotcha
\`shutdownNow()\` only *interrupts* — tasks that ignore the interrupt flag keep running. Cooperative interruption handling is required for it to actually stop work. And you **must** shut a pool down: its non-daemon threads otherwise keep the JVM alive.
:::`,
  },
  {
    id: 'conc-threadpool-growth',
    question: 'How does ThreadPoolExecutor decide whether to queue a task or spawn a thread?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['executors', 'threadpoolexecutor', 'thread-pool'],
    answer: `On each submission it applies this order:

1. If fewer than **\`corePoolSize\`** threads exist, start a new **core** thread.
2. Else try to **enqueue** the task in the work queue.
3. If the queue is **full**, start a new thread up to **\`maximumPoolSize\`**.
4. If max is reached too, **reject** via the \`RejectedExecutionHandler\`.

\`\`\`text
core full? -> queue -> queue full? -> grow to max -> reject
\`\`\`

:::senior
The catch: \`Executors.newFixedThreadPool\` uses an **unbounded** \`LinkedBlockingQueue\`, so step 2 never fails — the pool never grows past core and a backlog can grow until \`OutOfMemoryError\`. In production, build a \`ThreadPoolExecutor\` with a **bounded** queue and an explicit rejection policy (e.g. \`CallerRunsPolicy\` for back-pressure).
:::`,
  },
  {
    id: 'conc-concurrenthashmap-internals',
    question: 'How does ConcurrentHashMap achieve thread safety in Java 8+?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['concurrenthashmap', 'collections'],
    answer: `Java 8 **dropped the old segment locks** (the Java 7 \`Segment\` array). It now uses the same bucket array as \`HashMap\` with **fine-grained, per-bucket** synchronization:

- **Reads are lock-free** — nodes and values are \`volatile\`, so \`get\` never blocks.
- **Insert into an empty bucket** uses a single **CAS** — no lock.
- **Insert into a non-empty bucket** synchronizes only on **that bucket's head node**, so other buckets proceed in parallel. Concurrency scales with bucket count, not a fixed segment count.
- Long chains **treeify** into red-black trees, like \`HashMap\`.

:::gotcha
It allows **no null keys or values**, iterators are **weakly consistent** (never throw \`ConcurrentModificationException\`), and \`size()\` is an estimate. For compound updates use the atomic combinators — \`putIfAbsent\`, \`compute\`, \`merge\`, \`computeIfAbsent\` — never check-then-act.
:::`,
  },
  {
    id: 'conc-thencompose-vs-thencombine',
    question: 'CompletableFuture: when do you use thenCompose vs thenCombine?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['completablefuture', 'async'],
    answer: `- **\`thenCompose\`** chains a **dependent** future — the next step needs the previous result and itself returns a \`CompletableFuture\`. It **flat-maps** \`CF<CF<U>>\` into \`CF<U>\` (avoids nesting).
- **\`thenCombine\`** merges **two independent** futures that run in **parallel**, applying a function to both results.

\`\`\`java
// dependent (sequential):
getUser(id).thenCompose(user -> getOrders(user));   // CF<Orders>

// independent (parallel), then merge:
priceFut.thenCombine(taxFut, (p, t) -> p.add(t));
\`\`\`

:::tip
Mnemonic: **compose** = "and then *do another async step*"; **combine** = "and when *both* are ready, merge". Use plain \`thenApply\` when the transform is synchronous and returns a plain value.
:::`,
  },
  {
    id: 'conc-cas-aba',
    question: 'What is compare-and-swap, and what is the ABA problem?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['atomics', 'cas', 'lock-free'],
    answer: `**CAS** is an atomic CPU instruction behind the \`Atomic*\` classes: given a location, an *expected* value, and a *new* value, it stores the new value **only if** the location still equals expected, reporting success/failure. Atomic updates loop: read, compute, \`compareAndSet\`, retry on failure — **lock-free** and deadlock-free.

The **ABA problem**: CAS only checks the value *equals* expected, not that it never changed. If a value goes \`A -> B -> A\`, a CAS expecting \`A\` **succeeds** even though state changed in between — harmless for a counter, but corrupting for reference-based lock-free structures (e.g. a reused stack node).

\`\`\`java
// Fix: pair the value with a version stamp
AtomicStampedReference<Node> top = new AtomicStampedReference<>(node, 0);
top.compareAndSet(curr, next, stamp, stamp + 1);  // value AND stamp must match
\`\`\`

:::tip
Under heavy contention, prefer \`LongAdder\` over \`AtomicLong\` — it stripes writes across cells to cut CAS retries.
:::`,
  },
  {
    id: 'conc-virtual-threads',
    question: 'What are virtual threads, and when do they help (or not)?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['virtual-threads', 'loom'],
    answer: `Virtual threads (Java 21, JEP 444) are lightweight, JVM-scheduled threads. They **mount** onto a small pool of **carrier** (platform) threads to run, and **unmount** when they block on I/O — freeing the carrier to run another virtual thread. So blocked virtual threads consume **no** OS thread, letting plain blocking code scale to **millions** of concurrent tasks.

\`\`\`java
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    requests.forEach(r -> exec.submit(() -> handle(r)));
}
\`\`\`

- **Great for** I/O-bound, high-concurrency, thread-per-request workloads.
- **No benefit** for CPU-bound work — you can't beat the core count.

:::gotcha
Pitfalls: **don't pool** virtual threads (create one per task; cap load with a \`Semaphore\`). On Java 21, blocking inside a \`synchronized\` block **pins** the carrier and hurts scalability — use \`ReentrantLock\` (largely fixed in JDK 24). And millions of threads make heavy \`ThreadLocal\` use expensive — prefer scoped values.
:::`,
  },
];

export default questions;
