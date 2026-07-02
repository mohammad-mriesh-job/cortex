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
];

export default questions;
