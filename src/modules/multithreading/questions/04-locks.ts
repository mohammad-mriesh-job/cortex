import type { InterviewQuestion } from '../../../types';

const questions: InterviewQuestion[] = [
  {
    id: 'mt-locks-intrinsic-monitor',
    question: 'What is an intrinsic lock (monitor) in Java, and what does `synchronized` do with it?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'monitor', 'intrinsic-lock'],
    answer: `Every Java object has a hidden **intrinsic lock**, also called its *monitor*. \`synchronized\` **acquires** that monitor when a thread enters the region and **releases** it on exit, so at most one thread can be inside a \`synchronized\` block guarded by the same object at a time.

A monitor has an **owner** (the holding thread) and an **entry set** (threads waiting to acquire it, in state \`BLOCKED\`). When the owner releases, one waiting thread acquires and proceeds.

:::key
\`synchronized\` = mutual exclusion via an object's built-in monitor. Contending threads park in state \`BLOCKED\` until the monitor is free.
:::`,
  },
  {
    id: 'mt-locks-synchronized-guarantees',
    question: 'Beyond mutual exclusion, what memory guarantee does `synchronized` provide?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'happens-before', 'visibility'],
    answer: `\`synchronized\` gives **two** guarantees:

1. **Mutual exclusion** — only one thread holds the monitor at a time.
2. **Visibility / happens-before** — everything a thread did *before releasing* the monitor is visible to the next thread that *acquires* it. Release-then-acquire establishes a happens-before edge.

That second point is why \`synchronized\` fixes both race conditions *and* stale-read visibility bugs, whereas \`volatile\` fixes visibility alone (no mutual exclusion, so \`count++\` is still not atomic).

:::key
Lock **acquire/release** publishes memory, not just excludes threads. A read that sees a write done under the same lock is guaranteed to see all writes that preceded that release.
:::`,
  },
  {
    id: 'mt-locks-instance-vs-static',
    question: 'Which monitor does a `synchronized` instance method lock on versus a `synchronized static` method?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'static', 'class-lock'],
    answer: `They lock **different** monitors:

- A \`synchronized\` **instance** method locks on **\`this\`** (the receiver). Two threads calling it on the *same* object exclude each other; on *different* instances they do not.
- A \`synchronized\` **static** method locks on the **Class object** (\`ClassName.class\`), which is shared by all instances.

Because the instance lock and the class lock are distinct, a \`synchronized\` instance method and a \`synchronized static\` method of the same class **can run at the same time**.

    synchronized void a() { ... }         // locks on this
    synchronized static void b() { ... }  // locks on ClassName.class

:::gotcha
Mixing static and instance synchronization while assuming they exclude each other is a real bug — they guard two separate monitors.
:::`,
  },
  {
    id: 'mt-locks-reentrancy',
    question: 'Are Java intrinsic locks reentrant, and why does that matter?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['reentrancy', 'synchronized', 'hold-count'],
    answer: `Yes. Both \`synchronized\` and \`ReentrantLock\` are **reentrant**: a thread that already owns the monitor can acquire it again without deadlocking itself. The JVM keeps a per-thread **hold count** that increments on each re-entry and decrements on each exit; the lock frees only when the count returns to **zero**.

Why it matters: without reentrancy a \`synchronized\` method calling another \`synchronized\` method on the same object would deadlock against itself.

    synchronized void outer() { inner(); }   // already holds this...
    synchronized void inner() { ... }        // ...re-enters, count 1 -> 2

:::key
Reentrancy is per **thread**, tracked by a hold count. It enables locked methods to call other locked methods on the same object safely.
:::`,
  },
  {
    id: 'mt-locks-reentrantlock-vs-synchronized',
    question: 'When would you choose `ReentrantLock` over `synchronized`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['reentrantlock', 'synchronized', 'trylock'],
    answer: `Reach for \`ReentrantLock\` when you need capabilities the intrinsic monitor lacks:

- **\`tryLock()\`** — acquire only if free (non-blocking), key to **deadlock avoidance**.
- **Timed** acquisition — \`tryLock(2, TimeUnit.SECONDS)\` so you never block forever.
- **Interruptible** acquisition — \`lockInterruptibly()\` to abandon a wait on interrupt.
- **Fairness** — \`new ReentrantLock(true)\` grants in arrival order.
- **Multiple \`Condition\`s** — several independent wait-sets on one lock.

Otherwise prefer \`synchronized\`: it is simpler, cannot leak an unreleased lock, and is just as fast under the JIT. The cost of \`ReentrantLock\` is that **you** must \`unlock()\` in a \`finally\`.

:::key
\`ReentrantLock\` = \`synchronized\` + tryLock/timed/interruptible/fair/Conditions. Use it only when you need one of those; pay for it with a mandatory \`finally\`.
:::`,
  },
  {
    id: 'mt-locks-unlock-finally',
    question: 'Why must `ReentrantLock.unlock()` go in a `finally` block, and where does `lock()` belong?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['reentrantlock', 'finally', 'liveness'],
    answer: `Unlike \`synchronized\`, the JVM does **not** auto-release a \`ReentrantLock\`. If the critical section throws or returns early and \`unlock()\` is not in \`finally\`, the lock is **never released** — every future acquirer blocks forever (a permanent lock / liveness failure).

The correct idiom puts \`lock()\` **before** the \`try\` and \`unlock()\` **in the \`finally\`**:

    lock.lock();
    try {
        // critical section
    } finally {
        lock.unlock();
    }

Do **not** put \`lock()\` inside the \`try\`: if acquisition itself threw, the \`finally\` would call \`unlock()\` on a lock you never took, raising \`IllegalMonitorStateException\` and masking the real error.

:::gotcha
A forgotten \`finally { unlock(); }\` is the signature \`ReentrantLock\` bug. This is the one failure mode \`synchronized\` cannot have.
:::`,
  },
  {
    id: 'mt-locks-trylock-deadlock',
    question: 'How does `tryLock()` help avoid deadlock when a thread needs two locks?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['trylock', 'deadlock', 'reentrantlock'],
    answer: `Classic deadlock: thread A holds lock 1 and blocks forever on lock 2, while thread B holds lock 2 and blocks forever on lock 1. \`tryLock()\` breaks the "hold-and-wait" condition by refusing to block.

Instead of blocking on the second lock, **try** it; if it fails, **release what you already hold** and retry (usually after a small back-off):

    while (true) {
        lock1.lock();
        try {
            if (lock2.tryLock()) {
                try { /* both held: do work */ } finally { lock2.unlock(); }
                return;
            }
        } finally { lock1.unlock(); }
        // back off, then retry
    }

Because no thread ever blocks while holding a lock, the circular wait cannot form.

:::key
\`tryLock()\` turns "block and wait" into "try, and if it fails, back off". That removes hold-and-wait, so the deadlock cycle cannot close.
:::`,
  },
  {
    id: 'mt-locks-fairness',
    question: 'What is the trade-off between a fair and an unfair `ReentrantLock`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['fairness', 'reentrantlock', 'starvation'],
    answer: `A **fair** lock (\`new ReentrantLock(true)\`) grants acquisition in **arrival order (FIFO)**, which prevents starvation — no thread is skipped indefinitely.

An **unfair** lock (the default) allows **barging**: an arriving thread may grab a just-freed lock ahead of longer-waiting queued threads.

The trade-off is **throughput vs starvation**:

- Fairness disables barging, so nearly every handoff forces a context switch to the queued thread. Throughput can drop dramatically.
- Unfair barging reuses the running thread's warm cache and avoids context switches, so it is much faster — at the risk that some thread waits a long time.

Note: even on a fair lock, \`tryLock()\` (no timeout) **barges**; use \`tryLock(0, SECONDS)\` to honor fairness.

:::key
Default to **unfair** for throughput. Choose **fair** only when a profiler shows a thread is actually being starved.
:::`,
  },
  {
    id: 'mt-locks-read-write',
    question: 'What concurrency does a `ReadWriteLock` allow, and how can it starve writers?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['readwritelock', 'writer-starvation', 'concurrency'],
    answer: `A \`ReadWriteLock\` splits one lock into a **shared read lock** and an **exclusive write lock**. The rule is **many readers XOR one writer**:

- Any number of readers may hold the read lock **simultaneously** (reads do not conflict).
- The write lock is **exclusive** — the writer holds it alone, with no readers and no other writers.

It shines when reads far outnumber writes and each read holds the lock for a non-trivial time.

**Writer starvation:** with a non-fair policy, a continuous stream of readers can keep the read lock perpetually held (new readers arrive before the last one leaves), so a waiting writer may **never** acquire the exclusive lock. A fair policy fixes this by queuing the writer, at some throughput cost.

:::gotcha
If reads are cheap and quick, a \`ReadWriteLock\` can be *slower* than a plain mutex because of its extra bookkeeping. The split only pays off when reads are both frequent and non-trivial.
:::`,
  },
  {
    id: 'mt-locks-stampedlock',
    question: 'How does a `StampedLock` optimistic read work, and what is its biggest restriction?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['stampedlock', 'optimistic-read', 'reentrancy'],
    answer: `\`StampedLock.tryOptimisticRead()\` returns a **stamp** (a version number) **without taking any lock** — it does not block writers. You read the fields into locals, then call **\`validate(stamp)\`**:

- If \`validate\` returns **true**, no writer intervened; your read was consistent and you paid almost nothing.
- If it returns **false**, a writer moved, so you **fall back** to a real \`readLock()\` and re-read.

<!-- pattern -->

    long stamp = sl.tryOptimisticRead();
    int b = balance;
    if (!sl.validate(stamp)) {
        stamp = sl.readLock();
        try { b = balance; } finally { sl.unlockRead(stamp); }
    }

This gives the cheapest possible read when writes are rare.

**Biggest restriction: \`StampedLock\` is NOT reentrant.** A thread that already holds it and calls \`readLock()\`/\`writeLock()\` again **deadlocks against itself**. It also has **no \`Condition\`s**, so it is not a drop-in replacement for \`ReentrantReadWriteLock\`.

:::gotcha
Optimistic reads must copy fields to locals and only use them *after* \`validate\` passes — a field read during an in-flight write can be torn or inconsistent.
:::`,
  },
  {
    id: 'mt-locks-wait-while',
    question: 'Why must the condition around `wait()` be re-checked in a `while` loop instead of an `if`?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['wait-notify', 'spurious-wakeup', 'guarded-block'],
    answer: `Because \`wait()\` can return when the predicate is **still false**, for two independent reasons:

1. **Spurious wakeups** — the JVM is explicitly allowed to return from \`wait()\` **without** any matching \`notify()\`. This is documented and real.
2. **Stolen conditions** — with multiple waiters, another thread may have consumed the item between your wakeup and your re-acquisition of the monitor, so the queue is empty again by the time you run.

An \`if\` falls straight through and acts on a false predicate (e.g. \`remove()\` on an empty queue), corrupting an invariant. A \`while\` re-checks and, if still false, waits again:

    synchronized (lock) {
        while (queue.isEmpty()) {   // WHILE, never if
            lock.wait();
        }
        return queue.remove();
    }

The same applies to \`Condition.await()\`.

:::key
Always guard \`wait()\`/\`await()\` with a **\`while\` loop** over the predicate. Never assume a wakeup means the condition is true.
:::`,
  },
  {
    id: 'mt-locks-notify-vs-notifyall',
    question: 'What is the difference between `notify()` and `notifyAll()`, and how do `Condition`s improve on both?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['notify', 'notifyall', 'condition'],
    answer: `\`notify()\` wakes **one arbitrary** waiter; \`notifyAll()\` wakes **all** of them to re-check their predicates. You must **hold the object's monitor** to call either, or you get \`IllegalMonitorStateException\`.

**Prefer \`notifyAll()\`** unless you can prove all waiters block on a single condition. The hazard of \`notify()\` is a **lost wakeup**: if waiters are blocked on *different* predicates, \`notify()\` may wake the "wrong" one, which re-checks, finds its condition still false, and goes back to sleep — while the thread that *could* have proceeded is never signalled.

**\`Condition\` (on a \`ReentrantLock\`) improves on both.** One lock can mint several \`Condition\`s, so each predicate gets its **own wait-set**:

    Condition notFull  = lock.newCondition();
    Condition notEmpty = lock.newCondition();
    // producer: notEmpty.signal();   consumer: notFull.signal();

Now a single \`signal()\` targets exactly the threads that can make progress — no lost wakeups, and none of the **thundering herd** that \`notifyAll()\` causes.

:::key
\`notify()\` risks lost wakeups; \`notifyAll()\` is safe but wakes everyone. \`Condition\`s give per-predicate wait-sets, so you wake precisely the right group.
:::`,
  },
  {
    id: 'mt-locks-method-vs-block',
    question: 'What\'s the difference between a `synchronized` method and a `synchronized` block?',
    difficulty: 'Easy',
    category: 'Locks & Synchronization',
    tags: ['synchronized', 'synchronized-block', 'critical-section'],
    answer: `A \`synchronized\` **method** locks its **entire body** on an implicit monitor — \`this\` for an instance method, the \`Class\` object for a \`static\` one. A \`synchronized\` **block** locks a monitor **you choose** over a **narrower** region.

Prefer blocks: a shorter critical section holds the lock for less time, which means **less contention** and higher throughput, and you pick the lock object (ideally a private one) instead of exposing \`this\`.

\`\`\`java
synchronized void m() {          // locks this for the WHOLE method
    prep();                      // thread-local work, needlessly serialized
    shared.mutate();
}

private final Object lock = new Object();
void m() {
    prep();                      // now runs concurrently
    synchronized (lock) {        // lock ONLY the shared part
        shared.mutate();
    }
}
\`\`\`

:::key
A method locks its whole body on \`this\`/the class; a block locks a chosen object over a narrower span. Blocks shrink the critical section and hide the lock — usually the better default.
:::`,
  },
  {
    id: 'mt-locks-private-lock-object',
    question: 'Why lock on a private final `Object` instead of on `this`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['private-lock', 'encapsulation', 'synchronized'],
    answer: `Locking on \`this\` (or any publicly reachable object) **leaks your locking policy**. Any outside code holding a reference to your object can \`synchronized (yourObject) { ... }\` — or invoke your \`synchronized\` methods — and interfere with, or **deadlock**, your locking. You can no longer reason about who holds the lock from your class alone.

A **private final** lock **encapsulates** the policy — only your code can name it, so only your code can acquire it:

\`\`\`java
private final Object lock = new Object();

void update() {
    synchronized (lock) { /* critical section */ }
}
\`\`\`

It must be \`final\`: a lock reference that can be reassigned is broken — two threads could lock **different** objects and both "win", getting no exclusion at all.

:::key
A private final lock keeps the monitor unreachable from outside, so your locking policy is provable locally. Never lock on \`this\`, a public field, or a non-\`final\` field.
:::`,
  },
  {
    id: 'mt-locks-string-integer-lock-trap',
    question: 'Why is synchronizing on a `String` literal or a boxed `Integer` dangerous?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['string-interning', 'integer-cache', 'lock-object'],
    answer: `Because those values are **shared singletons**, so completely unrelated code can end up locking the **same** monitor by accident.

- **\`String\` literals are interned** — every \`"LOCK"\` in the whole JVM refers to the **one** pooled instance.
- **\`Integer.valueOf\` caches \`-128..127\`** (and \`Boolean.TRUE\`/\`FALSE\` are singletons), so \`Integer.valueOf(1)\` in module A and in module B is the very same object.

Two modules that never intended to share a lock now contend — or deadlock — on one monitor:

| Step | Thread A (class A) | Thread B (class B) | Monitor |
|---|---|---|---|
| 1 | \`synchronized ("LOCK")\` | — | A holds interned \`"LOCK"\` |
| 2 | — | \`synchronized ("LOCK")\` | B **BLOCKS** on the same object |

Outside the cache it inverts: \`Integer.valueOf(200)\` returns a **fresh** object each call, so threads that "share" it actually lock **different** monitors and get **no exclusion at all**.

:::gotcha
Never synchronize on interned \`String\`s, boxed primitives, \`Boolean\`s, or any pooled or reassignable value. Lock on a \`private final Object\` you allocated yourself.
:::`,
  },
  {
    id: 'mt-locks-entry-wait-set',
    question: 'What are a monitor\'s entry set and wait set?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['monitor', 'entry-set', 'wait-set'],
    answer: `Every monitor maintains **two** queues of threads:

- **Entry set** — threads that are **\`BLOCKED\`** trying to *acquire* the lock (contending to enter a \`synchronized\` region).
- **Wait set** — threads that owned the lock, called **\`wait()\`**, released it, and now sit **\`WAITING\`** to be notified.

The flow:

1. A thread acquires the monitor; late arrivals pile up in the **entry set**.
2. The owner calls \`wait()\` → it releases the lock and moves to the **wait set**.
3. Another thread calls \`notify()\` → **one** waiter moves from the wait set **into the entry set** (\`notifyAll()\` moves them **all**).
4. A notified thread is **not** running yet — it must **re-acquire** the monitor from the entry set before it can return from \`wait()\`.

:::key
Entry set = \`BLOCKED\` (want the lock); wait set = \`WAITING\` (called \`wait()\`). \`notify()\` only *promotes* a waiter to the entry set — it still has to win the lock before proceeding.
:::`,
  },
  {
    id: 'mt-locks-condition-vs-wait-notify',
    question: 'How do `Condition` objects improve on `wait()`/`notify()`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['condition', 'wait-notify', 'reentrantlock'],
    answer: `A \`Condition\` (from \`lock.newCondition()\`) is the \`Lock\` world's \`wait\`/\`notify\`, exposing \`await\`/\`signal\`/\`signalAll\`. The key win: a **single** \`Lock\` can mint **multiple** \`Condition\`s, so each **predicate** gets its **own wait-set** — you signal exactly the threads that can make progress, avoiding both **lost wakeups** and the **thundering herd**.

| \`Object\` monitor | \`Condition\` |
|---|---|
| \`wait()\` | \`await()\` |
| \`notify()\` | \`signal()\` |
| \`notifyAll()\` | \`signalAll()\` |

A bounded buffer uses two: \`notFull\` and \`notEmpty\`. A producer signals \`notEmpty\`; a consumer signals \`notFull\` — waking only the relevant side, never everyone. \`Condition\` also adds what \`Object\` lacks: \`awaitUninterruptibly()\`, timed \`awaitNanos()\` / \`await(t, unit)\`, and \`awaitUntil(deadline)\`.

Like \`wait()\`, \`await()\` must be called **holding the lock** and always inside a \`while\` loop over the predicate.

:::key
One \`Lock\`, many \`Condition\`s = one wait-set per predicate. That precision is exactly what a single intrinsic monitor cannot express.
:::`,
  },
  {
    id: 'mt-locks-splitting-striping',
    question: 'What are lock splitting and lock striping?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['lock-splitting', 'lock-striping', 'contention'],
    answer: `Both cut contention by replacing one hot lock with many.

- **Lock splitting** — when one lock guards **independent** pieces of state, give each piece its **own** lock (one lock per invariant). Operations on unrelated fields then run in parallel instead of serializing on a single mutex.
- **Lock striping** — partition **one** structure into **N stripes**, each with its own lock, so up to **N** threads can mutate **different** stripes at once. Java 7's \`ConcurrentHashMap\` used 16 segments; a key's hash selects its stripe.

\`\`\`java
// striping: N locks guard N buckets
final Object[] stripes = new Object[16];
Object lockFor(Object key) { return stripes[key.hashCode() & 15]; }
\`\`\`

The catch: an operation spanning **all** stripes — \`size()\`, a global rehash, \`clear()\` — must acquire **every** lock (in a fixed order), which is costly and re-serializes the whole structure.

:::senior
Splitting separates *unrelated* locks; striping shards *one* structure into N locks. Both trade a cheap per-operation win for expensive whole-structure operations that must grab all locks at once.
:::`,
  },
  {
    id: 'mt-locks-biased-locking-removed',
    question: 'What was biased locking, and why was it removed?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['biased-locking', 'jep-374', 'jvm'],
    answer: `The JVM locks a \`synchronized\` object along a **fast-path ladder**: **biased** → **thin/lightweight** (a CAS-based stack lock) → **inflated/heavyweight** (a real OS monitor). It climbs the ladder only as contention appears.

**Biased locking** optimized the common case of **one** thread repeatedly locking an **uncontended** object: the object header was *biased* to that thread's ID, so later re-locks needed **no atomic instruction (CAS)** at all — just a header check.

Why it was disabled by default in **JDK 15** (**JEP 374**) and is now being removed:

1. On modern CPUs an uncontended CAS became **cheap**, shrinking the payoff.
2. **Bias revocation** — needed when a second thread appears — requires a costly safepoint.
3. The bookkeeping added VM complexity that blocked other locking improvements.

Uncontended \`synchronized\` is **still cheap**; it simply uses the lightweight CAS path now.

:::senior
Biased locking removed the CAS from single-threaded re-locks. Cheap modern atomics plus expensive revocation flipped the cost/benefit, so JEP 374 retired it.
:::`,
  },
  {
    id: 'mt-locks-uncontended-cost',
    question: 'Is `synchronized` slow?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['performance', 'lightweight-lock', 'contention'],
    answer: `**Not when it is uncontended.** An uncontended \`synchronized\` is a **lightweight (thin) lock** — essentially a single **CAS** on the object header's mark word to install a stack-lock, then a CAS to release. No OS call, no kernel blocking, negligible cost. The JIT goes further with **lock elision** (dropping locks on provably thread-local objects via escape analysis) and **lock coarsening** (merging adjacent lock/unlock pairs).

It only turns expensive under **contention**, when the lock **inflates** to a heavyweight OS monitor and the losing threads **park** — a context switch costing microseconds.

| Situation | What it costs |
|---|---|
| Uncontended | one CAS on the object header (or elided entirely) |
| Contended | inflate to an OS monitor; losers **park** (context switch) |

:::key
"\`synchronized\` is slow" is a myth for uncontended locks. The real cost is **contention**, not the keyword — measure contention before you optimize it away.
:::`,
  },
  {
    id: 'mt-locks-lockinterruptibly',
    question: 'What does `lockInterruptibly()` give you over `lock()`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['lockinterruptibly', 'interruption', 'reentrantlock'],
    answer: `A thread blocked in **\`lockInterruptibly()\`** responds to **\`interrupt()\`** by throwing **\`InterruptedException\`** and **abandoning** the acquisition. Plain **\`lock()\`** — like \`synchronized\` — is **uninterruptible**: once it is queued for the lock, an interrupt is merely *recorded*, the thread keeps waiting, and it cannot be **cancelled** while blocked.

Use \`lockInterruptibly()\` for acquisitions that must stay **responsive to cancellation or shutdown**:

\`\`\`java
lock.lockInterruptibly();        // throws InterruptedException if interrupted while waiting
try {
    // critical section
} finally {
    lock.unlock();
}
\`\`\`

Note the shape: because \`lockInterruptibly()\` can throw **before** the lock is held, it sits **outside** the \`try\`, and the enclosing method must declare or catch \`InterruptedException\`.

:::key
\`lockInterruptibly()\` = a cancellable lock acquisition. \`lock()\` and \`synchronized\` leave a waiting thread un-cancellable until it finally acquires.
:::`,
  },
  {
    id: 'mt-locks-condition-mechanics',
    question: 'What exactly happens when you call `Condition.await()` and `signal()`?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['condition', 'await-signal', 'reentrantlock'],
    answer: `\`await()\` does three things **atomically**: it **releases** the lock, **suspends** the thread on that \`Condition\`'s wait-set, and — on \`signal()\` (or a spurious wakeup) — **re-acquires** the lock **before returning**. Because it cannot return until it holds the lock again, and because wakeups can be spurious or stolen, you always re-check the predicate in a **\`while\`** loop.

\`signal()\` wakes **one** waiter; \`signalAll()\` wakes **all**. You must **hold the lock** to call \`await\`/\`signal\`/\`signalAll\`, or you get \`IllegalMonitorStateException\`.

\`\`\`java
lock.lock();
try {
    while (queue.isEmpty()) {     // WHILE, never if
        notEmpty.await();         // releases lock, waits, then re-acquires
    }
    return queue.remove();
} finally {
    lock.unlock();
}
\`\`\`

:::gotcha
\`await()\` **releases and later re-acquires** the lock for you — but only that one lock. On return the predicate may again be false (a spurious or stolen wakeup), so the \`while\` re-check is mandatory.
:::`,
  },
  {
    id: 'mt-locks-rwlock-downgrade',
    question: 'Can you upgrade or downgrade a `ReentrantReadWriteLock`?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['readwritelock', 'lock-downgrade', 'reentrancy'],
    answer: `**Downgrading (write → read) is supported and idiomatic; upgrading (read → write) is not, and deadlocks.**

**Downgrade:** while holding the **write** lock, acquire the **read** lock, *then* release the write lock. You never surrender exclusivity before re-taking it as shared, so no other writer can slip in and change what you just wrote:

\`\`\`java
rw.writeLock().lock();
try {
    mutateState();
    rw.readLock().lock();        // acquire read WHILE still holding write
} finally {
    rw.writeLock().unlock();     // now downgraded: read held, write released
}
try {
    useState();
} finally {
    rw.readLock().unlock();
}
\`\`\`

**Upgrade** is impossible: a reader trying to take the write lock must wait for **all** readers to release — but if two readers both try, each waits on the other forever (**deadlock**). Reentrancy applies within a mode; choose fair or non-fair via \`new ReentrantReadWriteLock(true|false)\`.

:::gotcha
Read → write **self-deadlocks** and throws no error — it just hangs. Always downgrade, never upgrade: release the read lock fully and re-acquire write if you truly must.
:::`,
  },
  {
    id: 'mt-locks-granularity',
    question: 'How do you choose lock granularity?',
    difficulty: 'Medium',
    category: 'Locks & Synchronization',
    tags: ['lock-granularity', 'contention', 'design'],
    answer: `It is a trade-off between **contention** and **complexity**:

- **Coarse-grained** (one lock for everything) — simple and easy to prove correct, but it **serializes unrelated operations** and becomes a contention bottleneck.
- **Fine-grained** (many small locks) — unlocks parallelism, but multiplies **deadlock** risk (multi-lock ordering) and cognitive load.

The discipline:

1. **Start coarse and correct** — a single lock you can fully reason about.
2. Use **one lock per invariant** — group state that must change together under one lock; separate state that is genuinely independent.
3. **Split only where a profiler shows real contention** — never on a hunch.

\`\`\`java
// one lock per independent invariant, not one giant lock
private final Object cacheLock = new Object();
private final Object statsLock = new Object();
\`\`\`

:::key
Correctness first, then measure, then split. Fine-grained locking is an optimization you *earn* with profiler data — never the starting point.
:::`,
  },
  {
    id: 'mt-locks-spinlock',
    question: 'What is a spin lock, and when does it beat a blocking lock?',
    difficulty: 'Hard',
    category: 'Locks & Synchronization',
    tags: ['spin-lock', 'onspinwait', 'cas'],
    answer: `A **spin lock busy-waits** — it loops on a **CAS** until it wins the lock — instead of **blocking/parking** the thread. Skipping the park avoids the **context-switch and wake-up cost**, so it **wins when the critical section is very short** and the holder is unlikely to be descheduled (brief contention, spare cores on a multicore box).

\`\`\`java
final AtomicBoolean held = new AtomicBoolean(false);
void lock() {
    while (!held.compareAndSet(false, true)) {
        Thread.onSpinWait();     // Java 9 hint: we are in a spin-wait loop
    }
}
void unlock() { held.set(false); }
\`\`\`

It is **wasteful** when the lock is held **long**: a spinner burns an entire core doing nothing, and if the holder is descheduled every spinner just wastes cycles until it is rescheduled. That is why real JVM monitors use **adaptive spinning** — spin briefly, then **park**.

:::gotcha
Spin only for **short** sections on multicore hardware, and always call \`Thread.onSpinWait()\` to cut power use and free CPU pipeline resources. For long holds, **park** (block) — spinning a long-held lock wastes a whole core.
:::`,
  },
];

export default questions;
