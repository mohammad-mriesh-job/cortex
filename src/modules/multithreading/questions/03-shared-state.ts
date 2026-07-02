import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-shared-race-condition',
    question: 'What is a race condition?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['race-condition', 'thread-safety', 'concurrency'],
    answer: `A **race condition** is when a program's correctness depends on the **relative timing** of threads — the order in which their operations happen to interleave. Change the scheduling and you change the result.

- It appears whenever threads share **mutable state** without coordination.
- It is **non-deterministic**: the buggy interleaving is one of many possible orderings, so the program usually works — until it fails under load, in production.

The fix is to remove the timing dependency: make the shared access **atomic** (a lock or an atomic class), or avoid sharing altogether (thread confinement, immutability).`,
  },
  {
    id: 'mt-shared-lost-update',
    question: 'Why can two threads each running `count++` once leave `count` at 1 instead of 2?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['lost-update', 'read-modify-write', 'atomicity'],
    answer: `Because \`count++\` is not one operation — it is a **read-modify-write** of three steps:

\`\`\`java
int r = count;   // 1. read
r = r + 1;       // 2. modify
count = r;       // 3. write
\`\`\`

If both threads read the same starting value before either writes, they compute the same result and both store it. The second write **clobbers** the first: two increments ran, but the counter moved by one — a **lost update**.

:::key
The bug is that the three steps are not atomic. Fix it by making the read-modify-write indivisible — \`AtomicInteger.incrementAndGet()\` or a lock.
:::`,
  },
  {
    id: 'mt-shared-fix-counter',
    question: 'How do you correctly increment a counter shared by many threads, and how do the options compare?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['atomicinteger', 'longadder', 'synchronized', 'counter'],
    answer: `Make the whole read-modify-write **atomic**. Three standard options:

| Option | Mechanism | Best when |
|---|---|---|
| \`AtomicInteger\` | lock-free compare-and-swap | general shared counter |
| \`synchronized\` / \`Lock\` | mutual exclusion | the update spans more than the counter |
| \`LongAdder\` | per-thread cells, summed on read | very high write contention |

\`\`\`java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();          // atomic ++, returns the new value
\`\`\`

:::senior
Under heavy contention a single \`AtomicInteger\` becomes a cache-line hotspot as CAS retries pile up. \`LongAdder\` spreads writes across striped cells and sums them in \`sum()\`, trading a slightly stale/expensive read for far better write throughput — ideal for metrics.
:::`,
  },
  {
    id: 'mt-shared-critical-section',
    question: 'What is a critical section, and what is a compound action?',
    difficulty: 'Easy',
    category: 'The Shared-State Problem',
    tags: ['critical-section', 'compound-action', 'atomicity'],
    answer: `A **critical section** is code that accesses shared mutable state and must **not** run in two threads at the same time.

It usually guards a **compound action** — several steps that must happen as one indivisible unit:

- **read-modify-write** — \`count++\` (read, add, write).
- **check-then-act** — \`if (x == null) x = create();\` (test, then act on the result).

If another thread interleaves between the steps, the invariant breaks. You enforce atomicity with a **lock** (\`synchronized\`) or an **atomic operation** (\`compareAndSet\`, \`putIfAbsent\`).`,
  },
  {
    id: 'mt-shared-check-then-act',
    question: 'What is a check-then-act race? Give an example and the fix.',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['check-then-act', 'lazy-initialization', 'putifabsent'],
    answer: `**Check-then-act**: you test a condition, then act on it — but the state can change between the check and the act, so you act on a stale fact.

\`\`\`java
// Two threads can both pass the null check and both construct.
if (instance == null) {
    instance = new Service();   // built twice
}
\`\`\`

The same trap hides behind thread-safe collections:

\`\`\`java
if (!map.containsKey(k)) map.put(k, v);   // RACE: another thread inserts between the two calls
map.putIfAbsent(k, v);                    // FIX: one atomic operation
\`\`\`

**Fix** — make check-and-act atomic: a single atomic method (\`putIfAbsent\`, \`computeIfAbsent\`, \`compareAndSet\`), a lock across both steps, or the **holder idiom** for a lazy singleton.

:::gotcha
Using thread-safe building blocks is not enough — each call being atomic does not make the *pair* atomic.
:::`,
  },
  {
    id: 'mt-shared-atomic-compose',
    question: 'If two fields are each an AtomicInteger, is updating both thread-safe? Do atomic operations compose?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['atomicity', 'compound-invariant', 'composition', 'immutability'],
    answer: `No. **Atomic operations do not compose.** Each individual update is atomic, but a sequence of two is not — another thread can observe the state *between* them.

Say the invariant is \`x + y == 100\`:

\`\`\`java
AtomicInteger x = new AtomicInteger(50), y = new AtomicInteger(50);
x.addAndGet(10);   // observer here sees x=60, y=50 -> sum 110, invariant broken
y.addAndGet(-10);
\`\`\`

Between the two atomic writes the invariant is violated, and two threads doing this can interleave and corrupt the pair.

**Fix** — guard the *whole invariant* as one unit:

- a single **lock** around both updates, or
- a single **\`AtomicReference\`** to an *immutable* object holding both fields, swapped with \`compareAndSet\`.

:::key
Identify the invariant first, then pick one guard that covers all of it. "Each field is atomic" says nothing about the relationship *between* fields.
:::`,
  },
  {
    id: 'mt-shared-visibility',
    question: 'What is a visibility problem, and why can a plain flag loop never terminate?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['visibility', 'jmm', 'caching', 'happens-before'],
    answer: `**Visibility** is whether a write by one thread is ever seen by a read on another. With a plain (non-volatile) field, there is **no guarantee** it will be.

\`\`\`java
boolean stop = false;
while (!stop) { /* work */ }   // T2 — may loop forever
stop = true;                   // T1 — may never be seen
\`\`\`

Two reasons T2 can spin forever:

1. It keeps reading a **cached** copy of \`stop\` from a register / CPU cache and never refreshes from main memory.
2. The **JIT** may hoist the non-volatile read out of the loop, turning \`while (!stop)\` into \`if (!stop) while (true)\`.

**Fix** — create a **happens-before** edge so the write is published: mark \`stop\` \`volatile\`, or read/write it inside a \`synchronized\` block.`,
  },
  {
    id: 'mt-shared-happens-before',
    question: 'What is the happens-before relationship, and what are its main rules?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['happens-before', 'jmm', 'memory-model', 'ordering'],
    answer: `**happens-before** is the ordering relation at the heart of the Java Memory Model. If action **A happens-before B**, then A's memory effects are **visible to** and **ordered before** B. No such edge means no guarantee at all.

The main rules to name:

- **Program order** — within one thread, each action happens-before the next.
- **Monitor lock** — unlocking a monitor happens-before any later lock of the same monitor.
- **Volatile** — a volatile write happens-before every later volatile read of that field.
- **Thread start** — \`Thread.start()\` happens-before every action in the started thread.
- **Thread join** — every action in a thread happens-before another thread's return from \`join()\`.
- **Transitivity** — A hb B and B hb C implies A hb C.

:::gotcha
happens-before is a **partial order about visibility/ordering**, not wall-clock time. "A happens-before B" does not mean A physically ran first — it means *if* both run, B must see A's effects.
:::`,
  },
  {
    id: 'mt-shared-reordering',
    question: 'What is instruction reordering, and how does it cause unsafe publication?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['reordering', 'unsafe-publication', 'jmm', 'final'],
    answer: `The compiler and CPU may **reorder** independent reads and writes for performance. Within a single thread the result still looks like program order (**as-if-serial**); across threads, with no synchronization, another thread can see the writes in a **different order**.

**Unsafe publication** is the classic victim:

\`\`\`java
Config cfg;          // plain
boolean ready;       // plain
// T1
cfg = new Config();  // (a)
ready = true;        // (b)  -- may become visible to T2 before (a)
\`\`\`

T2 can see \`ready == true\` yet read a \`null\` or **half-constructed** \`cfg\`, because (a) and (b) can be reordered as observed by T2.

**Fix** — establish a happens-before edge so the object is safely published: make the reference \`volatile\`, publish via a \`synchronized\` block or a concurrent collection, or make \`Config\` **immutable** with \`final\` fields (whose values are guaranteed visible once the constructor completes).

:::senior
\`final\` fields have special "freeze" semantics: a thread that sees a properly-published immutable object is guaranteed to see its final fields fully initialized — a cheap, lock-free safe-publication tool.
:::`,
  },
  {
    id: 'mt-shared-volatile',
    question: 'What does volatile guarantee, and what does it not?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['volatile', 'visibility', 'ordering', 'atomicity'],
    answer: `\`volatile\` is the lightest synchronization tool. It **guarantees**:

- **Visibility** — a read always sees the most recent write (straight from main memory).
- **Ordering** — reads/writes are not reordered across the access; a volatile write happens-before a later volatile read (a happens-before edge).

It does **not** provide:

- **Atomicity** — \`count++\` is still read-modify-write.
- **Mutual exclusion** — it is not a lock.

**Use it for** single-writer flags (\`stop\`, \`ready\`) and safely publishing an **immutable** reference. Reach for \`AtomicInteger\`/\`LongAdder\` or a lock the moment you need atomicity or a compound update.`,
  },
  {
    id: 'mt-shared-volatile-atomic',
    question: 'Does marking a counter `volatile` make `count++` atomic? Why or why not?',
    difficulty: 'Medium',
    category: 'The Shared-State Problem',
    tags: ['volatile', 'atomicity', 'read-modify-write', 'counter'],
    answer: `**No.** \`volatile\` fixes *visibility*, not *atomicity*, and \`count++\` is a **read-modify-write** regardless of how the field is qualified:

\`\`\`java
volatile int count;
count++;   // read, +1, write — three steps, still interleavable
\`\`\`

Two threads can both read the same value, both increment, and both write it back — a **lost update**. Making the field \`volatile\` guarantees each thread sees the latest value *at the moment it reads*, but nothing stops another thread from writing between the read and the write.

**Fix:**

\`\`\`java
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();   // atomic read-modify-write via CAS
\`\`\`

:::gotcha
Marking a shared counter \`volatile\` is a classic non-fix seen in interviews. Visibility was never the problem — atomicity is.
:::`,
  },
  {
    id: 'mt-shared-double-checked-locking',
    question: 'What is double-checked locking, and why must the field be volatile?',
    difficulty: 'Hard',
    category: 'The Shared-State Problem',
    tags: ['double-checked-locking', 'volatile', 'safe-publication', 'singleton'],
    answer: `**Double-checked locking (DCL)** lazily initializes a singleton while locking only on the first call:

\`\`\`java
private volatile Singleton instance;   // volatile is mandatory

Singleton get() {
    if (instance == null) {                 // 1st check — no lock, fast path
        synchronized (this) {
            if (instance == null) {         // 2nd check — under lock
                instance = new Singleton();
            }
        }
    }
    return instance;
}
\`\`\`

**Why \`volatile\` is required:** \`instance = new Singleton()\` is really *allocate → run constructor → publish reference*, and without \`volatile\` those steps can be **reordered** so the reference is published *before* the constructor finishes. Another thread taking the fast path could then see a non-null but **half-constructed** object. \`volatile\` forbids that reordering and gives safe publication.

:::senior
DCL is subtle and easy to get wrong. Prefer the **holder idiom** (\`static class Holder { static final Singleton INSTANCE = new Singleton(); }\`) — the JVM's class-initialization lock gives lazy, thread-safe, lock-free-on-the-hot-path init with no \`volatile\` to remember.
:::`,
  },
];

export default questions;
