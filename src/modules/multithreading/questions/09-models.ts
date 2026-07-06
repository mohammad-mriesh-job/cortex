import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-models-immutable-why',
    question: 'Why are properly immutable objects inherently thread-safe?',
    difficulty: 'Easy',
    category: 'Concurrency Models',
    tags: ['immutability', 'thread safety', 'final'],
    answer: `An object is **immutable** when its state cannot change after construction: the class prevents subclassing, all fields are \`final\`, there are no setters, and any mutable input/output is **defensively copied**.

Because nothing can mutate it, every thread can only ever **read** it — and concurrent reads of unchanging data need no synchronization at all. There is no lost update, no torn read, nothing to lock.

\`\`\`java
public final class Point {
  private final int x, y;        // final, no setters
  public Point(int x, int y) { this.x = x; this.y = y; }
}
\`\`\`

Bonus from the JMM: once a constructor with only \`final\` fields returns, those fields are **safely published** — other threads are guaranteed to see them fully initialized without \`volatile\`.`,
  },
  {
    id: 'mt-models-share-by-communicating',
    question: 'What does the CSP slogan "share memory by communicating" mean?',
    difficulty: 'Easy',
    category: 'Concurrency Models',
    tags: ['csp', 'channels', 'go', 'message passing'],
    answer: `It is the inversion of the lock-based mindset. Instead of many threads sharing one variable and guarding it with a mutex ("communicate by sharing memory"), CSP has processes **pass the value to each other over a channel** ("share memory by communicating").

Ownership of the data effectively **moves** through the channel, so only one goroutine holds it at a time — there is no shared mutable state to protect, and therefore no lock.

\`\`\`go
ch := make(chan Job)
go func() { ch <- makeJob() }()   // producer hands the job off
job := <-ch                       // consumer now owns it
\`\`\`

Go popularized this; Java's closest analog is a \`BlockingQueue\`.`,
  },
  {
    id: 'mt-models-event-loop-thread',
    question: 'How many threads does a Node.js event loop run your JavaScript on, and how does it still serve thousands of connections?',
    difficulty: 'Easy',
    category: 'Concurrency Models',
    tags: ['event loop', 'async', 'node', 'non-blocking io'],
    answer: `Your JavaScript runs on **one** thread. The event loop achieves concurrency without extra threads by never blocking that thread:

- Blocking work (network, disk) is handed to the **OS/kernel**.
- The loop immediately moves on to the next ready **callback** in its queue.
- When the IO completes, its callback is **enqueued**, and the loop runs it later.

So one thread interleaves tens of thousands of connections — this is **concurrency, not parallelism**. Each callback runs to completion, so within a callback you never see a race.

:::gotcha
Because there is only one thread, a long CPU-bound callback **blocks every connection**. Offload heavy computation to \`worker_threads\`.
:::`,
  },
  {
    id: 'mt-models-threadlocal-leak',
    question: 'Why can ThreadLocal cause a memory leak in a thread pool, and how do you prevent it?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['threadlocal', 'thread pool', 'memory leak', 'confinement'],
    answer: `\`ThreadLocal\` stores a value in a per-thread slot. In a **thread pool**, threads are reused and effectively never die, so their slots are **never cleared** — the stored value stays reachable across unrelated tasks.

That leaks the value indefinitely, and because a ThreadLocal value can pin an entire **classloader**, it is a classic cause of \`OutOfMemoryError\` on app-server redeploys.

**Fix:** always \`remove()\` in a \`finally\` block so the pooled thread is clean for its next task:

\`\`\`java
try {
  FMT.get().format(date);
} finally {
  FMT.remove();     // clear the slot before the thread is recycled
}
\`\`\`

:::key
ThreadLocal is thread confinement made easy, but on a pooled thread you own the cleanup — \`remove()\` or leak.
:::`,
  },
  {
    id: 'mt-models-actor-no-lock',
    question: 'Why does an actor never need a lock to protect its own state?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['actor model', 'akka', 'mailbox', 'isolation'],
    answer: `A data race requires **two threads touching one piece of state at the same time**. An actor structurally makes that impossible:

1. **Isolation** — the actor's state is private; no other actor can reach into it.
2. **Serial processing** — the actor pulls messages from its **mailbox** and handles them **one at a time**.

Since only the actor mutates its state, and only from that single-at-a-time loop, there is never concurrent access — so no lock is needed. Other actors influence it *only* by sending asynchronous messages.

\`\`\`text
sender --tell(msg)--> [ mailbox: m3 m2 m1 ] --> actor handles one at a time
\`\`\`

The trade-off: you now reason about **message protocols and ordering** instead of locks.`,
  },
  {
    id: 'mt-models-actor-vs-csp',
    question: 'The actor model and CSP both pass messages. What is the key difference?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['actor model', 'csp', 'channels', 'comparison'],
    answer: `They look alike; the difference is **what you name**.

| | Actor model | CSP |
|--|--|--|
| Target | a **named actor** (its mailbox) | an **anonymous channel** |
| Coupling | sender knows the recipient | sender/receiver decoupled by the channel |
| Buffering | mailbox, usually unbounded | channel, often unbuffered / small |
| Sync | async send, never blocks | unbuffered send blocks until received |
| Examples | Erlang, Akka | Go, Clojure core.async |

An **actor** message goes to a specific recipient you hold a reference to. A **CSP** message goes onto a channel that belongs to neither side; whoever is listening receives it. A practical consequence: unbuffered CSP channels give **backpressure** for free (the sender blocks), while an actor's unbounded mailbox does not.`,
  },
  {
    id: 'mt-models-block-event-loop',
    question: 'What happens if you run a CPU-heavy computation directly on the event loop, and what is the fix?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['event loop', 'blocking', 'worker threads', 'node'],
    answer: `Callbacks run **to completion** on the single loop thread, and nothing preempts them. So a long synchronous computation — a big \`JSON.parse\`, a sync crypto hash, a tight loop — **blocks the entire process**. Every other connection freezes because there is no other thread to make progress.

**Fixes:**
- Offload CPU-bound work to **worker threads** (\`worker_threads\` in Node) or a thread pool, and post the result back as a callback.
- Never call **synchronous/blocking** APIs (\`fs.readFileSync\`, a blocking DB driver) on the loop.
- For CPU parallelism across cores, run **multiple event loops** (Node \`cluster\`, one process per core).

:::gotcha
"Just add a thread" does not help a loop that has exactly one thread — you must move the work *off* the loop entirely.
:::`,
  },
  {
    id: 'mt-models-vthread-vs-platform',
    question: 'What is the difference between a Java virtual thread and a platform thread?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['virtual threads', 'project loom', 'platform threads', 'jvm'],
    answer: `A **platform thread** is a thin 1:1 wrapper over an **OS thread** — ~1 MB of stack, expensive to create, so you have thousands at most and pool them. When it blocks, the whole OS thread is parked.

A **virtual thread** (Java 21, Project Loom) is scheduled **M:N** onto a small pool of **carrier** platform threads. It costs a few hundred bytes, so you can have **millions**. When it makes a blocking call, Loom **unmounts** it from its carrier — the carrier runs another virtual thread meanwhile — and remounts it when the IO is ready.

\`\`\`java
// One virtual thread per task; blocking is cheap, no pool budget
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
  requests.forEach(r -> exec.submit(() -> handleBlocking(r)));
}
\`\`\`

The payoff: write **simple blocking code**, get event-loop-scale concurrency. Both run truly in parallel across cores.`,
  },
  {
    id: 'mt-models-gil',
    question: 'Why do Python (CPython) threads not speed up CPU-bound work, and when are they still useful?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['python', 'gil', 'threads', 'multiprocessing'],
    answer: `CPython has a **Global Interpreter Lock (GIL)**: only one thread may execute Python **bytecode** at a time. Threads are real OS threads and interleave, but they never run Python code **in parallel**, so a CPU-bound workload sees no speedup (and some overhead) from threading.

**Threads are still useful for IO-bound work:** a thread that blocks on a socket or file **releases the GIL** while it waits, letting another thread run. So concurrency for waiting = fine; parallelism for computing = not from threads.

**For CPU parallelism:** use \`multiprocessing\` (separate processes, separate GILs), a native extension that releases the GIL, or free-threaded builds (PEP 703, experimental in 3.13+).

:::key
GIL = one bytecode interpreter at a time. Threads for IO waits, processes for CPU work.
:::`,
  },
  {
    id: 'mt-models-vthread-pinning',
    question: 'What is virtual-thread "pinning," why is it a problem, and how do you avoid it?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['virtual threads', 'pinning', 'synchronized', 'reentrantlock'],
    answer: `A virtual thread normally **unmounts** its carrier when it blocks, freeing that carrier to run other virtual threads. **Pinning** is when it *cannot* unmount — it stays glued to its carrier while blocked.

It happens when a virtual thread blocks:
- **inside a \`synchronized\` block/method**, or
- during a **native (JNI) call**.

**Why it hurts:** the carrier pool is small (roughly the number of cores). Enough pinned virtual threads blocked at once and every carrier is occupied — no other virtual thread can run, and you are back to the platform-thread scaling wall, possibly deadlocking.

**Fixes:**
\`\`\`java
// Prefer ReentrantLock over synchronized around long blocking sections
private final ReentrantLock lock = new ReentrantLock();
lock.lock();
try { blockingIo(); } finally { lock.unlock(); }   // can unmount while blocked
\`\`\`
Keep \`synchronized\` sections short and non-blocking. (Newer JDKs are steadily reducing what pins, but the interview answer is: use \`ReentrantLock\`.)`,
  },
  {
    id: 'mt-models-structured-concurrency',
    question: 'What problem does structured concurrency solve, and how does StructuredTaskScope work?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['structured concurrency', 'virtual threads', 'cancellation', 'jvm'],
    answer: `Cheap threads (virtual threads, goroutines) make **fire-and-forget** easy — and that leaks: subtasks outlive their parent, errors get swallowed, and cancellation is ad hoc. **Structured concurrency** ties a group of concurrent subtasks to a lexical **scope**, so they behave like a single unit of work.

With \`StructuredTaskScope\` (JDK 21+ preview):
- The parent **does not return** until all forked children finish (\`join()\`).
- If one child **fails**, the siblings are **cancelled** (\`ShutdownOnFailure\`).
- Errors **propagate** to the parent like a normal call stack — no orphaned threads.

\`\`\`java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
  var user  = scope.fork(() -> fetchUser(id));
  var order = scope.fork(() -> fetchOrder(id));
  scope.join().throwIfFailed();     // both succeed, or the whole scope fails fast
  return new Page(user.get(), order.get());
}
\`\`\`

It is the disciplined counterpart to unstructured spawning — Go expresses the same intent with \`errgroup\` and \`context\` cancellation.`,
  },
  {
    id: 'mt-models-unbuffered-channel-backpressure',
    question: 'What is the difference between a buffered and unbuffered channel, and how does that relate to backpressure?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['csp', 'channels', 'backpressure', 'deadlock', 'go'],
    answer: `An **unbuffered** channel is a synchronous **rendezvous**: a send blocks until a receiver is ready to take the value (and vice versa). A **buffered** channel of size N lets the sender proceed while there is spare capacity, decoupling producer and consumer up to N items.

**Backpressure:** with an unbuffered (or full bounded) channel, a **fast producer blocks** when the consumer lags — the system self-throttles for free. That is a feature: it prevents unbounded memory growth. An actor's unbounded mailbox, by contrast, gives *no* backpressure and can OOM under overload.

:::gotcha
The flip side is **deadlock/leaks**: a send on an unbuffered channel with **no receiver** blocks that goroutine forever (a silent leak), and sending on a **closed** channel panics. Buffer size is a real design decision — too small stalls throughput, too large hides overload until you run out of memory.
:::

\`\`\`go
unbuf := make(chan int)      // handoff + backpressure
buf   := make(chan int, 100) // decoupled up to 100, then blocks
\`\`\``,
  },
  {
    id: 'mt-models-overview',
    question: 'Compare the main server concurrency models.',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['concurrency-models', 'comparison', 'scalability', 'server'],
    answer: `Every server model answers one question: how do you serve many concurrent requests without paying for one OS thread per in-flight request? Each trades **simplicity of code** against **scalability and control** — here is the landscape.

| Model | How it scales | Mental model | Main pain point |
|--|--|--|--|
| Thread-per-request | one platform thread per request | simple blocking code | ~1 MB/thread caps you at a few thousand |
| Event loop / async | one thread + callback queue | never block the loop | one CPU hog blocks everyone |
| Reactive | async streams + backpressure | composable operators | hard to read and debug |
| Actors | isolated state + async messages | mailboxes, no shared state | protocol design, no backpressure |
| CSP | channels + ownership transfer | hand values off | channel/deadlock reasoning |
| Coroutines / virtual threads | cheap M:N user threads | blocking-style code that scales | pinning, newer tooling |

:::key
Modern default: coroutines/virtual threads give you event-loop scale while keeping thread-per-request's simple, debuggable code.
:::`,
  },
  {
    id: 'mt-models-reactive',
    question: 'What is reactive programming, and what are its trade-offs?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['reactive', 'reactive-streams', 'backpressure', 'project-reactor'],
    answer: `**Reactive programming** models computation as asynchronous **streams of events**. Under the Reactive Streams spec (Project Reactor, RxJava) a \`Publisher\` emits items to a \`Subscriber\` with non-blocking **backpressure**: the subscriber \`request(n)\`s only what it can handle, so a fast producer can't overwhelm it.

**Wins:**
- High throughput on **few threads** — nothing blocks.
- Rich, composable operators (\`map\`, \`flatMap\`, \`merge\`, \`retry\`).

**Costs:**
- Steep learning curve.
- **Unreadable stack traces** — the "stack" is the operator chain, not your code.
- Async **"coloring"** spreads: once one method returns \`Mono\`/\`Flux\`, its callers must too.
- \`ThreadLocal\`/context propagation is painful — you thread a \`Context\` object manually.

:::senior
Java 21 virtual threads recover most of reactive's scalability with plain **blocking** code, so for ordinary CRUD/IO services reactive is often no longer worth its complexity. Reach for it when you genuinely need stream composition and fine-grained backpressure.
:::`,
  },
  {
    id: 'mt-models-coroutines',
    question: 'What are coroutines and how do they relate to threads?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['coroutines', 'kotlin', 'suspend', 'structured-concurrency'],
    answer: `A **coroutine** is a **suspendable** function multiplexed onto a small pool of OS threads (Kotlin \`suspend\` functions, Python \`async def\`, and conceptually Go goroutines). At a **suspension point** — an \`await\`/\`suspend\` — the coroutine **yields its thread** so another can run, then resumes later exactly where it left off.

So thousands of coroutines share a handful of threads **cheaply** — the same idea as Java virtual threads. Contrast with OS threads, which the kernel schedules **preemptively** and which cost ~1 MB of stack each.

\`\`\`kotlin
suspend fun load(id: Int) = coroutineScope {   // structured: binds children
  val user  = async { fetchUser(id) }          // suspends, does not block
  val order = async { fetchOrder(id) }
  Page(user.await(), order.await())
}
\`\`\`

Kotlin adds **structured concurrency**: \`coroutineScope\` won't return until its children finish, and a child's failure cancels the siblings.`,
  },
  {
    id: 'mt-models-message-vs-shared',
    question: 'What is the difference between shared-memory and message-passing concurrency?',
    difficulty: 'Easy',
    category: 'Concurrency Models',
    tags: ['message-passing', 'shared-memory', 'comparison', 'locks'],
    answer: `Two ways for concurrent tasks to coordinate:

- **Shared memory** — tasks read/write **common state** and coordinate with locks/atomics. Fast (no copying) but **race-prone**: forget a lock and you get lost updates or torn reads. This is classic Java threading.
- **Message passing** — isolated tasks **send values** (copied, or ownership-transferred) over channels/mailboxes. No shared mutable state means **no locks**, but you pay a copying cost and must design **protocols**. Actors and CSP live here.

| | Shared memory | Message passing |
|--|--|--|
| Coordinate via | locks, atomics | channels, mailboxes |
| Cost | cheap (no copy) | copy / handoff |
| Main risk | data races, deadlock | protocol design, buffering |
| Examples | Java threads, C pthreads | Erlang, Go, Akka |

:::key
"Do not communicate by sharing memory; share memory by communicating." Message passing trades raw speed for structural safety.
:::`,
  },
  {
    id: 'mt-models-vthreads-vs-reactive',
    question: 'Virtual threads vs reactive programming for I/O scalability — which and why?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['virtual-threads', 'reactive', 'project-loom', 'comparison'],
    answer: `Both let a **handful of OS threads** serve huge concurrency — they just get there in opposite ways.

- **Reactive** wins by **never blocking**: callbacks and operators keep the thread busy. The cost is an entire async programming model — poor debuggability, unreadable stack traces, and context-propagation pain.
- **Virtual threads** win by making **blocking cheap**: the JVM unmounts the virtual thread from its carrier on a blocking call. You keep simple, sequential, **thread-per-request** code with normal stack traces and \`ThreadLocal\`s.

| | Reactive | Virtual threads |
|--|--|--|
| Mechanism | never block | block cheaply (unmount) |
| Code style | operator chains | plain sequential |
| Debugging | hard | normal stack traces |
| Backpressure | built-in operators | manual (\`Semaphore\`/queue) |

:::senior
Loom aims to make reactive **unnecessary** for the common blocking-IO case. Reactive still wins where you genuinely need **stream composition** and fine-grained **backpressure** operators.
:::`,
  },
  {
    id: 'mt-models-thread-per-request',
    question: 'What is the thread-per-request model and why did it dominate for so long?',
    difficulty: 'Easy',
    category: 'Concurrency Models',
    tags: ['thread-per-request', 'blocking-io', 'platform-threads', 'scalability'],
    answer: `Dedicate **one thread to each request** (or connection) and write straightforward **blocking** code; the OS scheduler interleaves the threads across cores. This was the default for servlets, JDBC, and classic HTTP servers for two decades.

**Why it dominated:**
1. **Simple mental model** — code reads top-to-bottom, no callbacks.
2. **Great stack traces** — one request maps to one stack.
3. Works with all the **blocking** JDBC/HTTP/file APIs everyone already had.

**The catch:** on **platform threads** each costs ~1 MB of stack plus OS scheduling overhead, capping you at a few **thousand** concurrent requests. That scaling wall is exactly what pushed people toward event loops and reactive.

:::key
Java 21 **virtual threads** keep the simple thread-per-request model but remove the wall — millions of cheap threads instead of thousands of expensive ones.
:::`,
  },
  {
    id: 'mt-models-carrier-continuations',
    question: 'How do virtual threads work under the hood (carriers and continuations)?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['virtual-threads', 'continuations', 'carrier-threads', 'project-loom'],
    answer: `A virtual thread runs on a **carrier** — a platform thread from a small \`ForkJoinPool\` (by default, one carrier per core). The magic is what happens when it blocks.

1. At a blocking point, the JVM captures the virtual thread's call stack as a **continuation** and **unmounts** it from the carrier.
2. The freed carrier immediately **mounts and runs another** virtual thread.
3. When the blocking operation completes, the virtual thread is **re-mounted** — possibly on a *different* carrier — and resumes exactly where it left off.

Its stack lives on the **heap** and grows/shrinks on demand — that's why a virtual thread costs hundreds of bytes rather than ~1 MB.

:::gotcha
**Pinning** breaks this: inside a \`synchronized\` block or a **native/JNI** call the virtual thread **can't unmount** and stays glued to its carrier while blocked. Enough pinned threads exhaust the tiny carrier pool.
:::`,
  },
  {
    id: 'mt-models-vthread-when-not',
    question: 'When should you NOT use virtual threads?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['virtual-threads', 'cpu-bound', 'semaphore', 'scoped-value'],
    answer: `Virtual threads shine at **blocking IO**. They are the wrong tool when there is no blocking to hide, or when their cheapness works against you.

1. **CPU-bound work** — there's nothing to unmount on, so millions of virtual threads just **oversubscribe** the cores. Use a bounded pool sized to the core count.
2. **Code that pins** — long \`synchronized\` sections or native calls hold a carrier and can starve the pool.
3. **Limiting a scarce resource** — don't pool virtual threads to cap concurrency; use a \`Semaphore\` around the resource instead.
4. **ThreadLocal-heavy code** — millions of per-thread copies waste memory; prefer \`ScopedValue\`.

\`\`\`java
// Cap DB concurrency with a Semaphore, not a small pool
Semaphore db = new Semaphore(20);
db.acquire();
try { query(); } finally { db.release(); }
\`\`\`

:::key
Rule of thumb: create **one virtual thread per task, never pool them** — pool the *resource*, not the thread.
:::`,
  },
  {
    id: 'mt-models-async-await',
    question: "What is the async/await model, and what is the 'function coloring' problem?",
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['async-await', 'function-coloring', 'coroutines', 'javascript'],
    answer: `**async/await** (JavaScript, C#, Python, Rust) is syntactic sugar over callbacks/futures. \`await\` **suspends** the current function until a future completes, then resumes it — **without blocking** the underlying thread — so you write sequential-looking asynchronous code.

\`\`\`js
async function load(id) {
  const user = await fetchUser(id);   // suspends here; thread runs other work
  return render(user);
}
\`\`\`

**The coloring problem:** \`async\` is **contagious**. An \`async\` function can only be \`await\`ed by another \`async\` function, so the ecosystem splits into two "colors" — async and sync — and you end up duplicating or bridging APIs across the divide (\`fetch\` vs a sync equivalent).

:::senior
**Goroutines and virtual threads avoid coloring entirely**: any ordinary function can block and be unmounted, so there are no two colors of function — one API works everywhere.
:::`,
  },
  {
    id: 'mt-models-fork-join',
    question: 'What is the fork/join model?',
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['fork-join', 'work-stealing', 'parallelism', 'recursive-task'],
    answer: `A **divide-and-conquer** parallelism model: recursively **split** a task into subtasks (**fork**), solve them in parallel, then **join** and combine the results. In Java you extend \`RecursiveTask\`/\`RecursiveAction\` and submit to a \`ForkJoinPool\`, which uses **work-stealing** — idle threads steal subtasks from busy threads' deques — to balance load.

\`\`\`java
class SumTask extends RecursiveTask<Long> {
  protected Long compute() {
    if (hi - lo <= THRESHOLD) return sequentialSum();   // small enough
    int mid = (lo + hi) >>> 1;
    var left = new SumTask(lo, mid).fork();             // fork
    long right = new SumTask(mid, hi).compute();
    return right + left.join();                          // join
  }
}
\`\`\`

It suits **CPU-bound, splittable** problems (parallel sort, sum, search); Java's **parallel streams** are built on it.

:::gotcha
Only split until subtasks are **large enough to amortize** fork/join overhead — a sequential **threshold**. Split too finely and coordination cost dominates the real work.
:::`,
  },
  {
    id: 'mt-models-disruptor-spsc',
    question: 'How can specialized queues beat a general BlockingQueue?',
    difficulty: 'Hard',
    category: 'Concurrency Models',
    tags: ['disruptor', 'ring-buffer', 'spsc', 'false-sharing'],
    answer: `By **exploiting how many producers and consumers** there actually are. A general \`BlockingQueue\` must stay safe for **many-to-many** (MPMC), which forces a lock or CAS on every operation.

A **single-producer/single-consumer (SPSC)** **ring buffer** needs almost no synchronization — just **memory barriers** on the head/tail indices, since only one thread writes each. That is dramatically faster than MPMC's contended CAS.

The **LMAX Disruptor** pushes this further with **mechanical sympathy**:
- a **preallocated** ring buffer (no per-item allocation or GC churn),
- **sequence counters** instead of locks,
- **cache-line padding** to avoid **false sharing** of the hot counters.

The result is millions of ops/sec, far outrunning a lock-based \`ArrayBlockingQueue\` for its use case.

:::senior
The lesson isn't "use the Disruptor everywhere" — it's **match the data structure to the exact concurrency pattern**. Knowing you have one producer and one consumer is worth a large constant factor.
:::`,
  },
  {
    id: 'mt-models-green-threads-history',
    question: "How has Java's threading model evolved — and why does it feel like it went in a circle?",
    difficulty: 'Medium',
    category: 'Concurrency Models',
    tags: ['green-threads', 'virtual-threads', 'history', 'jvm'],
    answer: `Java's threading has come full circle — user threads, to OS threads, back to user threads — but smarter each time.

| Era | Model | Mapping | Trade-off |
|--|--|--|--|
| Java 1.1 | **Green threads** | M:1 (JVM on one OS thread) | cheap, but **can't use multiple cores** and one blocking syscall froze **all** of them |
| Java 1.2/1.3+ | **Native threads** | 1:1 (OS-scheduled) | true multicore parallelism, but ~1 MB each — reigned for ~20 years |
| Java 21 | **Virtual threads** | M:N (user-mode) | cheap **and** multicore — the best of both |

Virtual threads revive green threads' cheapness **without** their two flaws: they run on **many carriers** so they use every core, and they **unmount** on IO instead of blocking the carrier.

:::key
It looks circular but isn't: green threads couldn't parallelize or survive a blocking syscall; virtual threads fix both.
:::`,
  },
];

export default questions;
