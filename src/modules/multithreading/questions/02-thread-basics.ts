import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-basics-runnable-vs-thread',
    question: 'What are the ways to create a thread in Java, and why is implementing Runnable usually preferred over extending Thread?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['thread', 'runnable', 'creation'],
    answer: `You can run work on another thread by:
- **Extending \`Thread\`** and overriding \`run()\`.
- **Implementing \`Runnable\`** and passing it to a \`Thread\` (or an executor).
- **Implementing \`Callable<V>\`** to return a value, submitted to an \`ExecutorService\` for a \`Future\`.
- **Submitting** a task to an \`ExecutorService\` (the usual choice).

**Prefer \`Runnable\`** because Java allows only one superclass — subclassing \`Thread\` wastes that slot and welds your business logic to the thread mechanism. A \`Runnable\` is just a task, so it can be handed to any \`Thread\`, a pool, or wrapped however you like.

:::key
Runnable/Callable = the *task*; Thread/ExecutorService = the *runner*. Keep them separate.
:::`,
  },
  {
    id: 'mt-basics-start-vs-run',
    question: 'What is the difference between calling start() and run() on a Thread?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['thread', 'start', 'run'],
    answer: `- **\`start()\`** asks the JVM to create a **new** thread and invoke \`run()\` on it. Work happens concurrently.
- **\`run()\`** is an ordinary method call — it executes the body **on the current thread**. No new thread is created, no concurrency happens.

\`\`\`java
Thread t = new Thread(() -> System.out.println(Thread.currentThread().getName()));
t.start();  // prints "Thread-0"  (new thread)
t.run();    // prints "main"      (no new thread)
\`\`\`

:::gotcha
Calling \`start()\` **twice** on the same \`Thread\` throws \`IllegalThreadStateException\`. A Thread object is single-use.
:::`,
  },
  {
    id: 'mt-basics-daemon-basics',
    question: 'What is a daemon thread and how does it affect JVM shutdown?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['daemon', 'jvm-exit', 'lifecycle'],
    answer: `A **daemon thread** is a background thread that does **not** keep the JVM alive. The JVM exits once the **last user (non-daemon) thread** finishes, and any remaining daemon threads are then **killed abruptly**.

Set it with \`t.setDaemon(true)\` **before** \`start()\` (otherwise \`IllegalThreadStateException\`). Threads inherit daemon status from the thread that creates them.

Use daemons for background chores like heartbeats, cache eviction, or monitoring — never for work that must complete.`,
  },
  {
    id: 'mt-basics-callable-future',
    question: 'How do Callable and Future let you get a result back from a thread?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['callable', 'future', 'executorservice'],
    answer: `A **\`Callable<V>\`** is like a \`Runnable\` but its \`call()\` **returns a value** and may throw a checked exception. You submit it to an \`ExecutorService\`, which hands back a **\`Future<V>\`** — a handle to the eventual result.

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(2);
Future<Integer> f = pool.submit(() -> 6 * 7);
Integer answer = f.get();   // blocks until ready, returns 42
\`\`\`

- \`future.get()\` **blocks** until the task completes; it can take a **timeout**.
- If the task threw, \`get()\` wraps it in an \`ExecutionException\`.
- \`future.cancel(true)\` requests cancellation (interrupts the running task).

Contrast: \`Runnable.run()\` returns \`void\` and cannot throw checked exceptions — no result channel.`,
  },
  {
    id: 'mt-basics-join-semantics',
    question: 'What does Thread.join() do, and when would you use it?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['join', 'coordination', 'blocking'],
    answer: `\`worker.join()\` **blocks the calling thread until \`worker\` finishes** (its \`run()\` returns and the thread dies). It is the simplest way to wait for another thread's work before proceeding.

\`\`\`java
worker.start();
worker.join();          // main waits here until worker is done
// safe to read worker's results now
worker.join(500);       // ...or wait at most 500ms
\`\`\`

Use it to **collect results** or **enforce ordering** — e.g. fork several workers, then \`join()\` each to wait for all to complete. \`join()\` itself can throw \`InterruptedException\` because the *waiting* thread can be interrupted.

:::gotcha
Without \`join()\`, the main thread may race ahead and read results before the worker has produced them.
:::`,
  },
  {
    id: 'mt-basics-sleep-vs-wait',
    question: 'What is the difference between Thread.sleep() and Object.wait() with respect to locks?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['sleep', 'wait', 'locks'],
    answer: `The critical difference is **lock behavior**:

- **\`Thread.sleep(ms)\`** pauses the current thread but **keeps every lock it holds**. A thread sleeping inside a \`synchronized\` block still owns the monitor, so everyone waiting on it stays blocked.
- **\`Object.wait()\`** **releases** the monitor it is waiting on and parks the thread until \`notify()\`/\`notifyAll()\`, then re-acquires the lock before returning.

Other differences:
- \`sleep\` is **static** and time-based; \`wait\` is called on an object and must be inside \`synchronized\` on that object.
- \`sleep\` guarantees *at least* the given time (subject to OS timer granularity), not exactly.

:::gotcha
Using \`sleep()\` to "coordinate" threads is an anti-pattern — it either busy-waits or risks lost wakeups. Use \`wait\`/\`notify\`, a latch, or \`join()\` instead.
:::`,
  },
  {
    id: 'mt-basics-interrupt-model',
    question: 'Explain the cooperative cancellation model in Java. What does interrupt() actually do?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['interrupt', 'cancellation', 'cooperative'],
    answer: `Java has **no safe force-kill**; cancellation is **cooperative**. \`thread.interrupt()\` is a **request**, delivered one of two ways depending on what the target is doing:

- **Blocked** in \`sleep\`, \`wait\`, \`join\`, \`BlockingQueue.take\`, etc. — the call **throws \`InterruptedException\`** (and clears the flag).
- **Running CPU work** — nothing throws; the JVM just **sets the interrupt flag**, which the thread must **poll** via \`Thread.currentThread().isInterrupted()\` and choose to stop.

\`\`\`java
while (!Thread.currentThread().isInterrupted()) {
  crunch();   // cooperatively check between chunks
}
\`\`\`

The interrupted thread decides *when and how* to wind down — which is exactly why it can stop at a point where its invariants hold.`,
  },
  {
    id: 'mt-basics-interrupted-vs-isinterrupted',
    question: 'What is the difference between Thread.interrupted() and thread.isInterrupted()?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['interrupt', 'isinterrupted', 'flag'],
    answer: `Both read the interrupt flag, but they differ in *static vs instance* and *clearing*:

- **\`thread.isInterrupted()\`** — an **instance** method that **reads** the target's flag and leaves it **unchanged**.
- **\`Thread.interrupted()\`** — a **static** method that reads **and clears** the **current** thread's flag (a "test-and-clear").

\`\`\`java
if (Thread.interrupted()) {      // reads AND resets the flag
  // handle interruption once
}
boolean stillSet = t.isInterrupted();  // just peeks, no reset
\`\`\`

:::gotcha
Because \`Thread.interrupted()\` clears the flag, calling it and ignoring the result silently discards the interrupt. If you consume it, be sure you actually handle the cancellation.
:::`,
  },
  {
    id: 'mt-basics-swallow-interrupt',
    question: 'Why is swallowing InterruptedException a bug, and what should you do instead?',
    difficulty: 'Hard',
    category: 'Thread Basics',
    tags: ['interruptedexception', 'best-practice', 'flag'],
    answer: `When a blocking call throws \`InterruptedException\`, it has **already cleared the interrupt flag**. So this:

\`\`\`java
try { Thread.sleep(1000); }
catch (InterruptedException e) { }   // BUG
\`\`\`

**destroys the cancellation signal**: the flag is now false and the exception is gone, so no code upstream can ever tell the thread was asked to stop. Cancellation silently stops working.

Do one of two things:
- **Propagate** it — declare \`throws InterruptedException\` and let the caller decide, or
- **Restore the flag** and stop:

\`\`\`java
catch (InterruptedException e) {
  Thread.currentThread().interrupt();  // re-set the flag
  return;                              // wind down
}
\`\`\`

:::key
Never swallow \`InterruptedException\`. Rethrow it or restore the interrupt status — otherwise you break cooperative cancellation for everyone above you on the stack.
:::`,
  },
  {
    id: 'mt-basics-thread-stop-deprecated',
    question: 'Why are Thread.stop(), suspend(), and resume() deprecated?',
    difficulty: 'Hard',
    category: 'Thread Basics',
    tags: ['thread-stop', 'deprecated', 'safety'],
    answer: `They are **inherently unsafe**:

- **\`stop()\`** throws a \`ThreadDeath\` at an **arbitrary point** and **releases all of the thread's locks immediately**. Shared objects can be left **half-updated**, violating invariants, with no chance to finish or roll back — corruption that other threads then observe.
- **\`suspend()\`** pauses a thread **without releasing its locks**. If it was holding a lock another thread needs, and that thread is the one meant to \`resume()\` it — **deadlock**.
- **\`resume()\`** only makes sense paired with the broken \`suspend()\`.

The safe alternative is **cooperative interruption**: \`interrupt()\` lets the target stop at a point where **its invariants are intact**, running cleanup as it goes.

:::key
There is no safe way to yank a thread's execution out from under it. Signal with \`interrupt()\` and let the thread stop itself cleanly.
:::`,
  },
  {
    id: 'mt-basics-daemon-cleanup-pitfall',
    question: 'You run a background writer on a daemon thread and notice records occasionally go missing on shutdown. Why, and how do you fix it?',
    difficulty: 'Hard',
    category: 'Thread Basics',
    tags: ['daemon', 'jvm-exit', 'cleanup'],
    answer: `Because **daemon threads are killed abruptly** when the JVM exits — and the JVM exits the moment the **last user thread** finishes. If your writer is a daemon and \`main\` returns, the JVM tears down the daemon **mid-operation**: its \`finally\` blocks may not run, and buffered records are never flushed. That is the lost data.

Fixes:
- Make the writer a **user thread** (the default) so the JVM waits for it, and shut it down explicitly.
- Or keep it as a background helper but **flush/drain on shutdown** via an \`ExecutorService\` you \`shutdown()\` + \`awaitTermination()\`, or a **shutdown hook** (\`Runtime.addShutdownHook\`) that finishes the pending work before exit.

:::gotcha
Daemon threads are for *discardable* background chores. Anything that **must complete** — writes, flushes, releasing external resources — should not depend on a daemon surviving JVM shutdown.
:::`,
  },
  {
    id: 'mt-basics-runnable-callable-comparison',
    question: 'Compare Runnable, Callable, and Thread — which is the task and which is the runner?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['runnable', 'callable', 'thread'],
    answer: `Two of these describe **the work** and one describes **who runs it**. \`Runnable\` and \`Callable<V>\` are tasks; \`Thread\` is a runner.

| Type | Method | Returns | Checked exceptions? | Role |
|------|--------|---------|---------------------|------|
| \`Runnable\` | \`run()\` | \`void\` | No — must catch/wrap | the task |
| \`Callable<V>\` | \`call()\` | \`V\` | Yes — \`throws Exception\` | the task |
| \`Thread\` | \`start()\` | — (a subclass you start) | — | the runner |

Choose \`Callable\` when the work produces a result or can fail with a checked exception; choose \`Runnable\` for fire-and-forget side effects. Hand either to a \`Thread\` or — far better — an \`ExecutorService\`.

:::key
\`Runnable\`/\`Callable\` = *what* to do; \`Thread\`/\`ExecutorService\` = *who* does it. \`Thread\` is not a task — it is a runner you *can* (but rarely should) subclass.
:::`,
  },
  {
    id: 'mt-basics-sleep-wait-yield-join',
    question: 'Compare sleep(), wait(), yield(), and join() — especially their effect on held locks.',
    difficulty: 'Hard',
    category: 'Thread Basics',
    tags: ['sleep', 'wait', 'yield', 'join'],
    answer: `The single most important distinction: **only \`wait()\` releases a lock.** The other three cling to every monitor the thread already holds.

| Method | Releases held lock? | Declared on | How it wakes | Typical use |
|--------|---------------------|-------------|--------------|-------------|
| \`sleep(t)\` | **No** — keeps all locks | \`static Thread\` | timeout or interrupt | fixed pause |
| \`wait()\` | **Yes** — releases *that* monitor | \`Object\` (must hold it) | notify / notifyAll / interrupt / spurious / timeout | condition wait |
| \`yield()\` | **No** — keeps locks | \`static Thread\` (hint) | scheduler may ignore it | give up the CPU |
| \`join()\` | **No** — the *caller* blocks | \`Thread\` instance | target dies / timeout / interrupt | await completion |

:::gotcha
Calling \`sleep()\` inside a \`synchronized\` block does **not** let anyone else in — the sleeping thread still owns the monitor. To release the lock while paused you need \`wait()\`.
:::`,
  },
  {
    id: 'mt-basics-yield',
    question: 'What does Thread.yield() do, and when is it actually useful?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['yield', 'scheduler', 'hint'],
    answer: `\`Thread.yield()\` is a **non-binding hint** to the scheduler that the current thread is willing to give up its core to another *runnable* thread of similar priority. The scheduler may **ignore it entirely** — on some platforms it is effectively a no-op, and its behavior varies by OS and JVM.

It is **not** a coordination primitive: it releases no locks, makes no happens-before guarantee, and never blocks. Using it to "let another thread catch up" is a race, not synchronization.

Rare legitimate uses:
1. A backoff hint inside a spin-wait — though \`Thread.onSpinWait()\` is the modern, purpose-built choice.
2. Nudging the scheduler in stress tests to shake out interleavings.

:::gotcha
Treat \`yield()\` as a performance hint, never as correctness. If your logic *needs* another thread to run first, use \`join()\`, a latch, or \`wait\`/\`notify\`.
:::`,
  },
  {
    id: 'mt-basics-lifecycle-transitions',
    question: 'Walk through the exact transitions between the six Thread states.',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['lifecycle', 'thread-state', 'transitions'],
    answer: `A thread moves through the \`Thread.State\` enum with **RUNNABLE as the central hub** — every blocking state routes back through it.

| From | Trigger | To |
|------|---------|-----|
| NEW | \`start()\` | RUNNABLE |
| RUNNABLE | contend for a monitor | BLOCKED |
| BLOCKED | acquire the monitor | RUNNABLE |
| RUNNABLE | \`wait()\` / \`join()\` / \`LockSupport.park()\` | WAITING |
| WAITING | notify / notifyAll / unpark / target dies | RUNNABLE |
| RUNNABLE | \`sleep(t)\` / \`wait(t)\` / \`join(t)\` | TIMED_WAITING |
| TIMED_WAITING | timeout or signal | RUNNABLE |
| RUNNABLE | \`run()\` returns or throws | TERMINATED |

Key facts:
- There is **no direct BLOCKED ↔ WAITING** edge — you always pass back through RUNNABLE.
- **NEW** and **TERMINATED** are one-way: you can never re-enter them.
- BLOCKED means "waiting for a monitor lock"; WAITING/TIMED_WAITING mean "parked until signalled".

:::key
RUNNABLE is the hub. Every block, wait, or sleep eventually returns through RUNNABLE before the thread can make progress or die.
:::`,
  },
  {
    id: 'mt-basics-uncaught-exception',
    question: 'What happens when a thread throws an uncaught exception from run()?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['exception', 'uncaughtexceptionhandler', 'executor'],
    answer: `That **one** thread terminates; **every other thread keeps running**. Before it dies, the JVM hands the exception down a handler chain:

1. the thread's own \`UncaughtExceptionHandler\`, if set;
2. else its \`ThreadGroup\`'s handler;
3. else the **default** handler, which prints the stack trace to \`stderr\`.

\`\`\`java
t.setUncaughtExceptionHandler((thr, ex) -> log.error("died: {}", thr.getName(), ex));
Thread.setDefaultUncaughtExceptionHandler(handler);  // JVM-wide fallback
\`\`\`

In an executor, routing depends on **how you submitted**:

| Submit path | Where the exception goes |
|-------------|--------------------------|
| \`execute(runnable)\` | the uncaught-exception handler (thread dies, pool replaces it) |
| \`submit(task)\` | **captured in the \`Future\`** — surfaces only as \`ExecutionException\` on \`get()\` |

:::gotcha
\`submit()\` **swallows** the failure until you call \`Future.get()\`. Forget to inspect the future and a task can fail completely silently — a classic production trap.
:::`,
  },
  {
    id: 'mt-basics-thread-priority',
    question: 'How reliable is Thread.setPriority() for controlling scheduling?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['priority', 'scheduler', 'portability'],
    answer: `Barely — treat it as a **hint you cannot depend on**. \`setPriority(int)\` takes \`Thread.MIN_PRIORITY\` (1) through \`Thread.MAX_PRIORITY\` (10), default \`NORM_PRIORITY\` (5), and the JVM maps those onto whatever the OS offers. That mapping is **wildly platform-dependent**: several Java priorities may collapse to one OS level, and on typical Linux setups user-space priorities are **effectively ignored**.

Never use it for correctness or ordering. Real hazards it invites:
- **Starvation** — a low-priority thread may never run under load.
- **Priority inversion** — a high-priority thread blocks on a lock held by a starved low-priority one.

\`\`\`java
t.setPriority(Thread.MAX_PRIORITY);  // a suggestion, not a guarantee
\`\`\`

:::key
If ordering or fairness matters, encode it explicitly with locks, bounded queues, or executor configuration — not thread priorities.
:::`,
  },
  {
    id: 'mt-basics-thread-naming',
    question: 'Why should you give your threads meaningful names?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['naming', 'debugging', 'threadfactory'],
    answer: `Thread names show up in **thread dumps, logs, and profilers**. A stack labelled \`order-writer-3\` tells you instantly what died; the default \`pool-2-thread-7\` tells you nothing. Naming is cheap, high-leverage operational hygiene.

Ways to set a name directly:

\`\`\`java
new Thread(task, "order-writer");   // constructor
t.setName("heartbeat");             // any time before/at run
\`\`\`

For pools, supply a **\`ThreadFactory\`** — otherwise every worker gets a generic \`pool-N-thread-M\` name:

\`\`\`java
ThreadFactory tf = Thread.ofPlatform().name("io-worker-", 0).factory();
ExecutorService pool = Executors.newFixedThreadPool(4, tf);
\`\`\`

:::key
Name threads at creation. The few seconds it costs pays for itself the first time you read a production thread dump at 2 a.m.
:::`,
  },
  {
    id: 'mt-basics-runnable-lambda',
    question: 'How do lambdas and method references relate to Runnable and Callable?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['lambda', 'runnable', 'callable'],
    answer: `Both \`Runnable\` and \`Callable<V>\` are \`@FunctionalInterface\` types — one abstract method each — so any lambda or method reference of the right shape **is** one. You rarely write \`new Runnable() { ... }\` anymore.

\`\`\`java
new Thread(() -> doWork()).start();            // Runnable: () -> void
Future<Integer> f = pool.submit(() -> 6 * 7);  // Callable: () -> V
pool.execute(logger::flush);                   // method reference
\`\`\`

The compiler resolves \`Runnable\` vs \`Callable\` from context: a value-returning body in a \`submit\` slot becomes a \`Callable\`; a void body becomes a \`Runnable\`.

:::key
The lambda **is** the task (\`Runnable\`/\`Callable\`); the \`Thread\` or executor is the runner. Lambdas make it concise, but the separation of *work* from *who runs it* is exactly the same.
:::`,
  },
  {
    id: 'mt-basics-interrupt-blocking-io',
    question: 'Can you interrupt a thread that is blocked on I/O?',
    difficulty: 'Hard',
    category: 'Thread Basics',
    tags: ['interrupt', 'blocking-io', 'nio'],
    answer: `It depends entirely on **what the thread is blocked in**:

| Blocked in | Response to \`interrupt()\` |
|------------|----------------------------|
| \`sleep\` / \`wait\` / \`join\` / \`BlockingQueue\` / \`Lock.lockInterruptibly\` | throws \`InterruptedException\` |
| classic \`InputStream\` / \`Socket\` read | **nothing** — flag is set, the read keeps blocking |
| \`java.nio\` \`InterruptibleChannel\` | channel closes, throws \`ClosedByInterruptException\` |

Classic blocking socket and stream reads are **not interruptible**: \`interrupt()\` only sets the flag, and the read stays parked in the OS. The one way to unblock it is to **close the socket/stream from another thread** — the pending read then throws \`SocketException\`/\`IOException\`.

\`\`\`java
// cancellation for legacy I/O = close the resource
public void cancel() { closeQuietly(socket); }  // the read() unblocks with an exception
\`\`\`

:::senior
Design cancellation around the *resource*, not the flag, for legacy I/O: keep a handle to the socket/stream and close it to unblock the reader. \`java.nio\` channels give you real interruptibility for free.
:::`,
  },
  {
    id: 'mt-basics-inheritable-threadlocal',
    question: 'What is InheritableThreadLocal, and why is it dangerous with thread pools?',
    difficulty: 'Hard',
    category: 'Thread Basics',
    tags: ['threadlocal', 'inheritablethreadlocal', 'thread-pool'],
    answer: `An \`InheritableThreadLocal<T>\` copies the **parent** thread's current value into a **child** thread **at the moment the child is created**, so ambient context (a request id, a trace id) flows automatically to threads you spawn. The copy is **shallow** — the child gets the same reference, not a deep clone.

The pitfall is **thread pools**. A pool's workers are created **once**, up front, then **reused** across countless unrelated tasks:

| Step | What the worker holds |
|------|-----------------------|
| Pool starts | context inherited from whoever *created the pool* |
| Task A (request 1) submitted | still the **pool-creation** context, not request 1's |
| Task B (request 2) submitted | **stale** context left over from before |

Inheritance fires at pool-thread creation, never at submit time — so workers see stale or leaked context and can bleed one request's data into another.

:::gotcha
Don't rely on \`InheritableThreadLocal\` to carry per-task context into a pool. Pass context explicitly (capture it in the task), or use **\`ScopedValue\`** (Java 21) which is built for safe, bounded inheritance.
:::`,
  },
  {
    id: 'mt-basics-restart-thread',
    question: 'Can you restart a Thread after it has finished running?',
    difficulty: 'Easy',
    category: 'Thread Basics',
    tags: ['lifecycle', 'restart', 'illegalthreadstateexception'],
    answer: `No. A \`Thread\` is **single-use** — its lifecycle runs one way, NEW → TERMINATED, and never loops back. Calling \`start()\` on a thread that has **already been started** (still running or long dead) throws \`IllegalThreadStateException\`.

\`\`\`java
Thread t = new Thread(task);
t.start();
t.join();
t.start();   // IllegalThreadStateException — cannot reuse
\`\`\`

To run the work again, either create a **new \`Thread\`**, or — far better — submit the task to an \`ExecutorService\`, which keeps a **pool of reusable worker threads** under the hood so *you* never restart a thread at all.

:::key
Threads aren't reusable; tasks are. Reuse the *task* (\`Runnable\`/\`Callable\`) by resubmitting it to a pool, and let the executor manage thread lifecycles.
:::`,
  },
  {
    id: 'mt-basics-wait-requires-monitor',
    question: 'Why must wait() and notify() be called while holding the object monitor?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['wait', 'notify', 'monitor'],
    answer: `\`wait()\`, \`notify()\`, and \`notifyAll()\` live on \`Object\` and require the caller to **already own that object's intrinsic lock** — to be inside a \`synchronized\` block on it. Call them without the monitor and you get \`IllegalMonitorStateException\`.

The reason is **atomicity against lost wakeups**. \`wait()\` must, in one indivisible step, **release the monitor and park** the thread on the monitor's wait-set. Holding the lock is what lets the JVM check your condition and go to sleep without another thread slipping a \`notify()\` in between:

\`\`\`java
synchronized (lock) {
  while (!condition) {   // always a loop, never a bare if
    lock.wait();         // atomically releases lock + parks
  }
  // re-acquired the lock here; condition now holds
}
\`\`\`

Because **every** Java object carries a monitor and wait-set, any object can serve as a condition variable — which is exactly why these methods are defined on \`Object\`.

:::key
No monitor, no wait-set coordination — hence \`IllegalMonitorStateException\`. Always \`wait()\` inside \`synchronized\`, and always in a \`while\` loop that re-checks the condition.
:::`,
  },
  {
    id: 'mt-basics-callable-runnable-exceptions',
    question: 'How does exception handling differ between Runnable and Callable?',
    difficulty: 'Medium',
    category: 'Thread Basics',
    tags: ['runnable', 'callable', 'exception'],
    answer: `\`Runnable.run()\` is declared with **no \`throws\`**, so it **cannot propagate checked exceptions** — you must catch them inside \`run()\` and rewrap as unchecked (\`RuntimeException\`). \`Callable.call()\` is declared \`throws Exception\`, so a checked failure can escape naturally.

In an executor, where that failure lands also differs:

| Task type | On \`execute()\` | On \`submit()\` |
|-----------|------------------|------------------|
| \`Runnable\` unchecked throw | uncaught-exception handler | captured in the \`Future\` |
| \`Callable\` throw | n/a (\`execute\` takes only \`Runnable\`) | wrapped as \`ExecutionException\` from \`get()\` |

\`\`\`java
Future<Integer> f = pool.submit(() -> { throw new IOException("boom"); });
try { f.get(); }
catch (ExecutionException e) { Throwable cause = e.getCause(); }  // the real IOException
\`\`\`

:::senior
Use \`Callable\` when a task can **fail meaningfully** — it forces callers to reckon with the exception via \`Future.get()\`. And always inspect the \`Future\`: a \`submit()\`-ed failure is invisible until you do.
:::`,
  },
];

export default questions;
