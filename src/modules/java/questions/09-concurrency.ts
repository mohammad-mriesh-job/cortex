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
  {
    id: 'conc-thread-vs-runnable-vs-callable',
    question: 'What is the difference between Thread, Runnable, and Callable?',
    difficulty: 'Easy',
    category: 'Concurrency',
    tags: ['threads', 'runnable', 'callable'],
    answer: `\`Thread\` is the **worker**; \`Runnable\` and \`Callable\` are the **task** it runs:

| | \`Runnable\` | \`Callable<V>\` |
|--|-----------|---------------|
| Method | \`run()\` | \`call()\` |
| Returns | \`void\` | a value \`V\` |
| Checked exceptions | **can't** throw | **can** throw |
| Result handle | — | a \`Future<V>\` |

\`\`\`java
Runnable r = () -> log.info("done");
Callable<Integer> c = () -> compute();     // returns a value, may throw

Future<Integer> f = executor.submit(c);
int result = f.get();                       // blocks for the result
\`\`\`

**Prefer implementing \`Runnable\`/\`Callable\` over extending \`Thread\`**: your class stays free to extend something else, the task is reusable across a thread pool, and it separates *what to do* from *how it runs*.

:::tip
You almost never create raw \`Thread\`s in application code — submit \`Runnable\`/\`Callable\` tasks to an \`ExecutorService\` and let it manage the threads.
:::`,
  },
  {
    id: 'conc-why-thread-pools',
    question: 'Why use an ExecutorService instead of creating threads with new Thread()?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['executors', 'thread-pool', 'executorservice'],
    answer: `A thread is **expensive** (~1 MB stack, an OS thread) and \`new Thread()\` per task is **unbounded** — a traffic spike spawns thousands of threads and thrashes or OOMs. An \`ExecutorService\` reuses a **bounded pool** of workers and decouples *submitting* work from *running* it.

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(8);
Future<Integer> f = pool.submit(() -> compute());
pool.shutdown();
\`\`\`

You gain: worker **reuse**, a **work queue**, \`Future\` results, lifecycle (\`shutdown\`/\`awaitTermination\`), scheduling (\`ScheduledExecutorService\`), and rejection policies.

Factory shortcuts: \`newFixedThreadPool\`, \`newCachedThreadPool\`, \`newSingleThreadExecutor\`, \`newScheduledThreadPool\`, \`newVirtualThreadPerTaskExecutor\` (Java 21).

:::senior
The \`Executors\` factories hide risky defaults — \`newFixedThreadPool\` uses an **unbounded** queue (backlog → OOM); \`newCachedThreadPool\` has **unbounded** thread growth. In production, construct a \`ThreadPoolExecutor\` directly with a **bounded** queue and an explicit \`RejectedExecutionHandler\`.
:::`,
  },
  {
    id: 'conc-future-vs-completablefuture',
    question: 'What does CompletableFuture add over a plain Future?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['future', 'completablefuture', 'async'],
    answer: `A \`Future\` (Java 5) is just a **handle** to a pending result — and it's frustratingly limited: \`get()\` **blocks**, you can't chain steps, register a callback, combine futures, or complete it manually.

\`CompletableFuture\` (Java 8) is a composable, **non-blocking** async pipeline:

| | \`Future\` | \`CompletableFuture\` |
|--|----------|----------------------|
| Get result | blocking \`get()\` | callbacks (\`thenApply\`, \`thenAccept\`) |
| Chain steps | no | \`thenCompose\` |
| Combine | no | \`thenCombine\`, \`allOf\`, \`anyOf\` |
| Errors | \`get\` throws | \`exceptionally\`, \`handle\` |
| Complete manually | no | \`complete(v)\` |

\`\`\`java
CompletableFuture.supplyAsync(() -> fetchUser(id))
    .thenApply(User::name)
    .exceptionally(ex -> "unknown")
    .thenAccept(System.out::println);   // never blocks
\`\`\`

:::gotcha
By default \`*Async\` methods run on the **common ForkJoinPool** — fine for CPU work, dangerous for blocking I/O (it can starve). Pass your own \`Executor\` for I/O-bound tasks.
:::`,
  },
  {
    id: 'conc-chm-vs-synchronizedmap',
    question: 'ConcurrentHashMap vs Collections.synchronizedMap — which and why?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['concurrenthashmap', 'synchronizedmap', 'collections'],
    answer: `Both are thread-safe, but they scale very differently:

- **\`Collections.synchronizedMap(map)\`** wraps a plain map so **every method** is \`synchronized\` on **one lock**. All access is serialized — no real concurrency — and **iteration still requires manual external synchronization** or it throws \`ConcurrentModificationException\`.
- **\`ConcurrentHashMap\`** uses **per-bucket** locking and lock-free reads, so many threads read and write in parallel. Its iterators are **weakly consistent** (never throw CME, no external lock needed).

\`\`\`java
// synchronizedMap: you MUST lock around iteration
synchronized (syncMap) { for (var e : syncMap.entrySet()) { ... } }

// ConcurrentHashMap: atomic compound ops, no external lock
chm.merge(key, 1, Integer::sum);
chm.computeIfAbsent(key, k -> load(k));
\`\`\`

**Use \`ConcurrentHashMap\`** for concurrent access. \`synchronizedMap\` is a legacy shim useful mainly to wrap a map type CHM can't (e.g. a \`LinkedHashMap\` for order).

:::gotcha
Neither makes **check-then-act** atomic across two calls. With CHM use \`putIfAbsent\`/\`compute\`/\`merge\`; with \`synchronizedMap\` hold the lock across the whole sequence.
:::`,
  },
  {
    id: 'conc-threadlocal',
    question: 'What is ThreadLocal, when is it useful, and what is its leak risk?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['threadlocal', 'thread-safety', 'memory-leak'],
    answer: `\`ThreadLocal<T>\` gives each thread its **own private copy** of a variable — no sharing, so no synchronization. Each thread's value is stored in a map keyed by the thread.

Good uses: per-thread context that would be painful to thread through every method — a non-thread-safe \`SimpleDateFormat\`, the current user/request/tenant, or a transaction/\`EntityManager\`:

\`\`\`java
static final ThreadLocal<SimpleDateFormat> FMT =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
String s = FMT.get().format(date);   // each thread gets its own formatter
\`\`\`

:::gotcha
On a **thread pool**, workers are reused, so a \`ThreadLocal\` value **survives into the next task** — leaking stale data (a security risk if it's user context) and pinning memory because the thread lives for the JVM's life. **Always \`remove()\` in a \`finally\`** at the end of the unit of work. (Virtual threads make heavy ThreadLocal use costly — prefer *scoped values* on Java 21+.)
:::`,
  },
  {
    id: 'conc-wait-notify',
    question: 'How do wait/notify/notifyAll work, and why must wait be called in a loop?',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['wait', 'notify', 'monitor', 'coordination'],
    answer: `\`wait\`, \`notify\`, and \`notifyAll\` are defined on \`Object\` because **any object** can be a monitor. You may call them **only while holding that object's lock** (inside \`synchronized\`), or you get \`IllegalMonitorStateException\`.

- \`wait()\` **atomically releases the lock** and parks the thread until it's notified (then it re-acquires the lock before returning).
- \`notify()\` wakes **one** waiting thread; \`notifyAll()\` wakes all (safer — prefer it).

Always wait inside a **\`while\` loop that re-checks the condition**:

\`\`\`java
synchronized (lock) {
    while (queue.isEmpty()) {   // NOT if — re-check after waking
        lock.wait();
    }
    return queue.remove();
}
\`\`\`

:::gotcha
Two reasons for the loop: **spurious wakeups** (a thread can wake without a notify), and with \`notifyAll\` another thread may have consumed the condition before you reacquire the lock. An \`if\` would proceed on a false condition. In modern code prefer \`BlockingQueue\`, \`Condition\`, or \`CountDownLatch\` over hand-rolled wait/notify.
:::`,
  },
  {
    id: 'conc-synchronized-mechanics',
    question: 'How does the synchronized keyword actually work?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['synchronized', 'monitor', 'intrinsic-lock', 'reentrancy'],
    answer: `Every Java object has an **intrinsic lock (monitor)**. \`synchronized\` acquires it on entry and releases it on exit, giving **mutual exclusion** and a **happens-before** edge (visibility of writes). *Which* object you lock matters:

\`\`\`java
synchronized void m() { }          // locks 'this' (the instance)
static synchronized void s() { }    // locks the Class object (Foo.class)
void n() { synchronized (lock) { } } // locks an explicit private object
\`\`\`

Key properties:
- **Reentrant** — a thread already holding a monitor can re-enter another \`synchronized\` block on the same monitor (so a synchronized method can call another).
- Instance lock and **class (static) lock are different locks** — they don't exclude each other.

:::gotcha
Never lock on something **shared or interned**: a \`String\` literal, a boxed \`Integer\` (cached), or a mutable field you reassign. The classic bugs are \`synchronized("lock")\` (every literal \`"lock"\` is the *same* interned object) and locking on a field that later changes to a different object. Use a \`private final Object lock = new Object();\`.
:::`,
  },
  {
    id: 'conc-synchronizers',
    question: 'Compare CountDownLatch, CyclicBarrier, and Semaphore.',
    difficulty: 'Hard',
    category: 'Concurrency',
    tags: ['countdownlatch', 'cyclicbarrier', 'semaphore', 'coordination'],
    answer: `Three coordination primitives from \`java.util.concurrent\`, each for a different pattern:

| Synchronizer | Purpose | Reusable? |
|--------------|---------|-----------|
| **CountDownLatch** | wait until N events complete (\`await\` blocks until \`countDown\` hits 0) | **no** (one-shot) |
| **CyclicBarrier** | N threads wait for **each other**, then all proceed together | **yes** |
| **Semaphore** | limit **concurrent access** to a resource via N permits | yes |

\`\`\`java
// Latch: main thread waits for 3 workers to finish
CountDownLatch done = new CountDownLatch(3);
// each worker: ... done.countDown();
done.await();                       // unblocks when count == 0

// Semaphore: at most 5 concurrent DB calls
Semaphore permits = new Semaphore(5);
permits.acquire(); try { callDb(); } finally { permits.release(); }
\`\`\`

Mnemonic: **latch** = "wait for others to *finish*", **barrier** = "wait for others to *arrive*", **semaphore** = "wait for a *permit*". (\`Phaser\` generalizes the barrier to multiple dynamic phases.)`,
  },
  {
    id: 'conc-producer-consumer',
    question: 'How do you implement the producer-consumer pattern safely?',
    difficulty: 'Medium',
    category: 'Concurrency',
    tags: ['producer-consumer', 'blockingqueue', 'backpressure'],
    answer: `Use a **\`BlockingQueue\`** — it handles all the locking and waiting for you. \`put()\` blocks when the queue is full; \`take()\` blocks when it's empty. No \`wait\`/\`notify\`, no missed signals:

\`\`\`java
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);  // bounded

// Producer
queue.put(task);            // blocks if full -> natural backpressure

// Consumer
while (running) {
    Task t = queue.take();  // blocks until an item is available
    process(t);
}
\`\`\`

A **bounded** queue is important: it applies **backpressure** so a fast producer can't exhaust memory. To stop consumers cleanly, enqueue a sentinel **"poison pill"** or interrupt them.

:::senior
Hand-rolling this with \`wait\`/\`notify\` is a rite of passage but error-prone (missed notifications, forgotten loop condition). In real code always reach for \`BlockingQueue\`, or an \`ExecutorService\` (which *is* a producer-consumer with a built-in queue and worker pool).
:::`,
  },
  {
    id: 'conc-race-condition',
    question: 'What is a race condition, and what does thread-safe mean?',
    difficulty: 'Easy',
    category: 'Concurrency',
    tags: ['race-condition', 'thread-safety', 'atomicity'],
    answer: `A **race condition** is when a program's correctness depends on the **timing/interleaving** of threads touching shared mutable state. The two classic shapes are **read-modify-write** and **check-then-act**:

\`\`\`java
count++;   // NOT atomic: read count, add 1, write back — two threads can lose an update
if (!map.containsKey(k)) map.put(k, v);   // check-then-act: both threads may put
\`\`\`

Two threads running \`count++\` a million times each can end well below two million.

**Thread-safe** means a class behaves correctly under concurrent access **without** callers adding their own synchronization. Ways to get there:

1. **No shared state** — confine data to one thread (stack/\`ThreadLocal\`).
2. **Immutability** — an object that never changes has no races.
3. **Synchronization** — \`synchronized\`, locks, or \`Atomic*\`/concurrent collections for shared mutable state.

:::key
Races need three ingredients: **shared** + **mutable** + **concurrent** state. Remove any one — don't share, don't mutate, or don't run concurrently — and the race is gone.
:::`,
  },
];

export default questions;
