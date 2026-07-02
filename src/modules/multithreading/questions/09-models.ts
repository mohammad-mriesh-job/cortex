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
];

export default questions;
