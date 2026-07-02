import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-coord-producer-consumer-purpose',
    question: 'What problem does the producer-consumer pattern solve?',
    difficulty: 'Easy',
    category: 'Coordination',
    tags: ['producer-consumer', 'backpressure', 'decoupling'],
    answer: `It **decouples** threads that *create* work (producers) from threads that *process* it (consumers) using a shared **bounded buffer** in between.

Benefits:
- **Independent rates** — producers and consumers run at their own speed; the buffer smooths bursts.
- **Backpressure** — a *bounded* buffer blocks producers when full, so fast producers cannot swamp slow consumers or exhaust memory.
- **Simplicity** — each side only talks to the queue, not to each other.

In Java you almost always implement it with a \`BlockingQueue\`: producers call \`put\`, consumers call \`take\`, and the queue handles all blocking and signaling.`,
  },
  {
    id: 'mt-coord-put-take-blocking',
    question: 'What do BlockingQueue.put() and take() do when the queue is full or empty?',
    difficulty: 'Easy',
    category: 'Coordination',
    tags: ['blocking-queue', 'put', 'take'],
    answer: `They **block** the calling thread:

- \`put(e)\` on a **full** queue parks the producer until a slot frees up.
- \`take()\` on an **empty** queue parks the consumer until an item arrives.

That is the whole point of a *blocking* queue — no busy-waiting, no manual \`wait\`/\`notify\`. Contrast with the other method families:

| Policy | Full → | Empty → |
|--|--|--|
| \`put\` / \`take\` | block | block |
| \`offer\` / \`poll\` | return \`false\` / \`null\` | return \`false\` / \`null\` |
| \`add\` / \`remove\` | throw | throw |

There are also timed variants: \`offer(e, t, unit)\` and \`poll(t, unit)\`.`,
  },
  {
    id: 'mt-coord-countdownlatch-use',
    question: 'What is a CountDownLatch and when would you use one?',
    difficulty: 'Easy',
    category: 'Coordination',
    tags: ['countdownlatch', 'latch', 'coordination'],
    answer: `A **\`CountDownLatch(N)\`** is a one-shot gate holding a count of \`N\`. Threads call \`await()\` to block until the count reaches **0**; any thread calls \`countDown()\` to decrement it.

Typical uses:
- **Done gate** — main waits for N workers to finish (\`await\` after N \`countDown\`s).
- **Start gate** — N workers \`await\` a latch of 1, and a controller \`countDown()\`s to release them all at once.

\`\`\`java
CountDownLatch done = new CountDownLatch(3);
for (int i = 0; i < 3; i++)
  pool.submit(() -> { try { work(); } finally { done.countDown(); } });
done.await();   // resumes once all 3 finished
\`\`\`

:::key
It is **one-shot** — once the count hits 0 it stays open forever and cannot be reset.
:::`,
  },
  {
    id: 'mt-coord-semaphore-vs-mutex',
    question: 'How does a binary semaphore differ from a mutex (lock)?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['semaphore', 'mutex', 'lock'],
    answer: `Both can limit access to one resource, but they differ in **ownership** and **reentrancy**:

| | Binary semaphore | Mutex / lock |
|--|--|--|
| Ownership | **None** — any thread may \`release\` | Owned — only the holder unlocks |
| Reentrancy | **No** — holder deadlocks on second \`acquire\` | \`ReentrantLock\`/\`synchronized\` re-lock freely |
| Primary use | signaling / throttling | mutual exclusion |
| Conditions | none | \`Condition\` variables |

Because release is **unowned**, a semaphore is great for signaling *between* threads (one acquires, another releases) — but that same property makes a binary semaphore an unsafe substitute for a mutex.

:::gotcha
Calling \`release()\` without a matching \`acquire()\` **inflates** the permit count above its initial value, silently breaking the limit. A lock cannot be "over-unlocked" like that.
:::`,
  },
  {
    id: 'mt-coord-latch-vs-barrier',
    question: 'What is the difference between a CountDownLatch and a CyclicBarrier?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['countdownlatch', 'cyclicbarrier', 'comparison'],
    answer: `The headline differences are **reusability** and **coupling**:

| | CountDownLatch | CyclicBarrier |
|--|--|--|
| Reusable | **No** — one-shot, cannot reset | **Yes** — auto-resets each trip |
| Who waits | any threads via \`await()\` | the participating threads themselves |
| Who advances it | any thread(s), any number of \`countDown()\` | each party arriving at \`await()\` |
| Group action | none | optional \`Runnable\` on last arrival |

- A **latch decouples** the counters from the waiters — the threads that count down need not be the ones that await, and one thread may count down many times. Models "wait for these events" (startup, shutdown, fan-in).
- A **barrier is symmetric** — the participants *are* the waiters, each contributing one arrival, and it resets for the next phase. Models "let these workers march in lockstep" (iterative/phased algorithms).`,
  },
  {
    id: 'mt-coord-wait-while-loop',
    question: 'When using wait()/notify() for a buffer, why must the condition be checked in a while loop, not an if?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['wait-notify', 'spurious-wakeup', 'producer-consumer'],
    answer: `Because a thread can return from \`wait()\` **without the condition being true**. Two reasons:

1. **Spurious wakeups** — the JVM/OS may wake a waiter for no reason; the spec explicitly allows it.
2. **Stolen condition** — between the \`notify\` and this thread re-acquiring the lock, another thread may have consumed the slot the wakeup was about.

With an \`if\`, you fall straight through and act on a full/empty buffer, corrupting it. A \`while\` re-checks and goes back to sleep if the condition is still false:

\`\`\`java
synchronized (lock) {
  while (count == cap) lock.wait();   // re-check on every wakeup
  enqueue(item); count++;
  lock.notifyAll();
}
\`\`\`

:::key
"Always wait in a loop" is the canonical rule for condition-variable code (\`Object.wait\` and \`Condition.await\` alike).
:::`,
  },
  {
    id: 'mt-coord-choose-blocking-queue',
    question: 'How do you choose between ArrayBlockingQueue, LinkedBlockingQueue, and SynchronousQueue?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['blocking-queue', 'arrayblockingqueue', 'synchronousqueue'],
    answer: `Choose by **bounding** and **handoff style**:

- **\`ArrayBlockingQueue\`** — fixed-capacity array, **single lock**. Pick it for true **backpressure** and predictable memory; \`put\` blocks when full.
- **\`LinkedBlockingQueue\`** — linked nodes, **two locks** (separate put/take), so producers and consumers rarely block each other → higher throughput. But the no-arg constructor is **unbounded** (\`Integer.MAX_VALUE\`); pass a capacity for backpressure.
- **\`SynchronousQueue\`** — **zero capacity**. Every \`put\` must rendezvous with a \`take\` — a direct thread-to-thread handoff with no storage.

Rules of thumb:
- Need bounded + simple → **ArrayBlockingQueue**.
- Need max throughput and can bound it → **LinkedBlockingQueue(capacity)**.
- Need pure handoff (e.g. \`newCachedThreadPool\`) → **SynchronousQueue**.`,
  },
  {
    id: 'mt-coord-semaphore-no-ownership',
    question: 'Can a thread release a semaphore permit it never acquired? What is the risk?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['semaphore', 'ownership', 'permits'],
    answer: `**Yes.** A semaphore has **no notion of ownership** — \`release()\` simply increments the permit count, regardless of which thread calls it. This is deliberate: it lets a semaphore act as a **cross-thread signal** (one thread waits with \`acquire\`, another fires with \`release\`), which is how "slots available" counters in a bounded buffer are built.

The risk is the flip side:
- Calling \`release()\` **without** a matching \`acquire()\` inflates the count above the initial permits, **breaking the concurrency limit** you meant to enforce.
- A leaked permit (throwing before \`release()\`) permanently **shrinks** the pool.

\`\`\`java
sem.acquire();
try { useConnection(); }
finally { sem.release(); }   // exactly one release per acquire
\`\`\`

:::gotcha
This is precisely why a binary semaphore is not a mutex — a lock can only be unlocked by its owner, a semaphore by anyone.
:::`,
  },
  {
    id: 'mt-coord-bounded-vs-unbounded',
    question: 'Why prefer a bounded queue over an unbounded one in a producer-consumer system?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['bounded', 'backpressure', 'memory'],
    answer: `A **bounded** queue gives **backpressure**; an unbounded one trades that safety for a memory time-bomb.

With a fixed capacity, \`put\` blocks when the buffer is full, so a fast producer is forced to slow to the consumer's rate. Memory stays flat and the system degrades gracefully.

An **unbounded** queue (e.g. default \`LinkedBlockingQueue\`) lets \`put\` almost never block. Under a sustained producer surge the queue keeps growing until:
- **latency** balloons (items sit in a huge backlog), and eventually
- **\`OutOfMemoryError\`** kills the process.

:::senior
The same choice reshapes a \`ThreadPoolExecutor\`: an unbounded work queue makes \`maximumPoolSize\` **irrelevant** (the pool never grows past core because the queue always accepts). A bounded queue plus a \`RejectedExecutionHandler\` is what gives you real load-shedding.
:::`,
  },
  {
    id: 'mt-coord-notify-vs-notifyall',
    question: 'In a producer-consumer buffer using a single lock and wait(), why is notify() dangerous and notifyAll() safer?',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['notify', 'notifyall', 'lost-wakeup'],
    answer: `With **one** monitor shared by both producers and consumers, \`notify()\` wakes **one arbitrary** waiter — and it might be the **wrong kind**.

Scenario: the buffer is full, several producers are waiting on it, and a few consumers too. A consumer takes an item (freeing a slot) and calls \`notify()\`. If that wakeup lands on **another producer** that still cannot proceed (or on a consumer when the buffer is now empty), the woken thread just goes back to \`wait()\` — and the thread that *could* have run is never signaled. That is a **lost wakeup**: everyone sleeps forever.

Two fixes:
1. **\`notifyAll()\`** — wake everyone; each re-checks its \`while\` condition, and the right ones proceed. Correct, but wakes threads needlessly (a thundering herd).
2. **Two \`Condition\`s on a \`ReentrantLock\`** — separate \`notFull\` and \`notEmpty\`. A consumer signals only \`notFull\` (producers), a producer signals only \`notEmpty\` (consumers), so you wake *exactly* the right side. This is what \`ArrayBlockingQueue\` does internally.

\`\`\`java
lock.lock();
try {
  while (count == cap) notFull.await();
  enqueue(item);
  notEmpty.signal();     // wake a consumer specifically
} finally { lock.unlock(); }
\`\`\`

:::key
Single \`Object\` monitor → use \`notifyAll()\`. Want targeted wakeups → use a \`Lock\` with two \`Condition\`s.
:::`,
  },
  {
    id: 'mt-coord-threadpool-queue-behavior',
    question: 'How does the choice of work queue change a ThreadPoolExecutor\'s behavior?',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['threadpoolexecutor', 'blocking-queue', 'thread-pool'],
    answer: `The queue silently controls **when the pool creates threads** and **when it rejects work**. The executor's rule: it uses core threads first, then **queues**, and only creates threads up to \`maximumPoolSize\` when the **queue is full**.

| Queue | Effect |
|--|--|
| **SynchronousQueue** (zero capacity) | Every task needs a free thread *now*; the queue is "always full", so the pool grows to \`maximumPoolSize\`, then **rejects**. This is \`newCachedThreadPool\`. |
| **Unbounded LinkedBlockingQueue** | The queue always accepts, so it is "never full" — the pool **never grows past core**, and \`maximumPoolSize\` is **ignored**. This is \`newFixedThreadPool\`; hidden risk: unbounded backlog → OOM. |
| **Bounded ArrayBlockingQueue** | The pool grows from core to max as the queue fills, then applies the \`RejectedExecutionHandler\`. The only config that gives **real backpressure + load-shedding**. |

:::senior
Because of this, \`Executors.newFixedThreadPool\` / \`newCachedThreadPool\` hide dangerous defaults. For production, construct \`ThreadPoolExecutor\` directly with a **bounded** queue and an explicit rejection policy (e.g. \`CallerRunsPolicy\`).
:::`,
  },
  {
    id: 'mt-coord-barrier-action-and-broken',
    question: 'On which thread does a CyclicBarrier action run, and what happens if one waiting thread is interrupted or times out?',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['cyclicbarrier', 'barrier-action', 'brokenbarrierexception'],
    answer: `**The barrier action runs on the last thread to arrive** — the one whose \`await()\` trips the barrier — while all the other parties stay parked. It is *not* a separate thread and *not* \`main\`. So whatever the action touches must be safe to execute from that arbitrary worker, and it runs **before** the others are released.

\`\`\`java
CyclicBarrier barrier = new CyclicBarrier(3, () -> mergeResults()); // runs on last arriver
\`\`\`

**If a waiting thread is interrupted, times out, or the action throws**, the barrier **breaks**:
- Every other waiter is released with a **\`BrokenBarrierException\`**.
- The barrier enters a broken state; you must call \`reset()\` to reuse it.

This all-or-nothing failure is intentional — a partial rendezvous would leave threads out of sync.

:::gotcha
A \`CountDownLatch\` has no such coupling: \`countDown()\` never throws \`BrokenBarrierException\`, and a latch cannot break — but it also cannot reset. When parties come and go across phases, prefer a **\`Phaser\`**, which tolerates dynamic registration.
:::`,
  },
];

export default questions;
