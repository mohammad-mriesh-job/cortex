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
];

export default questions;
