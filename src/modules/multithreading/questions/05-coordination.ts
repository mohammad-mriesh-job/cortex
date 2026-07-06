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
  {
    id: 'mt-coord-wait-notify-mechanics',
    question: 'What are the rules for using wait()/notify() correctly?',
    difficulty: 'Easy',
    category: 'Coordination',
    tags: ['wait-notify', 'monitor', 'synchronized'],
    answer: `All three — \`wait()\`, \`notify()\`, \`notifyAll()\` — live on \`Object\` and may **only** be called while you **hold that object's monitor** (inside \`synchronized\` on it); otherwise you get an \`IllegalMonitorStateException\`.

The rules:
1. **Own the monitor** — call them inside \`synchronized (lock)\` on that same \`lock\`.
2. **\`wait()\` releases the monitor** and suspends the thread; on wakeup it **re-acquires** the monitor before returning, so it competes for the lock again.
3. **\`notify()\` wakes one** waiter, **\`notifyAll()\` wakes all** — but neither *releases* the lock. The notifier keeps the monitor until it **exits the \`synchronized\` block**, so a woken thread only runs afterward.
4. **Always \`wait()\` in a \`while\` loop** over the predicate — spurious wakeups and stolen conditions mean returning from \`wait\` does not prove the condition holds.

\`\`\`java
synchronized (lock) {
  while (!ready) lock.wait();   // releases lock, re-acquires on wake
  consume();
}
\`\`\`

:::key
When one monitor is shared by different waiter kinds, prefer \`notifyAll()\` — or switch to a \`Lock\` with separate \`Condition\`s.
:::`,
  },
  {
    id: 'mt-coord-semaphore-resource-pool',
    question: 'How do you use a Semaphore to bound access to a resource?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['semaphore', 'permits', 'resource-pool'],
    answer: `A **\`Semaphore(N)\`** hands out **N permits**. \`acquire()\` takes one and **blocks** when none are free; \`release()\` returns one. That caps concurrent access at **N threads** — ideal for a **connection pool**, a **download cap**, or crude **rate limiting**.

\`\`\`java
Semaphore sem = new Semaphore(10);           // at most 10 in flight
void download(String url) throws InterruptedException {
  sem.acquire();
  try { fetch(url); }
  finally { sem.release(); }                  // exactly one release per acquire
}
\`\`\`

Non-blocking and bounded waits:
- \`tryAcquire()\` — take a permit **only if one is free**, else return \`false\` at once.
- \`tryAcquire(t, unit)\` — wait up to a timeout, then give up.

Unlike a mutex (a **single owner**), a semaphore **counts N permits** and has **no ownership** — any thread may release.

:::gotcha
Always put \`release()\` in \`finally\`. A permit leaked on an exception path permanently **shrinks** the pool until it starves.
:::`,
  },
  {
    id: 'mt-coord-exchanger',
    question: 'What is an Exchanger and when would you use one?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['exchanger', 'rendezvous', 'double-buffering'],
    answer: `An **\`Exchanger<V>\`** is a **rendezvous point where exactly two threads swap objects**. Each calls \`exchange(myObject)\` and **blocks until the other arrives**; then each receives what the other passed in.

\`\`\`java
Exchanger<Buffer> ex = new Exchanger<>();

Buffer mine = new Buffer();
while (running) {
  fill(mine);
  mine = ex.exchange(mine);   // hand over full buffer, get an empty one back
}
\`\`\`

Classic uses:
- **Double buffering** — a filler swaps its *full* buffer for the drainer's *empty* one, so both keep working without a shared mutable buffer.
- **Pipeline hand-off** — two stages trade a loaded container for a spent one.

:::gotcha
An \`Exchanger\` pairs **exactly two** parties. For three or more threads meeting at a point, use a \`CyclicBarrier\` or \`Phaser\` — an exchange has no meaning for N > 2.
:::`,
  },
  {
    id: 'mt-coord-priority-delay-queue',
    question: 'What are PriorityBlockingQueue and DelayQueue for?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['priorityblockingqueue', 'delayqueue', 'blocking-queue'],
    answer: `Both are \`BlockingQueue\`s that reorder \`take()\` instead of serving strict FIFO.

- **\`PriorityBlockingQueue<E>\`** — **unbounded**; \`take()\` returns the **least** element by \`Comparator\`/\`Comparable\`, modelling **priority scheduling** (top-priority job first), *not* arrival order.
- **\`DelayQueue<E extends Delayed>\`** — \`take()\` returns an element **only once its delay has expired**; until then the queue looks empty. Perfect for **scheduled tasks**, **cache expiry**, and **retry timers**.

\`\`\`java
PriorityBlockingQueue<Job> jobs = new PriorityBlockingQueue<>();   // least first
DelayQueue<Expiring> cache = new DelayQueue<>();                   // only ripe items
\`\`\`

:::senior
\`ScheduledThreadPoolExecutor\` is built on a delay-queue variant — that is exactly how \`schedule(task, delay, unit)\` releases each task at the right moment.
:::`,
  },
  {
    id: 'mt-coord-blocking-queue-family',
    question: 'Give an overview of the BlockingQueue implementations.',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['blocking-queue', 'overview', 'java-util-concurrent'],
    answer: `The \`java.util.concurrent\` \`BlockingQueue\` family, each tuned for a different hand-off:

| Implementation | Shape | Use when |
|--|--|--|
| \`ArrayBlockingQueue\` | bounded array, single lock | you want simple, predictable **backpressure** |
| \`LinkedBlockingQueue\` | optionally bounded, **two locks** | producers/consumers rarely block → **higher throughput** |
| \`SynchronousQueue\` | **zero capacity**, direct hand-off | every item must be taken **now** (cached pool) |
| \`PriorityBlockingQueue\` | unbounded, ordered | \`take()\` must return the **highest-priority** item |
| \`DelayQueue\` | unbounded, delayed | items become available **only after a delay** |
| \`LinkedBlockingDeque\` | optionally bounded, double-ended | you need **both ends** (work-stealing, undo) |
| \`LinkedTransferQueue\` | unbounded, transfer | a producer must **block until its item is consumed** via \`transfer()\` |

:::key
Default to \`ArrayBlockingQueue\` (bounded) for producer-consumer; reach for the rest only when priority, delay, both-ends, or guaranteed hand-off is a real requirement.
:::`,
  },
  {
    id: 'mt-coord-cyclicbarrier-reuse',
    question: 'How do you use a CyclicBarrier across multiple phases?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['cyclicbarrier', 'phases', 'lock-step'],
    answer: `A **\`CyclicBarrier(N, action)\`** makes **N threads meet** at each phase. Every worker computes its slice, calls \`await()\`, and blocks; when the **last** one arrives the optional **barrier action runs once** (merge results / advance the step), then **all N are released** and the barrier **auto-resets** for the next round. That reuse is what suits it to **lock-step simulations** — physics time-steps, iterative matrix solvers, cellular automata.

\`\`\`java
CyclicBarrier barrier = new CyclicBarrier(N, () -> advanceStep());
Runnable worker = () -> {
  for (int step = 0; step < STEPS; step++) {
    computeMyRegion(step);
    try { barrier.await(); }        // wait for peers; action runs on the last arriver
    catch (InterruptedException | BrokenBarrierException e) { return; }
  }
};
\`\`\`

:::gotcha
A \`CountDownLatch\` **cannot** do this — it is one-shot and never resets, so you would need a fresh latch per phase. Use \`CyclicBarrier\` (or \`Phaser\`) for repeated rendezvous.
:::`,
  },
  {
    id: 'mt-coord-drill-print-123',
    question: 'Three threads must print 1, 2, 3 repeatedly, in order, forever. How?',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['drill', 'ordering', 'condition'],
    answer: `Share a **turn counter** guarded by a \`ReentrantLock\` with **three \`Condition\`s**. Each thread waits until \`turn\` equals its slot, prints, advances \`turn\`, and signals **only the next** thread. The \`while (turn != slot)\` guard enforces the exact order no matter how the scheduler interleaves them — a thread that wakes early simply re-checks and waits again.

\`\`\`java
import java.util.concurrent.locks.*;

public class PrintInOrder {
  private final Lock lock = new ReentrantLock();
  private final Condition[] turns =
      { lock.newCondition(), lock.newCondition(), lock.newCondition() };
  private int turn = 0;                        // whose turn: 0, 1, 2

  private void loop(int slot, int value) {
    while (true) {
      lock.lock();
      try {
        while (turn != slot) turns[slot].await();
        System.out.print(value);              // prints 1, 2, 3, 1, 2, 3, ...
        turn = (turn + 1) % 3;
        turns[turn].signal();                 // wake exactly the next thread
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        return;
      } finally {
        lock.unlock();
      }
    }
  }

  public static void main(String[] args) {
    PrintInOrder p = new PrintInOrder();
    new Thread(() -> p.loop(0, 1)).start();
    new Thread(() -> p.loop(1, 2)).start();
    new Thread(() -> p.loop(2, 3)).start();
  }
}
\`\`\`

:::key
Targeted \`Condition\`s per thread avoid a thundering herd; a single monitor with \`notifyAll()\` also works but wakes everyone each turn.
:::`,
  },
  {
    id: 'mt-coord-drill-odd-even',
    question: 'Two threads print odd and even numbers alternately from 1 to N. Implement it.',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['drill', 'alternation', 'condition'],
    answer: `Share a **counter**, a \`ReentrantLock\`, and a single \`Condition\`. The **odd** thread acts only when \`count\` is odd, the **even** thread only when it is even; each prints, increments, and signals the peer. The \`while (count <= n)\` loop is the termination guard, and re-checking parity on every wakeup enforces strict alternation.

\`\`\`java
import java.util.concurrent.locks.*;

public class OddEven {
  private final int n;
  private int count = 1;
  private final Lock lock = new ReentrantLock();
  private final Condition turn = lock.newCondition();

  OddEven(int n) { this.n = n; }

  // parity: 1 = odd thread, 0 = even thread
  private void run(int parity) {
    lock.lock();
    try {
      while (count <= n) {
        if (count % 2 != parity) {
          turn.await();                       // not my turn — wait
        } else {
          System.out.println(Thread.currentThread().getName() + ": " + count);
          count++;
          turn.signalAll();                   // hand off to the peer
        }
      }
      turn.signalAll();                       // release the peer once we pass n
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    } finally {
      lock.unlock();
    }
  }

  public static void main(String[] args) {
    OddEven oe = new OddEven(10);
    new Thread(() -> oe.run(1), "odd").start();
    new Thread(() -> oe.run(0), "even").start();
  }
}
\`\`\`

:::gotcha
The \`signalAll()\` **after** the loop matters: without it the peer, still parked in \`await()\`, would never learn that \`count\` passed \`n\` and would hang forever.
:::`,
  },
  {
    id: 'mt-coord-drill-bounded-buffer',
    question: 'Implement a bounded blocking buffer from scratch.',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['drill', 'bounded-buffer', 'condition'],
    answer: `Use a \`ReentrantLock\` with two \`Condition\`s — \`notFull\` and \`notEmpty\` — over a circular array. \`put\` waits **while full** then enqueues and signals \`notEmpty\`; \`take\` waits **while empty** then dequeues and signals \`notFull\`. Both wait in \`while\` loops. This is essentially what \`ArrayBlockingQueue\` does internally.

\`\`\`java
import java.util.concurrent.locks.*;

public class BoundedBuffer<E> {
  private final Object[] items;
  private int head, tail, count;
  private final Lock lock = new ReentrantLock();
  private final Condition notFull  = lock.newCondition();
  private final Condition notEmpty = lock.newCondition();

  public BoundedBuffer(int capacity) { items = new Object[capacity]; }

  public void put(E e) throws InterruptedException {
    lock.lock();
    try {
      while (count == items.length) notFull.await();   // block while full
      items[tail] = e;
      tail = (tail + 1) % items.length;
      count++;
      notEmpty.signal();                               // wake a consumer
    } finally {
      lock.unlock();
    }
  }

  @SuppressWarnings("unchecked")
  public E take() throws InterruptedException {
    lock.lock();
    try {
      while (count == 0) notEmpty.await();             // block while empty
      E e = (E) items[head];
      items[head] = null;
      head = (head + 1) % items.length;
      count--;
      notFull.signal();                                // wake a producer
      return e;
    } finally {
      lock.unlock();
    }
  }
}
\`\`\`

:::key
Two \`Condition\`s let each side wake **exactly** the opposite side — no thundering herd, unlike a single monitor with \`notifyAll()\`.
:::`,
  },
  {
    id: 'mt-coord-drill-readers-writers',
    question: 'Implement the readers-writers pattern.',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['drill', 'readers-writers', 'readwritelock'],
    answer: `Use a \`ReentrantReadWriteLock\`: **readers** take the shared **read lock** (many hold it concurrently), **writers** take the exclusive **write lock** (blocks all readers and writers). Always lock and unlock in \`try\`/\`finally\`.

\`\`\`java
import java.util.*;
import java.util.concurrent.locks.*;

public class ReadWriteMap<K, V> {
  private final Map<K, V> map = new HashMap<>();
  private final ReadWriteLock rw = new ReentrantReadWriteLock();
  private final Lock read  = rw.readLock();
  private final Lock write = rw.writeLock();

  public V get(K key) {
    read.lock();                         // many readers at once
    try { return map.get(key); }
    finally { read.unlock(); }
  }

  public V put(K key, V value) {
    write.lock();                        // exclusive: no other reader or writer
    try { return map.put(key, value); }
    finally { write.unlock(); }
  }
}
\`\`\`

:::gotcha
With the **default (non-fair)** lock, a steady stream of readers can **starve** writers indefinitely. \`new ReentrantReadWriteLock(true)\` queues requests fairly, letting a waiting writer proceed after the in-flight readers finish.
:::`,
  },
  {
    id: 'mt-coord-poison-pill',
    question: 'How do you cleanly shut down a producer-consumer pipeline?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['poison-pill', 'shutdown', 'producer-consumer'],
    answer: `Signal end-of-stream with a **poison pill** — a sentinel object the producer enqueues when it is done. Each consumer that \`take()\`s the pill **stops**. With N consumers, enqueue **one pill per consumer**, or have each consumer **re-insert** the pill before exiting so its siblings also see it.

\`\`\`java
static final Object PILL = new Object();

// producer, once all real work is queued
for (int i = 0; i < consumerCount; i++) queue.put(PILL);   // one pill each

// consumer
while (true) {
  Object item = queue.take();
  if (item == PILL) break;                 // clean exit — no interrupt needed
  process(item);
}
\`\`\`

The alternative is to **interrupt** the consumers and drain the queue, but that races with in-flight items.

:::gotcha
The classic bug: consumers block **forever** on \`take()\` because no shutdown signal is ever sent. A blocking \`take()\` never returns on its own — you *must* send a pill or interrupt.
:::`,
  },
  {
    id: 'mt-coord-latch-vs-join',
    question: 'CountDownLatch or Thread.join() to wait for workers — which and why?',
    difficulty: 'Easy',
    category: 'Coordination',
    tags: ['countdownlatch', 'join', 'thread-pool'],
    answer: `**\`join()\`** waits for a **specific \`Thread\` to die**, so it only works when you **own that \`Thread\` object**. On a **pool** you never see the worker threads, so \`join()\` cannot reach them.

A **\`CountDownLatch\`** decouples "done" from thread identity: each task calls \`countDown()\` when it finishes — **whatever thread ran it** — and any thread \`await()\`s the count reaching zero.

\`\`\`java
CountDownLatch done = new CountDownLatch(tasks.size());
for (Runnable t : tasks)
  pool.submit(() -> { try { t.run(); } finally { done.countDown(); } });
done.await();                 // works even though the pool threads are hidden
\`\`\`

| | \`Thread.join()\` | \`CountDownLatch\` |
|--|--|--|
| Waits on | a specific thread | a count of events |
| Pooled tasks | cannot reach the thread | decoupled, works |
| Raw threads | fine | works too |

:::key
Prefer a latch with \`ExecutorService\`s; \`join()\` is fine for a handful of raw \`Thread\`s you created yourself.
:::`,
  },
  {
    id: 'mt-coord-semaphore-fairness',
    question: 'What does fairness change for a Semaphore, and how do the acquire methods differ?',
    difficulty: 'Medium',
    category: 'Coordination',
    tags: ['semaphore', 'fairness', 'barging'],
    answer: `**\`new Semaphore(n, true)\`** makes the semaphore **fair**: permits are granted in **FIFO arrival order**, preventing starvation and **barging** — at some throughput cost. The default \`new Semaphore(n)\` is **unfair**: it lets a thread **barge** ahead of the queue and runs faster.

The methods honour fairness differently:

| Method | Blocks? | Honours the FIFO queue? |
|--|--|--|
| \`acquire()\` | until a permit is free | **yes** (on a fair semaphore) |
| \`tryAcquire()\` | never | **no** — **barges** even when fair |
| \`tryAcquire(t, unit)\` | up to a timeout | yes, then gives up |

\`\`\`java
Semaphore sem = new Semaphore(3, true);    // fair, 3 permits
sem.acquire(2);                            // take two permits atomically
try { useTwoResources(); }
finally { sem.release(2); }                // return the same count
\`\`\`

Note \`acquire(k)\`/\`release(k)\` take or return **multiple permits** at once.

:::gotcha
\`tryAcquire()\` **always barges** — it grabs any free permit immediately, ignoring waiting threads, *even on a fair semaphore*. Use \`acquire()\` when fairness must be honoured.
:::`,
  },
  {
    id: 'mt-coord-missed-wakeup',
    question: 'What is a missed (lost) wakeup, and how do you prevent it?',
    difficulty: 'Hard',
    category: 'Coordination',
    tags: ['lost-wakeup', 'wait-notify', 'predicate'],
    answer: `A **missed (lost) wakeup** happens when \`notify()\`/\`signal()\` fires **before** the other thread reaches \`wait()\`/\`await()\`, and the wait is **not guarded by a shared-state predicate**. The signal is delivered to no one, and the waiter — arriving late — sleeps **forever**.

Schedule for a buffer that waits without checking state:

| Step | Thread A (producer) | Thread B (consumer) | State |
|--|--|--|--|
| 1 | enqueue item; \`signal()\` | — | item ready, **no waiter** |
| 2 | (signal discarded) | — | wakeup lost |
| 3 | — | \`await()\` | blocks — **stuck forever** |

The fix: change a shared **state predicate under the same lock**, and **wait in a \`while\` loop** on it.

\`\`\`java
// producer
lock.lock();
try { count++; notEmpty.signal(); }
finally { lock.unlock(); }

// consumer
lock.lock();
try {
  while (count == 0) notEmpty.await();   // early signal already bumped count
  take(); count--;
} finally { lock.unlock(); }
\`\`\`

Now an "early" signal leaves \`count > 0\`, so the consumer's \`while\` sees the item and **never blocks** — the wakeup cannot be missed.

:::key
Never \`wait\`/\`await\` without a condition: the predicate, checked in a loop under the lock, is what makes an early signal safe.
:::`,
  },
];

export default questions;
