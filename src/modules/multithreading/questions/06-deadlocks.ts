import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-deadlock-definition',
    question: 'What is a deadlock, and how does it appear at runtime?',
    difficulty: 'Easy',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'liveness', 'locks'],
    answer: `A **deadlock** is a set of threads that are all blocked forever, each waiting for a resource (usually a lock) held by another thread in the set. No thread can proceed, and none will release what it holds.

At runtime it is **silent**: the threads are \`BLOCKED\`/\`WAITING\`, so there is **no exception, no crash, and no CPU usage** — the program simply stops making progress. (Busy-spinning at high CPU with no progress is *livelock*, not deadlock.)

The classic trigger is two threads acquiring the **same two locks in opposite order**.`,
  },
  {
    id: 'mt-deadlock-coffman-conditions',
    question: 'Name the four Coffman conditions required for a deadlock.',
    difficulty: 'Easy',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'coffman-conditions'],
    answer: `All **four** must hold **simultaneously** for a deadlock to occur:

1. **Mutual exclusion** — a resource is held in a non-shareable way (one owner at a time).
2. **Hold and wait** — a thread holds one resource while requesting another.
3. **No preemption** — a resource can only be released by its holder, not forcibly taken away.
4. **Circular wait** — a closed chain of threads, each waiting on the next one's resource.

:::key
Because all four are **necessary**, breaking **any single one** prevents deadlock — that is the basis of every avoidance technique.
:::`,
  },
  {
    id: 'mt-deadlock-vs-livelock-starvation',
    question: 'What is the difference between deadlock, livelock, and starvation?',
    difficulty: 'Easy',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'livelock', 'starvation', 'liveness'],
    answer: `All three are **liveness failures** — threads make no useful progress — but by different mechanisms:

- **Deadlock** — threads are **blocked and idle** in a circular wait; CPU is unused.
- **Livelock** — threads are **RUNNABLE and busy**, actively reacting to each other, yet never advance; CPU is high.
- **Starvation** — a thread is **perpetually denied** a resource while other threads keep winning it.

The fixes differ: **lock ordering** for deadlock, **randomized backoff / breaking symmetry** for livelock, and **fair locks / bounded waiting** for starvation.`,
  },
  {
    id: 'mt-deadlock-lock-ordering',
    question: 'How does a global lock ordering prevent deadlock, and what is the catch?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'lock-ordering', 'prevention'],
    answer: `If **every** thread acquires locks in the same **total order**, a **circular wait cannot form**, so deadlock is impossible. Intuition: a blocked thread only holds locks that come *before* the one it is waiting on, so the thread holding the highest-ordered lock in any would-be cycle is never blocked — it finishes and the chain unwinds.

Order by a stable key (e.g. account id):

    void transfer(Account from, Account to, long amount) {
      Account first  = from.id < to.id ? from : to;   // always lock lower id first
      Account second = from.id < to.id ? to : from;
      synchronized (first) { synchronized (second) { /* move money */ } }
    }

:::gotcha
It only works if **every code path** obeys the **same** order. One method anywhere that locks the two in reverse reintroduces the exact deadlock. It is a global discipline, not a local fix.
:::`,
  },
  {
    id: 'mt-deadlock-trylock-backoff',
    question: 'How does tryLock with a timeout help avoid deadlock, and what new problem can it introduce?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'trylock', 'backoff', 'livelock'],
    answer: `\`Lock.tryLock(timeout, unit)\` refuses to wait forever. A thread takes the first lock, then **tries** for the second with a timeout; on failure it **releases everything and retries**. That breaks **hold-and-wait** / **no-preemption** — a thread never clings to a lock while blocked indefinitely.

The new hazard is **livelock**: if two threads release and retry in perfect lockstep, they can loop forever without both ever succeeding. The fix is a **randomized backoff** between attempts, which breaks the symmetry.

    while (true) {
      if (a.tryLock(100, MILLISECONDS)) {
        try {
          if (b.tryLock(100, MILLISECONDS)) {
            try { /* critical section */ return; }
            finally { b.unlock(); }
          }
        } finally { a.unlock(); }        // release A if B was unavailable
      }
      Thread.sleep(ThreadLocalRandom.current().nextInt(50)); // random backoff
    }`,
  },
  {
    id: 'mt-deadlock-detection-thread-dump',
    question: 'A production JVM appears hung. How do you confirm it is a deadlock?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'thread-dump', 'jstack', 'debugging'],
    answer: `Capture a **thread dump** and look for the JVM's deadlock banner. Ways to get one:

- \`jstack <pid>\` or \`jcmd <pid> Thread.print\` — attach to the live JVM (non-intrusive).
- \`kill -3 <pid>\` (SIGQUIT) — makes the JVM print a dump to its own console/log; it does **not** kill the process.

The JVM automatically prints **"Found one Java-level deadlock:"** followed by the threads in the cycle and the \`waiting to lock X ... which is held by Y\` lines. Map those monitor addresses back to code via the stack frames, then fix the lock order at that site.

:::senior
Take **two or three dumps** a few seconds apart — if the same threads sit at the same lines every time, it is a genuine hang rather than a slow call.
:::`,
  },
  {
    id: 'mt-deadlock-threadmxbean',
    question: 'How can a program detect its own deadlocks programmatically at runtime?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'threadmxbean', 'detection', 'monitoring'],
    answer: `Use \`ThreadMXBean\` from \`java.lang.management\`:

    ThreadMXBean bean = ManagementFactory.getThreadMXBean();
    long[] stuck = bean.findDeadlockedThreads();   // null if none
    if (stuck != null) {
      ThreadInfo[] infos = bean.getThreadInfo(stuck, true, true);
      // log each thread, the lock it waits on, and the owner
    }

\`findDeadlockedThreads()\` detects cycles over intrinsic monitors **and** \`ReentrantLock\`s (ownable synchronizers); \`findMonitorDeadlockedThreads()\` covers monitors only. It is cheap enough to run on a timer as a **watchdog** that alerts or auto-restarts.

:::gotcha
It cannot see deadlocks through \`Semaphore\`, \`CountDownLatch\`, blocking queues, or external resources — those threads just sit in \`WAITING\` with no detection.
:::`,
  },
  {
    id: 'mt-deadlock-dining-philosophers',
    question: 'Explain the dining philosophers problem and give one way to break the deadlock.',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'dining-philosophers', 'circular-wait'],
    answer: `Five philosophers sit around a table with one fork between each pair. Each needs **both** neighboring forks to eat and picks up the **left** fork, then the **right**. If all five grab their left fork at once, every right fork is already taken — a **five-way circular wait**, and nobody eats.

Any condition-breaking fix works:

- **Lock ordering** — number the forks; everyone picks up the **lower-numbered** fork first. One philosopher then effectively takes right-before-left, which breaks the symmetry and the cycle.
- **Limit diners** — allow at most **four** philosophers to reach for forks at once (a \`Semaphore(4)\`), so at least one can always obtain both.
- **Arbitrator** — a waiter (a mutex) hands out fork pairs, serializing acquisition so no cycle forms.`,
  },
  {
    id: 'mt-deadlock-break-condition',
    question: 'Map each common deadlock-avoidance technique to the Coffman condition it breaks.',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'coffman-conditions', 'prevention'],
    answer: `Every technique works by **eliminating one** of the four necessary conditions:

- **Global lock ordering** breaks **circular wait** — a total acquisition order makes a cycle impossible.
- **tryLock + timeout (release all on failure)** breaks **hold-and-wait** / **no-preemption** — a thread gives up locks instead of holding them while blocked.
- **Acquire all resources up front** (atomically) breaks **hold-and-wait** — you never hold some while requesting more.
- **Lock-free / single-lock / immutable snapshots** sidestep **mutual exclusion** or simply never hold two locks at once.

:::key
You usually cannot break **mutual exclusion** for something inherently exclusive, so real systems target **circular wait** (ordering) or **hold-and-wait** (tryLock / all-at-once).
:::`,
  },
  {
    id: 'mt-deadlock-identityhashcode',
    question: 'You must lock two objects that have no natural ordering key. How do you impose a safe lock order?',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'lock-ordering', 'identityhashcode'],
    answer: `Order the two locks by \`System.identityHashCode\`, and guard the rare hash **collision** with a global **tie lock**:

    int hA = System.identityHashCode(a);
    int hB = System.identityHashCode(b);
    if (hA < hB)      { synchronized (a) { synchronized (b) { work(); } } }
    else if (hA > hB) { synchronized (b) { synchronized (a) { work(); } } }
    else {                              // identical hashes: extremely rare
      synchronized (TIE_LOCK) {         // acquire a global gate first
        synchronized (a) { synchronized (b) { work(); } }
      }
    }

This is the canonical *Java Concurrency in Practice* pattern for **induced lock ordering**. The tie lock serializes only the collision case, so it costs almost nothing in practice while still guaranteeing one consistent order everywhere.`,
  },
  {
    id: 'mt-deadlock-hidden',
    question: 'Give an example of a deadlock that does not involve two explicit locks, and note a detection blind spot.',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'thread-pool', 'detection', 'edge-cases'],
    answer: `Deadlock is about **circular waiting on resources**, not specifically two \`synchronized\` blocks:

- **Thread-pool starvation deadlock** — a task in a **bounded** pool blocks waiting on the result of **another task it submitted to the same pool**. If every thread is a waiter, no thread is free to run the subtasks. Common with nested \`ExecutorService\` calls.
- **Lock + external resource** — thread A holds a JVM lock and waits on a DB row lock; thread B holds that row and waits on A's JVM lock.
- **Non-reentrant re-entry** — a thread re-acquiring a lock it already holds, when that lock is not reentrant.

:::gotcha
The JVM's automatic detector and \`findDeadlockedThreads()\` only see **monitors and ReentrantLocks**. Deadlocks through \`Semaphore\`, \`CountDownLatch\`, thread-pool exhaustion, or external resources produce **no banner** — the threads just sit in \`WAITING\`, and you must diagnose the cycle by reading the stacks.
:::`,
  },
  {
    id: 'mt-deadlock-minimal-repro',
    question: 'Write the minimal two-thread deadlock and show how it gets stuck.',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'circular-wait', 'lock-ordering'],
    answer: `Two threads acquire the **same two locks in opposite order**. Each grabs its first lock, then blocks forever waiting for the other's lock — a **circular wait**.

\`\`\`java
// Thread 1
synchronized (A) { synchronized (B) { /* work */ } }
// Thread 2
synchronized (B) { synchronized (A) { /* work */ } }
\`\`\`

| Step | Thread 1 | Thread 2 | locks held |
| --- | --- | --- | --- |
| 1 | lock A | — | T1: A |
| 2 | — | lock B | T1: A, T2: B |
| 3 | wants B → blocks | — | T1 holds A, waits B |
| 4 | — | wants A → blocks | T2 holds B, waits A |
| 5 | BLOCKED forever | BLOCKED forever | circular wait, 0% CPU |

Both threads sit in \`BLOCKED\` with no exception and no CPU use — the program just stops.

:::key
The one-line fix: acquire **A and B in the same global order everywhere**, so no cycle can ever form.
:::`,
  },
  {
    id: 'mt-deadlock-priority-inversion',
    question: 'What is priority inversion, and how is it solved?',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['priority-inversion', 'priority-inheritance', 'scheduling'],
    answer: `**Priority inversion**: a **high**-priority thread blocks on a lock held by a **low**-priority thread, but the low holder is preempted by unrelated **medium**-priority threads. The high task is now effectively blocked by medium work it has nothing to do with.

| Step | High-pri | Medium-pri | Low-pri | mutex M |
| --- | --- | --- | --- | --- |
| 1 | — | — | acquires M | held by Low |
| 2 | wants M → blocks | — | in critical section | High waits on Low |
| 3 | blocked | preempts Low | ready, not scheduled | Low can't release M |
| 4 | still blocked | keeps running | starved | High blocked by Medium |

The classic case is the **1997 Mars Pathfinder** rover: a high-priority bus-management task was starved by a low-priority meteorology task holding a shared mutex, tripping a watchdog that repeatedly reset the craft.

:::senior
Fix with **priority inheritance** — the holder temporarily inherits the waiter's priority until it releases — or a **priority ceiling**. Java provides *neither*, another reason never to rely on \`Thread\` priorities for correctness.
:::`,
  },
  {
    id: 'mt-deadlock-livelock-example',
    question: 'Give a concrete livelock example and its fix.',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['livelock', 'backoff', 'liveness'],
    answer: `In a **livelock**, threads keep **changing state in response to each other** but never make progress. Unlike deadlock, the threads are \`RUNNABLE\` and **CPU is busy**. Analogy: two people in a corridor who keep stepping the same way to let the other pass, blocking each other forever.

Concretely, two threads each grab one lock, notice the other is stuck, politely **release and retry** — in perfect lockstep:

| Step | Thread 1 | Thread 2 | state |
| --- | --- | --- | --- |
| 1 | holds L1, tries L2 → fails | holds L2, tries L1 → fails | each holds one |
| 2 | sees T2 blocked, releases L1 | sees T1 blocked, releases L2 | both free |
| 3 | re-acquires L1 | re-acquires L2 | back to start |
| 4 | tries L2 → fails | tries L1 → fails | loop, 100% CPU |

:::key
Break the **symmetry** with a **randomized / jittered backoff** (\`Thread.sleep\` of a random interval) between retries, so one thread wins the race and proceeds.
:::`,
  },
  {
    id: 'mt-deadlock-starvation-causes',
    question: 'What causes thread starvation and how do you fix it?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['starvation', 'fairness', 'liveness'],
    answer: `**Starvation** is when a thread is **perpetually denied** a resource it needs while other threads keep winning it. It is not a circular wait (that is deadlock) — it is unfair scheduling or lock allocation.

| Cause | Fix |
| --- | --- |
| Unfair locks + constant barging | **Fair** lock/semaphore: \`new ReentrantLock(true)\` (FIFO) |
| Thread priorities starve low-pri threads | Don't rely on \`Thread\` priorities |
| A greedy thread holds a lock too long | Keep **critical sections short** |
| Lock convoying under heavy contention | **Reduce contention**; enforce bounded waiting |

Fair synchronizers hand the lock to the **longest waiter** instead of whoever barges in, guaranteeing bounded waiting.

:::gotcha
Fairness is not free — a fair \`ReentrantLock\` has markedly lower throughput than the default barging lock. Reach for it only when a thread is actually starving, not by default.
:::`,
  },
  {
    id: 'mt-deadlock-open-call',
    question: "Why is calling an alien method while holding a lock dangerous, and what is an 'open call'?",
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['open-call', 'alien-method', 'reentrancy', 'listeners'],
    answer: `Calling an **alien method** — external, overridable, or a callback — while holding a lock is dangerous because you don't control what it does. It may **acquire other locks** (creating a lock-ordering deadlock) or **call back into your object** (unexpected reentrancy). Listeners, observers, and callbacks are the usual culprits.

An **open call** is invoking foreign code with **no locks held**. The fix: do the locked work, **snapshot** the state you need, **release the lock**, then invoke the callbacks.

\`\`\`java
// DANGEROUS: alien call while holding our lock
synchronized void publish(Event e) {
  events.add(e);
  for (Listener l : listeners) l.onEvent(e); // may lock back → deadlock
}

// OPEN CALL: mutate under the lock, notify outside it
void publish(Event e) {
  List<Listener> snapshot;
  synchronized (this) { events.add(e); snapshot = List.copyOf(listeners); }
  for (Listener l : snapshot) l.onEvent(e); // no lock held
}
\`\`\`

:::senior
Open calls also shrink the critical section, improving scalability — but re-check invariants after the call, since shared state may have changed while the lock was released.
:::`,
  },
  {
    id: 'mt-deadlock-pool-interdependency',
    question: 'How can a thread pool deadlock even with no explicit locks?',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'thread-pool', 'executor', 'virtual-threads'],
    answer: `This is **thread-starvation deadlock**. Tasks in a **bounded** pool submit **subtasks to the same pool** and then **block on their results** (\`Future.get\`). If every worker is blocked waiting on a subtask that has no free thread to run it, nothing progresses — and there is **no deadlock banner**.

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(2);
Future<Integer> outer = pool.submit(() -> {
  Future<Integer> inner = pool.submit(() -> 42); // subtask to the SAME pool
  return inner.get();                            // blocks this worker
});
\`\`\`

| Step | Worker 1 | Worker 2 | free threads |
| --- | --- | --- | --- |
| 1 | runs outer, submits inner-a | runs outer, submits inner-b | 0 |
| 2 | blocks on inner-a.get() | blocks on inner-b.get() | 0 |
| 3 | inner-a queued, unrunnable | inner-b queued, unrunnable | 0 |
| 4 | blocked forever | blocked forever | starvation deadlock |

:::gotcha
Never block on a task submitted to the **same** pool. Use **separate pools per dependency level**, compose with non-blocking \`CompletableFuture\`, or run on **virtual threads** / a \`ManagedBlocker\` so blocking doesn't consume a scarce carrier.
:::`,
  },
  {
    id: 'mt-deadlock-no-recovery',
    question: 'Once a Java program deadlocks, can it recover automatically?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'recovery', 'detection', 'database'],
    answer: `**No.** The JVM has no automatic recovery. A **database** detects deadlocks and **aborts a victim** transaction, rolling it back so the others proceed; the JVM offers only **detection** (\`findDeadlockedThreads\`, \`jstack\`), never recovery. There is no safe way to forcibly release a held monitor, so the stuck threads stay stuck until you kill the process.

| Aspect | Database | JVM |
| --- | --- | --- |
| Detects deadlock | Yes | Yes (\`findDeadlockedThreads\` / \`jstack\`) |
| Recovers automatically | **Yes** — aborts + rolls back a victim | **No** |
| Your responsibility | Catch the error, **retry** | **Prevent** it up front |

:::key
Because Java can detect but not recover, **prevention** — global lock ordering, \`tryLock\` with a timeout — matters far more than detection. A detected deadlock just tells you that you already lost.
:::`,
  },
  {
    id: 'mt-deadlock-db-app-ordering',
    question: 'How do deadlocks arise across a database and application, and how do you handle them?',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'database', 'transactions', 'retry'],
    answer: `Two transactions that update the **same rows in opposite order** deadlock **inside the DB**; the engine detects the cycle and kills a **victim**, throwing a deadlock/serialization error you must **catch and retry**.

| Step | Txn 1 | Txn 2 | row locks |
| --- | --- | --- | --- |
| 1 | UPDATE row 1 | — | T1: row 1 |
| 2 | — | UPDATE row 2 | T1: row 1, T2: row 2 |
| 3 | UPDATE row 2 → waits | — | T1 waits on row 2 |
| 4 | — | UPDATE row 1 → waits | cycle → DB aborts a victim |

A subtler **cross-domain** case: an app-level JVM lock plus a DB row lock, held by different threads in a cycle. The DB **can't see the JVM lock** and the JVM **can't see the row lock**, so **nothing detects it**.

:::key
Update rows in a **consistent order** (e.g. by primary key), keep transactions **short**, and wrap writes in **retry-on-deadlock with backoff**. Avoid spanning a JVM lock and a DB lock in a way that can invert.
:::`,
  },
  {
    id: 'mt-deadlock-nested-monitor-lockout',
    question: 'What is nested monitor lockout?',
    difficulty: 'Hard',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'wait-notify', 'monitors', 'nested-lock'],
    answer: `**Nested monitor lockout**: a thread calls \`wait()\` on an inner monitor while **still holding an outer lock**. \`wait()\` releases **only the monitor it was called on** — not the outer one — so the thread that would \`notify()\` can never acquire the outer lock, and both are stuck.

\`\`\`java
// Waiter
synchronized (outer) {
  synchronized (inner) {
    while (!ready) inner.wait();  // releases inner ONLY; still holds outer
  }
}
// Notifier — can never enter: the waiter still holds outer
synchronized (outer) {
  synchronized (inner) { ready = true; inner.notify(); }
}
\`\`\`

| Step | Waiter | Notifier | locks held |
| --- | --- | --- | --- |
| 1 | lock outer, lock inner | — | W: outer, inner |
| 2 | inner.wait() → releases inner | — | W: outer (still!) |
| 3 | — | wants outer → blocks | N waits on outer |
| 4 | waits for notify (never comes) | blocked | deadlock |

:::gotcha
Never \`wait()\` while holding a lock the notifier needs. Restructure to a **single monitor**, or ensure the wait releases **every** lock required to signal it.
:::`,
  },
  {
    id: 'mt-deadlock-shrink-lock-scope',
    question: 'Why should you avoid holding a lock across I/O or callbacks?',
    difficulty: 'Medium',
    category: 'Deadlocks & Liveness',
    tags: ['lock-scope', 'critical-section', 'virtual-threads', 'pinning'],
    answer: `Holding a lock across **I/O or callbacks** (network, disk, \`sleep\`, user code) stretches the critical section from nanoseconds to milliseconds. That amplifies contention, **raises deadlock risk** (you may call alien code or wait on something that itself needs the lock), and **pins virtual threads** to their carriers instead of unmounting. Compute the **minimal** critical section: touch shared state under the lock, do slow work outside it.

\`\`\`java
// BEFORE: blocking I/O inside the lock — long CS, pins the virtual thread
synchronized (this) {
  var data = httpClient.fetch(url); // network call while holding the lock
  cache.put(url, data);
}

// AFTER: fetch first, lock only for the mutation
var data = httpClient.fetch(url);             // slow work, no lock held
synchronized (this) { cache.put(url, data); } // tiny critical section
\`\`\`

:::senior
On virtual threads this is critical: blocking inside a \`synchronized\` block **pins** the carrier, defeating scalability. Prefer a \`ReentrantLock\` or an open call so the carrier can be released while you block.
:::`,
  },
  {
    id: 'mt-deadlock-one-lock-fix',
    question: 'What is the simplest way to avoid a two-lock deadlock?',
    difficulty: 'Easy',
    category: 'Deadlocks & Liveness',
    tags: ['deadlock', 'single-lock', 'circular-wait', 'concurrent-collections'],
    answer: `The simplest cure is to **never hold two locks at once** — then a circular wait **cannot form**. Options, cheapest first:

1. **One coarser lock** guarding both pieces of state.
2. **A concurrent / lock-free data structure** (e.g. \`ConcurrentHashMap\`, \`AtomicReference\`) that does its own internal synchronization.
3. **Reduce shared mutable state** — confine data to one thread, or make it immutable.
4. **Copy-then-operate** — snapshot under a brief lock, then work on the copy with no lock held.

If no path ever holds a second lock while holding the first, the **circular-wait** Coffman condition is structurally impossible.

:::gotcha
The trade-off is concurrency: a single coarse lock serializes everything through it. Reserve fine-grained multi-lock designs for **measured** hotspots, not as a default.
:::`,
  },
  {
    id: 'mt-deadlock-diagnose-hang',
    question: 'A service has frozen. How do you triage what kind of liveness failure it is?',
    difficulty: 'Easy',
    category: 'Deadlocks & Liveness',
    tags: ['debugging', 'thread-dump', 'liveness', 'triage'],
    answer: `Take **2–3 thread dumps** a few seconds apart (\`jstack <pid>\` or \`jcmd <pid> Thread.print\`) and **compare** them, then classify by CPU and thread state:

| Failure | CPU | Thread state | Tell-tale |
| --- | --- | --- | --- |
| **Deadlock** | ~0% | \`BLOCKED\` / \`WAITING\` in a cycle | JVM prints a deadlock banner |
| **Livelock** | High | \`RUNNABLE\`, same code | busy but no progress across dumps |
| **Blocked on I/O** | Looks busy | \`RUNNABLE\` in native socket/disk read | stuck in a \`read()\` frame |
| **GC pause / thrash** | High | — | long pauses in the GC logs |

Comparing dumps is the key move: if the **same threads sit at the same lines** in every dump, it is a genuine hang, not a slow call.

:::senior
Start with the cheapest signal — CPU %. Near-zero points at deadlock or blocking; pegged points at livelock or GC. The dumps then confirm which one.
:::`,
  },
];

export default questions;
