import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-interview-thread-safe-meaning',
    question: "What does it mean for a class to be \"thread-safe\"?",
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['thread safety', 'definition', 'invariants'],
    answer: `A class is **thread-safe** when it behaves correctly when accessed by multiple threads at once, *regardless of how their operations interleave*, and **without the caller adding any external synchronization**.

"Correctly" means its **invariants are never violated** and its methods return the results their specification promises, no matter the scheduling.

- Thread-safety is a property of the class's **invariants**, not of any single line.
- A **stateless** object (no fields, or only immutable ones) is always thread-safe.
- Being thread-safe does not require being lock-based — confinement, immutability, and atomics all qualify.

:::key
Correct under any interleaving, with no extra coordination demanded of the caller. Start by naming the invariant you are protecting.
:::`,
  },
  {
    id: 'mt-interview-volatile-vs-synchronized',
    question: 'What is the difference between `volatile` and `synchronized`?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['volatile', 'synchronized', 'visibility', 'atomicity'],
    answer: `They solve overlapping but different problems.

- **\`volatile\`** guarantees **visibility and ordering** for a *single field*: a read always sees the latest write, and it creates a happens-before edge. It gives **no mutual exclusion** and **no atomic read-modify-write**.
- **\`synchronized\`** provides **mutual exclusion *and* visibility**: only one thread is in the block at a time, so a whole critical section is atomic — but threads can **block**.

Reach for \`volatile\` for a status flag or safe publication of an immutable object; reach for \`synchronized\` (or an atomic) when you have a **compound action**.

:::gotcha
\`volatile\` does **not** make \`count++\` atomic — it is still read-modify-write, so two threads can still lose an update. Visibility is not atomicity.
:::`,
  },
  {
    id: 'mt-interview-daemon-thread',
    question: 'What is a daemon thread, and when would you use one?',
    difficulty: 'Easy',
    category: 'Interview Prep',
    tags: ['daemon thread', 'jvm lifecycle', 'shutdown'],
    answer: `A **daemon thread** is a background thread that does **not** keep the JVM alive. Once the only remaining threads are daemons, the JVM exits — and their \`finally\` blocks and shutdown logic **may never run**.

- Set it with \`thread.setDaemon(true)\` **before** \`start()\`.
- The GC, JIT, and timer threads are daemons.

Use daemons for background chores that should never delay shutdown (housekeeping, monitoring). **Avoid** them for work that must complete or that holds resources needing orderly cleanup, because they can be killed mid-flight.`,
  },
  {
    id: 'mt-interview-reason-thread-safe',
    question: 'Given an unfamiliar snippet, how do you systematically decide whether it is thread-safe?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['framework', 'thread safety', 'reasoning'],
    answer: `Run a fixed decision tree instead of guessing:

1. **Is the state shared** across threads? If not (thread-confined), it is safe — stop.
2. **Is it mutable** after publication? If not (immutable), it is safe — stop.
3. Shared *and* mutable, so pick the cheapest guard: **one variable → an atomic**; **several variables under one invariant → a single lock**.
4. **Compound actions?** Any check-then-act or multi-step invariant must be held together under that guard.
5. **Visibility?** Confirm a happens-before edge (\`volatile\`, lock, or \`final\`) so readers do not see stale values.
6. **Liveness?** Check for deadlock (lock ordering), starvation, and livelock.

The habit that makes this work: **name the invariant first**, then verify each step protects it.

:::key
Shared? Mutable? Choose confinement / immutability / atomic / lock, then check compound actions, visibility, and liveness — in that order.
:::`,
  },
  {
    id: 'mt-interview-check-then-act',
    question: 'A cache does `if (!map.containsKey(k)) map.put(k, load(k));` from many threads. What is the bug and how do you fix it?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['check-then-act', 'race condition', 'concurrenthashmap'],
    answer: `It is a **non-atomic check-then-act**. The \`containsKey\` check and the \`put\` are two separate operations, so two threads can **both** observe "absent," **both** call \`load(k)\`, and **both** write — duplicating expensive work and possibly clobbering each other. Using a \`ConcurrentHashMap\` does **not** help, because each call is individually atomic but the *pair* is not.

Fix: collapse the two steps into **one atomic operation**.

\`\`\`java
// runs load(k) at most once per key, atomically
V v = map.computeIfAbsent(k, key -> load(key));
\`\`\`

Or \`putIfAbsent\` when the value is already computed, or a lock around both steps if more than one field is involved.`,
  },
  {
    id: 'mt-interview-wait-while',
    question: 'Why must `wait()` always be called inside a `while` loop rather than an `if`?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['wait notify', 'spurious wakeup', 'condition'],
    answer: `Because a thread returning from \`wait()\` **cannot assume its condition is now true**. Three reasons:

- **Spurious wakeups**: the JVM is permitted to wake a waiter for no reason.
- **\`notifyAll\`** wakes *every* waiter, but often only one can actually proceed; the others must go back to sleep.
- Between the notify and the moment you **re-acquire the lock**, another thread may have already consumed the condition (e.g. taken the item you were waiting for).

So you must **re-test the predicate** after waking:

\`\`\`java
synchronized (lock) {
    while (!ready) lock.wait();   // re-check, never a single if
    consume();
}
\`\`\`

An \`if\` lets a thread run with a false condition — a classic planted bug.`,
  },
  {
    id: 'mt-interview-dining-philosophers',
    question: 'How do you prevent deadlock in the dining philosophers problem?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['dining philosophers', 'deadlock', 'lock ordering'],
    answer: `Deadlock needs all four Coffman conditions; break any one. The naive "grab left fork, then right" deadlocks by forming a **circular wait**, so the cleanest fix is to eliminate that condition with a **global resource ordering** — every philosopher acquires the **lower-numbered fork first**.

\`\`\`java
void dine(int p) {
    int a = p, b = (p + 1) % N;
    Lock first  = forks[Math.min(a, b)];
    Lock second = forks[Math.max(a, b)];
    first.lock();
    try {
        second.lock();
        try { eat(); } finally { second.unlock(); }
    } finally { first.unlock(); }
}
\`\`\`

Alternatives and their trade-offs: an **arbitrator / \`Semaphore\`** that seats at most N-1 philosophers (kills hold-and-wait), or **\`tryLock\` with backoff** (risks **livelock**). Mention at least one alternative to show depth.`,
  },
  {
    id: 'mt-interview-singleton',
    question: 'What is the best way to implement a thread-safe lazy singleton in Java?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['singleton', 'holder idiom', 'enum', 'lazy init'],
    answer: `Use the **initialization-on-demand holder idiom**: the nested class is not loaded until \`get()\` is first called, and the JVM guarantees class initialization runs **exactly once** with no locking in your code.

\`\`\`java
public final class Registry {
    private Registry() {}
    private static class Holder { static final Registry INSTANCE = new Registry(); }
    public static Registry get() { return Holder.INSTANCE; }
}
\`\`\`

Even simpler when you do not need laziness — an **\`enum\` singleton** (\`enum Config { INSTANCE; }\`) is concise and **serialization- and reflection-safe**.

Avoid hand-rolled **double-checked locking**; it works only if the field is \`volatile\` and is easy to get subtly wrong.`,
  },
  {
    id: 'mt-interview-producer-consumer',
    question: 'How would you implement a bounded producer-consumer queue?',
    difficulty: 'Medium',
    category: 'Interview Prep',
    tags: ['producer consumer', 'blockingqueue', 'backpressure'],
    answer: `Use a **bounded \`BlockingQueue\`** — do not hand-roll unless the interviewer asks.

\`\`\`java
BlockingQueue<Task> q = new ArrayBlockingQueue<>(1000); // bounded
// producer
q.put(task);        // blocks when full  -> backpressure
// consumer
Task t = q.take();  // blocks when empty
\`\`\`

The **bound is the point**: it throttles producers to the consumer rate. An unbounded queue just converts an overload into an \`OutOfMemoryError\`.

If asked to build it by hand, use a lock with **two \`Condition\`s** — \`notFull\` and \`notEmpty\` — and \`await()\` each in a **\`while\`** loop, signalling the opposite condition after each \`put\`/\`take\`.`,
  },
  {
    id: 'mt-interview-dcl-volatile',
    question: 'In double-checked locking, why must the instance field be declared `volatile`?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['double-checked locking', 'volatile', 'reordering', 'safe publication'],
    answer: `Because \`instance = new Singleton()\` is **not one step**. It is: (1) allocate memory, (2) run the constructor, (3) publish the reference into the field. Without \`volatile\`, the JVM/CPU may **reorder** (3) *before* (2).

Another thread running the first (unsynchronized) \`if (instance == null)\` check can then see a **non-null reference to a half-constructed object**, skip the lock, and use it — sometimes observing default (zero/null) fields.

\`\`\`java
private static volatile Singleton instance; // volatile forbids the reorder
\`\`\`

\`volatile\` inserts the **happens-before** edge that guarantees the constructor's writes are visible before the reference is published. Better still: sidestep the whole trap with the **holder idiom**.`,
  },
  {
    id: 'mt-interview-aba',
    question: 'What is the ABA problem in lock-free code, and how do you deal with it?',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['aba', 'cas', 'lock-free', 'atomicstampedreference'],
    answer: `**CAS** only asks "does this word still equal the value I expected?" The **ABA problem** is when a location changes **A → B → A**: your CAS sees "still A" and **succeeds**, even though the world moved and moved back, so it silently acts on stale assumptions.

The classic bite is a lock-free stack using raw pointers: a node is popped (A), reused/freed, and a *different* node reappears at the same address (A again). Your CAS on the head pointer succeeds and links in freed or wrong memory.

Fixes:

- Attach a **version stamp** so the pair (value, counter) must match — \`AtomicStampedReference\` (or \`AtomicMarkableReference\`).
- Use a **monotonic sequence** that never repeats.
- Rely on **GC**: in Java, a live reference cannot have its identity reused, which neutralizes the most dangerous form.`,
  },
  {
    id: 'mt-interview-deadlock-conditions',
    question: 'Name the four conditions required for deadlock and describe how you would break one in a real service.',
    difficulty: 'Hard',
    category: 'Interview Prep',
    tags: ['deadlock', 'coffman conditions', 'lock ordering', 'liveness'],
    answer: `Deadlock requires **all four** Coffman conditions at once:

1. **Mutual exclusion** — a resource is held exclusively.
2. **Hold-and-wait** — a thread holds one resource while waiting for another.
3. **No preemption** — resources cannot be forcibly taken back.
4. **Circular wait** — a cycle of threads each waiting on the next.

Break **any one** to make deadlock impossible. In practice:

- **Circular wait (most common fix):** impose a **global lock ordering** — always acquire locks in the same canonical order (e.g. by \`System.identityHashCode\` or a stable id). No cycle can form.
- **Hold-and-wait:** acquire everything at once, or use **\`tryLock\` on all and release-all-on-failure**.
- **No preemption:** use **\`tryLock(timeout)\`** with backoff so a thread gives up and retries (watch for livelock).

:::key
Global lock ordering is the go-to production fix — it is simple, cheap, and provably kills the circular-wait condition.
:::`,
  },
];

export default questions;
